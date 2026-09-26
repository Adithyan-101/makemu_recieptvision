import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Upload, Camera, Sparkles, AlertCircle, FileImage, X, Video, StopCircle } from 'lucide-react';

export default function ScanReceipt() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const navigate = useNavigate();

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setFileWithPreview(droppedFile);
      setError('');
    } else {
      setError('Please upload a valid image file.');
    }
  };

  const setFileWithPreview = (selectedFile) => {
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(selectedFile);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFileWithPreview(selectedFile);
      setError('');
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Camera functionality
  const startCamera = useCallback(async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      console.error('Camera error:', err);
      setError('Could not access camera. Please check permissions or use file upload instead.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const capturedFile = new File([blob], `receipt-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setFileWithPreview(capturedFile);
        stopCamera();
      }
    }, 'image/jpeg', 0.92);
  }, [stopCamera]);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post('/api/receipts/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      localStorage.setItem('lastAnalysis', JSON.stringify(response.data.scan));
      navigate(`/analysis/${response.data.scan._id}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to analyze receipt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('/api/receipts/analyze?demo=true', {});
      localStorage.setItem('lastAnalysis', JSON.stringify(response.data.scan));
      navigate(`/analysis/${response.data.scan._id}`);
    } catch (err) {
      console.error(err);
      setError('Demo mode failed. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--gradient-hero)' }}>
      <canvas ref={canvasRef} className="hidden" />
      
      <div className="max-w-2xl w-full animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 rounded-full bg-emerald-100/80 text-emerald-700 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Analysis
          </div>
          <h2 className="text-4xl font-black text-gray-900 mb-2">Scan Your Receipt</h2>
          <p className="text-lg text-gray-500">Upload a receipt image, use your camera, or try our demo</p>
        </div>

        {/* Main Card */}
        <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100 space-y-6">
          {/* Error */}
          {error && (
            <div className="animate-scale-in bg-red-50 p-4 rounded-2xl flex items-start gap-3 border border-red-100">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Demo Button */}
          <button
            onClick={handleDemo}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {loading ? (
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-6 h-6" />
            )}
            <span className="text-lg">Try Demo Receipt</span>
          </button>

          {/* Divider */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-xs font-bold text-gray-400 uppercase tracking-widest">
                Or use your own
              </span>
            </div>
          </div>

          {/* Camera View */}
          {cameraActive ? (
            <div className="animate-scale-in rounded-2xl overflow-hidden bg-black relative">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full rounded-2xl"
              />
              <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4">
                <button
                  onClick={capturePhoto}
                  className="w-16 h-16 bg-white rounded-full shadow-xl flex items-center justify-center hover:scale-105 transition-transform border-4 border-gray-200"
                >
                  <Camera className="w-7 h-7 text-gray-900" />
                </button>
                <button
                  onClick={stopCamera}
                  className="w-12 h-12 bg-red-500 rounded-full shadow-lg flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <StopCircle className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
          ) : !file ? (
            <>
              {/* Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col justify-center items-center px-6 pt-10 pb-12 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${
                  isDragging 
                    ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01]' 
                    : 'border-gray-200 hover:border-emerald-400 hover:bg-gray-50/50'
                }`}
              >
                <div className={`p-4 rounded-2xl mb-4 transition-colors ${isDragging ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                  <Upload className={`h-10 w-10 ${isDragging ? 'text-emerald-500' : 'text-gray-400'}`} />
                </div>
                <p className="text-base font-semibold text-gray-700">
                  Drag & drop your receipt here
                </p>
                <p className="text-sm text-gray-400 mt-1">or click to browse</p>
                <p className="text-xs text-gray-400 mt-3 px-3 py-1.5 bg-gray-50 rounded-full">PNG, JPG, JPEG up to 10MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>

              {/* Camera Button */}
              {navigator.mediaDevices && (
                <button 
                  onClick={startCamera}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-600 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all duration-200"
                >
                  <Video className="w-4 h-4" />
                  Use Camera Instead
                </button>
              )}
            </>
          ) : (
            /* File Preview */
            <div className="animate-scale-in bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
              {preview && (
                <div className="relative bg-gray-100 flex items-center justify-center p-4 max-h-64 overflow-hidden">
                  <img src={preview} alt="Receipt preview" className="max-h-56 rounded-lg shadow-sm object-contain" />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-100 rounded-xl text-emerald-600">
                      <FileImage className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    onClick={removeFile}
                    disabled={loading}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={handleUpload}
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Analyzing your receipt...
                    </>
                  ) : (
                    'Analyze Receipt'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
