'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { apiClient, PhotoMatch } from '@/lib/api-client';

type Step = 'welcome' | 'selfie' | 'processing' | 'photos' | 'error';

export default function GuestEventPage() {
  const params = useParams();
  const accessCode = params.code as string;
  
  const [step, setStep] = useState<Step>('welcome');
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState<string | undefined>();
  const [location, setLocation] = useState<string | undefined>();
  const [sessionId, setSessionId] = useState('');
  const [photos, setPhotos] = useState<PhotoMatch[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Join event on mount
  useEffect(() => {
    const joinEvent = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.joinEvent(accessCode.toUpperCase());
        setSessionId(response.sessionId);
        setEventName(response.eventName);
        setEventDate(response.eventDate);
        setLocation(response.location);
      } catch (err) {
        console.error('Failed to join event:', err);
        setError('Event not found or no longer active');
        setStep('error');
      } finally {
        setIsLoading(false);
      }
    };

    if (accessCode) {
      joinEvent();
    }
  }, [accessCode]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access denied:', err);
      setError('Camera access is required to find your photos');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (step === 'selfie') {
      startCamera();
    } else {
      stopCamera();
    }
  }, [step, startCamera, stopCamera]);

  const captureSelfie = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Flip horizontally for mirror effect
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    // Convert to blob
    canvas.toBlob(async (blob) => {
      if (!blob) return;

      stopCamera();
      setStep('processing');
      setProcessingMessage('Uploading your selfie...');

      try {
        // Create file from blob
        const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
        
        // Upload selfie
        setProcessingMessage('Analyzing your face...');
        await apiClient.uploadSelfie(sessionId, file);

        // Find matching photos
        setProcessingMessage('Searching through event photos...');
        const matchResponse = await apiClient.findMatchingPhotos(sessionId);

        setPhotos(matchResponse.photos);
        setStep('photos');
      } catch (err) {
        console.error('Processing failed:', err);
        setError('Failed to process your selfie. Please try again.');
        setStep('selfie');
      }
    }, 'image/jpeg', 0.9);
  };

  const downloadPhoto = async (photo: PhotoMatch) => {
    try {
      const { downloadUrl, fileName } = await apiClient.downloadGuestPhoto(sessionId, photo.photoId);
      
      // Trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download photo');
    }
  };

  const downloadAllPhotos = async () => {
    try {
      const response = await apiClient.downloadAllGuestPhotos(sessionId);
      
      // Download each photo
      for (const photo of response.photos) {
        const link = document.createElement('a');
        link.href = photo.downloadUrl;
        link.download = photo.fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (err) {
      console.error('Bulk download failed:', err);
      alert('Failed to download photos');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto' }}></div>
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading event...</p>
        </div>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card" style={{ maxWidth: '400px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😕</div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            Oops!
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ paddingTop: '80px' }}>
      {step === 'welcome' && (
        <div className="container" style={{ maxWidth: '500px', textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📸</div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            {eventName}
          </h1>
          {eventDate && (
            <p style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              {new Date(eventDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          )}
          {location && (
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              📍 {location}
            </p>
          )}
          
          <div className="card" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
            <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>How it works</h3>
            <ol style={{ paddingLeft: '1.25rem', lineHeight: '1.8' }}>
              <li>Take a quick selfie</li>
              <li>Our AI finds photos with you in them</li>
              <li>Download your photos instantly!</li>
            </ol>
          </div>

          <button
            onClick={() => setStep('selfie')}
            className="btn btn-primary"
            style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
          >
            Find My Photos 📷
          </button>
        </div>
      )}

      {step === 'selfie' && (
        <div className="container" style={{ maxWidth: '500px', textAlign: 'center', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
            Take a Selfie
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Look directly at the camera for best results
          </p>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '0.75rem',
              marginBottom: '1rem',
              color: '#ef4444'
            }}>
              {error}
            </div>
          )}

          <div style={{
            position: 'relative',
            borderRadius: '12px',
            overflow: 'hidden',
            marginBottom: '1.5rem',
            background: '#000'
          }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ 
                width: '100%', 
                display: 'block',
                transform: 'scaleX(-1)' // Mirror effect
              }}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            
            {/* Face guide overlay */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '200px',
              height: '250px',
              border: '2px dashed rgba(255,255,255,0.5)',
              borderRadius: '50%',
              pointerEvents: 'none'
            }} />
          </div>

          <button
            onClick={captureSelfie}
            className="btn btn-primary"
            style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%',
              fontSize: '2rem',
              padding: 0
            }}
          >
            📸
          </button>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
            Tap to capture
          </p>
        </div>
      )}

      {step === 'processing' && (
        <div className="container" style={{ maxWidth: '500px', textAlign: 'center', padding: '3rem' }}>
          <div className="spinner" style={{ width: '60px', height: '60px', margin: '0 auto' }}></div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
            Finding Your Photos
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            {processingMessage}
          </p>
        </div>
      )}

      {step === 'photos' && (
        <div className="container" style={{ padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              {photos.length > 0 ? `Found ${photos.length} Photo${photos.length > 1 ? 's' : ''}!` : 'No Photos Found'}
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              {photos.length > 0 
                ? 'Here are the photos we found you in'
                : "We couldn't find any photos with you in them. The event may still be processing."}
            </p>
          </div>

          {photos.length > 0 && (
            <>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                {photos.map((photo) => (
                  <div 
                    key={photo.photoId}
                    style={{ 
                      position: 'relative',
                      aspectRatio: '1',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      background: 'var(--background-secondary)'
                    }}
                  >
                    <img
                      src={photo.thumbnailUrl}
                      alt="Your photo"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <button
                      onClick={() => downloadPhoto(photo)}
                      style={{
                        position: 'absolute',
                        bottom: '0.5rem',
                        right: '0.5rem',
                        background: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.5rem 0.75rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                      }}
                    >
                      ⬇️ Download
                    </button>
                    <div style={{
                      position: 'absolute',
                      top: '0.5rem',
                      left: '0.5rem',
                      background: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem'
                    }}>
                      {Math.round(photo.confidence * 100)}% match
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={downloadAllPhotos}
                  className="btn btn-primary"
                  style={{ padding: '1rem 2rem' }}
                >
                  Download All Photos
                </button>
              </div>
            </>
          )}

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button
              onClick={() => setStep('selfie')}
              className="btn btn-secondary"
            >
              Try Another Selfie
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
