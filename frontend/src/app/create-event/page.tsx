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
