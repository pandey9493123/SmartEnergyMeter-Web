import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  browserLocalPersistence,
  browserSessionPersistence,
  getRedirectResult,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
} from 'firebase/auth';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '../../firebase/config';
import { getFirebaseErrorCode } from '../../utils/firebaseErrors';
import { ensureUserProfile } from '../../firebase/profile';
import { useAuth } from '../../hooks/useAuth';
import './Auth.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingRedirect, setCheckingRedirect] = useState(true);

  // Complete Google redirect sign-in (mobile / popup-blocked fallback).
  useEffect(() => {
    let cancelled = false;
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user && !cancelled) {
          try {
            await ensureUserProfile(result.user.uid, {
              name: result.user.displayName || 'User',
              email: result.user.email || '',
              photoURL: result.user.photoURL,
            });
          } catch {
            /* profile creation is best-effort here */
          }
          navigate('/app', { replace: true });
        }
      })
      .catch(() => {
        if (!cancelled) setError('Google login could not be completed.');
      })
      .finally(() => {
        if (!cancelled) setCheckingRedirect(false);
      });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (!authLoading && currentUser) {
    return <Navigate to="/app" replace />;
  }

  const applyPersistence = async () => {
    await setPersistence(
      auth,
      rememberMe ? browserLocalPersistence : browserSessionPersistence,
    );
  };

  const handleEmailLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await applyPersistence();
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/app');
    } catch (error: unknown) {
      const errorCode = getFirebaseErrorCode(error);
      if (errorCode === 'auth/too-many-requests') {
        setError('Too many unsuccessful attempts. Please wait or reset your password.');
      } else if (
        errorCode === 'auth/invalid-credential' ||
        errorCode === 'auth/user-not-found' ||
        errorCode === 'auth/wrong-password'
      ) {
        setError('Invalid email or password.');
      } else {
        setError('Authentication failed. Check your internet connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await applyPersistence();
      try {
        const result = await signInWithPopup(auth, googleProvider);
        await ensureUserProfile(result.user.uid, {
          name: result.user.displayName || 'User',
          email: result.user.email || '',
          photoURL: result.user.photoURL,
        });
        navigate('/app');
      } catch (popupError: unknown) {
        const code = getFirebaseErrorCode(popupError);
        if (
          code === 'auth/popup-blocked' ||
          code === 'auth/operation-not-supported-in-this-environment' ||
          code === 'auth/popup-closed-by-user'
        ) {
          if (code === 'auth/popup-closed-by-user') return;
          // Fall back to full-page redirect; handled by getRedirectResult.
          await signInWithRedirect(auth, googleProvider);
          return;
        }
        throw popupError;
      }
    } catch (error: unknown) {
      const errorCode = getFirebaseErrorCode(error);
      if (errorCode !== 'auth/popup-closed-by-user') {
        setError('Google login could not be completed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-wrapper">
      <section className="auth-split-card">

        {/* Left Panel */}
        <div className="auth-brand-panel">
          <h1 className="auth-brand-title">Welcome to Smart Energy Meter</h1>
          <p className="auth-brand-subtitle">
            Log in to monitor your electrical telemetry, view financial insights, and securely manage your hardware endpoints.
          </p>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--text-secondary)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--action)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Secure End-to-End Encryption</span>
          </div>
        </div>

        {/* Right Panel */}
        <div className="auth-form-panel">
          <h2 className="auth-form-title">Account Login</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
            New user? <Link to="/signup" style={{ color: 'var(--action)', fontWeight: 600 }}>Create an account</Link>
          </p>

          {error && <div className="auth-error">{error}</div>}

          <button type="button" className="auth-google-btn" onClick={handleGoogleLogin} disabled={loading || checkingRedirect}>
            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="auth-divider">OR USE EMAIL</div>

          <form className="auth-form" onSubmit={handleEmailLogin} style={{ marginTop: '0' }}>
            <div className="auth-input-group">
              <label htmlFor="login-email">Email Address</label>
              <input id="login-email" className="auth-input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="auth-input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label htmlFor="login-password">Password</label>
                <Link to="/forgot-password" style={{ color: 'var(--action)', fontSize: '0.8rem', fontWeight: 600 }}>Forgot password?</Link>
              </div>

              <div className="pwd-input-wrapper">
                <input id="login-password" className="auth-input" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" className="pwd-toggle-btn" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide' : 'Show'}>
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" /></svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  )}
                </button>
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--action)' }}
              />
              Remember me on this device
            </label>

            <button type="submit" className="auth-button" disabled={loading || checkingRedirect}>
              {loading ? 'AUTHENTICATING...' : 'LOGIN TO DASHBOARD'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
