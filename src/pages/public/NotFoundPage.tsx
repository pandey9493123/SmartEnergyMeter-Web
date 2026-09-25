import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', textAlign: 'center' }}>
      <div className="mono" style={{ fontSize: '4rem', color: 'var(--fault)', fontWeight: 700, marginBottom: '8px' }}>404</div>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--text-primary)' }}>ENDPOINT NOT FOUND</h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', marginBottom: '32px' }}>
        The requested system path does not exist on this server. Verify your URL or return to the main telemetry dashboard.
      </p>
      <Link to="/" style={{ backgroundColor: 'var(--surface-control)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '12px 24px', borderRadius: '4px', fontWeight: 600, letterSpacing: '1px' }}>
        RETURN TO HOME
      </Link>
    </main>
  );
}