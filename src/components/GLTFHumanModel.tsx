import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useLoader, ThreeEvent } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { CircleMarker } from "./CircleMarker";

export interface CircleData {
  position: THREE.Vector3;
  normal: THREE.Vector3;
  radius: number;
  meshName: string;
  zoneName: string;
}

export type CombinedPartsMap = Record<string, { left: string; right: string }>;

/** Partição de triângulos por plano X local; `flipLeftRight` troca a atribuição L/R. */
function splitGeometryByPlaneX(
  geometry: THREE.BufferGeometry,
  planeX: number,
  flipLeftRight: boolean
): { geomL: THREE.BufferGeometry; geomR: THREE.BufferGeometry } {
  const posAttr = geometry.getAttribute("position");
  const indexAttr = geometry.index;
  const hasNormals = geometry.hasAttribute("normal");
  const normAttr = hasNormals ? geometry.getAttribute("normal") : null;
  const hasUV = geometry.hasAttribute("uv");
  const uvAttr = hasUV ? geometry.getAttribute("uv") : null;

  const indicesL: number[] = [];
  const indicesR: number[] = [];
  const vertexMapL = new Map<string, number>();
  const vertexMapR = new Map<string, number>();
  const vertsL: { pos: [number, number, number]; norm?: [number, number, number]; uv?: [number, number] }[] = [];
  const vertsR: { pos: [number, number, number]; norm?: [number, number, number]; uv?: [number, number] }[] = [];

  const getKey = (i: number) => {
    const x = posAttr.getX(i), y = posAttr.getY(i), z = posAttr.getZ(i);
    return `${x.toFixed(6)},${y.toFixed(6)},${z.toFixed(6)}`;
  };

  const addVertex = (
    i: number,
    map: Map<string, number>,
    arr: { pos: [number, number, number]; norm?: [number, number, number]; uv?: [number, number] }[]
  ) => {
    const key = getKey(i);
    let idx = map.get(key);
    if (idx === undefined) {
      idx = arr.length;
      map.set(key, idx);
      arr.push({
        pos: [posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i)],
        norm: normAttr ? [normAttr.getX(i), normAttr.getY(i), normAttr.getZ(i)] : undefined,
        uv: uvAttr ? [uvAttr.getX(i), uvAttr.getY(i)] : undefined,
      });
    }
    return idx;
  };

  const processTriangle = (i0: number, i1: number, i2: number) => {
    const x0 = posAttr.getX(i0), x1 = posAttr.getX(i1), x2 = posAttr.getX(i2);
    const cx = (x0 + x1 + x2) / 3;
    const isRight = cx >= planeX;
    const toL = flipLeftRight ? !isRight : isRight;
    const map = toL ? vertexMapL : vertexMapR;
    const arr = toL ? vertsL : vertsR;
    const indices = toL ? indicesL : indicesR;
    const v0 = addVertex(i0, map, arr);
    const v1 = addVertex(i1, map, arr);
    const v2 = addVertex(i2, map, arr);
    indices.push(v0, v1, v2);
  };

  if (indexAttr) {
    for (let i = 0; i < indexAttr.count; i += 3) {
      processTriangle(
        indexAttr.getX(i) as number,
        indexAttr.getX(i + 1) as number,
        indexAttr.getX(i + 2) as number
      );
    }
  } else {
    for (let i = 0; i < posAttr.count; i += 3) {
      processTriangle(i, i + 1, i + 2);
    }
  }

  const buildGeom = (arr: typeof vertsL) => {
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(arr.length * 3);
    const normals = hasNormals ? new Float32Array(arr.length * 3) : null;
    const uvs = hasUV ? new Float32Array(arr.length * 2) : null;
    for (let i = 0; i < arr.length; i++) {
      positions[i * 3] = arr[i].pos[0];
      positions[i * 3 + 1] = arr[i].pos[1];
      positions[i * 3 + 2] = arr[i].pos[2];
      if (normals && arr[i].norm) {
        normals[i * 3] = arr[i].norm![0];
        normals[i * 3 + 1] = arr[i].norm![1];
        normals[i * 3 + 2] = arr[i].norm![2];
      }
      if (uvs && arr[i].uv) {
        uvs[i * 2] = arr[i].uv![0];
        uvs[i * 2 + 1] = arr[i].uv![1];
      }
    }
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    if (normals) geom.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
    if (uvs) geom.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    return geom;
  };

  const geomL = buildGeom(vertsL);
  const geomR = buildGeom(vertsR);
  geomL.setIndex(indicesL);
  geomR.setIndex(indicesR);
  return { geomL, geomR };
}

interface GLTFHumanModelProps {
  modelPath: string;
  selectedZone: string | null;
  onSelectZone: (name: string) => void;
  meshNameMap?: Record<string, string>;
  combinedParts?: CombinedPartsMap;
  isZoomed: boolean;
  circles: CircleData[];
  activeCircleIndex: number | null;
  onStartCircle?: (position: THREE.Vector3, normal: THREE.Vector3, meshName: string, zoneName: string) => void;
  onResizeCircle?: (radius: number) => void;
  onFinishCircle?: () => void;
  onMeshCenterFound?: (center: THREE.Vector3, meshName: string, direction: THREE.Vector3, meshSize?: number, bboxSize?: THREE.Vector3) => void;
  /** Inverte qual metade da partição X vira malha _L vs _R. */
  flipLeftRightAxis?: boolean;
}

export function GLTFHumanModel({
  modelPath,
  selectedZone,
  onSelectZone,
  meshNameMap = {},
  combinedParts = {},
  isZoomed,
  circles = [],
  activeCircleIndex = null,
  onStartCircle,
  onResizeCircle,
  onFinishCircle,
  onMeshCenterFound,
  flipLeftRightAxis = false,
}: GLTFHumanModelProps) {
  const gltf = useLoader(GLTFLoader, modelPath, (loader) => {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/");
    (loader as GLTFLoader).setDRACOLoader(dracoLoader);
  });
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredMesh, setHoveredMesh] = useState<string | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState<THREE.Vector3 | null>(null);
  const isDragging = useRef(false);
  const dragOrigin = useRef<THREE.Vector3 | null>(null);

  const hoverColor = new THREE.Color("#93c5fd");
  const activeColor = new THREE.Color("#2563eb");

  const originalMaterials = useRef<Map<string, THREE.Material | THREE.Material[]>>(new Map());

  const getDisplayName = useCallback(
    (meshName: string, _point?: THREE.Vector3) => meshNameMap[meshName] || meshName,
    [meshNameMap]
  );

  const reverseMap = useMemo(() => {
    const map: Record<string, string> = {};
    Object.entries(meshNameMap).forEach(([mesh, display]) => {
      map[display] = mesh;
    });
    return map;
  }, [meshNameMap]);

  const modelScene = useMemo(() => {
    const scene = gltf.scene.clone(true);
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 2.5 / maxDim;
    scene.scale.setScalar(scale);

    const scaledBox = new THREE.Box3().setFromObject(scene);
    const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
    scene.position.sub(scaledCenter);
    scene.position.y += scaledBox.getSize(new THREE.Vector3()).y / 2;

    const toSplit: THREE.Mesh[] = [];
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (Array.isArray(mesh.material)) {
          const cloned = mesh.material.map((m) => {
            const c = m.clone();
            (c as THREE.MeshStandardMaterial).roughness = 0.5;
            (c as THREE.MeshStandardMaterial).metalness = 0.02;
            return c;
          });
          originalMaterials.current.set(mesh.name, cloned.map(m => m.clone()));
          mesh.material = cloned;
        } else {
          const c = mesh.material.clone();
          (c as THREE.MeshStandardMaterial).roughness = 0.5;
          (c as THREE.MeshStandardMaterial).metalness = 0.02;
          originalMaterials.current.set(mesh.name, c.clone());
          mesh.material = c;
        }
        if (combinedParts[mesh.name]) toSplit.push(mesh);
      }
    });

    for (const mesh of toSplit) {
      const baseName = mesh.name;
      const parent = mesh.parent;
      if (!parent) continue;
      originalMaterials.current.delete(baseName);

      const cloneMat = (m: THREE.Material) => {
        const c = m.clone() as THREE.MeshStandardMaterial;
        c.roughness = 0.5;
        c.metalness = 0.02;
        return c;
      };

      const { geomL, geomR } = splitGeometryByPlaneX(mesh.geometry, 0, flipLeftRightAxis);
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const matL = mats.length === 1 ? cloneMat(mats[0]) : mats.map(cloneMat);
      const matR = mats.length === 1 ? cloneMat(mats[0]) : mats.map(cloneMat);

      const meshL = new THREE.Mesh(geomL, matL);
      const meshR = new THREE.Mesh(geomR, matR);
      meshL.name = `${baseName}_L`;
      meshR.name = `${baseName}_R`;

      originalMaterials.current.set(meshL.name, Array.isArray(matL) ? matL.map(m => m.clone()) : (matL as THREE.Material).clone());
      originalMaterials.current.set(meshR.name, Array.isArray(matR) ? matR.map(m => m.clone()) : (matR as THREE.Material).clone());

      const group = new THREE.Group();
      group.name = `${baseName}_split`;
      group.position.copy(mesh.position);
      group.quaternion.copy(mesh.quaternion);
      group.scale.copy(mesh.scale);
      group.add(meshL);
      group.add(meshR);
      parent.remove(mesh);
      parent.add(group);
    }

    return scene;
  }, [gltf.scene, combinedParts, flipLeftRightAxis]);

  useEffect(() => {
    if (!selectedZone || !modelScene || !onMeshCenterFound) return;
    const meshName = reverseMap[selectedZone] || selectedZone;
    const combinedBox = new THREE.Box3();
    let hasMatch = false;

    modelScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const matches = mesh.name === meshName || getDisplayName(mesh.name) === selectedZone;
        if (matches) {
          combinedBox.union(new THREE.Box3().setFromObject(mesh));
          hasMatch = true;
        }
      }
    });

    if (!hasMatch) return;

    const center = combinedBox.getCenter(new THREE.Vector3());
    const size = combinedBox.getSize(new THREE.Vector3());
    const meshSize = Math.max(size.x, size.y, size.z);

    const BACK_ZONES = ["Costas", "Dorso Superior", "Dorso Inferior", "Lombar", "Glúteos"];
    const isBackZone = BACK_ZONES.includes(selectedZone);

    const modelBox = new THREE.Box3().setFromObject(modelScene);
    const modelCenter = modelBox.getCenter(new THREE.Vector3());
    let dir = new THREE.Vector3(
      center.x - modelCenter.x,
      0,
      center.z - modelCenter.z
    );
    if (dir.length() < 0.01) {
      dir.set(0, 0, isBackZone ? -1 : 1);
    } else {
      dir.normalize();
      if (!isBackZone && dir.z < 0) {
        dir.set(dir.x, 0, Math.abs(dir.z) || 0.3);
        dir.normalize();
      }
    }

    onMeshCenterFound(center, meshName, dir, meshSize, size);
  }, [selectedZone, modelScene, reverseMap, getDisplayName, onMeshCenterFound]);

  useEffect(() => {
    if (!modelScene) return;
    modelScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const isHovered = mesh.name === hoveredMesh;
        const displayName = getDisplayName(mesh.name);
        const isActive = displayName === selectedZone;

        const orig = originalMaterials.current.get(mesh.name);
        const origMats = orig ? (Array.isArray(orig) ? orig : [orig]) : null;
        const currMats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

        const applyColor = (mat: THREE.Material, index: number) => {
          const stdMat = mat as THREE.MeshStandardMaterial;
          if (!stdMat.color) return;
          if (isActive) {
            stdMat.color.copy(activeColor);
            stdMat.emissive?.set(0x1d4ed8);
            stdMat.emissiveIntensity = 0.2;
          } else if (isHovered) {
            stdMat.color.copy(hoverColor);
            stdMat.emissive?.set(0x3b82f6);
            stdMat.emissiveIntensity = 0.08;
          } else if (origMats && origMats[index]) {
            const o = origMats[index] as THREE.MeshStandardMaterial;
            stdMat.color.copy(o.color);
            stdMat.emissive?.copy(o.emissive || new THREE.Color(0x000000));
            stdMat.emissiveIntensity = o.emissiveIntensity ?? 0;
          }
        };

        currMats.forEach((mat, i) => applyColor(mat, i));
      }
    });
  }, [selectedZone, hoveredMesh, modelScene, getDisplayName]);

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const mesh = e.object as THREE.Mesh;
    if (!mesh.isMesh || !mesh.name) return;
    const displayName = getDisplayName(mesh.name, e.point);

    if (isZoomed && selectedZone === displayName && onStartCircle) {
      isDragging.current = true;
      dragOrigin.current = e.point.clone();
      const normal = e.face?.normal.clone() || new THREE.Vector3(0, 1, 0);
      const normalMatrix = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
      normal.applyMatrix3(normalMatrix).normalize();
      onStartCircle(e.point.clone(), normal, mesh.name, displayName);
    }
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const mesh = e.object as THREE.Mesh;

    if (isDragging.current && dragOrigin.current && onResizeCircle) {
      const dist = e.point.distanceTo(dragOrigin.current);
      const radius = Math.max(0.005, Math.min(dist, 0.15));
      onResizeCircle(radius);
      return;
    }

    if (mesh.isMesh && mesh.name) {
      setHoveredMesh(mesh.name);
      setHoveredPosition(e.point.clone());
      document.body.style.cursor = isZoomed ? "crosshair" : "pointer";
    }
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    if (isDragging.current) {
      e.stopPropagation();
      isDragging.current = false;
      dragOrigin.current = null;
      onFinishCircle?.();
    }
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const mesh = e.object as THREE.Mesh;
    if (!mesh.isMesh || !mesh.name) return;
    const displayName = getDisplayName(mesh.name, e.point);

    if (!isZoomed || selectedZone !== displayName) {
      onSelectZone(displayName);
    }
  };

  const handlePointerOut = () => {
    if (!isDragging.current) {
      setHoveredMesh(null);
      setHoveredPosition(null);
      document.body.style.cursor = "auto";
    }
  };

  return (
    <group ref={groupRef}>
      <primitive
        object={modelScene}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerOver={handlePointerMove}
        onPointerOut={handlePointerOut}
      />

      {circles.map((circle, i) => (
        <CircleMarker
          key={i}
          position={circle.position}
          normal={circle.normal}
          radius={circle.radius}
          isActive={i === activeCircleIndex}
        />
      ))}

      {hoveredMesh && hoveredPosition && !isDragging.current && (
        <Html position={hoveredPosition} style={{ pointerEvents: "none" }}>
          <div
            style={{
              background: isZoomed ? "rgba(220, 38, 38, 0.92)" : "rgba(15, 23, 42, 0.95)",
              color: "#f8fafc",
              padding: "5px 12px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 600,
              whiteSpace: "nowrap",
              boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
              fontFamily: "Inter, system-ui, sans-serif",
              transform: "translate(-50%, -140%)",
              border: isZoomed
                ? "1px solid rgba(252, 165, 165, 0.4)"
                : "1px solid rgba(148, 163, 184, 0.2)",
            }}
          >
            {isZoomed ? "Arraste para marcar área" : getDisplayName(hoveredMesh, hoveredPosition || undefined)}
          </div>
        </Html>
      )}
    </group>
  );
}
