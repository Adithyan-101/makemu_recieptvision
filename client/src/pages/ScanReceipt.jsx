import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Upload, Camera, Sparkles, AlertCircle, FileImage, X } from 'lucide-react';

export default function ScanReceipt() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
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
      setFile(droppedFile);
      setError('');
    } else {
      setError('Please upload a valid image file.');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

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
      // Store in localStorage for other pages
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
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-2xl w-full space-y-8 bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Scan Your Receipt</h2>
          <p className="mt-2 text-lg text-gray-600">Upload a receipt image or try our demo</p>
        </div>

        {error && (
          <div className="bg-red-50 p-4 rounded-xl flex items-start gap-3 border border-red-100">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="flex justify-center mb-8">
          <button
            onClick={handleDemo}
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl shadow-md transition-all hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Sparkles className="w-6 h-6" />
            )}
            Try Demo Receipt
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-white text-sm font-medium text-gray-400 uppercase tracking-wide">
              OR UPLOAD YOUR OWN
            </span>
          </div>
        </div>

        {!file ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`mt-8 flex flex-col justify-center items-center px-6 pt-10 pb-12 border-2 border-dashed rounded-2xl cursor-pointer transition-colors duration-200 ${
              isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-emerald-400 hover:bg-gray-50'
            }`}
          >
            <Upload className={`mx-auto h-12 w-12 ${isDragging ? 'text-emerald-500' : 'text-gray-400'}`} />
            <div className="mt-4 flex text-sm text-gray-600 text-center flex-col sm:flex-row">
              <span className="relative font-medium text-emerald-600 hover:text-emerald-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-emerald-500">
                Drag & drop your receipt here
              </span>
              <p className="pl-1">or click to browse</p>
            </div>
            <p className="text-xs text-gray-500 mt-2">PNG, JPG, JPEG up to 10MB</p>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-100 rounded-lg text-emerald-600">
                  <FileImage className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button
                onClick={removeFile}
                disabled={loading}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={handleUpload}
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Analyzing your receipt...
                </span>
              ) : (
                'Analyze Receipt'
              )}
            </button>
          </div>
        )}

        {navigator.mediaDevices && (
          <div className="mt-6 flex justify-center">
            <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-600 transition-colors font-medium">
              <Camera className="w-4 h-4" />
              Use Camera Instead
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
