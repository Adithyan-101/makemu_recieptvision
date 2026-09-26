import { useState, useRef } from 'react';
import { Upload } from 'lucide-react';

export default function FileUpload({ onChange, disabled }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        onChange(file);
      } else {
        alert('Please upload an image file.');
      }
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onChange(e.target.files[0]);
    }
    // Reset input so the same file can be selected again if needed
    e.target.value = null;
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative overflow-hidden rounded-2xl border-2 border-dashed p-12
        flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200
        ${disabled ? 'opacity-50 cursor-not-allowed border-gray-200 bg-gray-50' : ''}
        ${isDragOver 
          ? 'border-emerald-500 bg-emerald-50/50 scale-[1.02]' 
          : 'border-gray-300 hover:border-emerald-400 hover:bg-gray-50'}
      `}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        disabled={disabled}
      />
      
      <div className={`p-4 rounded-full mb-4 ${isDragOver ? 'bg-emerald-100' : 'bg-emerald-50 text-emerald-600'}`}>
        <Upload className={`w-8 h-8 ${isDragOver ? 'text-emerald-600' : 'text-emerald-500'}`} />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        Drag & drop your receipt here
      </h3>
      <p className="text-gray-500">
        or <span className="text-emerald-600 font-medium hover:underline">click to browse</span>
      </p>
      
      <p className="mt-4 text-xs text-gray-400 font-medium tracking-wide uppercase">
        Supports JPG, PNG, WEBP
      </p>
    </div>
  );
}
