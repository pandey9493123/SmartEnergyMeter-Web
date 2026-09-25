import { useEffect, useState } from 'react';
import { updateProfile, updatePassword } from 'firebase/auth';
import { useAuth } from '../../hooks/useAuth';
import { useDevice } from '../../hooks/useDevice';
import { getFirebaseErrorCode } from '../../utils/firebaseErrors';
import {
  DEFAULT_DEVICE_ID,
  DEFAULT_TARIFF,
  loadUserProfile,
  updateUserProfile,
} from '../../firebase/profile';

export default function ProfilePage() {
  const { currentUser } = useAuth();
  const { deviceId: activeDeviceId, setDeviceId } = useDevice();

  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [deviceId, setDeviceIdInput] = useState(activeDeviceId || DEFAULT_DEVICE_ID);
  const [tariff, setTariff] = useState(String(DEFAULT_TARIFF));
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!currentUser) {
        setLoadingProfile(false);
        return;
      }
      setLoadingProfile(true);
      try {
        const profile = await loadUserProfile(currentUser.uid);
        if (cancelled) return;
        if (profile) {
          if (!displayName) setDisplayName(profile.name || currentUser.displayName || '');
          setDeviceIdInput(profile.deviceId || activeDeviceId);
          setTariff(String(profile.tariff ?? DEFAULT_TARIFF));
        } else {
          setDeviceIdInput(activeDeviceId);
        }
      } catch {
        if (!cancelled) setError('Could not load your saved profile. Showing defaults.');
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.uid]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setError('');
    setMessage('');

    const cleanDevice = deviceId.trim();
    if (!cleanDevice) {
      setError('Enter a valid Device ID.');
      return;
    }
    const tariffNum = Number(tariff);
    if (!Number.isFinite(tariffNum) || tariffNum <= 0) {
      setError('Enter a valid tariff rate.');
      return;
    }

    setLoading(true);
    try {
      if (displayName !== currentUser.displayName) {
        await updateProfile(currentUser, { displayName });
      }
      if (newPassword) {
        await updatePassword(currentUser, newPassword);
      }
      await updateUserProfile(currentUser.uid, {
        name: displayName,
        deviceId: cleanDevice,
        tariff: tariffNum,
      });
      // Switching the linked device immediately re-subscribes telemetry.
      if (cleanDevice !== activeDeviceId) {
        await setDeviceId(cleanDevice);
      }
      setMessage('Profile updated successfully. Device and tariff saved to Firebase.');
      setNewPassword('');
    } catch (err: unknown) {
      const code = getFirebaseErrorCode(err);
      if (code === 'auth/requires-recent-login') {
        setError('Security restriction: Please log out and log back in to change your password.');
      } else {
        setError('Failed to update profile. Check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '8px' }}>
        <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2rem)' }}>Account Profile</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your hardware link, tariff settings, and security.</p>
      </header>

      {error && <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--fault)', padding: '12px', border: '1px solid var(--fault)', borderRadius: '4px', marginBottom: '16px' }}>{error}</div>}
      {message && <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--normal)', padding: '12px', border: '1px solid var(--normal)', borderRadius: '4px', marginBottom: '16px' }}>{message}</div>}

      {loadingProfile ? (
        <p style={{ color: 'var(--text-secondary)' }}>Loading saved profile…</p>
      ) : (
      <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Personal Details */}
        <section style={{ backgroundColor: 'var(--surface-primary)', padding: '24px', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)' }}>
          <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>Personal Details</h3>
          <div className="responsive-grid">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Display Name</label>
              <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} style={{ padding: '12px', backgroundColor: 'var(--surface-control)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Account Email</label>
              <input type="email" value={currentUser?.email || ''} disabled style={{ padding: '12px', backgroundColor: 'var(--surface-recessed)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', borderRadius: '4px', cursor: 'not-allowed' }} />
            </div>
          </div>
        </section>

        {/* Hardware & Billing */}
        <section style={{ backgroundColor: 'var(--surface-primary)', padding: '24px', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)' }}>
          <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>Hardware & Billing</h3>
          <div className="responsive-grid">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Linked Device ID</label>
              <input type="text" value={deviceId} onChange={(e) => setDeviceIdInput(e.target.value)} placeholder={DEFAULT_DEVICE_ID} style={{ padding: '12px', backgroundColor: 'var(--surface-control)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', fontFamily: 'IBM Plex Mono' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Live path: <span className="mono">SmartEnergyMeter/Devices/{deviceId.trim() || DEFAULT_DEVICE_ID}/Live</span>
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Default Tariff (₹/kWh)</label>
              <input type="number" step="0.01" min="0" value={tariff} onChange={(e) => setTariff(e.target.value)} style={{ padding: '12px', backgroundColor: 'var(--surface-control)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', fontFamily: 'IBM Plex Mono' }} />
            </div>
          </div>
        </section>

        {/* Security */}
        <section style={{ backgroundColor: 'var(--surface-primary)', padding: '24px', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)' }}>
          <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>Security Settings</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '300px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Change Password</label>
            <input type="password" placeholder="Leave blank to keep current" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ padding: '12px', backgroundColor: 'var(--surface-control)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px' }} />
          </div>
        </section>

        <button type="submit" disabled={loading} style={{ backgroundColor: 'var(--action)', color: '#fff', padding: '14px', borderRadius: '4px', fontWeight: 600, fontSize: '1rem', marginTop: '8px' }}>
          {loading ? 'SAVING CHANGES...' : 'SAVE ALL CHANGES'}
        </button>
      </form>
      )}
    </div>
  );
}
