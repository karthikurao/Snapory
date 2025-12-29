'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';

export default function CreateEventPage() {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Event name is required');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.createEvent({
        name: name.trim(),
        description: description.trim() || undefined,
        eventDate: eventDate || undefined,
        location: location.trim() || undefined,
      });

      router.push(`/dashboard/${response.eventId}`);
    } catch (err: unknown) {
      console.error('Failed to create event:', err);
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { error?: string } } };
        setError(axiosError.response?.data?.error || 'Failed to create event');
      } else {
        setError('Failed to create event');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '100px', paddingBottom: '2rem' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <Link href="/dashboard" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem', display: 'block' }}>
          ← Back to Dashboard
        </Link>

        <h1 style={{ fontSize: '1.75rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          Create New Event
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Set up your event to start uploading photos
        </p>

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

        <form onSubmit={handleSubmit} className="card">
          <div className="form-group">
            <label className="form-label">Event Name *</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Sarah & John's Wedding"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Event Date</label>
            <input
              type="date"
              className="form-input"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Location</label>
            <input
              type="text"
              className="form-input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Grand Ballroom, NYC"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description for the event..."
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <Link href="/dashboard" className="btn btn-secondary" style={{ flex: 1, textAlign: 'center' }}>
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 2 }}
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>

        <div className="card" style={{ marginTop: '1.5rem', background: 'var(--background-secondary)' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem' }}>
            ✨ What happens next?
          </h3>
          <ul style={{ fontSize: '0.875rem', color: 'var(--text-muted)', paddingLeft: '1.25rem', lineHeight: '1.8' }}>
            <li>You&apos;ll get a unique guest access code and QR code</li>
            <li>Upload your event photos</li>
            <li>Our AI will detect faces automatically</li>
            <li>Share the QR code with guests to let them find their photos</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
