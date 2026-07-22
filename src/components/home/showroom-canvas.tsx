"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Float, PerspectiveCamera } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import type { Group, Mesh } from "three";
import { useLocale } from "@/providers/locale-provider";

function PremiumSUV() {
  const group = useRef<Group>(null);
  const body = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.25;
  });

  const materials = useMemo(
    () => ({
      paint: "#1e293b",
      glass: "#93c5fd",
      trim: "#c8a96a",
      tire: "#0f172a",
    }),
    [],
  );

  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.4}>
      <group ref={group} position={[0, 0.2, 0]} scale={1.15}>
        <mesh ref={body} castShadow position={[0, 0.55, 0]}>
          <boxGeometry args={[2.4, 0.55, 1.2]} />
          <meshStandardMaterial color={materials.paint} metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh castShadow position={[0, 1.0, 0]}>
          <boxGeometry args={[1.5, 0.55, 1.05]} />
          <meshStandardMaterial color={materials.paint} metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0.1, 1.05, 0]}>
          <boxGeometry args={[1.1, 0.35, 0.95]} />
          <meshStandardMaterial
            color={materials.glass}
            transparent
            opacity={0.35}
            metalness={1}
            roughness={0}
          />
        </mesh>
        <mesh position={[1.1, 0.55, 0]}>
          <boxGeometry args={[0.2, 0.2, 1.05]} />
          <meshStandardMaterial color={materials.trim} metalness={1} roughness={0.2} />
        </mesh>
        {[
          [-0.75, 0.28, 0.55],
          [0.75, 0.28, 0.55],
          [-0.75, 0.28, -0.55],
          [0.75, 0.28, -0.55],
        ].map((pos, i) => (
          <mesh key={i} castShadow position={pos as [number, number, number]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.28, 0.1, 12, 24]} />
            <meshStandardMaterial color={materials.tire} roughness={0.8} />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

function Scene() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[4.2, 2.2, 4.8]} fov={42} />
      <color attach="background" args={["#020617"]} />
      <fog attach="fog" args={["#020617", 6, 16]} />
      <ambientLight intensity={0.35} />
      <spotLight
        position={[5, 8, 2]}
        angle={0.4}
        penumbra={0.7}
        intensity={2.2}
        color="#93c5fd"
        castShadow
      />
      <spotLight position={[-4, 5, -2]} angle={0.5} penumbra={1} intensity={1.4} color="#c8a96a" />
      <PremiumSUV />
      <ContactShadows position={[0, 0, 0]} opacity={0.65} scale={12} blur={2.5} far={4} />
      <Environment preset="city" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <circleGeometry args={[8, 64]} />
        <meshStandardMaterial color="#020617" metalness={0.9} roughness={0.15} />
      </mesh>
    </>
  );
}

export function ShowroomCanvas() {
  const { t } = useLocale();

  return (
    <div className="absolute inset-0 -z-10">
      <Suspense
        fallback={
          <div className="flex h-full items-center justify-center bg-slate-950 text-slate-400">
            {t("showroom.loading")}
          </div>
        }
      >
        <Canvas dpr={[1, 1.75]} shadows gl={{ antialias: true, alpha: true }}>
          <Scene />
        </Canvas>
      </Suspense>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/20 via-transparent to-slate-950" />
    </div>
  );
}
