"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Float, MeshDistortMaterial } from "@react-three/drei";

function AnimatedSphere() {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          color="#8b5cf6"
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.2}
        />
      </mesh>
    </Float>
  );
}

export default function Scene3D() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <AnimatedSphere />
      <OrbitControls enableZoom={false} />
    </Canvas>
  );
}
