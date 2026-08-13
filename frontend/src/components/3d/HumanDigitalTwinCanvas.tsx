import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, ContactShadows } from '@react-three/drei';
import { HolographicHumanModel } from './HolographicHumanModel';
import { useDigitalTwin } from '../../context/DigitalTwinContext';

interface Props {
  className?: string;
  onSelectOrgan?: (key: string) => void;
}

export const HumanDigitalTwinCanvas: React.FC<Props> = ({ className, onSelectOrgan }) => {
  const { selectedOrganKey, setSelectedOrganKey, twinState } = useDigitalTwin();

  const handleSelect = (key: string) => {
    setSelectedOrganKey(key);
    if (onSelectOrgan) onSelectOrgan(key);
  };

  const organScores: Record<string, { score: number; color: string }> = {};
  if (twinState?.organs) {
    Object.entries(twinState.organs).forEach(([k, v]) => {
      organScores[k] = { score: v.score, color: v.color };
    });
  }

  return (
    <div className={`relative w-full h-full min-h-[420px] rounded-2xl overflow-hidden glass-panel ${className || ''}`}>
      {/* Visual background cyber glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-900/40 to-transparent"></div>

      <Canvas
        camera={{ position: [0, 0.4, 3.8], fov: 45 }}
        className="cursor-grab active:cursor-grabbing"
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.2} color="#38BDF8" />
        <pointLight position={[-10, -5, -10]} intensity={0.6} color="#818CF8" />
        <spotLight position={[0, 5, 2]} intensity={1.5} color="#06B6D4" angle={0.6} penumbra={1} />

        <Suspense fallback={null}>
          <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
            <HolographicHumanModel
              selectedOrganKey={selectedOrganKey}
              onSelectOrgan={handleSelect}
              organScores={organScores}
            />
          </Float>
          <ContactShadows
            position={[0, -1.5, 0]}
            opacity={0.6}
            scale={5}
            blur={2}
            far={4}
            color="#06B6D4"
          />
        </Suspense>

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={2.2}
          maxDistance={5.5}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.7}
          autoRotate={!selectedOrganKey}
          autoRotateSpeed={0.8}
        />
      </Canvas>

      {/* Interactive HUD Overlay instructions */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-900/80 backdrop-blur-md border border-cyan-500/20 text-xs text-cyan-300 pointer-events-none">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span>Interactive 3D Avatar (Drag to Rotate • Scroll to Zoom • Tap Organs)</span>
        </div>
        <span className="text-slate-400 hidden sm:inline font-mono">DIGITAL_TWIN_v1.0</span>
      </div>
    </div>
  );
};
