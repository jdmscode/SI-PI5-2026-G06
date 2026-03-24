import { useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface CameraControllerProps {
  targetPosition: THREE.Vector3 | null;
  targetLookAt: THREE.Vector3 | null;
  orbitControlsRef: React.RefObject<any>;
  isZoomed: boolean;
  onAnimationComplete?: () => void;
}

export function CameraController({
  targetPosition,
  targetLookAt,
  orbitControlsRef,
  isZoomed,
  onAnimationComplete,
}: CameraControllerProps) {
  const { camera } = useThree();
  const animating = useRef(false);
  const hasTarget = targetPosition !== null && targetLookAt !== null;
  const lerpFactor = 0.12;

  const defaultPos = useRef(new THREE.Vector3(0, 0.8, 3.2));
  const defaultTarget = useRef(new THREE.Vector3(0, 1.1, 0));

  useEffect(() => {
    animating.current = true;
  }, [targetPosition, targetLookAt, isZoomed]);

  useFrame(() => {
    if (!animating.current) return;

    const goalPos = targetPosition || defaultPos.current;
    const goalTarget = targetLookAt || defaultTarget.current;

    camera.position.lerp(goalPos, lerpFactor);

    if (orbitControlsRef.current) {
      const ctrl = orbitControlsRef.current;
      ctrl.target.lerp(goalTarget, lerpFactor);
      ctrl.update();
    }

    const posDist = camera.position.distanceTo(goalPos);
    const targetDist = orbitControlsRef.current
      ? orbitControlsRef.current.target.distanceTo(goalTarget)
      : 0;

    if (posDist < 0.02 && targetDist < 0.02) {
      animating.current = false;
      if (orbitControlsRef.current) {
        orbitControlsRef.current.target.copy(goalTarget);
        orbitControlsRef.current.update();
      }
      onAnimationComplete?.();
    }
  });

  return null;
}
