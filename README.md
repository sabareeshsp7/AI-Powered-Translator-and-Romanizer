# 🇮🇳 Hindi OCR & AI Text Processor

A powerful Next.js application that processes Hindi text images using AI-powered OCR, transliteration, translation, and detailed analysis with comprehensive download functionality.

## ✨ Features

### 🔍 **Smart Text Detection**
- **Instant Detection**: Quickly identifies if an image contains Hindi/Devanagari text
- **Early Stop**: Immediately notifies users if no Hindi text is found, saving processing time
- **Multi-format Support**: Supports JPG, PNG, GIF, and other common image formats (up to 10MB)

### 📝 **Comprehensive Text Processing**
1. **OCR Extraction**: Extracts Hindi text from images using Google Gemini Vision AI
2. **Romanization**: Converts Hindi text to Roman script (transliteration)
3. **English Translation**: Provides accurate English translation
4. **Content Analysis**: Identifies content type (poem, story, sign, etc.)
5. **Detailed Breakdown**: Line-by-line or stanza-by-stanza analysis with meanings

### 💾 **Professional PDF Reports**
- **One-Click Download**: Download all results as a formatted PDF report
- **Professional Layout**: Color-coded sections with proper typography
- **Multi-page Support**: Automatically handles lengthy content across pages
- **Complete Information**: Includes original text, transliteration, translation, and analysis
- **Metadata Included**: Processing date, filename, and content type
- **Print-Ready**: High-quality formatting suitable for printing or sharing

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd poem-ai-indhic
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

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 How to Use

### Step 1: Upload Image
- Click the upload area or drag and drop an image
- Supported formats: JPG, PNG, GIF (up to 10MB)
- Preview your selected image before processing

### Step 2: Process
- Click "Extract Text & Process"
- Watch real-time progress through 5 processing steps:
  1. **Analyzing Image** - Scanning for Hindi text
  2. **Extracting Text** - Reading Hindi characters  
  3. **Transliteration** - Converting to Roman script
  4. **Translation** - Translating to English
  5. **Analysis** - Analyzing content and meaning

### Step 3: View Results
After processing, you'll see three organized sections:
- **📜 Original Hindi Text**: Extracted text in Devanagari script
- **🔤 Romanized Transliteration**: Hindi text in Roman characters
- **🌍 Translation & Analysis**: English translation with detailed breakdown

### Step 4: Download PDF Report
- Click the "� Download PDF Report" button
- Get a professionally formatted PDF with all processed information
- Includes color-coded sections, proper formatting, and metadata

## 🔧 What the App Can Process

### ✅ **Supported Content Types**
- **Poetry**: Hindi poems, shayari, verses
- **Literature**: Stories, articles, essays
- **Signs**: Street signs, shop boards, notices
- **Handwritten Text**: Clear handwritten Hindi text
- **Printed Material**: Books, newspapers, documents
- **Religious Texts**: Sanskrit/Hindi religious content
- **Educational Content**: Textbooks, worksheets

### ✅ **Processing Capabilities**
- **Accurate OCR**: High-precision text recognition
- **Context-Aware Translation**: Understands cultural and literary context
- **Literary Analysis**: Explains metaphors, themes, and meanings
- **Grammar Insights**: Identifies poetic devices and language patterns
- **Cultural References**: Explains cultural and historical references

### ❌ **Limitations**
- Requires clear, readable text (avoid very blurry or damaged images)
- Best results with high-contrast images
- May struggle with very stylized or decorative fonts
- Limited to Hindi/Devanagari script (will detect and reject other languages)

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
  - Implements early Hindi text detection

### Performance Features
- **Smart Detection**: Quick initial scan to avoid unnecessary processing
- **Optimized UI**: Minimal animations and clean interface
- **Error Handling**: Comprehensive error messages and recovery
- **File Validation**: Size and format checks before processing

## 📱 User Experience

### Clean Interface
- **Professional Design**: Clean, modern UI without excessive animations
- **Clear Instructions**: Step-by-step guidance for users
- **Visual Feedback**: Real-time processing status
- **Error Messages**: Clear, actionable error messages

### Accessibility
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Friendly**: Proper ARIA labels and semantic HTML
- **High Contrast**: Clear visual distinction between elements
- **Responsive Design**: Works on desktop, tablet, and mobile

## 🔐 Privacy & Security

- **No Data Storage**: Images and text are not stored on servers
- **Secure Processing**: All processing happens through encrypted connections
- **API Key Protection**: Environment variables protect sensitive keys
- **Client-Side Preview**: Image preview happens locally in browser

## 🚨 Error Handling

The app handles various scenarios gracefully:
- **No File Selected**: Clear prompt to select an image
- **Wrong File Type**: Validation message for non-image files
- **File Too Large**: Size limit notification (10MB max)
- **No Hindi Text**: Immediate detection and user notification  
- **API Errors**: Network and processing error recovery
- **Timeout Issues**: Graceful handling of slow connections

## 🎨 PDF Download Features

### What's Included in PDF Reports
- **Professional Header**: Blue header with app title and branding
- **Document Information**: Processing date, filename, content type
- **Color-Coded Sections**: 
  - 📜 **Amber**: Original Hindi Text section
  - 🔤 **Green**: Romanized Transliteration section  
  - 🌍 **Blue**: English Translation section
  - 📊 **Purple**: Detailed Analysis section
- **Proper Typography**: Clean fonts with appropriate sizing
- **Multi-page Support**: Automatic page breaks for lengthy content
- **Professional Footer**: Page numbers and app attribution

### PDF Format Features
- **High Quality**: Vector-based text for crisp printing
- **Proper Margins**: Professional document formatting
- **Unicode Support**: Full support for Hindi/Devanagari characters
- **Searchable Text**: All text is selectable and searchable
- **Print-Ready**: Optimized for both screen viewing and printing
- **Compact Size**: Efficient file size without quality loss

## 🔧 Development

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Key Dependencies
- **@google/generative-ai**: Google Gemini AI integration
- **next**: React framework  
- **typescript**: Type safety
- **tailwindcss**: Utility-first CSS
- **react**: UI library
- **jspdf**: PDF generation for download reports
- **html2canvas**: Canvas utilities for PDF generation

### Getting a Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env.local` file as `GEMINI_API_KEY`

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## 🔧 Troubleshooting

### Common Issues
- **API Key Issues**: Ensure your Gemini API key is correctly set in `.env.local`
- **Image Upload Issues**: Check file size (max 10MB) and format (JPG, PNG, GIF)
- **No Results**: Ensure the image contains clear, readable Hindi text
- **Network Errors**: Check internet connection and API key validity

---

**Built with ❤️ for the Hindi language community**
