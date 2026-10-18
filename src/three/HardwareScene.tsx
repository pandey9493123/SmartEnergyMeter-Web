import { useState } from 'react';
import type { ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  Box,
  Grid,
  Line,
  OrbitControls,
  Text,
  Torus,
} from '@react-three/drei';

type ComponentId = 'esp32' | 'pzem' | 'relay' | null;
type Position3D = [number, number, number];

interface HardwareSceneProps {
  onSelect: (id: ComponentId) => void;
  selectedId: ComponentId;
}

interface CircuitBoardProps {
  position: Position3D;
  label: string;
  color: string;
  isSelected: boolean;
  onClick: () => void;
  children?: ReactNode;
}

function CircuitBoard({
  position,
  label,
  color,
  isSelected,
  onClick,
  children,
}: CircuitBoardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <group
      position={position}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      onPointerOver={() => {
        document.body.style.cursor = 'pointer';
        setHovered(true);
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
        setHovered(false);
      }}
    >
      <Box args={[2.5, 0.1, 1.5]}>
        <meshStandardMaterial
          color={color}
          emissive={isSelected ? '#315f86' : '#000000'}
          emissiveIntensity={isSelected ? 0.4 : 0}
          roughness={0.8}
        />
      </Box>

      {hovered && (
        <Box
          args={[2.6, 0.05, 1.6]}
          position={[0, -0.05, 0]}
        >
          <meshBasicMaterial color="#ffffff" wireframe />
        </Box>
      )}

      <Text
        position={[0, 0.2, 0.5]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>

      {children}
    </group>
  );
}

function SceneLayout({
  onSelect,
  selectedId,
}: HardwareSceneProps) {
  return (
    <group>
      <CircuitBoard
        position={[0, 0, 0]}
        label="ESP32 MCU"
        color="#2a2a2a"
        isSelected={selectedId === 'esp32'}
        onClick={() => onSelect('esp32')}
      >
        <Box args={[0.8, 0.15, 0.8]} position={[0, 0.1, -0.2]}>
          <meshStandardMaterial
            color="#555555"
            metalness={0.8}
            roughness={0.2}
          />
        </Box>
      </CircuitBoard>

      <CircuitBoard
        position={[-3.5, 0, 0]}
        label="PZEM-004T"
        color="#1a472a"
        isSelected={selectedId === 'pzem'}
        onClick={() => onSelect('pzem')}
      >
        <Torus
          args={[0.3, 0.1, 16, 32]}
          position={[-0.5, 0.25, -0.2]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshStandardMaterial
            color="#884400"
            roughness={0.6}
          />
        </Torus>
      </CircuitBoard>

      <CircuitBoard
        position={[3.5, 0, 0]}
        label="MASTER RELAY"
        color="#8b1e1e"
        isSelected={selectedId === 'relay'}
        onClick={() => onSelect('relay')}
      >
        <Box
          args={[0.8, 0.4, 0.6]}
          position={[-0.5, 0.2, -0.2]}
        >
          <meshStandardMaterial
            color="#1a5276"
            roughness={0.3}
          />
        </Box>
      </CircuitBoard>

      <Line
        points={[
          [-2.25, 0, 0],
          [-1.25, 0, 0],
        ]}
        color="#aaaaaa"
        lineWidth={2}
        dashed
        dashScale={10}
        dashSize={1}
      />

      <Text
        position={[-1.75, 0.2, 0]}
        fontSize={0.15}
        color="#888888"
      >
        UART 16/17
      </Text>

      <Line
        points={[
          [1.25, 0, 0],
          [2.25, 0, 0],
        ]}
        color="#aaaaaa"
        lineWidth={2}
        dashed
        dashScale={10}
        dashSize={1}
      />

      <Text
        position={[1.75, 0.2, 0]}
        fontSize={0.15}
        color="#888888"
      >
        GPIO 26
      </Text>
    </group>
  );
}

export default function HardwareScene({
  onSelect,
  selectedId,
}: HardwareSceneProps) {
  return (
    <Canvas
      camera={{
        position: [0, 4, 6],
        fov: 45,
      }}
      dpr={[1, 1.5]}
    >
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.5}
      />

      <Grid
        infiniteGrid
        fadeDistance={20}
        sectionColor="#444444"
        cellColor="#222222"
        position={[0, -1, 0]}
      />

      <SceneLayout
        onSelect={onSelect}
        selectedId={selectedId}
      />

      <OrbitControls
        enablePan={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={4}
        maxDistance={12}
      />
    </Canvas>
  );
}