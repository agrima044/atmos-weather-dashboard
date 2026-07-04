/**
 * ATMOS — User Menu Component
 * Header avatar, dropdown: email, preferences, sign out
 * Author: Agrima Vijayvargiya
 */
'use client';

import { useState, useRef, useEffect } from 'react';

export default function UserMenu({ user, onSignOut, onOpenAuth, unit, onUnitToggle, theme, onThemeChange }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!menuRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : '?';

  if (!user) {
    return (
      <button
        className="auth-trigger-btn"
        onClick={onOpenAuth}
        aria-label="Sign in to save your data"
        id="sign-in-btn"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        Sign In
      </button>
    );
  }

  return (
    <div className="user-menu-wrapper" ref={menuRef}>
      <button
        className="user-avatar-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label="User menu"
        aria-expanded={open}
        aria-haspopup="true"
        id="user-avatar-btn"
      >
        <span className="user-avatar">{initials}</span>
      </button>

      {open && (
        <div className="user-dropdown glass-card" role="menu" aria-label="User menu">
          {/* User info */}
          <div className="user-dropdown-header">
            <div className="user-dropdown-avatar">{initials}</div>
            <div className="user-dropdown-info">
              <span className="user-dropdown-email">{user.email}</span>
              <span className="user-dropdown-badge">✓ Signed in</span>
            </div>
          </div>

          <div className="user-dropdown-divider" />

          {/* Preferences */}
          <div className="user-dropdown-section-label">Preferences</div>

          {/* Unit toggle */}
          <div className="user-dropdown-pref-row">
            <span className="pref-label">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
              </svg>
              Temperature
            </span>
            <div className="pref-unit-toggle">
              {['C', 'F'].map((u) => (
                <button
                  key={u}
                  className={`pref-unit-btn ${unit === u ? 'active' : ''}`}
                  onClick={() => { onUnitToggle(u); }}
                  aria-pressed={unit === u}
                  id={`pref-unit-${u.toLowerCase()}-btn`}
                >
                  °{u}
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div className="user-dropdown-pref-row">
            <span className="pref-label">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 2a10 10 0 0 1 0 20V2z" fill="currentColor" opacity="0.3"/>
              </svg>
              Theme
            </span>
            <div className="pref-unit-toggle">
              {[
                { id: 'light', icon: '☀️' },
                { id: 'dark',  icon: '🌙' },
                { id: 'auto',  icon: '⚙️' },
              ].map((t) => (
                <button
                  key={t.id}
                  className={`pref-unit-btn ${theme === t.id ? 'active' : ''}`}
                  onClick={() => onThemeChange(t.id)}
                  aria-pressed={theme === t.id}
                  title={t.id}
                  id={`pref-theme-${t.id}-btn`}
                >
                  {t.icon}
                </button>
              ))}
            </div>
          </div>

          <div className="user-dropdown-divider" />

          {/* Sign out */}
          <button
            className="user-dropdown-signout"
            onClick={() => { setOpen(false); onSignOut(); }}
            role="menuitem"
            id="sign-out-btn"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
