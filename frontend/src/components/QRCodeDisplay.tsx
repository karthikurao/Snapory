'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';

interface QRCodeDisplayProps {
  eventCode: string;
  eventName: string;
  size?: number;
}

export default function QRCodeDisplay({ eventCode, eventName, size = 200 }: QRCodeDisplayProps) {
  const eventUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/event/${eventCode}`;
  const [copyMessage, setCopyMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showCopyMessage = (text: string, type: 'success' | 'error', duration: number = 3000) => {
    setCopyMessage({ text, type });
    setTimeout(() => setCopyMessage(null), duration);
  };

  const downloadQRCode = () => {
    const svg = document.getElementById('event-qr-code');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = size * 2;
      canvas.height = size * 2;
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, size * 2, size * 2);
        
        const link = document.createElement('a');
        link.download = `${eventName.replace(/\s+/g, '-')}-qr-code.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const copyLink = async () => {
    const successMsg = 'Link copied to clipboard!';
    const errorMsg = `Failed to copy link. Please copy it manually: ${eventUrl}`;
    
    try {
      await navigator.clipboard.writeText(eventUrl);
      showCopyMessage(successMsg, 'success');
    } catch (error) {
      console.error('Failed to copy link using navigator.clipboard:', error);
      showCopyMessage(errorMsg, 'error', 5000);
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = eventUrl;
        document.body.appendChild(textArea);
        textArea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (success) {
          showCopyMessage(successMsg, 'success');
        } else {
          showCopyMessage(errorMsg, 'error', 5000);
        }
      } catch (fallbackError) {
        console.error('Fallback clipboard copy failed:', fallbackError);
        showCopyMessage(errorMsg, 'error', 5000);
      }
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      {/* QR Code */}
      <div style={{
        display: 'inline-block',
        padding: '1.5rem',
        backgroundColor: 'white',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow)',
        marginBottom: '1.5rem'
      }}>
        <QRCodeSVG
          id="event-qr-code"
          value={eventUrl}
          size={size}
          level="H"
          includeMargin={false}
          bgColor="white"
          fgColor="#000000"
        />
      </div>

      {/* Event Code */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1.25rem',
        backgroundColor: 'var(--card-bg)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        marginBottom: '1.5rem',
        fontFamily: 'monospace',
        fontSize: '1.25rem',
        fontWeight: 600,
        letterSpacing: '0.15em'
      }}>
        {eventCode}
      </div>

      {/* Action Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: '0.75rem', 
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={downloadQRCode}
          className="btn"
          style={{
            backgroundColor: 'white',
            border: '1px solid var(--border)'
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download QR
        </button>
        
        <button
          onClick={copyLink}
          className="btn"
          style={{
            backgroundColor: 'white',
            border: '1px solid var(--border)'
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          Copy Link
        </button>
      </div>

      {/* URL Display */}
      <p style={{
        marginTop: '1rem',
        fontSize: '0.8125rem',
        color: 'var(--muted-foreground)',
        wordBreak: 'break-all'
      }}>
        {eventUrl}
      </p>

      {/* Copy message notification */}
      {copyMessage && (
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem 1rem',
          fontSize: '0.875rem',
          color: copyMessage.type === 'success' ? 'var(--success-foreground)' : 'var(--destructive-foreground)',
          backgroundColor: copyMessage.type === 'success' ? 'var(--success-light)' : 'var(--destructive-light)',
          border: `1px solid ${copyMessage.type === 'success' ? 'var(--success)' : 'var(--destructive)'}`,
          borderRadius: 'var(--radius)',
          textAlign: 'center',
          animation: 'fadeIn 0.3s ease'
        }}>
          {copyMessage.text}
        </div>
      )}
    </div>
  );
}
