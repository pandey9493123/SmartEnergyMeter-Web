import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggle from './ThemeToggle';
import './PublicHeader.css';

interface AuthActionProps {
  isAuthenticated: boolean;
  onNavigate: () => void;
}

/*
 * This component is declared outside PublicHeader so React does not
 * recreate its component identity during every parent render.
 */
function AuthAction({ isAuthenticated, onNavigate }: AuthActionProps) {
  if (isAuthenticated) {
    return (
      <Link
        to="/app"
        onClick={onNavigate}
        className="header-link header-login"
        style={{
          backgroundColor: 'var(--normal)',
          color: '#ffffff',
          borderColor: 'var(--normal)',
          boxShadow: 'var(--neon-glow-normal)',
        }}
      >
        Dashboard
      </Link>
    );
  }

  return (
    <Link
      to="/login"
      onClick={onNavigate}
      className="header-link header-login"
      style={{
        borderColor: 'var(--action)',
        color: 'var(--action)',
        boxShadow: 'var(--neon-glow-action)',
      }}
    >
      Login
    </Link>
  );
}

export default function PublicHeader() {
  const { currentUser } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAuthenticated = Boolean(currentUser);

  const toggleMenu = () => {
    setIsMobileMenuOpen((previousState) => !previousState);
  };

  const closeMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="public-header">
      <div className="header-container">
        <div className="header-brand">
          <Link
            to="/"
            className="header-title"
            onClick={closeMenu}
          >
            SMART ENERGY METER
          </Link>

          <span className="header-subtitle">
            Diploma ECE
          </span>
        </div>

        {/* Desktop navigation */}
        <nav
          className="header-nav-desktop"
          aria-label="Public website navigation"
        >
          <Link to="/" className="header-link">
            Project
          </Link>

          <Link to="/team" className="header-link">
            Team
          </Link>

          <Link to="/docs" className="header-link">
            Documentation
          </Link>

          <ThemeToggle />

          <AuthAction
            isAuthenticated={isAuthenticated}
            onNavigate={closeMenu}
          />
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={toggleMenu}
          aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-public-navigation"
        >
          {isMobileMenuOpen ? (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile navigation */}
      {isMobileMenuOpen && (
        <nav
          id="mobile-public-navigation"
          className="mobile-menu-dropdown"
          aria-label="Mobile public website navigation"
        >
          <Link
            to="/"
            className="header-link"
            onClick={closeMenu}
          >
            Project Home
          </Link>

          <Link
            to="/team"
            className="header-link"
            onClick={closeMenu}
          >
            Meet the Team
          </Link>

          <Link
            to="/docs"
            className="header-link"
            onClick={closeMenu}
          >
            Documentation
          </Link>

          <div
            style={{
              padding: '8px 0',
              borderBottom: '1px solid var(--border-color)',
            }}
          >
            <ThemeToggle />
          </div>

          <div style={{ marginTop: '8px' }}>
            <AuthAction
              isAuthenticated={isAuthenticated}
              onNavigate={closeMenu}
            />
          </div>
        </nav>
      )}
    </header>
  );
}
