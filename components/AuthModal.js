/**
 * ATMOS — Auth Modal Component
 * Sign up / Login via Supabase Magic Link
 * Author: Agrima Vijayvargiya
 */
'use client';

import { useState } from 'react';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function AuthModal({ onClose, onSignIn }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    const { error } = await onSignIn(email.trim());
    setLoading(false);
    if (error) {
      setError('Failed to send link. Please try again.');
    } else {
      setSent(true);
    }
  };

  return (
    <div className="auth-overlay" role="dialog" aria-modal="true" aria-label="Sign in to ATMOS">
      {/* Backdrop */}
      <div className="auth-backdrop" onClick={onClose} aria-hidden="true" />

      <div className="auth-modal glass-card">
        {/* Close */}
        <button className="auth-close-btn" onClick={onClose} aria-label="Close sign-in modal">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>

        {/* Logo */}
        <div className="auth-logo" aria-hidden="true">
          <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="15" fill="url(#authLogoGrad)" stroke="var(--accent-primary)" strokeWidth="1"/>
            {/* Sun */}
            <circle cx="20" cy="12" r="5" fill="#FBBF24" />
            {/* Cloud */}
            <path d="M10 21a3 3 0 0 1 0-6 3.5 3.5 0 0 1 6.5-1.5 4 4 0 0 1 6.5 3.5 3 3 0 0 1-1 5.8h-12z" fill="white" opacity="0.95" />
            <defs>
              <linearGradient id="authLogoGrad" x1="0" y1="0" x2="32" y2="32">
                <stop offset="0%" stopColor="#38BDF8"/>
                <stop offset="100%" stopColor="#8B5CF6"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        {!sent ? (
          <>
            <h2 className="auth-title">Welcome to ATMOS</h2>
            <p className="auth-subtitle">
              Sign in to save your favorite cities, search history, and preferences — synced across all your devices.
            </p>

            {!isSupabaseConfigured && (
              <div className="auth-warning">
                ⚠️ Supabase is not configured yet. Add your keys to <code>.env.local</code> to enable auth.
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              <div className="auth-input-group">
                <label htmlFor="auth-email-input" className="auth-label">Email address</label>
                <input
                  id="auth-email-input"
                  type="email"
                  className="auth-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  autoComplete="email"
                  disabled={loading || !isSupabaseConfigured}
                />
              </div>

              {error && <p className="auth-error" role="alert">{error}</p>}

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading || !email.trim() || !isSupabaseConfigured}
                id="auth-submit-btn"
              >
                {loading ? (
                  <span className="auth-btn-content">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spin">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    Sending link…
                  </span>
                ) : (
                  <span className="auth-btn-content">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    Send Magic Link
                  </span>
                )}
              </button>
            </form>

            <p className="auth-footer-note">
              No password needed. We&apos;ll email you a secure one-click sign-in link.
            </p>
          </>
        ) : (
          <div className="auth-sent-state">
            <div className="auth-sent-icon" aria-hidden="true">📬</div>
            <h2 className="auth-title">Check your email!</h2>
            <p className="auth-subtitle">
              We sent a magic link to <strong>{email}</strong>.
              Click it to sign in — no password needed.
            </p>
            <p className="auth-sent-note">Didn&apos;t receive it? Check spam or <button className="auth-resend-btn" onClick={() => setSent(false)}>try again</button>.</p>
          </div>
        )}
      </div>
    </div>
  );
}
