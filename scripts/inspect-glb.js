/* Inspeciona public/models/human-body.glb: árvore de nós, bbox por mesh COMBINED_PARTS, eixo L/R (X vs Z). */

import { NodeIO } from "@gltf-transform/core";
import { KHRDracoMeshCompression } from "@gltf-transform/extensions";
import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const draco3d = require("draco3dgltf");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODEL_PATH = path.resolve(__dirname, "../public/models/human-body.glb");

const COMBINED_PARTS = [
  "04_Shoulders",
  "10_Upper_arms",
  "11_Elbows",
  "12_Fore_arms",
  "13_Hand_back",
  "14_Hand_palms",
  "15_Thighs",
  "16_Knees",
  "17_Legs",
  "18_Ankles",
  "19_Feet",
  "SA_03_EARS",
];

function transformPoint(m, x, y, z) {
  const w = m[3] * x + m[7] * y + m[11] * z + m[15];
  return [
    (m[0] * x + m[4] * y + m[8] * z + m[12]) / w,
    (m[1] * x + m[5] * y + m[9] * z + m[13]) / w,
    (m[2] * x + m[6] * y + m[10] * z + m[14]) / w,
  ];
}

function traverseWithHierarchy(node, depth = 0) {
  const indent = "  ".repeat(depth);
  const name = node.getName() || "(unnamed)";
  const mesh = node.getMesh();
  const info = mesh ? ` [MESH: ${mesh.getName() || "(unnamed)"}]` : "";
  console.log(`${indent}${name} (Node)${info}`);

  for (const child of node.listChildren()) {
    traverseWithHierarchy(child, depth + 1);
  }
}

function getVertexMinMaxXZ(accessor, worldMatrix) {
  const count = accessor.getCount();
  if (count === 0) return null;

  const elem = [];
  let minX = Infinity,
    maxX = -Infinity;
  let minZ = Infinity,
    maxZ = -Infinity;

  for (let i = 0; i < count; i++) {
    accessor.getElement(i, elem);
    const [wx, wy, wz] = transformPoint(worldMatrix, elem[0], elem[1], elem[2]);
    minX = Math.min(minX, wx);
    maxX = Math.max(maxX, wx);
    minZ = Math.min(minZ, wz);
    maxZ = Math.max(maxZ, wz);
  }

  return { minX, maxX, minZ, maxZ };
}

async function loadAndInspect() {
  const decoderModule = await draco3d.createDecoderModule();
  const io = new NodeIO()
    .registerExtensions([KHRDracoMeshCompression])
    .registerDependencies({
      "draco3d.decoder": decoderModule,
    });

  const document = await io.read(MODEL_PATH);
  const root = document.getRoot();
  const defaultScene = root.getDefaultScene() || root.listScenes()[0];

  if (!defaultScene) {
    console.error("No scene found in model.");
    process.exit(1);
  }

  console.log("\n=== 1. MESH NAMES AND HIERARCHY ===\n");

  for (const node of defaultScene.listChildren()) {
    traverseWithHierarchy(node);
  }

  const nameToNodes = new Map();
  defaultScene.traverse((node) => {
    const mesh = node.getMesh();
    if (mesh) {
      const name = node.getName() || mesh.getName() || "(unnamed)";
      if (!nameToNodes.has(name)) nameToNodes.set(name, []);
      nameToNodes.get(name).push(node);
    }
  });

  console.log("\n=== 2. COMBINED_PARTS: BBOX & VERTEX MIN/MAX X,Z ===\n");

  const combinedResults = [];

  for (const meshName of COMBINED_PARTS) {
    const nodes = nameToNodes.get(meshName);
    if (!nodes || nodes.length === 0) {
      console.log(`${meshName}: NOT FOUND in model\n`);
      continue;
    }

    const node = nodes[0];
    const mesh = node.getMesh();
    const worldMatrix = node.getWorldMatrix();

    let minX = Infinity,
      maxX = -Infinity;
    let minZ = Infinity,
      maxZ = -Infinity;
    let minY = Infinity,
      maxY = -Infinity;

    for (const primitive of mesh.listPrimitives()) {
      const posAccessor = primitive.getAttribute("POSITION");
      if (!posAccessor) continue;

      const v = getVertexMinMaxXZ(posAccessor, worldMatrix);
      if (v) {
        minX = Math.min(minX, v.minX);
        maxX = Math.max(maxX, v.maxX);
        minZ = Math.min(minZ, v.minZ);
        maxZ = Math.max(maxZ, v.maxZ);
      }

      const elem = [];
      for (let i = 0; i < posAccessor.getCount(); i++) {
        posAccessor.getElement(i, elem);
        const [, wy] = transformPoint(worldMatrix, elem[0], elem[1], elem[2]);
        minY = Math.min(minY, wy);
        maxY = Math.max(maxY, wy);
      }
    }

    console.log(`${meshName}:`);
    console.log(
      `  World bbox: min (${minX.toFixed(4)}, ${minY.toFixed(4)}, ${minZ.toFixed(4)})`
    );
    console.log(
      `              max (${maxX.toFixed(4)}, ${maxY.toFixed(4)}, ${maxZ.toFixed(4)})`
    );
    console.log(`  Vertex X: min=${minX.toFixed(4)}, max=${maxX.toFixed(4)}`);
    console.log(`  Vertex Z: min=${minZ.toFixed(4)}, max=${maxZ.toFixed(4)}`);
    console.log("");

    combinedResults.push({
      meshName,
      minX,
      maxX,
      minZ,
      maxZ,
    });
  }

  console.log("\n=== 3. LEFT/RIGHT AXIS (X vs Z) ===\n");

  const xRange = combinedResults.reduce(
    (acc, r) => acc + (r.maxX - r.minX),
    0
  );
  const zRange = combinedResults.reduce(
    (acc, r) => acc + (r.maxZ - r.minZ),
    0
  );

  console.log(`Total vertex spread across COMBINED_PARTS:`);
  console.log(`  X axis: ${xRange.toFixed(4)}`);
  console.log(`  Z axis: ${zRange.toFixed(4)}`);

  if (xRange > zRange) {
    console.log(
      `\n→ Model uses X for left/right separation (X has larger spread)`
    );
    console.log(
      `  (Typically: negative X = left, positive X = right in glTF)`
    );
  } else if (zRange > xRange) {
    console.log(
      `\n→ Model uses Z for left/right separation (Z has larger spread)`
    );
    console.log(
      `  (Typically: negative Z = left, positive Z = right in glTF)`
    );
  } else {
    console.log(
      `\n→ X and Z spreads are similar; check individual mesh ranges above.`
    );
  }
}

loadAndInspect().catch((err) => {
  console.error("Failed to load GLB:", err);
  process.exit(1);
});
