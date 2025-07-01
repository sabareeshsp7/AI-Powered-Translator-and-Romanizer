'use client';

import { useState } from 'react';

interface ProcessingResponse {
  originalText: string;
  detectedLanguage: string;
  languageCode: string;
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
    { id: 1, title: "Analyzing Image", description: "Detecting language and scanning text..." },
    { id: 2, title: "Extracting Text", description: "Reading text characters..." },
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Universal OCR & AI Text Processor
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload an image containing text in any language to extract, transliterate, translate, and analyze the content using AI.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">📋 Instructions</h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Upload a clear image containing text in any language</li>
            <li>• Supports JPG, PNG, and other common image formats</li>
            <li>• The AI will automatically detect the language, extract text, create transliteration, translate to English, and provide detailed analysis</li>
            <li>• If no readable text is detected, processing will stop early</li>
          </ul>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Text Image (Any Language)
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
                        {isSkipped ? 'Skipped - No readable text detected' : step.description}
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
              {quickStop ? 'No Readable Text Detected' : 'Processing Complete - No Readable Text Found'}
            </h3>
            <p className="text-orange-800">
              The uploaded image appears to contain no readable text or text that cannot be processed. Please try with a clearer image containing text.
            </p>
          </div>
        )}

        {/* Results */}
        {processedData && (
          <div className="space-y-6">
            {/* Processing Complete Header */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">✅</div>
              <h3 className="font-semibold text-green-900 mb-2">Processing Complete!</h3>
              <p className="text-green-800">Your text has been successfully analyzed and processed.</p>
            </div>

            {/* Results Display */}
            <div className="grid gap-6">
              {/* Original Text */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="text-2xl mr-2">📜</span>
                  Original Text ({processedData.detectedLanguage})
                </h3>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-lg text-gray-900 font-mono leading-relaxed whitespace-pre-wrap">
                    {processedData.originalText}
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
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-5">
                      <div className="detailed-analysis text-gray-900">
                        {processedData.detailedAnalysis.split('\n').map((line, index) => {
                          // Handle stanza headers
                          if (line.trim().startsWith('Stanza ') && line.includes(':')) {
                            return (
                              <div key={index} className="font-semibold text-purple-800 mt-4 mb-2 text-base">
                                {line.trim()}
                              </div>
                            );
                          }
                          // Handle Hindi lines with bullets
                          else if (line.trim().startsWith('●')) {
                            return (
                              <div key={index} className="ml-3 mb-1 text-gray-800 font-medium">
                                {line.trim()}
                              </div>
                            );
                          }
                          // Handle meaning lines with circles
                          else if (line.trim().startsWith('○')) {
                            return (
                              <div key={index} className="ml-6 mb-3 text-gray-700 italic">
                                {line.trim()}
                              </div>
                            );
                          }
                          // Handle empty lines
                          else if (line.trim() === '') {
                            return <div key={index} className="h-2"></div>;
                          }
                          // Handle any other lines
                          else {
                            return (
                              <div key={index} className="mb-2 text-gray-800">
                                {line.trim()}
                              </div>
                            );
                          }
                        })}
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
