'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

// Mock event data - replace with actual API call
const mockEvent = {
  eventId: 'demo-event',
  name: 'Sharma Wedding',
  description: 'Wedding celebration',
  eventDate: '2025-01-15',
  location: 'Grand Palace, Mumbai',
  photoCount: 245
};

export default function GuestAccessPage() {
  const params = useParams();
  const eventCode = params.code as string;
  
  const [step, setStep] = useState<'welcome' | 'selfie' | 'processing' | 'photos'>('welcome');
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [matchedPhotos, setMatchedPhotos] = useState<string[]>([]);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCapturing(true);
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError('Unable to access camera. Please ensure you have granted camera permissions.');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  };

  // Capture selfie
  const captureSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Flip horizontally for mirror effect
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setSelfieImage(imageData);
        stopCamera();
      }
    }
  };

  // Process selfie and find matches
  const findMyPhotos = async () => {
    setStep('processing');
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock matched photos - replace with actual API call
    setMatchedPhotos([
      'https://picsum.photos/seed/1/400/300',
      'https://picsum.photos/seed/2/400/300',
      'https://picsum.photos/seed/3/400/300',
      'https://picsum.photos/seed/4/400/300',
      'https://picsum.photos/seed/5/400/300',
      'https://picsum.photos/seed/6/400/300',
    ]);
    
    setStep('photos');
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Welcome Step
  if (step === 'welcome') {
    return (
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          {/* Event Card */}
          <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              margin: '0 auto 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
            
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              {mockEvent.name}
            </h1>
            
            <div style={{ 
              color: 'var(--muted-foreground)', 
              fontSize: '0.875rem',
              marginBottom: '1.5rem'
            }}>
              {mockEvent.location && (
                <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  {mockEvent.location}
                </p>
              )}
              <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                {mockEvent.photoCount} photos available
              </p>
            </div>

            <div style={{
              padding: '1rem',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
              borderRadius: 'var(--radius)',
              marginBottom: '1.5rem'
            }}>
              <p style={{ margin: 0, fontSize: '0.9375rem' }}>
                📸 Find all photos you appear in with a quick selfie!
              </p>
            </div>

            <button
              onClick={() => setStep('selfie')}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Find My Photos
            </button>
          </div>

          {/* How it works */}
          <div style={{ 
            fontSize: '0.8125rem', 
            color: 'var(--muted-foreground)',
            textAlign: 'left'
          }}>
            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>How it works:</p>
            <ol style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: 1.8 }}>
              <li>Take a quick selfie</li>
              <li>Our AI finds photos with your face</li>
              <li>Download your photos instantly</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  // Selfie Capture Step
  if (step === 'selfie') {
    return (
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Take a Selfie
          </h2>
          <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem', fontSize: '0.9375rem' }}>
            Position your face in the frame for best results
          </p>

          <div className="card" style={{ padding: '1rem', marginBottom: '1rem' }}>
            {!selfieImage ? (
              <>
                <div style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '4/3',
                  backgroundColor: '#1a1a1a',
                  borderRadius: 'var(--radius)',
                  overflow: 'hidden',
                  marginBottom: '1rem'
                }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transform: 'scaleX(-1)' // Mirror effect
                    }}
                  />
                  {/* Face guide overlay */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '160px',
                    height: '200px',
                    border: '3px dashed rgba(255,255,255,0.5)',
                    borderRadius: '50%',
                    pointerEvents: 'none'
                  }} />
                  {!isCapturing && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(0,0,0,0.7)'
                    }}>
                      <span style={{ color: 'white' }}>Camera not started</span>
                    </div>
                  )}
                </div>
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                
                {!isCapturing ? (
                  <button
                    onClick={startCamera}
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                    Start Camera
                  </button>
                ) : (
                  <button
                    onClick={captureSelfie}
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '0.5rem' }}>
                      <circle cx="12" cy="12" r="10"/>
                    </svg>
                    Capture
                  </button>
                )}
              </>
            ) : (
              <>
                <div style={{
                  width: '100%',
                  aspectRatio: '4/3',
                  borderRadius: 'var(--radius)',
                  overflow: 'hidden',
                  marginBottom: '1rem'
                }}>
                  <img
                    src={selfieImage}
                    alt="Your selfie"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={() => {
                      setSelfieImage(null);
                      startCamera();
                    }}
                    className="btn"
                    style={{ 
                      flex: 1, 
                      justifyContent: 'center',
                      backgroundColor: 'white',
                      border: '1px solid var(--border)'
                    }}
                  >
                    Retake
                  </button>
                  <button
                    onClick={findMyPhotos}
                    className="btn btn-primary"
                    style={{ flex: 2, justifyContent: 'center' }}
                  >
                    Find My Photos
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Camera error message */}
          {cameraError && (
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
              marginBottom: '1rem',
              animation: 'fadeIn 0.3s ease'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {cameraError}
            </div>
          )}

          <button
            onClick={() => {
              stopCamera();
              setSelfieImage(null);
              setCameraError(null);
              setStep('welcome');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--muted-foreground)',
              fontSize: '0.875rem',
              cursor: 'pointer',
              padding: '0.5rem'
            }}
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // Processing Step
  if (step === 'processing') {
    return (
      <div className="container" style={{ 
        paddingTop: '4rem', 
        paddingBottom: '4rem', 
        textAlign: 'center',
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ maxWidth: '400px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            border: '4px solid var(--border)',
            borderTopColor: 'var(--primary)',
            margin: '0 auto 1.5rem',
            animation: 'spin 1s linear infinite'
          }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Finding Your Photos...
          </h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9375rem' }}>
            Our AI is scanning {mockEvent.photoCount} photos for your face
          </p>
          
          <style jsx>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // Photos Gallery Step
  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          backgroundColor: '#dcfce7',
          color: '#166534',
          borderRadius: '2rem',
          fontSize: '0.875rem',
          fontWeight: 500,
          marginBottom: '1rem'
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          Found {matchedPhotos.length} photos of you!
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Your Photos from {mockEvent.name}
        </h2>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9375rem' }}>
          Tap any photo to view full size
        </p>
      </div>

      {/* Photo Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '0.75rem',
        marginBottom: '2rem'
      }}>
        {matchedPhotos.map((photo, index) => (
          <div
            key={index}
            style={{
              aspectRatio: '4/3',
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            className="photo-item"
          >
            <img
              src={photo}
              alt={`Event photo ${index + 1} from ${mockEvent.name}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
        ))}
      </div>

      {/* Download All Button */}
      <div style={{ textAlign: 'center' }}>
        <button
          className="btn btn-primary"
          style={{ padding: '1rem 2rem' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download All Photos
        </button>
      </div>

      <style jsx>{`
        .photo-item:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
}
