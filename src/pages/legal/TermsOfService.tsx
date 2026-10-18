export default function TermsOfService() {
  return (
    <main style={{ padding: '40px 32px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <h1 style={{ marginBottom: '24px' }}>Terms of Service & Safety Disclaimer</h1>
      <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        <div style={{ 
          padding: '16px', 
          backgroundColor: 'var(--surface-recessed)', 
          borderLeft: '4px solid var(--fault)', 
          marginBottom: '24px',
          color: 'var(--text-primary)',
          fontWeight: 500
        }}>
          WARNING: This platform interfaces with hardware handling dangerous AC Mains Voltage (230V). 
        </div>
        
        <h3 style={{ color: 'var(--text-primary)', marginTop: '24px', marginBottom: '8px' }}>1. Educational Nature</h3>
        <p style={{ marginBottom: '16px' }}>
          This software and its associated hardware constitute an experimental academic project for Government Polytechnic College, Sangareddy. It is <strong>NOT</strong> a certified commercial product.
        </p>
        
        <h3 style={{ color: 'var(--text-primary)', marginTop: '24px', marginBottom: '8px' }}>2. Not a Replacement for Certified Protection</h3>
        <p style={{ marginBottom: '16px' }}>
          This system must not replace certified electrical protection devices such as MCBs, RCDs, or RCCBs. The relay module has physical switching limits that must not be exceeded, regardless of the PZEM-004T sensor's 100A measurement rating.
        </p>

        <h3 style={{ color: 'var(--text-primary)', marginTop: '24px', marginBottom: '8px' }}>3. Cloud Control Limitations</h3>
        <p style={{ marginBottom: '16px' }}>
          Remote control requests sent via this interface are dependent on network availability. Users are responsible for ensuring it is physically safe to re-energize the circuit before issuing a remote fault reset command.
        </p>
      </div>
    </main>
  );
}