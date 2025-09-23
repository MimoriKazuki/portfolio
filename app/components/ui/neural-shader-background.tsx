'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

// ===================== SHADER =====================
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision mediump float;
  uniform float iTime;
  uniform vec2 iResolution;
  varying vec2 vUv;

  vec4 cppn_fn(vec2 coordinate) {
    // Simplified neural network-like pattern generation
    vec2 pos = coordinate * 1.5;
    
    // Simple wave patterns with AI-like movement
    float wave1 = sin(pos.x * 2.0 + iTime * 0.3) * cos(pos.y * 1.5 + iTime * 0.2);
    float wave2 = sin(pos.y * 2.5 + iTime * 0.4) * cos(pos.x * 1.2 + iTime * 0.25);
    
    // Neural-like pulsing centers
    vec2 center1 = vec2(sin(iTime * 0.15) * 0.3, cos(iTime * 0.1) * 0.25);
    vec2 center2 = vec2(cos(iTime * 0.12) * 0.25, sin(iTime * 0.08) * 0.3);
    
    float dist1 = length(pos - center1);
    float dist2 = length(pos - center2);
    
    float ripple1 = sin(dist1 * 8.0 - iTime * 1.2) * exp(-dist1 * 1.5);
    float ripple2 = sin(dist2 * 6.0 - iTime * 0.8) * exp(-dist2 * 1.2);
    
    // Combine effects
    float combined = (wave1 + wave2) * 0.4 + (ripple1 + ripple2) * 0.6;
    
    // AI-inspired color scheme - blue to purple gradient
    vec3 color1 = vec3(0.15, 0.35, 0.85); // Deep blue
    vec3 color2 = vec3(0.5, 0.2, 0.8); // Purple
    vec3 color3 = vec3(0.8, 0.85, 1.0); // Light blue
    
    float t = smoothstep(-0.8, 0.8, combined);
    vec3 finalColor = mix(color1, color2, t);
    finalColor = mix(finalColor, color3, smoothstep(0.5, 1.0, t));
    
    // Subtle brightness variation
    finalColor *= 0.8 + 0.2 * sin(iTime * 0.3 + dot(pos, vec2(0.8, 0.8)));
    
    return vec4(finalColor, 0.25); // Lower alpha for more subtle effect
  }

  void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    uv.y *= -1.0;
    
    // Maintain aspect ratio
    if (iResolution.x > iResolution.y) {
      uv.x *= iResolution.x / iResolution.y;
    } else {
      uv.y *= iResolution.y / iResolution.x;
    }
    
    gl_FragColor = cppn_fn(uv);
  }
`;

const NeuralShaderMaterial = shaderMaterial(
  { iTime: 0, iResolution: new THREE.Vector2(1, 1) },
  vertexShader,
  fragmentShader
);

extend({ NeuralShaderMaterial });

function ShaderPlane() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const materialRef = useRef<any>(null!);

  useFrame((state) => {
    if (!materialRef.current) return;
    materialRef.current.iTime = state.clock.elapsedTime * 0.5; // Slow down animation
    const { width, height } = state.size;
    materialRef.current.iResolution.set(width, height);
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -0.5]}>
      <planeGeometry args={[6, 6]} />
      <neuralShaderMaterial ref={materialRef} side={THREE.DoubleSide} transparent />
    </mesh>
  );
}

export default function NeuralShaderBackground() {
  const camera = useMemo(
    () => ({ position: [0, 0, 1] as [number, number, number], fov: 75, near: 0.1, far: 1000 }),
    []
  );

  return (
    <div className="absolute inset-0 -z-10 w-full h-full" aria-hidden="true">
      <Canvas 
        camera={camera} 
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance"
        }} 
        dpr={[1, 1.5]}
        style={{ background: 'transparent' }}
      >
        <ShaderPlane />
      </Canvas>
    </div>
  );
}

declare module '@react-three/fiber' {
  interface ThreeElements {
    neuralShaderMaterial: any;
  }
}