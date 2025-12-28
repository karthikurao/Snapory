'use client';

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
