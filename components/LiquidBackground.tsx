"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function LiquidSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    uniform float uTime;
    
    void main() {
      vUv = uv;
      vPosition = position;
      vNormal = normal;
      
      vec3 pos = position;
      
      // Create flowing wave effect
      float wave1 = sin(pos.x * 3.0 + uTime * 0.5) * 0.2;
      float wave2 = sin(pos.y * 2.0 + uTime * 0.7) * 0.2;
      float wave3 = sin(pos.z * 2.5 + uTime * 0.3) * 0.2;
      
      pos += normal * (wave1 + wave2 + wave3);
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    uniform float uTime;
    
    void main() {
      vec2 uv = vUv;
      
      // Create flowing liquid effect
      float flow1 = sin(uv.x * 8.0 + uTime * 0.5) * 0.5 + 0.5;
      float flow2 = sin(uv.y * 6.0 - uTime * 0.3) * 0.5 + 0.5;
      float flow3 = sin((uv.x + uv.y) * 5.0 + uTime * 0.4) * 0.5 + 0.5;
      
      // Bright neon green colors
      vec3 color1 = vec3(0.0, 1.0, 0.5);  // Neon green
      vec3 color2 = vec3(0.0, 0.9, 0.7);  // Cyan-green
      vec3 color3 = vec3(0.3, 1.0, 0.4);  // Bright green
      
      vec3 finalColor = mix(color1, color2, flow1);
      finalColor = mix(finalColor, color3, flow2 * flow3);
      
      // Add strong glow effect
      float glow = pow(1.0 - abs(vNormal.z), 2.5);
      finalColor += glow * vec3(0.0, 1.0, 0.5) * 0.8;
      
      // Increase opacity for better visibility
      float alpha = 0.5 + glow * 0.3;
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `;

  return (
    <mesh ref={meshRef} position={[0, 0, -2]}>
      <sphereGeometry args={[3, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
        }}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function FlowingParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] -= 0.015;
        if (positions[i + 1] < -5) {
          positions[i + 1] = 5;
        }
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const particleCount = 200;
  const positions = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 12;
    positions[i * 3 + 1] = Math.random() * 12 - 2;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 12;
  }

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#00ff88"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

export default function LiquidBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#00ff88" />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#00ffaa" />
        <pointLight position={[0, 10, 0]} intensity={1} color="#00ff66" />
        <LiquidSphere />
        <FlowingParticles />
      </Canvas>
    </div>
  );
}
