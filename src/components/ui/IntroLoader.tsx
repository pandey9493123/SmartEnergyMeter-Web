import { useEffect, useMemo, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { markIntroSeen } from '../../utils/intro';

type Vec3 = [number, number, number];

/**
 * Classic PCB-style circuit traces (old website style): angular routes
 * radiating from the center core, like energy flowing out of a chip.
 */
const TRACES: Vec3[][] = [
  [[0, 0, 0], [1.6, 0, 0], [2.3, 0, 0.7], [3.4, 0, 0.7]],
  [[0, 0, 0], [1.2, 0, -0.9], [2.4, 0, -0.9], [3.1, 0, -1.6]],
  [[0, 0, 0], [-1.6, 0, 0], [-2.3, 0, -0.7], [-3.4, 0, -0.7]],
  [[0, 0, 0], [-1.2, 0, 0.9], [-2.4, 0, 0.9], [-3.1, 0, 1.6]],
  [[0, 0, 0], [0.4, 0, 1.4], [1.3, 0, 2.1], [1.3, 0, 3.0]],
  [[0, 0, 0], [-0.4, 0, -1.4], [-1.3, 0, -2.1], [-1.3, 0, -3.0]],
  [[0, 0, 0], [0.9, 0, 1.1], [0.9, 0, 2.4], [1.8, 0, 3.0]],
  [[0, 0, 0], [-0.9, 0, -1.1], [-0.9, 0, -2.4], [-1.8, 0, -3.0]],
];

const PULSE_COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#f59e0b', '#10b981', '#3b82f6', '#f59e0b', '#10b981'];

/** Point along a polyline trace at param t (0..1), by segment length. */
function tracePoint(trace: Vec3[], t: number): Vec3 {
  const pts = trace.map((p) => new THREE.Vector3(...p));
  const lengths: number[] = [];
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const len = pts[i].distanceTo(pts[i + 1]);
    lengths.push(len);
    total += len;
  }
  let target = THREE.MathUtils.clamp(t, 0, 1) * total;
  for (let i = 0; i < lengths.length; i++) {
    if (target <= lengths[i] || i === lengths.length - 1) {
      const segT = lengths[i] === 0 ? 0 : target / lengths[i];
      const v = pts[i].clone().lerp(pts[i + 1], THREE.MathUtils.clamp(segT, 0, 1));
      return [v.x, v.y, v.z];
    }
    target -= lengths[i];
  }
  const last = pts[pts.length - 1];
  return [last.x, last.y, last.z];
}

function TravelingPulse({ trace, color, speed, offset }: { trace: Vec3[]; color: string; speed: number; offset: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = (state.clock.elapsedTime * speed + offset) % 1;
    const [x, , z] = tracePoint(trace, t);
    if (ref.current) ref.current.position.set(x, 0.08, z);
    if (glowRef.current) {
      glowRef.current.position.set(x, 0.08, z);
      const s = 1 + Math.sin(state.clock.elapsedTime * 10 + offset * 20) * 0.25;
      glowRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group>
      {/* Soft glow halo */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshBasicMaterial color={color} transparent opacity={0.25} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* Bright core */}
      <mesh ref={ref}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

/** Deterministic PRNG so particle layout is stable across renders. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Revolving wireframe globe with orbit rings and satellites. */
function RevolvingGlobe({ center }: { center: Vec3 }) {
  const globeRef = useRef<THREE.Group>(null);
  const dotsRef = useRef<THREE.Points>(null);
  const satARef = useRef<THREE.Mesh>(null);
  const satBRef = useRef<THREE.Mesh>(null);

  // Fibonacci sphere — deterministic "city lights" dot distribution.
  const dotPositions = useMemo(() => {
    const count = 320;
    const arr = new Float32Array(count * 3);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const radius = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = golden * i;
      arr[i * 3] = Math.cos(theta) * radius * 1.12;
      arr[i * 3 + 1] = y * 1.12;
      arr[i * 3 + 2] = Math.sin(theta) * radius * 1.12;
    }
    return arr;
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    // Globe revolution (+ axial tilt applied on the group).
    if (globeRef.current) globeRef.current.rotation.y += delta * 0.55;
    if (dotsRef.current) dotsRef.current.rotation.y += delta * 0.55;
    // Satellites orbiting on their tilted rings.
    if (satARef.current) {
      const a = t * 1.1;
      satARef.current.position.set(Math.cos(a) * 1.75, 0, Math.sin(a) * 1.75);
    }
    if (satBRef.current) {
      const a = -t * 0.8 + Math.PI;
      satBRef.current.position.set(Math.cos(a) * 2.05, 0, Math.sin(a) * 2.05);
    }
  });

  return (
    <group position={center}>
      {/* Axial tilt container */}
      <group rotation={[0, 0, 0.22]}>
        {/* Dark inner sphere so only the front wireframe shows */}
        <mesh>
          <sphereGeometry args={[1.08, 32, 32]} />
          <meshBasicMaterial color="#05080f" />
        </mesh>
        {/* Revolving wireframe shell */}
        <group ref={globeRef}>
          <mesh>
            <sphereGeometry args={[1.12, 28, 20]} />
            <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.55} />
          </mesh>
          {/* Equator highlight */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.12, 0.012, 8, 72]} />
            <meshBasicMaterial color="#60a5fa" transparent opacity={0.9} />
          </mesh>
        </group>
        {/* City-lights dots, revolving with the globe */}
        <points ref={dotsRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[dotPositions, 3]} />
          </bufferGeometry>
          <pointsMaterial size={0.035} color="#f59e0b" transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation />
        </points>
      </group>

      {/* Orbit ring A + satellite */}
      <group rotation={[Math.PI / 2.6, 0, 0.35]}>
        <mesh>
          <torusGeometry args={[1.75, 0.012, 8, 96]} />
          <meshBasicMaterial color="#10b981" transparent opacity={0.6} />
        </mesh>
        <mesh ref={satARef}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>
      </group>
      {/* Orbit ring B + satellite */}
      <group rotation={[Math.PI / 1.8, 0.3, -0.4]}>
        <mesh>
          <torusGeometry args={[2.05, 0.01, 8, 96]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.45} />
        </mesh>
        <mesh ref={satBRef}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshBasicMaterial color="#93c5fd" />
        </mesh>
      </group>

      {/* Soft halo */}
      <mesh>
        <sphereGeometry args={[1.35, 24, 24]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.08} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}
function EnergyParticles({ count = 220 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const { positions, speeds } = useMemo(() => {
    const rand = mulberry32(1337);
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (rand() - 0.5) * 9;
      positions[i * 3 + 1] = rand() * 4 - 1;
      positions[i * 3 + 2] = (rand() - 0.5) * 9;
      speeds[i] = 0.4 + rand() * 1.1;
    }
    return { positions, speeds };
  }, [count]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const attr = ref.current.geometry.getAttribute('position') as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds[i] * delta;
      if (arr[i * 3 + 1] > 3.2) arr[i * 3 + 1] = -1;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#3b82f6" transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation />
    </points>
  );
}

function CircuitScene({ progressRef }: { progressRef: MutableRefObject<number> }) {
  const beamRef = useRef<THREE.Mesh>(null);
  const padRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    progressRef.current = Math.min(1, t / 2.2);

    if (beamRef.current) {
      const mat = beamRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.35 + Math.sin(t * 5) * 0.15;
    }
    if (padRef.current) {
      const s = 1 + Math.sin(t * 3) * 0.08;
      padRef.current.scale.set(s, 1, s);
    }
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.25) * 0.12;
    }
  });

  return (
    <group ref={groupRef}>
      {/* PCB traces */}
      {TRACES.map((trace, i) => (
        <group key={i}>
          <Line points={trace} color="#1e3a5f" lineWidth={2} transparent opacity={0.9} />
          {/* Via pad at the end of each trace */}
          <mesh position={[trace[trace.length - 1][0], 0.02, trace[trace.length - 1][2]]} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.09, 0.09, 0.04, 16]} />
            <meshBasicMaterial color="#2c5282" />
          </mesh>
        </group>
      ))}

      {/* Traveling energy pulses */}
      {TRACES.map((trace, i) => (
        <TravelingPulse
          key={i}
          trace={trace}
          color={PULSE_COLORS[i % PULSE_COLORS.length]}
          speed={0.28 + (i % 3) * 0.09}
          offset={i / TRACES.length}
        />
      ))}

      {/* Launch pad + energy beam feeding the globe */}
      <mesh ref={padRef} position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.5, 0.62, 0.06, 32]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.85} />
      </mesh>
      <mesh position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.72, 0.02, 8, 48]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.9} />
      </mesh>
      <mesh ref={beamRef} position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.035, 0.06, 1.5, 12, 1, true]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Revolving globe centerpiece */}
      <RevolvingGlobe center={[0, 2.15, 0]} />

      <EnergyParticles />
    </group>
  );
}

export default function IntroLoader({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);
  const progressRef = useRef(0);
  const doneRef = useRef(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    markIntroSeen();
    setFading(true);
    window.setTimeout(onDone, 350);
  };

  useEffect(() => {
    const ui = window.setInterval(() => {
      setProgress(progressRef.current);
      if (progressRef.current >= 1) {
        window.clearInterval(ui);
        window.setTimeout(finish, 250);
      }
    }, 100);
    // Hard cap so the intro can never trap the user.
    const cap = window.setTimeout(finish, 4500);
    return () => {
      window.clearInterval(ui);
      window.clearTimeout(cap);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') finish();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bootLines = [
    'ENERGIZING CIRCUIT',
    progress > 0.35 ? 'LINKING SENSOR BUS' : 'ENERGIZING CIRCUIT',
    progress > 0.7 ? 'SYSTEM READY' : progress > 0.35 ? 'LINKING SENSOR BUS' : 'ENERGIZING CIRCUIT',
  ];
  const statusLine = bootLines[2];

  return (
    <div
      role="status"
      aria-label="Loading Smart Energy Meter"
      onClick={finish}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        backgroundColor: '#05080f',
        backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% 45%, rgba(59,130,246,0.12) 0%, transparent 70%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.35s ease',
      }}
    >
      <div style={{ width: 'min(560px, 92vw)', height: '320px' }}>
        <Canvas camera={{ position: [0, 4.4, 7.2], fov: 42 }} dpr={[1, 1.5]}>
          <ambientLight intensity={0.6} />
          <pointLight position={[0, 3, 0]} intensity={12} color="#3b82f6" distance={12} />
          <CircuitScene progressRef={progressRef} />
        </Canvas>
      </div>

      <div style={{
        fontFamily: 'Rajdhani, sans-serif', fontWeight: 700,
        letterSpacing: '4px', fontSize: '1.3rem',
        color: '#e6edf5', marginTop: '4px', textAlign: 'center',
      }}>
        SMART ENERGY METER
      </div>
      <div className="mono" style={{
        fontSize: '0.7rem', color: '#f59e0b',
        letterSpacing: '3px', marginTop: '8px',
      }}>
        ⚡ {statusLine}
      </div>

      {/* Progress bar */}
      <div style={{
        width: 'min(320px, 72vw)', height: '4px', marginTop: '20px',
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: '2px', overflow: 'hidden',
      }}>
        <div style={{
          width: `${Math.round(progress * 100)}%`, height: '100%',
          backgroundColor: '#f59e0b',
          boxShadow: '0 0 12px rgba(245,158,11,0.8)',
          transition: 'width 0.1s linear',
        }} />
      </div>
      <div className="mono" style={{ marginTop: '10px', fontSize: '0.7rem', color: 'rgba(230,237,245,0.55)', letterSpacing: '2px' }}>
        {Math.round(progress * 100)}%
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); finish(); }}
        style={{
          marginTop: '20px', fontSize: '0.75rem', fontWeight: 700,
          letterSpacing: '1px', color: 'rgba(230,237,245,0.7)',
          border: '1px solid rgba(255,255,255,0.25)', borderRadius: '4px',
          padding: '8px 20px', backgroundColor: 'transparent',
        }}
      >
        SKIP
      </button>
    </div>
  );
}
