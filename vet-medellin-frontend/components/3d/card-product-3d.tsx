"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, RoundedBox, Text, Float } from "@react-three/drei";
import * as THREE from "three";

interface Product3DViewerProps {
  productName: string;
  category: string;
  color?: string;
}

function ProductBox({
  color = "#10B981",
  category,
}: {
  color: string;
  category: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  const getShape = () => {
    switch (category.toLowerCase()) {
      case "medicamento":
      case "medicamentos":
        return (
          <group ref={meshRef}>
            {/* Pill bottle */}
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.8, 0.8, 2, 32]} />
              <meshStandardMaterial color={color} />
            </mesh>
            {/* Cap */}
            <mesh position={[0, 1.2, 0]}>
              <cylinderGeometry args={[0.85, 0.85, 0.4, 32]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
            {/* Label */}
            <mesh position={[0, 0, 0.81]}>
              <planeGeometry args={[1.2, 1]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          </group>
        );

      case "vacuna":
      case "vacunas":
        return (
          <group ref={meshRef}>
            {/* Syringe body */}
            <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
              <cylinderGeometry args={[0.2, 0.2, 2.5, 32]} />
              <meshStandardMaterial
                color="#ffffff"
                transparent
                opacity={0.8}
              />
            </mesh>
            {/* Needle */}
            <mesh
              position={[0.9, 0.9, 0]}
              rotation={[0, 0, Math.PI / 4]}
            >
              <cylinderGeometry args={[0.03, 0.03, 1, 16]} />
              <meshStandardMaterial color="#C0C0C0" metalness={0.8} />
            </mesh>
            {/* Plunger */}
            <mesh
              position={[-0.7, -0.7, 0]}
              rotation={[0, 0, Math.PI / 4]}
            >
              <cylinderGeometry args={[0.15, 0.15, 0.8, 32]} />
              <meshStandardMaterial color={color} />
            </mesh>
          </group>
        );

      case "alimento":
      case "alimentos":
        return (
          <group ref={meshRef}>
            {/* Food bag */}
            <RoundedBox args={[1.5, 2, 0.8]} radius={0.1} smoothness={4}>
              <meshStandardMaterial color={color} />
            </RoundedBox>
            {/* Label area */}
            <mesh position={[0, 0.2, 0.41]}>
              <planeGeometry args={[1.2, 1.2]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          </group>
        );

      case "accesorio":
      case "accesorios":
        return (
          <group ref={meshRef}>
            {/* Collar */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[1, 0.15, 16, 100]} />
              <meshStandardMaterial color={color} />
            </mesh>
            {/* Tag */}
            <mesh position={[0, -1.1, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 0.05, 32]} />
              <meshStandardMaterial color="#FFD700" metalness={0.8} />
            </mesh>
          </group>
        );

      default:
        return (
          <RoundedBox ref={meshRef} args={[1.5, 1.5, 1.5]} radius={0.1}>
            <meshStandardMaterial color={color} />
          </RoundedBox>
        );
    }
  };

  return <Float speed={2} rotationIntensity={0.5}>{getShape()}</Float>;
}

function Scene({
  productName,
  category,
  color,
}: {
  productName: string;
  category: string;
  color: string;
}) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#10B981" />

      <ProductBox color={color} category={category} />

      <Text
        position={[0, -2, 0]}
        fontSize={0.3}
        color="#6b7280"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter.woff"
      >
        {productName}
      </Text>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2}
      />

      {/* Ground reflection */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial
          color="#f0f0f0"
          transparent
          opacity={0.5}
        />
      </mesh>
    </>
  );
}

export function CardProduct3D({
  productName,
  category,
  color = "#10B981",
}: Product3DViewerProps) {
  return (
    <div className="w-full h-[300px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <Scene productName={productName} category={category} color={color} />
      </Canvas>
    </div>
  );
}
