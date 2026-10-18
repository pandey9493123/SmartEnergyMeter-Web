const sectionCard: React.CSSProperties = {
  backgroundColor: 'var(--surface-primary)',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--border-radius)',
  padding: '32px',
  marginBottom: '40px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
};

const sectionTitle: React.CSSProperties = {
  fontSize: '2rem',
  color: 'var(--action)',
  marginBottom: '24px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

const numberBadge: React.CSSProperties = {
  backgroundColor: 'var(--action)',
  color: '#fff',
  width: '32px',
  height: '32px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '50%',
  fontSize: '1.2rem',
  flexShrink: 0,
};

const bodyText: React.CSSProperties = {
  marginBottom: '24px',
  color: 'var(--text-secondary)',
  lineHeight: 1.7,
};

const subHeading: React.CSSProperties = {
  marginBottom: '16px',
  color: 'var(--text-primary)',
};

const infoBox: React.CSSProperties = {
  padding: '16px',
  backgroundColor: 'var(--surface-recessed)',
  borderLeft: '4px solid var(--normal)',
  borderRadius: '4px',
};

export default function DocsPage() {
  return (
    <main style={{ padding: '60px 32px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '8px', color: 'var(--text-primary)' }}>Complete User Guide</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '40px', fontSize: '1.1rem' }}>
        Everything you need to know about setting up and using your Smart Energy Meter.
      </p>

      {/* Section 1: Project Overview */}
      <section style={sectionCard}>
        <h2 style={sectionTitle}>
          <span style={numberBadge}>1</span>
          Project Overview
        </h2>
        <p style={bodyText}>
          Electricity is an essential part of everyday life, and the increasing use of electrical
          appliances has made it important to monitor and manage energy consumption effectively.
          Traditional energy meters mainly show the total energy consumed and do not give users
          detailed real-time information about their electricity usage.
        </p>
        <p style={bodyText}>
          The <strong style={{ color: 'var(--text-primary)' }}>IoT Smart Energy Meter</strong> overcomes
          this limitation. It is an Internet of Things (IoT)-based system that lets users monitor
          electrical parameters, estimate electricity bills, detect abnormal conditions, and control
          an electrical load remotely — all from a web dashboard or directly at the meter.
        </p>

        <h3 style={subHeading}>What the system does:</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={infoBox}>
            <strong style={{ display: 'block', color: 'var(--text-primary)' }}>Real-Time Monitoring</strong>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Live voltage, current, power, energy (kWh), power factor, and frequency.</span>
          </div>
          <div style={infoBox}>
            <strong style={{ display: 'block', color: 'var(--text-primary)' }}>Bill Estimation</strong>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Estimated electricity cost from total energy consumed and the selected tariff.</span>
          </div>
          <div style={infoBox}>
            <strong style={{ display: 'block', color: 'var(--text-primary)' }}>Fault Detection</strong>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Alerts for overvoltage, undervoltage, overcurrent, and unusual conditions.</span>
          </div>
          <div style={infoBox}>
            <strong style={{ display: 'block', color: 'var(--text-primary)' }}>Remote Load Control</strong>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Switch the connected load on/off remotely using a relay.</span>
          </div>
        </div>

        <p style={{ ...bodyText, marginBottom: 0 }}>
          The aim is to make electricity monitoring simple, accessible, and useful for everyday users —
          helping them manage energy efficiently, reduce costs, and supervise abnormal or unauthorized
          consumption.
        </p>
      </section>

      {/* Section 2: System Architecture */}
      <section style={sectionCard}>
        <h2 style={sectionTitle}>
          <span style={numberBadge}>2</span>
          System Architecture
        </h2>
        <p style={bodyText}>
          The system has three layers — sensing hardware, cloud services, and the user application —
          working together as follows:
        </p>

        <h3 style={subHeading}>How data flows:</h3>
        <div className="mono" style={{ ...infoBox, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '24px', lineHeight: 2 }}>
          PZEM-004T Sensor → ESP32 (processing + safety) → Wi-Fi → Firebase Realtime Database → Web Dashboard
          <br />
          ESP32 → 16×2 LCD / LEDs / Buzzer (local display &amp; alerts)
          <br />
          ESP32 → Blynk IoT (data communication verification)
        </div>

        <h3 style={subHeading}>Hardware layer:</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={infoBox}>
            <strong style={{ display: 'block', color: 'var(--text-primary)' }}>ESP32 Microcontroller</strong>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Main controller — reads the sensor, applies safety checks, updates the cloud.</span>
          </div>
          <div style={infoBox}>
            <strong style={{ display: 'block', color: 'var(--text-primary)' }}>PZEM-004T Module</strong>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Measures V, I, P, energy (kWh), power factor, and frequency.</span>
          </div>
          <div style={infoBox}>
            <strong style={{ display: 'block', color: 'var(--text-primary)' }}>16×2 LCD + LEDs + Buzzer</strong>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Local readings display, status indication, and abnormal-condition warnings.</span>
          </div>
          <div style={infoBox}>
            <strong style={{ display: 'block', color: 'var(--text-primary)' }}>Relay Module</strong>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Physically switches the connected electrical load on/off.</span>
          </div>
        </div>

        <h3 style={subHeading}>Cloud &amp; application layer:</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div style={infoBox}>
            <strong style={{ display: 'block', color: 'var(--text-primary)' }}>Firebase Realtime Database</strong>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Stores and syncs live energy data to the web app instantly.</span>
          </div>
          <div style={infoBox}>
            <strong style={{ display: 'block', color: 'var(--text-primary)' }}>Firebase Authentication</strong>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Secure registration and login, including Google Sign-In, plus user/device management.</span>
          </div>
          <div style={infoBox}>
            <strong style={{ display: 'block', color: 'var(--text-primary)' }}>Blynk IoT</strong>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Used to monitor and verify data communication from the hardware.</span>
          </div>
          <div style={infoBox}>
            <strong style={{ display: 'block', color: 'var(--text-primary)' }}>Web Dashboard</strong>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Live readings, usage analysis, fault alerts, and remote relay control.</span>
          </div>
        </div>
      </section>

      {/* Section 3: Hardware Setup */}
      <section style={sectionCard}>
        <h2 style={sectionTitle}>
          <span style={numberBadge}>3</span>
          Hardware Setup
        </h2>
        <p style={bodyText}>The Smart Energy Meter uses ESP32 as the main controller with voltage and current sensors.</p>

        <h3 style={subHeading}>Required Components:</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={infoBox}>
            <strong style={{ display: 'block', color: 'var(--text-primary)' }}>ESP32 DevKit</strong>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Microcontroller with Wi-Fi</span>
          </div>
          <div style={infoBox}>
            <strong style={{ display: 'block', color: 'var(--text-primary)' }}>PZEM 004T Sensor</strong>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Voltage, current sensor (0-250V AC)</span>
          </div>
          <div style={infoBox}>
            <strong style={{ display: 'block', color: 'var(--text-primary)' }}>5V Relay Module</strong>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>For remote switching</span>
          </div>
          <div style={infoBox}>
            <strong style={{ display: 'block', color: 'var(--text-primary)' }}>16×2 LCD Display</strong>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Shows key readings directly at the meter</span>
          </div>
          <div style={infoBox}>
            <strong style={{ display: 'block', color: 'var(--text-primary)' }}>LEDs + Buzzer</strong>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Operating status and abnormal-condition warnings</span>
          </div>
        </div>

        <div style={{ padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--fault)', color: 'var(--fault)', borderRadius: '4px', marginBottom: '24px', display: 'flex', gap: '12px' }}>
          <strong>⚠️ SAFETY WARNING:</strong>
          <span>Working with AC mains voltage (230V) is dangerous. Always ensure the power is OFF before making connections. Seek help from a qualified electrician if unsure.</span>
        </div>

        <h3 style={subHeading}>Pin Connections (ESP32):</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.9rem' }}>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>PZEM 004T (RX/TX)</td>
              <td style={{ padding: '12px', color: 'var(--text-primary)' }}>→ GPIO 16 &amp; GPIO 17</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>Relay Module IN</td>
              <td style={{ padding: '12px', color: 'var(--text-primary)' }}>→ GPIO 26</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>Common VCC</td>
              <td style={{ padding: '12px', color: 'var(--text-primary)' }}>→ 3.3V / 5V</td>
            </tr>
            <tr>
              <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>Common GND</td>
              <td style={{ padding: '12px', color: 'var(--text-primary)' }}>→ GND</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Section 4: Measured Parameters & Billing */}
      <section style={sectionCard}>
        <h2 style={sectionTitle}>
          <span style={numberBadge}>4</span>
          Measured Parameters &amp; Bill Estimation
        </h2>
        <p style={bodyText}>
          The PZEM-004T continuously measures the parameters below. The ESP32 processes them and pushes
          the latest values to Firebase so the dashboard always shows current readings:
        </p>

        <h3 style={subHeading}>Electrical parameters:</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', marginBottom: '24px' }}>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '12px', color: 'var(--text-primary)', fontWeight: 600 }}>Voltage (V)</td>
              <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>AC mains voltage, typically ~230V in India.</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '12px', color: 'var(--text-primary)', fontWeight: 600 }}>Current (A)</td>
              <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>Load current drawn by connected appliances.</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '12px', color: 'var(--text-primary)', fontWeight: 600 }}>Power (W)</td>
              <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>Instantaneous active power consumption.</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '12px', color: 'var(--text-primary)', fontWeight: 600 }}>Energy (kWh)</td>
              <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>Cumulative energy consumed — the basis of billing.</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '12px', color: 'var(--text-primary)', fontWeight: 600 }}>Power Factor</td>
              <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>Efficiency of power usage (0–1, higher is better).</td>
            </tr>
            <tr>
              <td style={{ padding: '12px', color: 'var(--text-primary)', fontWeight: 600 }}>Frequency (Hz)</td>
              <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>AC supply frequency, normally 50Hz.</td>
            </tr>
          </tbody>
        </table>

        <h3 style={subHeading}>Bill estimation:</h3>
        <p style={bodyText}>
          The system calculates an estimated electricity bill so users understand their expenses before
          the actual bill arrives — encouraging reduced unnecessary consumption:
        </p>
        <div className="mono" style={{ ...infoBox, color: 'var(--text-primary)', fontSize: '0.95rem', textAlign: 'center' }}>
          Estimated Bill (₹) = Total Energy (kWh) × Tariff (₹/kWh)
        </div>
        <p style={{ ...bodyText, marginBottom: 0, marginTop: '16px' }}>
          Set your tariff rate during signup or later in your Profile. The dashboard also tracks a monthly
          budget limit and warns you when spending crosses it.
        </p>
      </section>

      {/* Section 5: Fault Detection & Safety */}
      <section style={sectionCard}>
        <h2 style={sectionTitle}>
          <span style={numberBadge}>5</span>
          Fault Detection &amp; Safety
        </h2>
        <p style={bodyText}>
          The ESP32 continuously compares live readings against safety thresholds and acts immediately —
          locally, without waiting for the cloud. When a fault is detected, the relay opens to isolate the
          load, the buzzer and LEDs warn nearby users, and the dashboard shows the fault status:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={infoBox}>
            <strong style={{ display: 'block', color: 'var(--text-primary)' }}>Overvoltage</strong>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Voltage above the safe limit (default max 265V).</span>
          </div>
          <div style={infoBox}>
            <strong style={{ display: 'block', color: 'var(--text-primary)' }}>Undervoltage</strong>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Voltage below the safe limit (default min 170V).</span>
          </div>
          <div style={infoBox}>
            <strong style={{ display: 'block', color: 'var(--text-primary)' }}>Overcurrent</strong>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Current above the safe limit (default max 30A).</span>
          </div>
        </div>
        <p style={{ ...bodyText, marginBottom: 0 }}>
          Faults latch for safety — the load stays isolated until conditions are verified safe and a reset
          is issued from the Protection page. Unusual operating conditions are also logged in the Event Log
          for review.
        </p>
      </section>

      {/* Section 6: Remote Load Control */}
      <section style={sectionCard}>
        <h2 style={sectionTitle}>
          <span style={numberBadge}>6</span>
          Remote Load Control
        </h2>
        <p style={bodyText}>
          The connected electrical load can be switched on/off remotely from the dashboard's Device
          Controls page. Requests travel through Firebase to the ESP32, which validates them against
          local safety limits before driving the relay on GPIO 26:
        </p>
        <div className="mono" style={{ ...infoBox, fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 2 }}>
          Dashboard → Firebase command → ESP32 safety check → Relay switches → Status synced back
        </div>
        <p style={{ ...bodyText, marginBottom: 0, marginTop: '16px' }}>
          The web interface never drives the relay directly — the ESP32 always has the final say, so an
          unsafe command can never energize the circuit during an active fault.
        </p>
      </section>

      {/* Section 7: Web Dashboard Guide */}
      <section style={sectionCard}>
        <h2 style={sectionTitle}>
          <span style={numberBadge}>7</span>
          Web Dashboard Guide
        </h2>
        <p style={bodyText}>
          After signing up (email/password or Google Sign-In) and linking your Device ID, the dashboard
          provides:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div style={infoBox}>
            <strong style={{ display: 'block', color: 'var(--text-primary)' }}>Overview</strong>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>At-a-glance readings, bill estimate, and fault status.</span>
          </div>
          <div style={infoBox}>
            <strong style={{ display: 'block', color: 'var(--text-primary)' }}>Live Monitor</strong>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Real-time oscilloscope-style voltage, current, and power charts.</span>
          </div>
          <div style={infoBox}>
            <strong style={{ display: 'block', color: 'var(--text-primary)' }}>Energy &amp; Billing</strong>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Consumption totals, tariff and budget configuration.</span>
          </div>
          <div style={infoBox}>
            <strong style={{ display: 'block', color: 'var(--text-primary)' }}>Protection &amp; Controls</strong>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Fault reset, safety thresholds, and remote relay control.</span>
          </div>
          <div style={infoBox}>
            <strong style={{ display: 'block', color: 'var(--text-primary)' }}>Events &amp; Diagnostics</strong>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Fault history and device online/offline heartbeat.</span>
          </div>
          <div style={infoBox}>
            <strong style={{ display: 'block', color: 'var(--text-primary)' }}>Simulation Panel</strong>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Demonstrate faults safely without hardware.</span>
          </div>
        </div>
      </section>

      {/* Section 8: Exporting Data */}
      <section style={{ ...sectionCard, marginBottom: 0 }}>
        <h2 style={sectionTitle}>
          <span style={numberBadge}>8</span>
          Exporting Data
        </h2>
        <p style={bodyText}>Download your energy data for reports, analysis, or record-keeping. Available in the Dashboard.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ padding: '24px', backgroundColor: 'var(--surface-control)', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
            <h4 style={{ color: 'var(--normal)', marginBottom: '8px', fontSize: '1.2rem' }}>📄 CSV Export</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Downloads all raw telemetry readings as a spreadsheet. Best for Excel analysis.</p>
          </div>
          <div style={{ padding: '24px', backgroundColor: 'var(--surface-control)', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
            <h4 style={{ color: 'var(--fault)', marginBottom: '8px', fontSize: '1.2rem' }}>📑 PDF Report</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Generates a beautifully formatted billing statement report for the month.</p>
          </div>
        </div>
      </section>

    </main>
  );
}
