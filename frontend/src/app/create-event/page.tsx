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
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Create Event | Snapory',
  description: 'Create a new event and start collecting photos',
};

export default function CreateEventPage() {
  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Back Link */}
        <Link 
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--muted-foreground)',
            textDecoration: 'none',
            marginBottom: '2rem',
            fontSize: '0.875rem'
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Home
        </Link>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: 'clamp(1.5rem, 4vw, 2rem)', 
            fontWeight: 700,
            marginBottom: '0.5rem'
          }}>
            Create New Event
          </h1>
          <p style={{ color: 'var(--muted-foreground)' }}>
            Set up your event and get a QR code for guests to access their photos.
          </p>
        </div>

        {/* Form */}
        <form className="card" style={{ padding: '2rem' }}>
          {/* Event Name */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label 
              htmlFor="eventName"
              style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: 500,
                fontSize: '0.875rem'
              }}
            >
              Event Name *
            </label>
            <input
              type="text"
              id="eventName"
              name="eventName"
              placeholder="e.g., Sharma Wedding, Tech Conference 2025"
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                fontSize: '1rem',
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
          </div>

          {/* Event Date */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label 
              htmlFor="eventDate"
              style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: 500,
                fontSize: '0.875rem'
              }}
            >
              Event Date
            </label>
            <input
              type="date"
              id="eventDate"
              name="eventDate"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                fontSize: '1rem',
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
          </div>

          {/* Location */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label 
              htmlFor="location"
              style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: 500,
                fontSize: '0.875rem'
              }}
            >
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              placeholder="e.g., Grand Ballroom, Mumbai"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                fontSize: '1rem',
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '2rem' }}>
            <label 
              htmlFor="description"
              style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: 500,
                fontSize: '0.875rem'
              }}
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Add any notes about the event..."
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                fontSize: '1rem',
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
                outline: 'none',
                resize: 'vertical',
                minHeight: '100px',
                transition: 'border-color 0.2s'
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Create Event & Get QR Code
          </button>
        </form>

        {/* Info Box */}
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          backgroundColor: 'var(--card-bg)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)'
        }}>
          <h4 style={{ 
            fontSize: '0.875rem', 
            fontWeight: 600, 
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4M12 8h.01"/>
            </svg>
            What happens next?
          </h4>
          <ul style={{ 
            margin: 0, 
            paddingLeft: '1.25rem', 
            fontSize: '0.875rem',
            color: 'var(--muted-foreground)',
            lineHeight: 1.6
          }}>
            <li>You&apos;ll get a unique QR code for your event</li>
            <li>Display the QR code at your venue for guests</li>
            <li>Upload photos and they&apos;ll be automatically processed</li>
            <li>Guests scan the QR, take a selfie, and see their photos</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
