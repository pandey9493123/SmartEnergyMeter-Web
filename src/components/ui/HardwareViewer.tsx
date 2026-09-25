import { useState } from 'react';
import HardwareScene from '../../three/HardwareScene';

type ComponentId = 'esp32' | 'pzem' | 'relay' | null;

const HARDWARE_DATA = {
  esp32: {
    title: 'ESP32 Microcontroller',
    role: 'Central Processing & Cloud Sync',
    specs: [
      'Reads telemetry via UART (RX:16, TX:17)',
      'Executes local safety thresholds (Overvoltage, Overcurrent)',
      'Syncs to Firebase Realtime Database',
      'Drives local LCD, LEDs, and Buzzer'
    ]
  },
  pzem: {
    title: 'PZEM-004T (V4.0)',
    role: 'AC Electrical Telemetry',
    specs: [
      'Measures: V, I, P, E, Freq, PF',
      'Communicates via TTL UART (9600 Baud)',
      '100A rating via external CT (Current Transformer)',
      'Accurate to 0.5% (industrial grade)'
    ]
  },
  relay: {
    title: 'Master Relay Module',
    role: 'Safety & Load Control',
    specs: [
      'Controlled via ESP32 (GPIO 26)',
      'Active LOW/HIGH configuration based on module',
      'Physically isolates AC mains on fault',
      'Never controlled directly by UI without ESP32 safety check'
    ]
  }
};

export default function HardwareViewer() {
  const [selectedId, setSelectedId] = useState<ComponentId>(null);

  const selectedData = selectedId ? HARDWARE_DATA[selectedId] : null;

    return (
    <div className="hardware-viewer-container">
      {/* 3D Canvas Area */}
      <div className="hardware-canvas-area">
        {!selectedId && (
          <div style={{ position: 'absolute', top: '16px', left: '16px', color: 'var(--text-secondary)', fontSize: '0.75rem', pointerEvents: 'none', zIndex: 10, fontFamily: 'IBM Plex Mono, monospace' }}>
            [ DRAG TO ROTATE • CLICK BOARDS ]
          </div>
        )}
        <HardwareScene onSelect={setSelectedId} selectedId={selectedId} />
      </div>

      {/* Data Panel Area */}
      <div className="hardware-info-area">
        {selectedData ? (
          <div>
            <div style={{ color: 'var(--action)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              System Component
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
              {selectedData.title}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '24px', fontSize: '0.9rem' }}>
              {selectedData.role}
            </p>
            
            <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
              {selectedData.specs.map((spec, index) => (
                <li key={index} style={{ position: 'relative', paddingLeft: '16px', marginBottom: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.4 }}>
                  <span style={{ position: 'absolute', left: 0, top: '6px', width: '6px', height: '6px', backgroundColor: 'var(--action)', borderRadius: '50%' }}></span>
                  {spec}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: '24px' }}>
            <p style={{ fontSize: '0.9rem' }}>Select a hardware component in the 3D viewer to view technical specifications.</p>
          </div>
        )}
      </div>
    </div>
  );
}