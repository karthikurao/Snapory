'use client';

import { useState } from 'react';
import { apiClient, PhotoUploadResponse } from '@/lib/api-client';

export default function PhotoUploader() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [eventId, setEventId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<PhotoUploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError(null);
      setUploadResult(null);
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
      const result = await apiClient.uploadPhoto(selectedFile, eventId || undefined);
      setUploadResult(result);
      setSelectedFile(null);
      setEventId('');
      
      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="photo-uploader">
      <h2>Upload Photo</h2>
      
      <div className="upload-form">
        <div className="form-group">
          <label htmlFor="file-input">Select Photo:</label>
          <input
            id="file-input"
            type="file"
            accept="image/jpeg,image/png,image/gif"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="event-id">Event ID (optional):</label>
          <input
            id="event-id"
            type="text"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            placeholder="e.g., birthday-2024"
            disabled={uploading}
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="upload-button"
        >
          {uploading ? 'Uploading...' : 'Upload Photo'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {uploadResult && (
        <div className="success-message">
          <h3>Upload Successful!</h3>
          <p><strong>File:</strong> {uploadResult.fileName}</p>
          <p><strong>Size:</strong> {(uploadResult.sizeInBytes / 1024).toFixed(2)} KB</p>
          <p><strong>Status:</strong> {uploadResult.status}</p>
          <p><strong>Photo ID:</strong> {uploadResult.photoId}</p>
          <a href={uploadResult.storageUrl} target="_blank" rel="noopener noreferrer">
            View Photo
          </a>
        </div>
      )}
    </div>
  );
}
