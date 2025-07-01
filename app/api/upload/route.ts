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

    // Create a prompt for Gemini to first quickly check for any readable text
    const quickCheckPrompt = `
      Look at this image and determine if there is any readable text present in any language.
      
      Respond with ONLY:
      - "TEXT_FOUND" if you see any readable text in any language
      - "NO_TEXT" if there's no readable text or the image is not clear enough
      
      Be quick and decisive - just look for any text characters, letters, or script symbols.
    `;

    try {
      // Prepare the image part for Gemini
      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      };

      // First, do a quick check for any readable text
      const quickCheckResult = await model.generateContent([quickCheckPrompt, imagePart]);
      const quickCheckResponse = quickCheckResult.response.text().trim();

      console.log('Quick check result:', quickCheckResponse);

      // If no readable text found, return immediately
      if (quickCheckResponse.includes('NO_TEXT')) {
        return NextResponse.json({
          success: true,
          noTextFound: true,
          message: 'No readable text was detected in the image. Please try with a clearer image containing text.',
          quickStop: true
        });
      }

      // If text is found, proceed with full analysis
      const detailedPrompt = `
        You are an expert multilingual OCR and translation specialist. Please analyze this image and provide a structured response.
        
        Since text has been detected, provide your response in this EXACT format:
        
        EXTRACTED_TEXT:
        [Write the complete text exactly as it appears in the image, preserving all formatting and line breaks]
        
        DETECTED_LANGUAGE:
        [Full name of the detected language (e.g., "Hindi", "Spanish", "Arabic", "Chinese", "English", etc.)]
        
        LANGUAGE_CODE:
        [ISO language code (e.g., "hi" for Hindi, "es" for Spanish, "ar" for Arabic, "zh" for Chinese, "en" for English, etc.)]
        
        ROMANIZED_TRANSLITERATION:
        [If the detected language uses a non-Latin script, provide romanized transliteration using standard romanization. If already in Latin script, write "N/A - Already in Latin script"]
        
        ENGLISH_TRANSLATION:
        [Provide a complete English translation of the text. If the text is already in English, write "N/A - Original text is in English"]
        
        CONTENT_TYPE:
        [Specify what type of content this is: poem, story, article, sign, book page, handwritten note, etc.]
        
        DETAILED_ANALYSIS:
        For each stanza/paragraph/section, follow this EXACT format with proper grouping:
        
        Section 1:
        ● [Original text line], ([Transliteration/romanization if applicable])
        ○ Meaning: [English meaning of this line]
        ● [Next original text line], ([Transliteration/romanization if applicable])
        ○ Meaning: [English meaning of this line]
        
        Section 2:
        ● [Original text line], ([Transliteration/romanization if applicable])
        ○ Meaning: [English meaning of this line]
        
        [Continue this pattern for all sections]
        
        Example format:
        Stanza 1:
        ● मैं तुम-सबकी ओर निहार रहा हूँ, (Main tum-sabakī ora nihāra rahā hūṅ,)
        ○ Meaning: I am gazing towards all of you,
        ● स्थान मुझे भी दो तुम अपने बीच; (Sthāna mujhe bhī dō tum apanē bīch;)
        ○ Meaning: Give me a place too, amongst yourselves;
        
        Stanza 2:
        ● कुछ तो कहो कि मैं यहाँ हूँ! (Kuch to kaho ki main yahāṅ hūṅ!)
        ○ Meaning: Say something, for I am here!
        
        CRITICAL FORMATTING RULES:
        - Use exactly ● (bullet) for original text lines with transliteration/romanization in parentheses (if applicable)
        - Use exactly ○ (circle) for meanings that start with "Meaning:"
        - Group lines by section with clear "Section X:" headers
        - Analyze every single line of each section
        - If it's poetry, use "Stanza" instead of "Section"
        - If it's prose, treat each paragraph as a section
        - Maintain consistent spacing and formatting throughout
        - Do not use any other bullet or numbering styles
        - For languages already in Latin script, you may omit transliteration in parentheses
        
        Be accurate and thorough in your analysis. Make sure to format everything clearly under the specified sections.
      `;

      // Get detailed response from Gemini
      const result = await model.generateContent([detailedPrompt, imagePart]);
      const response = result.response;
      const geminiResponse = response.text();

      console.log('Gemini Vision analysis completed');

      // Parse the structured response from detailed analysis
      const extractOriginalText = (text: string) => {
        const match = text.match(/EXTRACTED_TEXT:\s*([\s\S]*?)(?=\n(?:DETECTED_LANGUAGE|$))/i);
        return match ? match[1].trim() : '';
      };

      const extractDetectedLanguage = (text: string) => {
        const match = text.match(/DETECTED_LANGUAGE:\s*([\s\S]*?)(?=\n(?:LANGUAGE_CODE|$))/i);
        return match ? match[1].trim() : '';
      };

      const extractLanguageCode = (text: string) => {
        const match = text.match(/LANGUAGE_CODE:\s*([\s\S]*?)(?=\n(?:ROMANIZED_TRANSLITERATION|$))/i);
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
        originalText: extractOriginalText(geminiResponse),
        detectedLanguage: extractDetectedLanguage(geminiResponse),
        languageCode: extractLanguageCode(geminiResponse),
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
