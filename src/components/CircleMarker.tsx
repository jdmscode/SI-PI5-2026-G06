import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface CircleMarkerProps {
  position: THREE.Vector3;
  normal: THREE.Vector3;
  radius: number;
  isActive?: boolean;
}

export function CircleMarker({ position, normal, radius, isActive }: CircleMarkerProps) {
  const ringRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 0, 1),
    normal.clone().normalize()
  );

  useFrame(({ clock }) => {
    if (ringRef.current && isActive) {
      const t = clock.getElapsedTime();
      const pulse = 1 + Math.sin(t * 3) * 0.08;
      ringRef.current.scale.set(pulse, pulse, 1);
    }
  });

  return (
    <group ref={groupRef} position={position} quaternion={quaternion}>
      <mesh position={[0, 0, 0.005]} renderOrder={999}>
        <circleGeometry args={[radius, 48]} />
        <meshBasicMaterial
          color="#ef4444"
          transparent
          opacity={0.3}
          side={THREE.FrontSide}
          depthWrite={false}
          depthTest={false}
        />
      </mesh>

      <mesh ref={ringRef} position={[0, 0, 0.006]} renderOrder={1000}>
        <ringGeometry args={[radius * 0.88, radius, 48]} />
        <meshBasicMaterial
          color="#dc2626"
          transparent
          opacity={0.9}
          side={THREE.FrontSide}
          depthWrite={false}
          depthTest={false}
        />
      </mesh>

      <mesh position={[0, 0, 0.007]} renderOrder={1001}>
        <circleGeometry args={[radius * 0.08, 16]} />
        <meshBasicMaterial
          color="#991b1b"
          side={THREE.FrontSide}
          depthWrite={false}
          depthTest={false}
        />
      </mesh>
    </group>
  );
}
