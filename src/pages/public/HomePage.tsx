import { useState } from 'react';
import { Link } from 'react-router-dom';
import HardwareViewer from '../../components/ui/HardwareViewer';
import IntroLoader from '../../components/ui/IntroLoader';
import { shouldShowIntro } from '../../utils/intro';

export default function HomePage() {
  const [showIntro, setShowIntro] = useState<boolean>(() => shouldShowIntro());

  return (
    <main>
      {showIntro && <IntroLoader onDone={() => setShowIntro(false)} />}
      
      {/* Hero Section */}
      <section style={{ backgroundColor: 'var(--surface-primary)', borderBottom: '1px solid var(--border-color)', padding: '60px 16px', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--normal)', border: '1px solid var(--normal)', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '24px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--normal)', boxShadow: 'var(--neon-glow-normal)' }}></span>
            LIVE MONITORING READY
          </div>
          
          <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)', lineHeight: 1.1, marginBottom: '24px', color: 'var(--text-primary)' }}>
            Monitor Your Power.<br/>Save Your Money.
          </h1>
          
          <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(1rem, 3vw, 1.25rem)', marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px' }}>
            A smart IoT-based energy monitoring system that gives you real-time insights into your electricity consumption, detects faults instantly, and helps you cut down your bills.
          </p>
          
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" style={{ backgroundColor: 'var(--action)', color: '#fff', padding: '14px 28px', borderRadius: '4px', fontWeight: 600, fontSize: '1.1rem', boxShadow: 'var(--neon-glow-action)' }}>
              Get Started Free
            </Link>
            <Link to="/docs" style={{ backgroundColor: 'var(--surface-control)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '14px 28px', borderRadius: '4px', fontWeight: 600, fontSize: '1.1rem' }}>
              Read Documentation
            </Link>
          </div>
        </div>
      </section>

      {/* About Project (Mission/Vision) */}
      <section className="responsive-container">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ color: 'var(--action)', fontWeight: 700, letterSpacing: '1px', fontSize: '0.85rem', marginBottom: '8px' }}>FINAL YEAR PROJECT</div>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--text-primary)' }}>About Smart Energy Meter</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '16px auto 0' }}>An innovative IoT-based solution developed by students of Government Polytechnic College, Sangareddy to revolutionize energy monitoring.</p>
        </div>

        <div className="responsive-grid">
          <div style={{ backgroundColor: 'var(--surface-primary)', padding: '32px', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '16px' }}>Our Mission</h3>
            <p style={{ color: 'var(--text-secondary)' }}>To provide affordable, real-time energy monitoring solutions that empower users to understand and optimize their electricity consumption, reducing waste and costs.</p>
          </div>
          <div style={{ backgroundColor: 'var(--surface-primary)', padding: '32px', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '16px' }}>Our Vision</h3>
            <p style={{ color: 'var(--text-secondary)' }}>A future where every home and business has access to smart energy insights, contributing to a sustainable and energy-efficient world.</p>
          </div>
          <div style={{ backgroundColor: 'var(--surface-primary)', padding: '32px', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '16px' }}>The Problem</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Traditional energy meters provide no real-time feedback, leading to unchecked consumption, high bills, and undetected electrical faults that can cause hazards.</p>
          </div>
        </div>
      </section>

      {/* Hardware Architecture (The 3D Viewer) */}
      <section style={{ backgroundColor: 'var(--surface-primary)', padding: '60px 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="responsive-container">
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '2.5rem', color: 'var(--text-primary)', marginBottom: '16px' }}>System Architecture</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '800px' }}>
              The architecture features isolated local hardware protection handled autonomously by the ESP32, with asynchronous telemetry synchronization via Firebase.
            </p>
          </div>
          <HardwareViewer />
        </div>
      </section>

    </main>
  );
}