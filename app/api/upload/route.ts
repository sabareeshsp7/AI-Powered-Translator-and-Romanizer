import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not configured');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Get the uploaded file from form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Please upload a valid image file' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size too large. Please upload an image under 10MB' },
        { status: 500 }
      );
    }

    console.log('Starting OCR and AI analysis...');

    // Convert file to base64 for Gemini Vision API
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString('base64');

    // Initialize Gemini AI with Vision model
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Create a prompt for Gemini to first quickly check if there's Hindi text
    const quickCheckPrompt = `
      Look at this image and determine if there is any Hindi/Devanagari script text present.
      
      Respond with ONLY:
      - "HINDI_FOUND" if you see any Hindi/Devanagari characters
      - "NO_HINDI" if there's no Hindi/Devanagari text (English, other languages, or no text)
      
      Be quick and decisive - just look for the characteristic curved shapes of Devanagari script.
    `;

    try {
      // Prepare the image part for Gemini
      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      };

      // First, do a quick check for Hindi text
      const quickCheckResult = await model.generateContent([quickCheckPrompt, imagePart]);
      const quickCheckResponse = quickCheckResult.response.text().trim();

      console.log('Quick check result:', quickCheckResponse);

      // If no Hindi text found, return immediately
      if (quickCheckResponse.includes('NO_HINDI')) {
        return NextResponse.json({
          success: true,
          noTextFound: true,
          message: 'No Hindi text was detected in the image. The image appears to contain English or other non-Hindi content.',
          quickStop: true
        });
      }

      // If Hindi text is found, proceed with full analysis
      const detailedPrompt = `
        You are an expert in Hindi language and OCR. Please analyze this image and provide a structured response.
        
        Since Hindi text has been detected, provide your response in this EXACT format:
        
        EXTRACTED_HINDI_TEXT:
        [Write the complete Hindi text exactly as it appears in the image]
        
        ROMANIZED_TRANSLITERATION:
        [Provide the complete romanized transliteration of the Hindi text using standard IAST or simple roman characters]
        
        ENGLISH_TRANSLATION:
        [Provide a complete English translation of the text]
        
        CONTENT_TYPE:
        [Specify what type of content this is: poem, story, article, sign, etc.]
        
        DETAILED_ANALYSIS:
        For each stanza (or section if prose), follow this EXACT format:
        
        Stanza [number]:
        ● [Hindi line], ([Transliteration in parentheses])
        ○ Meaning: [English meaning of this line]
        ● [Next Hindi line], ([Transliteration in parentheses])
        ○ Meaning: [English meaning of this line]
        [Continue for all lines in the stanza]
        
        Example format:
        Stanza 1:
        ● मैं तुम-सबकी ओर निहार रहा हूँ, (Main tum-sabakī ora nihāra rahā hūṅ,)
        ○ Meaning: I am gazing towards all of you,
        ● स्थान मुझे भी दो तुम अपने बीच; (Sthāna mujhe bhī dō tum apanē bīch;)
        ○ Meaning: Give me a place too, amongst yourselves;
        
        IMPORTANT FORMATTING RULES:
        - Use exactly ● (bullet) for Hindi lines with transliteration in parentheses
        - Use exactly ○ (circle) for meanings that start with "Meaning:"
        - Analyze every single line of each stanza
        - If it's prose, treat each paragraph as a section instead of stanzas
        - Maintain consistent formatting throughout
        
        Be accurate and thorough in your analysis. Make sure to format everything clearly under the specified sections.
      `;

      // Get detailed response from Gemini
      const result = await model.generateContent([detailedPrompt, imagePart]);
      const response = result.response;
      const geminiResponse = response.text();

      console.log('Gemini Vision analysis completed');

      // Parse the structured response from detailed analysis
      const extractHindiText = (text: string) => {
        const match = text.match(/EXTRACTED_HINDI_TEXT:\s*([\s\S]*?)(?=\n(?:ROMANIZED_TRANSLITERATION|$))/i);
        return match ? match[1].trim() : '';
      };

      const extractRomanizedText = (text: string) => {
        const match = text.match(/ROMANIZED_TRANSLITERATION:\s*([\s\S]*?)(?=\n(?:ENGLISH_TRANSLATION|$))/i);
        return match ? match[1].trim() : '';
      };

      const extractEnglishTranslation = (text: string) => {
        const match = text.match(/ENGLISH_TRANSLATION:\s*([\s\S]*?)(?=\n(?:CONTENT_TYPE|$))/i);
        return match ? match[1].trim() : '';
      };

      const extractContentType = (text: string) => {
        const match = text.match(/CONTENT_TYPE:\s*([\s\S]*?)(?=\n(?:DETAILED_ANALYSIS|$))/i);
        return match ? match[1].trim() : '';
      };

      const extractDetailedAnalysis = (text: string) => {
        const match = text.match(/DETAILED_ANALYSIS:\s*([\s\S]*?)$/i);
        return match ? match[1].trim() : '';
      };

      const structuredResponse = {
        hindiText: extractHindiText(geminiResponse),
        romanizedText: extractRomanizedText(geminiResponse),
        englishTranslation: extractEnglishTranslation(geminiResponse),
        contentType: extractContentType(geminiResponse),
        detailedAnalysis: extractDetailedAnalysis(geminiResponse),
        fullResponse: geminiResponse
      };

      return NextResponse.json({
        success: true,
        data: structuredResponse,
      });

    } catch (aiError) {
      console.error('Gemini AI Error:', aiError);
      return NextResponse.json(
        { error: 'Failed to analyze image with AI. Please try again.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}
