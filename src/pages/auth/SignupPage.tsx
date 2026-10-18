import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getRedirectResult,
  setPersistence,
  signInWithPopup,
  signInWithRedirect,
  updateProfile,
} from 'firebase/auth';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '../../firebase/config';
import { getFirebaseErrorCode } from '../../utils/firebaseErrors';
import { ensureUserProfile, saveUserProfile } from '../../firebase/profile';
import { useAuth } from '../../hooks/useAuth';
import './Auth.css';

export default function SignupPage() {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [deviceId, setDeviceId] = useState('device001');
  const [tariff, setTariff] = useState('7.50');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingRedirect, setCheckingRedirect] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  let strength = 0;
  if (password.length >= 6) strength += 1;
  if (password.length >= 10) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[0-9!@#$%^&*]/.test(password)) strength += 1;

  // Complete Google redirect signup.
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
            /* best-effort */
          }
          setShowSuccess(true);
          window.setTimeout(() => navigate('/app', { replace: true }), 1600);
        }
      })
      .catch(() => {
        if (!cancelled) setError('Google signup could not be completed.');
      })
      .finally(() => {
        if (!cancelled) setCheckingRedirect(false);
      });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (!authLoading && currentUser && !showSuccess) {
    return <Navigate to="/app" replace />;
  }

  const handleSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (strength < 3) {
      setError('Password too weak. Use 10+ characters, an uppercase letter, and a number or symbol.');
      return;
    }
    if (!acceptedTerms) {
      setError('You must accept the Terms of Service to continue.');
      return;
    }
    const cleanDevice = deviceId.trim();
    if (!cleanDevice) {
      setError('Enter a valid Device ID (e.g. device001).');
      return;
    }
    const tariffNum = Number(tariff);
    if (!Number.isFinite(tariffNum) || tariffNum <= 0) {
      setError('Enter a valid tariff rate.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await setPersistence(auth, browserLocalPersistence);
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName: fullName.trim() });
      await saveUserProfile(credential.user.uid, {
        name: fullName.trim(),
        email: credential.user.email || email,
        deviceId: cleanDevice,
        tariff: tariffNum,
        createdAt: Date.now(),
        role: 'user',
        photoURL: null,
      });
      setShowSuccess(true);
      window.setTimeout(() => navigate('/app', { replace: true }), 1600);
    } catch (error: unknown) {
      const errorCode = getFirebaseErrorCode(error);
      if (errorCode === 'auth/email-already-in-use') setError('Email is already registered.');
      else if (errorCode === 'auth/invalid-email') setError('Enter a valid email address.');
      else setError('Account creation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError('');
    setLoading(true);
    try {
      await setPersistence(auth, browserLocalPersistence);
      try {
        const result = await signInWithPopup(auth, googleProvider);
        await ensureUserProfile(result.user.uid, {
          name: result.user.displayName || 'User',
          email: result.user.email || '',
          photoURL: result.user.photoURL,
        });
        setShowSuccess(true);
        window.setTimeout(() => navigate('/app', { replace: true }), 1600);
      } catch (popupError: unknown) {
        const code = getFirebaseErrorCode(popupError);
        if (code === 'auth/popup-closed-by-user') return;
        if (
          code === 'auth/popup-blocked' ||
          code === 'auth/operation-not-supported-in-this-environment'
        ) {
          await signInWithRedirect(auth, googleProvider);
          return;
        }
        throw popupError;
      }
    } catch {
      setError('Google signup could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-wrapper">
      {showSuccess && (
        <div
          role="status"
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            backgroundColor: 'rgba(3, 5, 10, 0.72)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div style={{
            backgroundColor: 'var(--surface-primary)',
            border: '1px solid var(--normal)',
            borderRadius: 'var(--border-radius)',
            padding: '40px 48px', textAlign: 'center', maxWidth: '420px',
          }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              backgroundColor: 'var(--normal)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Account created</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Your profile and device link were saved. Opening your dashboard…
            </p>
          </div>
        </div>
      )}

      <section className="auth-split-card">

        {/* Left Panel */}
        <div className="auth-brand-panel">
          <h1 className="auth-brand-title">Join the Future</h1>
          <p className="auth-brand-subtitle">
            Create your account to start monitoring your energy consumption in real-time with our smart dashboard.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--action)', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>1</div>
              <div style={{ fontWeight: 600 }}>Create your free account</div>
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--action)', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>2</div>
              <div style={{ fontWeight: 600 }}>Link your device ID</div>
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--action)', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>3</div>
              <div style={{ fontWeight: 600 }}>Start monitoring live data</div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="auth-form-panel">
          <h2 className="auth-form-title">Create Your Account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--action)', fontWeight: 600 }}>Sign In</Link>
          </p>

          {error && <div className="auth-error">{error}</div>}

          <button type="button" className="auth-google-btn" onClick={handleGoogleSignup} disabled={loading || checkingRedirect}>
            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign up with Google
          </button>

          <div className="auth-divider">OR USE EMAIL</div>

          <form className="auth-form" style={{ marginTop: '0' }} onSubmit={handleSignup}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="auth-input-group">
                <label htmlFor="signup-name">Full Name</label>
                <input id="signup-name" className="auth-input" type="text" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div className="auth-input-group">
                <label htmlFor="signup-email">Email Address</label>
                <input id="signup-email" className="auth-input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="auth-input-group">
                <label htmlFor="signup-device">Device ID</label>
                <input id="signup-device" className="auth-input" type="text" value={deviceId} onChange={(e) => setDeviceId(e.target.value)} required placeholder="device001" />
              </div>
              <div className="auth-input-group">
                <label htmlFor="signup-tariff">Tariff (₹/kWh)</label>
                <input id="signup-tariff" className="auth-input" type="number" min="0" step="0.01" value={tariff} onChange={(e) => setTariff(e.target.value)} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="auth-input-group">
                <label htmlFor="signup-password">Password</label>
                <div className="pwd-input-wrapper">
                  <input id="signup-password" className="auth-input" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <button type="button" className="pwd-toggle-btn" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" /></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    )}
                  </button>
                </div>
                <div className="pwd-strength-bars">
                  {Array.from({ length: 4 }, (_, i) => <span key={i} className={`pwd-bar ${strength > i ? `active-${i + 1}` : ''}`} />)}
                </div>
              </div>

              <div className="auth-input-group">
                <label htmlFor="signup-confirm">Confirm Password</label>
                <input id="signup-confirm" className="auth-input" type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} style={{ marginTop: '4px' }} />
              <span>I agree to the <Link to="/terms" style={{ color: 'var(--action)' }}>Terms of Service</Link> and <Link to="/privacy" style={{ color: 'var(--action)' }}>Privacy Policy</Link>.</span>
            </label>

            <button type="submit" className="auth-button" disabled={loading || checkingRedirect}>
              {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
