import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface HolographicHumanModelProps {
  selectedOrganKey: string | null;
  onSelectOrgan: (key: string) => void;
  organScores?: Record<string, { score: number; color: string }>;
}

export const HolographicHumanModel: React.FC<HolographicHumanModelProps> = ({
  selectedOrganKey,
  onSelectOrgan,
  organScores = {}
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const heartRef = useRef<THREE.Mesh>(null);
  const brainRef = useRef<THREE.Mesh>(null);
  const lungsRef = useRef<THREE.Group>(null);
  const stomachRef = useRef<THREE.Mesh>(null);

  // Subtle floating and pulsating anatomical animations
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 1.2) * 0.05 - 0.2;
    }
    // Heart pulse
    if (heartRef.current) {
      const pulse = 1 + Math.sin(t * 4.5) * 0.15;
      heartRef.current.scale.set(pulse, pulse, pulse);
    }
    // Brain neural pulse
    if (brainRef.current) {
      const glow = 1 + Math.cos(t * 2.5) * 0.08;
      brainRef.current.scale.set(glow, glow, glow);
    }
    // Lungs breathing rhythm
    if (lungsRef.current) {
      const breath = 1 + Math.sin(t * 1.8) * 0.08;
      lungsRef.current.scale.set(breath, breath, breath);
    }
  });

  const getOrganColor = (key: string, defaultColor: string) => {
    if (selectedOrganKey === key) return '#38BDF8';
    return organScores[key]?.color || defaultColor;
  };

  return (
    <group ref={groupRef} scale={[1.1, 1.1, 1.1]}>
      {/* --- Stylized Holographic Anatomy Silhouette --- */}

      {/* Head & Cranium */}
      <mesh position={[0, 1.85, 0]}>
        <sphereGeometry args={[0.32, 32, 32]} />
        <meshPhysicalMaterial
          color="#06B6D4"
          transmission={0.85}
          opacity={0.6}
          transparent
          roughness={0.2}
          wireframe={false}
          emissive="#06B6D4"
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 1.45, 0]}>
        <cylinderGeometry args={[0.12, 0.14, 0.22, 24]} />
        <meshStandardMaterial color="#0E7490" transparent opacity={0.5} wireframe />
      </mesh>

      {/* Torso & Ribcage */}
      <mesh position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.38, 0.28, 1.0, 32]} />
        <meshPhysicalMaterial
          color="#0369A1"
          transmission={0.88}
          opacity={0.45}
          transparent
          roughness={0.3}
          wireframe={false}
          emissive="#0284C7"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Pelvis */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.28, 0.24, 0.35, 24]} />
        <meshStandardMaterial color="#0284C7" transparent opacity={0.4} wireframe />
      </mesh>

      {/* Arms (Left & Right) */}
      <mesh position={[-0.48, 0.8, 0]} rotation={[0, 0, 0.15]}>
        <cylinderGeometry args={[0.09, 0.07, 0.9, 16]} />
        <meshStandardMaterial color="#0E7490" transparent opacity={0.5} wireframe />
      </mesh>
      <mesh position={[0.48, 0.8, 0]} rotation={[0, 0, -0.15]}>
        <cylinderGeometry args={[0.09, 0.07, 0.9, 16]} />
        <meshStandardMaterial color="#0E7490" transparent opacity={0.5} wireframe />
      </mesh>

      {/* Legs (Left & Right) */}
      <mesh position={[-0.2, -0.65, 0]}>
        <cylinderGeometry args={[0.11, 0.08, 1.3, 20]} />
        <meshStandardMaterial color="#0284C7" transparent opacity={0.45} wireframe />
      </mesh>
      <mesh position={[0.2, -0.65, 0]}>
        <cylinderGeometry args={[0.11, 0.08, 1.3, 20]} />
        <meshStandardMaterial color="#0284C7" transparent opacity={0.45} wireframe />
      </mesh>

      {/* --- Glowing Interactive Organ Nodes --- */}

      {/* 1. Brain / Mental Node */}
      <group position={[0, 1.88, 0.08]} onClick={(e) => { e.stopPropagation(); onSelectOrgan('brain'); }}>
        <mesh ref={brainRef}>
          <sphereGeometry args={[0.13, 24, 24]} />
          <meshStandardMaterial
            color={getOrganColor('brain', '#8B5CF6')}
            emissive={getOrganColor('brain', '#8B5CF6')}
            emissiveIntensity={0.8}
            roughness={0.1}
          />
        </mesh>
        {/* Glow Ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.16, 0.19, 32]} />
          <meshBasicMaterial color="#A78BFA" transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* 2. Heart Node */}
      <group position={[-0.07, 1.05, 0.18]} onClick={(e) => { e.stopPropagation(); onSelectOrgan('heart'); }}>
        <mesh ref={heartRef}>
          <sphereGeometry args={[0.11, 24, 24]} />
          <meshStandardMaterial
            color={getOrganColor('heart', '#EF4444')}
            emissive={getOrganColor('heart', '#EF4444')}
            emissiveIntensity={0.9}
            roughness={0.1}
          />
        </mesh>
        {/* Pulsing coronary halo */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.14, 0.17, 32]} />
          <meshBasicMaterial color="#F87171" transparent opacity={0.85} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* 3. Lungs / Respiratory Node */}
      <group ref={lungsRef} position={[0, 1.05, 0.08]} onClick={(e) => { e.stopPropagation(); onSelectOrgan('respiratory'); }}>
        {/* Left Lung */}
        <mesh position={[-0.18, 0, 0]}>
          <capsuleGeometry args={[0.07, 0.18, 8, 16]} />
          <meshStandardMaterial
            color={getOrganColor('respiratory', '#06B6D4')}
            emissive={getOrganColor('respiratory', '#06B6D4')}
            emissiveIntensity={0.7}
            transparent
            opacity={0.85}
          />
        </mesh>
        {/* Right Lung */}
        <mesh position={[0.18, 0, 0]}>
          <capsuleGeometry args={[0.07, 0.18, 8, 16]} />
          <meshStandardMaterial
            color={getOrganColor('respiratory', '#06B6D4')}
            emissive={getOrganColor('respiratory', '#06B6D4')}
            emissiveIntensity={0.7}
            transparent
            opacity={0.85}
          />
        </mesh>
      </group>

      {/* 4. Digestive & Metabolic Node */}
      <group position={[0.02, 0.58, 0.16]} onClick={(e) => { e.stopPropagation(); onSelectOrgan('digestive'); }}>
        <mesh ref={stomachRef}>
          <sphereGeometry args={[0.11, 24, 24]} />
          <meshStandardMaterial
            color={getOrganColor('digestive', '#F59E0B')}
            emissive={getOrganColor('digestive', '#F59E0B')}
            emissiveIntensity={0.75}
            roughness={0.2}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.13, 0.16, 24]} />
          <meshBasicMaterial color="#FBBF24" transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* 5. Musculoskeletal & Fitness Node */}
      <group position={[0.24, -0.3, 0.15]} onClick={(e) => { e.stopPropagation(); onSelectOrgan('fitness'); }}>
        <mesh>
          <sphereGeometry args={[0.09, 20, 20]} />
          <meshStandardMaterial
            color={getOrganColor('fitness', '#10B981')}
            emissive={getOrganColor('fitness', '#10B981')}
            emissiveIntensity={0.8}
          />
        </mesh>
      </group>

      {/* 6. Sleep / Pineal Circadian Node */}
      <group position={[0, 1.62, -0.05]} onClick={(e) => { e.stopPropagation(); onSelectOrgan('sleep'); }}>
        <mesh>
          <sphereGeometry args={[0.08, 20, 20]} />
          <meshStandardMaterial
            color={getOrganColor('sleep', '#6366F1')}
            emissive={getOrganColor('sleep', '#6366F1')}
            emissiveIntensity={0.8}
          />
        </mesh>
      </group>
    </group>
  );
};
