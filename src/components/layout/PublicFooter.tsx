import { Link } from 'react-router-dom';

export default function PublicFooter() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-color)',
      backgroundColor: 'var(--surface-primary)',
      padding: '24px 32px',
      marginTop: 'auto', // Pushes footer to bottom
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '16px'
    }}>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        © 2026 Smart Energy Meter Project
      </div>
      
      <div style={{ display: 'flex', gap: '24px' }}>
        <Link to="/privacy" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Privacy Policy</Link>
        <Link to="/terms" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Terms of Service</Link>
      </div>
    </footer>
  );
}