import { useState } from 'react';
import type { FormEvent } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Link } from 'react-router-dom';
import { auth } from '../../firebase/config';
import { getFirebaseErrorCode } from '../../utils/firebaseErrors';
import './Auth.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('If an account exists for this address, password reset instructions have been sent.');
    } catch (error: unknown) {
      const errorCode = getFirebaseErrorCode(error);
      if (errorCode === 'auth/invalid-email') setError('Enter a valid email address.');
      else setError('The password reset request could not be completed. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-wrapper">
      <section className="auth-split-card" style={{ maxWidth: '600px' }}>
        
        <div className="auth-form-panel">
          <h2 className="auth-form-title">Reset Password</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
            Enter your email address to recover account access.
          </p>

          {error && <div className="auth-error">{error}</div>}
          {message && (
            <div style={{ padding: '12px', color: 'var(--normal)', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--normal)', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '16px' }}>
              {message}
            </div>
          )}

          <form className="auth-form" style={{ marginTop: '0' }} onSubmit={handleReset}>
            <div className="auth-input-group">
              <label htmlFor="reset-email">Account Email Address</label>
              <input id="reset-email" className="auth-input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'SENDING INSTRUCTIONS...' : 'SEND RESET INSTRUCTIONS'}
            </button>
          </form>

          <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem' }}>
            <Link to="/login" style={{ color: 'var(--action)', fontWeight: 600 }}>Return to login</Link>
          </p>
        </div>
      </section>
    </main>
  );
}