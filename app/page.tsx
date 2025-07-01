'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';

interface ProcessingResponse {
  hindiText: string;
  romanizedText: string;
  englishTranslation: string;
  contentType: string;
  detailedAnalysis: string;
  fullResponse: string;
}

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [processedData, setProcessedData] = useState<ProcessingResponse | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [noTextFound, setNoTextFound] = useState(false);
  const [quickStop, setQuickStop] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const processingSteps = [
    { id: 1, title: "Analyzing Image", description: "Scanning for Hindi text..." },
    { id: 2, title: "Extracting Text", description: "Reading Hindi characters..." },
    { id: 3, title: "Transliteration", description: "Converting to Roman script..." },
    { id: 4, title: "Translation", description: "Translating to English..." },
    { id: 5, title: "Analysis", description: "Analyzing content..." }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('File selected:', file);
    
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid image file (JPG, PNG, GIF, WEBP)');
        return;
      }

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setError('File size too large. Please select an image under 10MB.');
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      console.log('Preview URL created:', url);
      
      // Reset states
      setProcessedData(null);
      setError(null);
      setCurrentStep(0);
      setNoTextFound(false);
      setQuickStop(false);
    } else {
      console.log('No file selected');
      setError('No file selected. Please choose an image file.');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      console.log('File dropped:', file);
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid image file (JPG, PNG, GIF, WEBP)');
        return;
      }

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setError('File size too large. Please select an image under 10MB.');
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      console.log('Preview URL created from drop:', url);
      
      // Reset states
      setProcessedData(null);
      setError(null);
      setCurrentStep(0);
      setNoTextFound(false);
      setQuickStop(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image file first');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setCurrentStep(0);
    setProcessedData(null);
    setNoTextFound(false);
    setQuickStop(false);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      // Start step 1 immediately
      setCurrentStep(1);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      // Check if no Hindi text detected early
      if (result.quickStop && result.noTextFound) {
        await new Promise(resolve => setTimeout(resolve, 1200));
        setQuickStop(true);
        setNoTextFound(true);
      } else if (result.noTextFound) {
        // Complete all steps then show no text found
        for (let step = 2; step <= 5; step++) {
          setCurrentStep(step);
          await new Promise(resolve => setTimeout(resolve, 600));
        }
        setNoTextFound(true);
      } else {
        // Normal processing - continue with remaining steps
        for (let step = 2; step <= 5; step++) {
          setCurrentStep(step);
          await new Promise(resolve => setTimeout(resolve, 600));
        }
        setProcessedData(result.data);
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Error processing image. Please try again.');
    } finally {
      setIsProcessing(false);
      setCurrentStep(0);
    }
  };

  const downloadResults = () => {
    if (!processedData) return;

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    let yPosition = 30;

    // Helper function to add text with word wrapping
    const addWrappedText = (text: string, y: number, fontSize: number = 12, isBold: boolean = false) => {
      pdf.setFontSize(fontSize);
      if (isBold) {
        pdf.setFont('helvetica', 'bold');
      } else {
        pdf.setFont('helvetica', 'normal');
      }
      
      const lines = pdf.splitTextToSize(text, maxWidth);
      pdf.text(lines, margin, y);
      return y + (lines.length * (fontSize * 0.5)) + 10;
    };

    // Title
    pdf.setFillColor(59, 130, 246); // Blue background
    pdf.rect(0, 0, pageWidth, 25, 'F');
    pdf.setTextColor(255, 255, 255); // White text
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Hindi OCR & AI Text Processor - Results', pageWidth / 2, 16, { align: 'center' });

    // Reset text color
    pdf.setTextColor(0, 0, 0);

    // Document info
    yPosition = addWrappedText(`File: ${selectedFile?.name || 'Unknown'}`, yPosition, 10);
    yPosition = addWrappedText(`Processed: ${new Date().toLocaleString()}`, yPosition, 10);
    yPosition = addWrappedText(`Content Type: ${processedData.contentType}`, yPosition, 10);
    yPosition += 10;

    // Add a separator line
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 20;

    // Original Hindi Text
    pdf.setFillColor(252, 211, 77); // Amber background
    pdf.rect(margin - 5, yPosition - 10, maxWidth + 10, 20, 'F');
    yPosition = addWrappedText('📜 ORIGINAL HINDI TEXT', yPosition, 14, true);
    yPosition += 5;
    yPosition = addWrappedText(processedData.hindiText, yPosition, 12);
    yPosition += 15;

    // Check if we need a new page
    if (yPosition > pdf.internal.pageSize.getHeight() - 50) {
      pdf.addPage();
      yPosition = 30;
    }

    // Romanized Transliteration
    pdf.setFillColor(187, 247, 208); // Green background
    pdf.rect(margin - 5, yPosition - 10, maxWidth + 10, 20, 'F');
    yPosition = addWrappedText('🔤 ROMANIZED TRANSLITERATION', yPosition, 14, true);
    yPosition += 5;
    yPosition = addWrappedText(processedData.romanizedText, yPosition, 12);
    yPosition += 15;

    // Check if we need a new page
    if (yPosition > pdf.internal.pageSize.getHeight() - 50) {
      pdf.addPage();
      yPosition = 30;
    }

    // English Translation
    pdf.setFillColor(219, 234, 254); // Blue background
    pdf.rect(margin - 5, yPosition - 10, maxWidth + 10, 20, 'F');
    yPosition = addWrappedText('🌍 ENGLISH TRANSLATION', yPosition, 14, true);
    yPosition += 5;
    yPosition = addWrappedText(processedData.englishTranslation, yPosition, 12);
    yPosition += 15;

    // Check if we need a new page
    if (yPosition > pdf.internal.pageSize.getHeight() - 50) {
      pdf.addPage();
      yPosition = 30;
    }

    // Detailed Analysis
    pdf.setFillColor(233, 213, 255); // Purple background
    pdf.rect(margin - 5, yPosition - 10, maxWidth + 10, 20, 'F');
    yPosition = addWrappedText('📊 DETAILED ANALYSIS', yPosition, 14, true);
    yPosition += 5;
    yPosition = addWrappedText(processedData.detailedAnalysis, yPosition, 12);

    // Footer
    const pageCount = pdf.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text(`Generated by Hindi OCR & AI Text Processor | Page ${i} of ${pageCount}`, 
        pageWidth / 2, pdf.internal.pageSize.getHeight() - 10, { align: 'center' });
    }

    // Save the PDF
    const fileName = `hindi-ocr-results-${Date.now()}.pdf`;
    pdf.save(fileName);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hindi OCR & AI Text Processor
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload an image containing Hindi text to extract, transliterate, translate, and analyze the content using AI.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">📋 Instructions</h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Upload a clear image containing Hindi text</li>
            <li>• Supports JPG, PNG, and other common image formats</li>
            <li>• The AI will extract text, create transliteration, translate to English, and provide detailed analysis</li>
            <li>• If no Hindi text is detected, processing will stop early</li>
            <li>• Download complete results as a professionally formatted PDF report</li>
          </ul>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Hindi Text Image
          </label>
          
          <div 
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragOver 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="space-y-2">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="text-gray-600">
                  <span className="font-medium text-blue-600 hover:text-blue-500">Click to upload</span> or drag and drop
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF, WEBP up to 10MB</p>
              </div>
            </label>
          </div>

          {previewUrl && selectedFile && (
            <div className="mt-6 text-center">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-600">Selected: {selectedFile.name}</p>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    setError(null);
                    setProcessedData(null);
                    setCurrentStep(0);
                    setNoTextFound(false);
                    setQuickStop(false);
                    // Reset the file input
                    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                    if (fileInput) fileInput.value = '';
                  }}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
              <div className="inline-block border rounded-lg p-2 bg-gray-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full h-auto rounded preview-image"
                  onError={() => {
                    console.error('Error loading image preview');
                    setError('Error loading image preview. Please try selecting the file again.');
                  }}
                  onLoad={() => {
                    console.log('Image preview loaded successfully');
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!selectedFile || isProcessing}
            className="w-full mt-4 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {isProcessing ? 'Processing...' : 'Extract Text & Process'}
          </button>

          {/* Debug Info */}
          {/* {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-gray-600">
              <strong>Debug Info:</strong><br />
              Selected File: {selectedFile ? `${selectedFile.name} (${selectedFile.type})` : 'None'}<br />
              Preview URL: {previewUrl ? 'Generated' : 'None'}<br />
              Processing: {isProcessing ? 'Yes' : 'No'}
            </div>
          )} */}

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Processing Steps */}
        {isProcessing && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Processing Status</h3>
            <div className="space-y-3">
              {processingSteps.map((step) => {
                const isCompleted = currentStep > step.id;
                const isActive = currentStep === step.id;
                const isSkipped = quickStop && noTextFound && step.id > 1;
                
                return (
                  <div key={step.id} className={`flex items-center space-x-3 p-3 rounded-lg ${
                    isActive ? 'bg-blue-50' : isCompleted ? 'bg-green-50' : isSkipped ? 'bg-gray-50' : 'bg-gray-50'
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                      isActive ? 'bg-blue-500 text-white' : 
                      isCompleted ? 'bg-green-500 text-white' : 
                      isSkipped ? 'bg-gray-400 text-white' : 'bg-gray-300 text-gray-600'
                    }`}>
                      {isActive ? '⋯' : isCompleted ? '✓' : isSkipped ? '⏭' : step.id}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{step.title}</div>
                      <div className="text-sm text-gray-600">
                        {isSkipped ? 'Skipped - No Hindi text detected' : step.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* No Text Found */}
        {noTextFound && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="font-semibold text-orange-900 mb-2">
              {quickStop ? 'No Hindi Text Detected' : 'Processing Complete - No Hindi Text Found'}
            </h3>
            <p className="text-orange-800">
              The uploaded image appears to contain English or other non-Hindi content. Please try with an image containing Hindi/Devanagari text.
            </p>
          </div>
        )}

        {/* Results */}
        {processedData && (
          <div className="space-y-6">
            {/* Download Button */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">✅</div>
              <h3 className="font-semibold text-green-900 mb-2">Processing Complete!</h3>
              <button
                onClick={downloadResults}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium transition-colors"
              >
                 Download PDF Report
              </button>
            </div>

            {/* Results Display */}
            <div className="grid gap-6">
              {/* Original Hindi Text */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="text-2xl mr-2">📜</span>
                  Original Hindi Text
                </h3>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-lg text-gray-900 font-mono leading-relaxed whitespace-pre-wrap">
                    {processedData.hindiText}
                  </p>
                </div>
              </div>

              {/* Transliteration */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="text-2xl mr-2">🔤</span>
                  Romanized Transliteration
                </h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-lg text-gray-900 font-mono leading-relaxed whitespace-pre-wrap italic">
                    {processedData.romanizedText}
                  </p>
                </div>
              </div>

              {/* Translation & Analysis */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="text-2xl mr-2">🌍</span>
                  English Translation & Analysis
                </h3>
                
                {processedData.contentType && (
                  <div className="mb-4">
                    <span className="inline-block bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">
                      {processedData.contentType}
                    </span>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Translation:</h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                        {processedData.englishTranslation}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Detailed Analysis:</h4>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="detailed-analysis text-gray-900 leading-relaxed whitespace-pre-wrap">
                        {processedData.detailedAnalysis}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
