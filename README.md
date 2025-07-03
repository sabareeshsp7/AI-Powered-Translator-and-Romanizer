#  Universal OCR & AI Text Processor

A powerful Next.js application that processes text images in **any language** using AI-powered OCR, automatic language detection, transliteration, translation, and detailed analysis.

## ✨ Features

### 🔍 **Smart Text & Language Detection**
- **Universal Text Recognition**: Automatically detects and extracts text from any language
- **Language Identification**: Identifies the specific language of the detected text
- **Early Stop**: Immediately notifies users if no readable text is found, saving processing time
- **Multi-format Support**: Supports JPG, PNG, GIF, and other common image formats (up to 10MB)

### 🌐 **Comprehensive Language Support**
**The application supports ALL major world languages including:**
- **Asian Languages**: Hindi, Chinese (Simplified/Traditional), Japanese, Korean, Thai, Arabic, Hebrew, etc.
- **European Languages**: Spanish, French, German, Italian, Russian, Greek, Portuguese, Dutch, etc.
- **Indian Languages**: Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Punjabi, Malayalam, etc.  
- **Other Scripts**: Arabic, Persian, Urdu, Thai, Burmese, Khmer, Mongolian, Tibetan, etc.
- **Latin-based Languages**: English, Spanish, French, Portuguese, Italian, German, and many more

### 📝 **Comprehensive Text Processing**
1. **OCR Extraction**: Extracts text from images using Google Gemini Vision AI
2. **Language Detection**: Automatically identifies the language and provides language code
3. **Romanization**: Converts non-Latin scripts to Roman script (transliteration)
4. **English Translation**: Provides accurate English translation for any detected language
5. **Content Analysis**: Identifies content type (poem, story, sign, etc.)
6. **Detailed Breakdown**: Section-by-section analysis with meanings
5. **Detailed Breakdown**: Stanza-by-stanza analysis with proper formatting:
   - ● Original text lines with transliteration (if applicable)
   - ○ English meanings for each line
   - Clear section/stanza grouping and structure

### 🎯 **Enhanced Analysis Format**
- **Structured Output**: Each section/stanza is clearly labeled and grouped
- **Multi-Script Display**: Original text with romanized transliteration (when applicable)
- **Line-by-Line Meanings**: Individual explanations for better understanding
- **Professional Formatting**: Clean, readable layout with proper spacing
- **Language-Aware Processing**: Adapts analysis style based on detected language

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AI-Powered-Translator-and-Romanizer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎯 How to Use

### Step 1: Upload Image
- Click the upload area or drag and drop an image
- Supported formats: JPG, PNG, GIF (up to 10MB)
- Preview your selected image before processing

### Step 2: Process
- Click "Extract Text & Process"
- Watch real-time progress through 5 processing steps:
  1. **Analyzing Image** - Detecting language and scanning text
  2. **Extracting Text** - Reading text characters  
  3. **Transliteration** - Converting to Roman script
  4. **Translation** - Translating to English
  5. **Analysis** - Analyzing content and meaning

### Step 3: View Results
After processing, you'll see three organized sections:
- **📜 Original Text**: Extracted text in the detected language
- **🔤 Romanized Transliteration**: Text in Roman characters (if applicable)
- **🌍 Translation & Analysis**: English translation with structured analysis

## 📋 Analysis Format Examples

### For Hindi Text:
```
Section 1:
● मैं तुम-सबकी ओर निहार रहा हूँ, (Main tum-sabakī ora nihāra rahā hūṅ,)
○ Meaning: I am gazing towards all of you,
● स्थान मुझे भी दो तुम अपने बीच; (Sthāna mujhe bhī dō tum apanē bīch;)
○ Meaning: Give me a place too, amongst yourselves;
```

### For Arabic Text:
```
Section 1:
● مرحبا بكم في عالم الذكاء الاصطناعي (Marhaban bikum fi alam al-dhaka' al-istinaei)
○ Meaning: Welcome to the world of artificial intelligence
```

### For Chinese Text:
```
Section 1:
● 人工智能的未来 (Réngōng zhìnéng de wèilái)
○ Meaning: The future of artificial intelligence
```

### For Japanese Text:
```
Section 1:
● こんにちは世界 (Konnichiwa sekai)
○ Meaning: Hello world
```

### For Russian Text:
```
Section 1:
● Добро пожаловать в будущее (Dobro pozhalovat' v budushcheye)
○ Meaning: Welcome to the future
```

## 🔧 What the App Can Process

### ✅ **Supported Content Types**
- **Poetry**: Poems, verses in any language
- **Literature**: Stories, articles, essays
- **Signs**: Street signs, shop boards, notices in any script
- **Handwritten Text**: Clear handwritten text in various languages
- **Printed Material**: Books, newspapers, documents
- **Religious Texts**: Texts in Sanskrit, Arabic, Hebrew, etc.
- **Educational Content**: Textbooks, worksheets in any language

### ✅ **Processing Capabilities**
- **Accurate OCR**: High-precision text recognition for multiple scripts
- **Language Detection**: Automatic identification of 100+ languages
- **Context-Aware Translation**: Understands cultural and literary context
- **Literary Analysis**: Explains metaphors, themes, and meanings
- **Grammar Insights**: Identifies linguistic patterns and structures
- **Cultural References**: Explains cultural and historical references

### ❌ **Limitations**
- Requires clear, readable text (avoid very blurry or damaged images)
- Best results with high-contrast images
- May struggle with very stylized or decorative fonts
- Processing time varies based on text complexity and language

## 🛠️ Technical Details

### Architecture
- **Frontend**: Next.js 15.3.4 with TypeScript
- **Styling**: Tailwind CSS
- **AI Engine**: Google Gemini 1.5 Flash Vision API
- **Image Processing**: Client-side preview with server-side AI processing

### API Endpoints
- `POST /api/upload` - Main processing endpoint
  - Accepts multipart form data with image file
  - Returns structured JSON with all processing results
  - Implements universal text detection and language identification
