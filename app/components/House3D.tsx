"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, ContactShadows } from "@react-three/drei";
import { useRef } from "react";
import type { Group } from "three";

function House() {
  const group = useRef<Group>(null);

  useFrame((_, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.12;
    }
  });

  return (
    <group ref={group} position={[0, -0.6, 0]} scale={0.9}>
      {/* Ground plate */}
      <mesh position={[0, -0.55, 0]} receiveShadow>
        <cylinderGeometry args={[3.2, 3.2, 0.08, 64]} />
        <meshStandardMaterial
          color="#f8fafc"
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>

      {/* Main body */}
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 1.6, 1.8]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* Roof - triangular prism made with rotated box */}
      <mesh
        position={[0, 1.45, 0]}
        rotation={[0, 0, Math.PI / 4]}
        castShadow
      >
        <boxGeometry args={[1.25, 1.25, 1.85]} />
        <meshStandardMaterial
          color="#1d4ed8"
          roughness={0.35}
          metalness={0.15}
        />
      </mesh>

      {/* Door */}
      <mesh position={[0, -0.05, 0.91]}>
        <boxGeometry args={[0.45, 0.95, 0.05]} />
        <meshStandardMaterial
          color="#0a2540"
          roughness={0.3}
          metalness={0.3}
        />
      </mesh>
      <mesh position={[0.12, -0.05, 0.94]}>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshStandardMaterial color="#c9a96e" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Windows front */}
      <mesh position={[-0.75, 0.45, 0.91]}>
        <boxGeometry args={[0.5, 0.5, 0.04]} />
        <meshStandardMaterial
          color="#bfdbfe"
          roughness={0.1}
          metalness={0.6}
          emissive="#3b82f6"
          emissiveIntensity={0.15}
        />
      </mesh>
      <mesh position={[0.75, 0.45, 0.91]}>
        <boxGeometry args={[0.5, 0.5, 0.04]} />
        <meshStandardMaterial
          color="#bfdbfe"
          roughness={0.1}
          metalness={0.6}
          emissive="#3b82f6"
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Side windows */}
      <mesh position={[1.21, 0.45, 0]}>
        <boxGeometry args={[0.04, 0.5, 0.6]} />
        <meshStandardMaterial
          color="#bfdbfe"
          roughness={0.1}
          metalness={0.6}
          emissive="#3b82f6"
          emissiveIntensity={0.15}
        />
      </mesh>
      <mesh position={[-1.21, 0.45, 0]}>
        <boxGeometry args={[0.04, 0.5, 0.6]} />
        <meshStandardMaterial
          color="#bfdbfe"
          roughness={0.1}
          metalness={0.6}
          emissive="#3b82f6"
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Chimney */}
      <mesh position={[0.7, 1.85, -0.3]} castShadow>
        <boxGeometry args={[0.25, 0.7, 0.25]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>

      {/* Trees / small bushes */}
      <mesh position={[-2.1, -0.25, 0.6]} castShadow>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color="#3b82f6" roughness={0.7} />
      </mesh>
      <mesh position={[2.1, -0.25, -0.7]} castShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#1d4ed8" roughness={0.7} />
      </mesh>
      <mesh position={[2.3, -0.3, 0.8]} castShadow>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#3b82f6" roughness={0.7} />
      </mesh>
    </group>
  );
}

export default function House3D() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas
        shadows
        camera={{ position: [5, 3.2, 5.5], fov: 35 }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.55} />
        <directionalLight
          position={[5, 6, 3]}
          intensity={1.1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-4, 3, -2]} intensity={0.35} />

        <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.35}>
          <House />
        </Float>

        <ContactShadows
          position={[0, -1.1, 0]}
          opacity={0.25}
          scale={8}
          blur={2.5}
          far={4}
        />

        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
