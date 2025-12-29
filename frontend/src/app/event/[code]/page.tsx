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
    if (accessCode) joinEvent();
  }, [accessCode]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
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

  const captureSelfie = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    stopCamera();
    setStep('processing');
    setProcessingMessage('Uploading your selfie...');
    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Failed to create blob')), 'image/jpeg', 0.9);
      });
      const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
      
      // Upload selfie first
      await apiClient.uploadSelfie(sessionId, file);
      
      setProcessingMessage('Finding your photos...');
      // Then find matching photos
      const result = await apiClient.findMatchingPhotos(sessionId);
      setPhotos(result.photos || []);
      setStep('photos');
    } catch (err) {
      console.error('Face matching failed:', err);
      setError('Failed to process your photo. Please try again.');
      setStep('selfie');
    }
  }, [sessionId, stopCamera]);

  useEffect(() => {
    if (step === 'selfie') startCamera();
    return () => stopCamera();
  }, [step, startCamera, stopCamera]);

  const downloadPhoto = async (photoId: string, fileName: string) => {
    try {
      const result = await apiClient.downloadGuestPhoto(sessionId, photoId);
      const response = await fetch(result.downloadUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.fileName || fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download failed:', err);
      setError('Failed to download photo. Please try again.');
      setStep('error');
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'var(--background)' }}>
        <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😕</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>Oops!</h2>
          <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>{error}</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      {step === 'welcome' && (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📸</div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>{eventName || 'Welcome!'}</h1>
            {eventDate && <p style={{ color: 'var(--muted-foreground)', marginBottom: '0.25rem' }}>{new Date(eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>}
            {location && <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>📍 {location}</p>}
            <p style={{ marginBottom: '1.5rem' }}>Take a quick selfie and we&apos;ll find all photos with you in them!</p>
            <button onClick={() => setStep('selfie')} className="btn btn-primary" style={{ width: '100%' }}>Find My Photos</button>
          </div>
        </div>
      )}

      {step === 'selfie' && (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%', overflow: 'hidden' }}>
            <div style={{ position: 'relative', aspectRatio: '4/3', background: '#000', borderRadius: 'var(--radius) var(--radius) 0 0' }}>
              <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <div style={{ width: '200px', height: '250px', border: '3px dashed rgba(255,255,255,0.5)', borderRadius: '50%' }} />
              </div>
            </div>
            <div style={{ padding: '1.5rem', textAlign: 'center' }}>
              <p style={{ marginBottom: '1rem', color: 'var(--muted-foreground)' }}>Position your face in the oval and take a selfie</p>
              {error && <p style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => setStep('welcome')} className="btn btn-secondary" style={{ flex: 1 }}>Back</button>
                <button onClick={captureSelfie} className="btn btn-primary" style={{ flex: 2 }}>📷 Take Selfie</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 'processing' && (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '2rem' }}>
            <div className="spinner" style={{ margin: '0 auto 1.5rem' }}></div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>Processing...</h2>
            <p style={{ color: 'var(--muted-foreground)' }}>{processingMessage}</p>
          </div>
        </div>
      )}

      {step === 'photos' && (
        <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem', paddingTop: '1rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              {photos.length > 0 ? `Found ${photos.length} Photo${photos.length > 1 ? 's' : ''}!` : 'No Photos Found'}
            </h1>
            <p style={{ color: 'var(--muted-foreground)' }}>
              {photos.length > 0 ? 'Here are all the photos we found you in' : 'We couldn\'t find any photos with you. Try taking another selfie.'}
            </p>
          </div>
          {photos.length === 0 ? (
            <div style={{ textAlign: 'center' }}>
              <button onClick={() => setStep('selfie')} className="btn btn-primary">Try Again</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {photos.map((photo, index) => (
                <div key={photo.photoId || index} className="card" style={{ overflow: 'hidden', padding: 0 }}>
                  <div style={{ aspectRatio: '1', position: 'relative' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.thumbnailUrl || photo.fullUrl} alt={`Photo ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {photo.confidence && (
                      <span style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius)', fontSize: '0.75rem' }}>
                        {Math.round(photo.confidence * 100)}% match
                      </span>
                    )}
                  </div>
                  <div style={{ padding: '0.75rem' }}>
                    <button onClick={() => downloadPhoto(photo.photoId, `photo-${index + 1}.jpg`)} className="btn btn-secondary" style={{ width: '100%', fontSize: '0.875rem' }}>⬇️ Download</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ textAlign: 'center', marginTop: '2rem', paddingBottom: '2rem' }}>
            <button onClick={() => setStep('selfie')} className="btn btn-secondary">🔄 Find More Photos</button>
          </div>
        </div>
      )}
    </div>
  );
}