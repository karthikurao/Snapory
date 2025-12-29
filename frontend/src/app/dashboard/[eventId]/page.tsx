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
  
  // Upload state
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
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && eventId) {
      loadEvent();
    }
  }, [isAuthenticated, eventId, loadEvent]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (uploadFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Upload in batches of 5
      const batchSize = 5;
      for (let i = 0; i < uploadFiles.length; i += batchSize) {
        const batch = uploadFiles.slice(i, i + batchSize);
        await apiClient.uploadPhotos(eventId, batch);
        setUploadProgress(Math.min(100, ((i + batchSize) / uploadFiles.length) * 100));
      }

      // Reload event data
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
    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
      await apiClient.deletePhoto(eventId, photoId);
      await loadEvent();
    } catch (err) {
      console.error('Delete failed:', err);
      setError('Failed to delete photo');
    }
  };

  const getQrUrl = () => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/event/${event?.guestAccessCode}`;
  };

  const copyGuestLink = async () => {
    try {
      await navigator.clipboard.writeText(getQrUrl());
    } catch (err) {
      console.error('Failed to copy guest link to clipboard:', err);
    }
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
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/dashboard" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
          ← Back to Dashboard
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '600' }}>{event.name}</h1>
            {event.eventDate && (
              <p style={{ color: 'var(--text-muted)' }}>
                {new Date(event.eventDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
                {event.location && ` • ${event.location}`}
              </p>
            )}
          </div>
          <span style={{
            padding: '0.5rem 1rem',
            borderRadius: '999px',
            fontSize: '0.875rem',
            background: event.isActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(156, 163, 175, 0.1)',
            color: event.isActive ? '#22c55e' : '#9ca3af'
          }}>
            {event.isActive ? '● Active' : '○ Inactive'}
          </span>
import { useState } from 'react';
import Link from 'next/link';
import PhotoUploader from '@/components/PhotoUploader';
import QRCodeDisplay from '@/components/QRCodeDisplay';

// Mock event data - replace with actual API
const mockEvent = {
  eventId: 'abc123',
  name: 'Sharma Wedding',
  guestAccessCode: 'SHR24W',
  eventDate: '2025-01-15',
  location: 'Grand Palace, Mumbai',
  createdAt: '2024-12-28T10:00:00Z',
  photos: [
    { id: '1', url: 'https://picsum.photos/seed/p1/400/300', uploadedAt: '2024-12-28T10:30:00Z', faceCount: 3 },
    { id: '2', url: 'https://picsum.photos/seed/p2/400/300', uploadedAt: '2024-12-28T10:31:00Z', faceCount: 2 },
    { id: '3', url: 'https://picsum.photos/seed/p3/400/300', uploadedAt: '2024-12-28T10:32:00Z', faceCount: 5 },
    { id: '4', url: 'https://picsum.photos/seed/p4/400/300', uploadedAt: '2024-12-28T10:33:00Z', faceCount: 1 },
    { id: '5', url: 'https://picsum.photos/seed/p5/400/300', uploadedAt: '2024-12-28T10:34:00Z', faceCount: 4 },
    { id: '6', url: 'https://picsum.photos/seed/p6/400/300', uploadedAt: '2024-12-28T10:35:00Z', faceCount: 2 },
  ],
  stats: {
    totalPhotos: 245,
    processedPhotos: 240,
    uniqueFaces: 48,
    guestAccesses: 32
  }
};

type Tab = 'overview' | 'photos' | 'upload' | 'guests';

export default function EventDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const tabs = [
    { id: 'overview' as Tab, label: 'Overview', icon: '📊' },
    { id: 'photos' as Tab, label: 'Photos', icon: '🖼️' },
    { id: 'upload' as Tab, label: 'Upload', icon: '📤' },
    { id: 'guests' as Tab, label: 'Guests', icon: '👥' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'var(--card-bg)'
      }}>
        <div className="container" style={{ padding: '1.5rem 1rem' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <Link 
                href="/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'var(--muted-foreground)',
                  textDecoration: 'none',
                  marginBottom: '0.5rem',
                  fontSize: '0.8125rem'
                }}
              >
                ← Back to Events
              </Link>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                {mockEvent.name}
              </h1>
              <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
                {mockEvent.location} • {mockEvent.eventDate}
              </p>
            </div>
            <div style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#dcfce7',
              color: '#166534',
              borderRadius: 'var(--radius)',
              fontSize: '0.8125rem',
              fontWeight: 500
            }}>
              ● Active
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        marginBottom: '1.5rem',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '1rem'
      }}>
        {(['overview', 'photos', 'upload', 'guests'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === tab ? 'var(--primary)' : 'transparent',
              color: activeTab === tab ? 'white' : 'var(--text-muted)',
              cursor: 'pointer',
              fontWeight: '500',
              textTransform: 'capitalize'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          {/* Stats */}
          <div className="card">
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Event Statistics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
              <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--background-secondary)', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{stats?.totalPhotos || 0}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Photos</div>
              </div>
              <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--background-secondary)', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{stats?.processedPhotos || 0}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Processed</div>
              </div>
              <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--background-secondary)', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{stats?.totalFaces || 0}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Faces Detected</div>
              </div>
              <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--background-secondary)', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{stats?.totalGuests || 0}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Guests</div>
              </div>
            </div>

            {stats && stats.pendingPhotos > 0 && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(234, 179, 8, 0.1)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                  <span>{stats.pendingPhotos} photos still processing...</span>
                </div>
              </div>
            )}

            {event.description && (
              <div style={{ marginTop: '1.5rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Description</h4>
                <p style={{ color: 'var(--text-muted)' }}>{event.description}</p>
              </div>
            )}
          </div>

          {/* QR Code */}
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Guest Access</h3>
            <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', display: 'inline-block' }}>
              <QRCodeSVG value={getQrUrl()} size={150} />
            </div>
            <div style={{ marginTop: '1rem' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Access Code</p>
              <code style={{ 
                fontSize: '1.5rem', 
                fontWeight: '700', 
                fontFamily: 'monospace',
                letterSpacing: '0.1em'
              }}>
                {event.guestAccessCode}
              </code>
            </div>
            <button 
              onClick={copyGuestLink}
              className="btn btn-secondary"
              style={{ marginTop: '1rem', width: '100%' }}
            >
              Copy Guest Link
            </button>
          </div>
        </div>
      )}

      {activeTab === 'photos' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>
              Photos ({event.photos?.length || 0})
            </h3>
            <button onClick={() => setActiveTab('upload')} className="btn btn-primary">
              + Upload Photos
            </button>
          </div>

          {!event.photos || event.photos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📷</div>
              <p>No photos uploaded yet</p>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
              gap: '1rem' 
            }}>
              {event.photos.map((photo: Photo) => (
                <div 
                  key={photo.photoId}
                  style={{ 
                    position: 'relative', 
                    aspectRatio: '1', 
                    borderRadius: '8px',
                    overflow: 'hidden',
                    background: 'var(--background-secondary)'
                  }}
                >
                  <img
                    src={photo.thumbnailUrl}
                    alt={photo.fileName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '0.5rem',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                    color: 'white',
                    fontSize: '0.75rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{photo.faceCount} faces</span>
                      <button
                        onClick={() => handleDeletePhoto(photo.photoId)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.8)',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '0.25rem 0.5rem',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '0.625rem'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {photo.processingStatus === 'Pending' && (
                    <div style={{
                      position: 'absolute',
                      top: '0.5rem',
                      right: '0.5rem',
                      background: 'rgba(234, 179, 8, 0.9)',
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.625rem'
                    }}>
                      Processing...
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'upload' && (
        <div className="card">
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Upload Photos</h3>
          
          <div 
            style={{
              border: '2px dashed var(--border-color)',
              borderRadius: '12px',
              padding: '3rem',
              textAlign: 'center',
              background: 'var(--background-secondary)'
            }}
          >
            <input
              type="file"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/heic,image/heif"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="photo-upload"
            />
            <label htmlFor="photo-upload" style={{ cursor: 'pointer' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</div>
              <p style={{ fontWeight: '500', marginBottom: '0.5rem' }}>
                Click to select photos or drag and drop
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                JPEG, PNG, HEIC • Max 50MB per file
              </p>
            </label>
          </div>

          {uploadFiles.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <p style={{ marginBottom: '1rem' }}>
                {uploadFiles.length} file{uploadFiles.length > 1 ? 's' : ''} selected
              </p>
              
              {isUploading && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ 
                    height: '8px', 
                    background: 'var(--background-secondary)', 
                    borderRadius: '4px', 
                    overflow: 'hidden' 
                  }}>
                    <div style={{ 
                      height: '100%', 
                      width: `${uploadProgress}%`, 
                      background: 'var(--primary)',
                      transition: 'width 0.3s'
                    }}></div>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    Uploading... {Math.round(uploadProgress)}%
                  </p>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                {isUploading ? 'Uploading...' : `Upload ${uploadFiles.length} Photo${uploadFiles.length > 1 ? 's' : ''}`}
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'guests' && (
        <div className="card">
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
            Guest Activity
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--background-secondary)', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{stats?.totalGuests || 0}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Visitors</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--background-secondary)', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{stats?.matchedGuests || 0}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Found Photos</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--background-secondary)', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{stats?.totalDownloads || 0}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Downloads</div>
            </div>
          </div>

          {stats?.totalGuests === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              <p>No guests have visited yet.</p>
              <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                Share the QR code or access code with your event guests!
              </p>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Detailed guest activity logs coming soon...
            </p>
          )}
        </div>
      )}
      <div style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--card-bg)' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: '0.25rem', overflowX: 'auto' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '1rem 1.25rem',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                  color: activeTab === tab.id ? 'var(--foreground)' : 'var(--muted-foreground)',
                  fontWeight: activeTab === tab.id ? 600 : 400,
                  cursor: 'pointer',
                  fontSize: '0.9375rem',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container" style={{ padding: '2rem 1rem' }}>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              {[
                { label: 'Total Photos', value: mockEvent.stats.totalPhotos, icon: '📸' },
                { label: 'Processed', value: mockEvent.stats.processedPhotos, icon: '✅' },
                { label: 'Unique Faces', value: mockEvent.stats.uniqueFaces, icon: '👤' },
                { label: 'Guest Views', value: mockEvent.stats.guestAccesses, icon: '👁️' },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="card"
                  style={{ padding: '1.25rem', textAlign: 'center' }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* QR Code Section */}
            <div className="card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem', textAlign: 'center' }}>
                Guest QR Code
              </h2>
              <p style={{ 
                color: 'var(--muted-foreground)', 
                marginBottom: '1.5rem', 
                textAlign: 'center',
                fontSize: '0.9375rem'
              }}>
                Display this at your event for guests to access their photos
              </p>
              <QRCodeDisplay 
                eventCode={mockEvent.guestAccessCode} 
                eventName={mockEvent.name}
              />
            </div>
          </div>
        )}

        {/* Photos Tab */}
        {activeTab === 'photos' && (
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>
                Event Photos ({mockEvent.stats.totalPhotos})
              </h2>
              <button className="btn btn-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download All
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              {mockEvent.photos.map((photo) => (
                <div
                  key={photo.id}
                  className="card"
                  style={{ padding: '0', overflow: 'hidden' }}
                >
                  <div style={{ aspectRatio: '4/3', position: 'relative' }}>
                    <img
                      src={photo.url}
                      alt={`Photo ${photo.id}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: '0.5rem',
                      right: '0.5rem',
                      padding: '0.25rem 0.5rem',
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem'
                    }}>
                      👤 {photo.faceCount}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem', textAlign: 'center' }}>
              Upload Photos
            </h2>
            <p style={{ 
              color: 'var(--muted-foreground)', 
              marginBottom: '1.5rem', 
              textAlign: 'center',
              fontSize: '0.9375rem'
            }}>
              Upload event photos to be processed by AI
            </p>
            <PhotoUploader />
          </div>
        )}

        {/* Guests Tab */}
        {activeTab === 'guests' && (
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>
              Guest Face Groups ({mockEvent.stats.uniqueFaces})
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1rem'
            }}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="card" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--border)',
                      overflow: 'hidden'
                    }}>
                      <img
                        src={`https://picsum.photos/seed/face${i}/100/100`}
                        alt={`Person ${i}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                        Person {i}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>
                        {Math.floor(Math.random() * 20) + 5} photos
                      </div>
                    </div>
                    <button
                      className="btn"
                      style={{
                        padding: '0.5rem',
                        backgroundColor: 'white',
                        border: '1px solid var(--border)'
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
