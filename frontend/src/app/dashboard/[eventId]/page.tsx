'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { apiClient, Event, EventStats, Photo } from '@/lib/api-client';
import { QRCodeSVG } from 'qrcode.react';

type TabType = 'overview' | 'photos' | 'upload' | 'guests';

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [stats, setStats] = useState<EventStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const loadEvent = useCallback(async () => {
    try {
      const [eventData, statsData] = await Promise.all([
        apiClient.getEvent(eventId),
        apiClient.getEventStats(eventId)
      ]);
      setEvent(eventData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load event:', err);
      setError('Failed to load event');
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && eventId) loadEvent();
  }, [isAuthenticated, eventId, loadEvent]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setUploadFiles(Array.from(e.target.files));
  };

  const handleUpload = async () => {
    if (uploadFiles.length === 0) return;
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const batchSize = 5;
      for (let i = 0; i < uploadFiles.length; i += batchSize) {
        const batch = uploadFiles.slice(i, i + batchSize);
        await apiClient.uploadPhotos(eventId, batch);
        setUploadProgress(Math.min(100, ((i + batchSize) / uploadFiles.length) * 100));
      }
      await loadEvent();
      setUploadFiles([]);
      setActiveTab('photos');
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Failed to upload photos');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Delete this photo?')) return;
    try {
      await apiClient.deletePhoto(eventId, photoId);
      await loadEvent();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const getQrUrl = () => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/event/${event?.guestAccessCode}`;
  };

  const copyGuestLink = async () => {
    try { await navigator.clipboard.writeText(getQrUrl()); } catch {}
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container" style={{ paddingTop: '100px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h2 style={{ color: '#ef4444' }}>{error || 'Event not found'}</h2>
          <Link href="/dashboard" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '100px', paddingBottom: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/dashboard" style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block', textDecoration: 'none' }}>
          ← Back to Dashboard
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '600' }}>{event.name}</h1>
            {event.eventDate && (
              <p style={{ color: 'var(--muted-foreground)' }}>
                {new Date(event.eventDate).toLocaleDateString()}
                {event.location && ` • ${event.location}`}
              </p>
            )}
          </div>
          <span style={{
            padding: '0.5rem 1rem',
            borderRadius: '999px',
            fontSize: '0.875rem',
            background: event.isActive ? 'var(--success-light)' : 'var(--muted)',
            color: event.isActive ? 'var(--success)' : 'var(--muted-foreground)'
          }}>
            {event.isActive ? '● Active' : '○ Inactive'}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', overflowX: 'auto' }}>
        {(['overview', 'photos', 'upload', 'guests'] as TabType[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius)',
              border: 'none',
              background: activeTab === tab ? 'var(--primary)' : 'transparent',
              color: activeTab === tab ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
              cursor: 'pointer',
              fontWeight: '500',
              textTransform: 'capitalize'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Statistics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              {[
                { label: 'Photos', value: stats?.totalPhotos || 0 },
                { label: 'Processed', value: stats?.processedPhotos || 0 },
                { label: 'Faces', value: stats?.totalFaces || 0 },
                { label: 'Guests', value: stats?.totalGuests || 0 }
              ].map(stat => (
                <div key={stat.label} style={{ textAlign: 'center', padding: '1rem', background: 'var(--secondary)', borderRadius: 'var(--radius)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{stat.value}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Guest Access</h3>
            <div style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius)', display: 'inline-block' }}>
              <QRCodeSVG value={getQrUrl()} size={150} />
            </div>
            <div style={{ marginTop: '1rem' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Access Code</p>
              <code style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'monospace' }}>{event.guestAccessCode}</code>
            </div>
            <button onClick={copyGuestLink} className="btn btn-secondary" style={{ marginTop: '1rem', width: '100%' }}>
              Copy Guest Link
            </button>
          </div>
        </div>
      )}

      {activeTab === 'photos' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>Photos ({event.photos?.length || 0})</h3>
            <button onClick={() => setActiveTab('upload')} className="btn btn-primary">+ Upload</button>
          </div>
          {!event.photos?.length ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted-foreground)' }}>
              <div style={{ fontSize: '3rem' }}>📷</div>
              <p>No photos yet</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
              {event.photos.map((photo: Photo) => (
                <div key={photo.photoId} style={{ position: 'relative', aspectRatio: '1', borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--secondary)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.thumbnailUrl} alt={photo.fileName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0.5rem', background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'white', fontSize: '0.75rem' }}>👤 {photo.faceCount || 0}</span>
                    <button onClick={() => handleDeletePhoto(photo.photoId)} style={{ background: 'rgba(239,68,68,0.8)', border: 'none', borderRadius: '4px', color: 'white', padding: '0.25rem 0.5rem', fontSize: '0.75rem', cursor: 'pointer' }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'upload' && (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Upload Photos</h3>
          <div style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius)', padding: '2rem', textAlign: 'center', marginBottom: '1rem' }}>
            <input type="file" multiple accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} id="photo-upload" />
            <label htmlFor="photo-upload" style={{ cursor: 'pointer' }}>
              <div style={{ fontSize: '2rem' }}>📷</div>
              <p style={{ color: 'var(--muted-foreground)' }}>Click to select photos</p>
            </label>
          </div>
          {uploadFiles.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <p>{uploadFiles.length} file(s) selected</p>
              {isUploading && (
                <div style={{ height: '8px', background: 'var(--secondary)', borderRadius: '4px', overflow: 'hidden', marginTop: '0.5rem' }}>
                  <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s' }}></div>
                </div>
              )}
            </div>
          )}
          <button onClick={handleUpload} disabled={!uploadFiles.length || isUploading} className="btn btn-primary" style={{ width: '100%' }}>
            {isUploading ? 'Uploading...' : 'Upload Photos'}
          </button>
        </div>
      )}

      {activeTab === 'guests' && (
        <div className="card">
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Guest Activity</h3>
          <p style={{ color: 'var(--muted-foreground)' }}>{stats?.totalGuests || 0} guests have accessed this event.</p>
        </div>
      )}
    </div>
  );
}