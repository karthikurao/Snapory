'use client';

import { useState, useRef, useEffect } from 'react';
import { apiClient, PhotoUploadResponse } from '@/lib/api-client';

export default function PhotoUploader() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [eventId, setEventId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<PhotoUploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
    setUploadResult(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadResult(null);

    try {
      const result = await apiClient.uploadPhotos(eventId || '', [selectedFile]);
      setUploadResult(result);
      setSelectedFile(null);
      setPreviewUrl(null);
      setEventId('');
      
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const dropzoneStyles: React.CSSProperties = {
    border: '2px dashed',
    borderColor: isDragging ? 'var(--primary)' : selectedFile ? 'var(--primary)' : 'var(--input)',
    borderRadius: 'var(--radius)',
    padding: selectedFile ? '0' : '2rem 1rem',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: isDragging ? 'var(--secondary)' : selectedFile ? 'transparent' : 'var(--background)',
    transform: isDragging ? 'scale(1.01)' : 'scale(1)',
    minHeight: '180px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--foreground)' }}>Upload Photo</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', margin: 0 }}>Tap to select or drag and drop</p>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div 
          style={dropzoneStyles}
          onClick={triggerFileInput}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
            disabled={uploading}
            style={{ display: 'none' }}
          />
          
          {previewUrl ? (
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16/10' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={previewUrl} 
                alt="Preview of selected photo" 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  borderRadius: 'calc(var(--radius) - 2px)'
                }}
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                padding: '1rem',
                borderRadius: 'calc(var(--radius) - 2px)'
              }}>
                <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: 500 }}>
                  {selectedFile && selectedFile.name.length > 20 ? selectedFile.name.substring(0, 20) + '...' : selectedFile?.name}
                </span>
                <button 
                  onClick={clearSelection}
                  style={{
                    background: 'rgba(255,255,255,0.9)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.2s'
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '1rem 0' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <div>
                <span style={{ fontSize: '0.9375rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem', color: 'var(--foreground)' }}>
                  Tap to upload photo
                </span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>
                  or drag and drop here
                </span>
              </div>
              <span style={{ 
                fontSize: '0.6875rem', 
                color: 'var(--muted-foreground)', 
                backgroundColor: 'var(--secondary)', 
                padding: '0.25rem 0.625rem', 
                borderRadius: '9999px' 
              }}>
                JPG, PNG, GIF, WebP • Max 10MB
              </span>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="event-id" style={{ 
            fontSize: '0.875rem', 
            fontWeight: 600, 
            marginBottom: '0.5rem', 
            display: 'block', 
            color: 'var(--foreground)' 
          }}>
            Event ID 
            <span style={{ color: 'var(--muted-foreground)', fontWeight: 400, fontSize: '0.75rem', marginLeft: '0.25rem' }}>(Optional)</span>
          </label>
          <input
            id="event-id"
            type="text"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            placeholder="e.g., wedding-2024"
            disabled={uploading}
            className="input"
            style={{ fontSize: '16px' }} // Prevents iOS zoom
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="btn btn-primary"
          style={{ 
            width: '100%', 
            position: 'relative',
            opacity: (!selectedFile || uploading) ? 0.5 : 1
          }}
        >
          {uploading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg style={{ animation: 'spin 1s linear infinite', width: '16px', height: '16px' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Upload Photo
            </span>
          )}
        </button>
      </div>

      {error && (
        <div style={{
          padding: '0.875rem 1rem',
          fontSize: '0.875rem',
          color: 'var(--destructive-foreground)',
          backgroundColor: 'var(--destructive-light)',
          border: '1px solid var(--destructive)',
          borderRadius: 'var(--radius)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          animation: 'fadeIn 0.3s ease'
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      {uploadResult && (
        <div style={{
          padding: '1.25rem',
          backgroundColor: 'var(--success-light)',
          border: '1px solid var(--success)',
          borderRadius: 'var(--radius)',
          textAlign: 'center',
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            backgroundColor: 'var(--success-lighter)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.75rem'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
          </div>
          <div style={{ color: 'var(--success-foreground)', fontWeight: 600, fontSize: '1rem', marginBottom: '0.25rem' }}>Upload Successful!</div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--success-foreground)', marginBottom: '1rem' }}>
            Your photo has been added to the event.
            {uploadResult.photos && uploadResult.photos.length > 0 && ` (Photo ID: ${uploadResult.photos[0].photoId.substring(0, 8)}...)`}
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
