'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { apiClient, Event } from '@/lib/api-client';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const loadEvents = async () => {
      if (!isAuthenticated) return;
      
      try {
        const data = await apiClient.getEvents();
        setEvents(data);
      } catch (err) {
        console.error('Failed to load events:', err);
        setError('Failed to load events');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      loadEvents();
    }
  }, [isAuthenticated]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '100px', paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '600' }}>
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Manage your events and photos
          </p>
        </div>
        <Link href="/create-event" className="btn btn-primary">
          + Create Event
        </Link>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1.5rem',
          color: '#ef4444'
        }}>
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="spinner" style={{ margin: '0 auto' }}></div>
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📷</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            No events yet
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Create your first event to start uploading photos
          </p>
          <Link href="/create-event" className="btn btn-primary">
            Create Your First Event
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {events.map((event) => (
            <Link 
              key={event.eventId} 
              href={`/dashboard/${event.eventId}`}
              className="card"
              style={{ textDecoration: 'none', color: 'inherit', transition: 'transform 0.2s, box-shadow 0.2s' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                    {event.name}
                  </h3>
                  {event.eventDate && (
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      {new Date(event.eventDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  background: event.isActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(156, 163, 175, 0.1)',
                  color: event.isActive ? '#22c55e' : '#9ca3af'
                }}>
                  {event.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {event.location && (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  📍 {event.location}
                </p>
              )}

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '0.5rem',
                padding: '0.75rem',
                background: 'var(--background-secondary)',
                borderRadius: '8px',
                fontSize: '0.875rem'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: '600' }}>{event.totalPhotos}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Photos</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: '600' }}>{event.totalFacesDetected}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Faces</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: '600' }}>{event.processedPhotos}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Processed</div>
                </div>
              </div>

              <div style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Guest Code: </span>
                <code style={{ 
                  background: 'var(--background-secondary)', 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontWeight: '600'
                }}>
                  {event.guestAccessCode}
                </code>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
