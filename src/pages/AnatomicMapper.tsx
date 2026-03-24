import { useState, useRef, Suspense, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment } from "@react-three/drei";
import { Upload, BrainCircuit, ZoomOut, Circle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useNavigate } from "react-router-dom";
import { GLTFHumanModel, CircleData } from "@/components/GLTFHumanModel";
import { CameraController } from "@/components/CameraController";
import * as THREE from "three";

const anatomyTree = [
  { group: "Cabeça e Pescoço", parts: ["Cabeça", "Pescoço", "Face", "Couro Cabeludo", "Orelha Direita", "Orelha Esquerda"] },
  { group: "Tronco", parts: ["Tórax", "Abdômen", "Quadril", "Dorso Superior", "Dorso Inferior", "Região Lombar"] },
  { group: "Membros Superiores", parts: ["Ombro Direito", "Ombro Esquerdo", "Braço Direito", "Braço Esquerdo", "Cotovelo Direito", "Cotovelo Esquerdo", "Antebraço Direito", "Antebraço Esquerdo", "Mão Direita", "Mão Esquerda"] },
  { group: "Membros Inferiores", parts: ["Coxa Direita", "Coxa Esquerda", "Joelho Direito", "Joelho Esquerdo", "Panturrilha Direita", "Panturrilha Esquerda", "Tornozelo Direito", "Tornozelo Esquerdo", "Pé Direito", "Pé Esquerdo"] },
];

/** Nomes de mesh no GLB segmentado → rótulos clínicos (incl. variantes _L/_R). */
const meshNameMap: Record<string, string> = {
  "01_Scalp": "Couro Cabeludo", "02_Face": "Face", "03_Neck": "Pescoço",
  "05_Chest": "Tórax", "06_Abdomen": "Abdômen",
  "07_Lower_abdomen": "Baixo Ventre", "08_Intimate_area": "Região Íntima",
  "09_Arm_pits": "Axilas", "20_Back": "Costas", "21_Lower_back": "Lombar", "22_Buttocks": "Glúteos",
  "SA_01_FOREHEAD": "Testa", "SA_02_TEMPLES": "Têmporas", "SA_04_EYEBROWS": "Sobrancelhas",
  "SA_05_EYELIDS": "Pálpebras", "SA_06_EYES": "Olhos", "SA_07_EYELASHES": "Cílios",
  "SA_08_NOSE": "Nariz", "SA_09_NOSTRILS": "Narinas", "SA_10_CHEEKS": "Bochechas",
  "SA_11_MOUTH": "Boca", "SA_12_LIPS": "Lábios", "SA_13_JAW": "Mandíbula",
  "Model": "Corpo",
  "04_Shoulders": "Ombros", "04_Shoulders_L": "Ombro Esquerdo", "04_Shoulders_R": "Ombro Direito",
  "04_Shoulder_L": "Ombro Esquerdo", "04_Shoulder_R": "Ombro Direito",
  "10_Upper_arms": "Braços", "10_Upper_arms_L": "Braço Esquerdo", "10_Upper_arms_R": "Braço Direito",
  "10_Upper_arm_L": "Braço Esquerdo", "10_Upper_arm_R": "Braço Direito",
  "11_Elbows": "Cotovelos", "11_Elbows_L": "Cotovelo Esquerdo", "11_Elbows_R": "Cotovelo Direito",
  "11_Elbow_L": "Cotovelo Esquerdo", "11_Elbow_R": "Cotovelo Direito",
  "12_Fore_arms": "Antebraços", "12_Fore_arms_L": "Antebraço Esquerdo", "12_Fore_arms_R": "Antebraço Direito",
  "12_Fore_arm_L": "Antebraço Esquerdo", "12_Fore_arm_R": "Antebraço Direito",
  "13_Hand_back": "Dorso das Mãos", "13_Hand_back_L": "Mão Esquerda", "13_Hand_back_R": "Mão Direita",
  "14_Hand_palms": "Palmas das Mãos", "14_Hand_palms_L": "Mão Esquerda", "14_Hand_palms_R": "Mão Direita",
  "13_Hand_L": "Mão Esquerda", "13_Hand_R": "Mão Direita", "14_Hand_palm_L": "Mão Esquerda", "14_Hand_palm_R": "Mão Direita",
  "15_Thighs": "Coxas", "15_Thighs_L": "Coxa Esquerda", "15_Thighs_R": "Coxa Direita",
  "15_Thigh_L": "Coxa Esquerda", "15_Thigh_R": "Coxa Direita",
  "16_Knees": "Joelhos", "16_Knees_L": "Joelho Esquerdo", "16_Knees_R": "Joelho Direito",
  "16_Knee_L": "Joelho Esquerdo", "16_Knee_R": "Joelho Direito",
  "17_Legs": "Panturrilhas", "17_Legs_L": "Panturrilha Esquerda", "17_Legs_R": "Panturrilha Direita",
  "17_Leg_L": "Panturrilha Esquerda", "17_Leg_R": "Panturrilha Direita",
  "17_Calf_L": "Panturrilha Esquerda", "17_Calf_R": "Panturrilha Direita",
  "18_Ankles": "Tornozelos", "18_Ankles_L": "Tornozelo Esquerdo", "18_Ankles_R": "Tornozelo Direito",
  "18_Ankle_L": "Tornozelo Esquerdo", "18_Ankle_R": "Tornozelo Direito",
  "19_Feet": "Pés", "19_Feet_L": "Pé Esquerdo", "19_Feet_R": "Pé Direito",
  "19_Foot_L": "Pé Esquerdo", "19_Foot_R": "Pé Direito",
  "SA_03_EARS": "Orelhas", "SA_03_EARS_L": "Orelha Esquerda", "SA_03_EARS_R": "Orelha Direita",
  "SA_03_EAR_L": "Orelha Esquerda", "SA_03_EAR_R": "Orelha Direita",
};

/** Meshes bilaterais numa só geometria: partição por X local (+X → direito). */
const COMBINED_PARTS: Record<string, { left: string; right: string }> = {
  "04_Shoulders": { left: "Ombro Esquerdo", right: "Ombro Direito" },
  "10_Upper_arms": { left: "Braço Esquerdo", right: "Braço Direito" },
  "11_Elbows": { left: "Cotovelo Esquerdo", right: "Cotovelo Direito" },
  "12_Fore_arms": { left: "Antebraço Esquerdo", right: "Antebraço Direito" },
  "13_Hand_back": { left: "Mão Esquerda", right: "Mão Direita" },
  "14_Hand_palms": { left: "Mão Esquerda", right: "Mão Direita" },
  "15_Thighs": { left: "Coxa Esquerda", right: "Coxa Direita" },
  "16_Knees": { left: "Joelho Esquerdo", right: "Joelho Direito" },
  "17_Legs": { left: "Panturrilha Esquerda", right: "Panturrilha Direita" },
  "18_Ankles": { left: "Tornozelo Esquerdo", right: "Tornozelo Direito" },
  "19_Feet": { left: "Pé Esquerdo", right: "Pé Direito" },
  "SA_03_EARS": { left: "Orelha Esquerda", right: "Orelha Direita" },
};

export default function AnatomicMapper() {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [is3D, setIs3D] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);
  const [circles, setCircles] = useState<CircleData[]>([]);
  const [activeCircleIndex, setActiveCircleIndex] = useState<number | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [cameraTarget, setCameraTarget] = useState<THREE.Vector3 | null>(null);
  const [cameraPosition, setCameraPosition] = useState<THREE.Vector3 | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const orbitRef = useRef<any>(null);
  const navigate = useNavigate();

  const handleSelectZone = useCallback((name: string) => {
    if (selectedZone === name && isZoomed) return;
    setSelectedZone(name);
    setIsZoomed(true);
  }, [selectedZone, isZoomed]);

  const handleZoomOut = useCallback(() => {
    setCameraTarget(null);
    setCameraPosition(null);
    setIsAnimating(true);
    setIsZoomed(false);
    setSelectedZone(null);
    setActiveCircleIndex(null);
  }, []);

  const handleMeshCenterFound = useCallback((
    center: THREE.Vector3,
    _meshName: string,
    direction: THREE.Vector3,
    meshSize?: number,
    bboxSize?: THREE.Vector3
  ) => {
    setIsAnimating(true);

    const FOV_FACTOR = 0.48;
    const width = bboxSize ? Math.max(bboxSize.x, bboxSize.z) : meshSize ?? 0.5;
    const height = bboxSize?.y ?? meshSize ?? 0.5;
    const frameSize = Math.max(width, height * 1.3);
    const baseDist = Math.max(0.5, Math.min(frameSize / FOV_FACTOR, 2.5));

    const cameraOffset = direction.clone().multiplyScalar(baseDist);
    cameraOffset.y += 0.03;

    const lateralBias = 0.45;
    if (Math.abs(center.x) > 0.08) {
      cameraOffset.x += Math.sign(center.x) * lateralBias;
    }

    setCameraTarget(center.clone());
    setCameraPosition(center.clone().add(cameraOffset));
  }, []);

  const handleStartCircle = useCallback((position: THREE.Vector3, normal: THREE.Vector3, meshName: string, zoneName: string) => {
    const newCircle: CircleData = { position, normal, radius: 0.01, meshName, zoneName };
    setCircles((prev) => [...prev, newCircle]);
    setActiveCircleIndex(circles.length);
    if (orbitRef.current) orbitRef.current.enabled = false;
  }, [circles.length]);

  const handleResizeCircle = useCallback((radius: number) => {
    setCircles((prev) => {
      const updated = [...prev];
      if (updated.length > 0) {
        updated[updated.length - 1] = { ...updated[updated.length - 1], radius };
      }
      return updated;
    });
  }, []);

  const handleFinishCircle = useCallback(() => {
    setActiveCircleIndex(null);
    if (orbitRef.current) orbitRef.current.enabled = true;
  }, []);

  const handleRemoveCircle = useCallback((index: number) => {
    setCircles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadedImage(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) setUploadedImage(URL.createObjectURL(file));
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mapeamento Anatômico</h1>
        <p className="text-sm text-muted-foreground mt-1">Selecione a região e registre a lesão</p>
      </div>

      <div className="flex h-[calc(100vh-200px)] overflow-hidden rounded-xl bg-card shadow-soft border border-border">
        <div className="w-3/5 relative border-r border-border" style={{ background: "linear-gradient(145deg, #64748b 0%, #475569 50%, #334155 100%)" }}>
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <div className="flex items-center gap-3 bg-card p-2 px-3 rounded-lg shadow-surface border border-border">
              <span className={`text-xs font-medium ${!is3D ? "text-primary" : "text-muted-foreground"}`}>Lista</span>
              <Switch checked={is3D} onCheckedChange={setIs3D} />
              <span className={`text-xs font-medium ${is3D ? "text-primary" : "text-muted-foreground"}`}>3D</span>
            </div>
            {isZoomed && (
              <Button variant="secondary" size="sm" onClick={handleZoomOut} className="gap-1.5 shadow-surface border border-border">
                <ZoomOut className="w-3.5 h-3.5" />
                Voltar
              </Button>
            )}
          </div>

          {is3D && (
            <div className="absolute bottom-4 left-4 z-10">
              <div className="bg-card/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-surface border border-border">
                {isZoomed ? (
                  <div className="flex items-center gap-2">
                    <Circle className="w-3.5 h-3.5 text-destructive" />
                    <span className="text-xs font-medium text-foreground">Arraste para marcar a área</span>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">Clique em uma região para zoom</span>
                )}
              </div>
            </div>
          )}

          {is3D ? (
            <div className="w-full h-full">
              <Canvas camera={{ position: [0, 0.8, 3.2], fov: 50 }} gl={{ localClippingEnabled: true }}>
                <ambientLight intensity={0.8} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={0.5} />
                <directionalLight position={[-5, 5, 5]} intensity={0.4} />
                <directionalLight position={[5, 5, -5]} intensity={0.2} />
                <CameraController
                  targetPosition={cameraPosition}
                  targetLookAt={cameraTarget}
                  orbitControlsRef={orbitRef}
                  isZoomed={isZoomed}
                  onAnimationComplete={() => setIsAnimating(false)}
                />
                <Suspense fallback={<mesh><sphereGeometry args={[0.5, 16, 16]} /><meshStandardMaterial color="#dce4ed" wireframe /></mesh>}>
                  <GLTFHumanModel
                    modelPath="/models/human-body.glb"
                    selectedZone={selectedZone}
                    onSelectZone={handleSelectZone}
                    meshNameMap={meshNameMap}
                    combinedParts={COMBINED_PARTS}
                    isZoomed={isZoomed}
                    circles={circles}
                    activeCircleIndex={activeCircleIndex}
                    onStartCircle={handleStartCircle}
                    onResizeCircle={handleResizeCircle}
                    onFinishCircle={handleFinishCircle}
                    onMeshCenterFound={handleMeshCenterFound}
                    flipLeftRightAxis={true}
                  />
                  <ContactShadows opacity={0.2} scale={10} blur={2.5} far={2} position={[0, -0.1, 0]} />
                  <Environment preset="studio" />
                </Suspense>
                <OrbitControls
                  ref={orbitRef}
                  enabled={!isAnimating}
                  enablePan={true}
                  enableDamping
                  dampingFactor={0.08}
                  minDistance={0.12}
                  maxDistance={6}
                  target={[0, 1.1, 0]}
                  rotateSpeed={0.8}
                />
              </Canvas>
            </div>
          ) : (
            <div className="p-6 pt-16 overflow-y-auto h-full">
              <Accordion type="multiple" className="space-y-2">
                {anatomyTree.map((group) => (
                  <AccordionItem key={group.group} value={group.group} className="border border-border rounded-lg overflow-hidden bg-card">
                    <AccordionTrigger className="px-4 py-3 text-sm font-semibold text-foreground hover:no-underline hover:bg-accent/50">{group.group}</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-1 p-2">
                        {group.parts.map((part) => (
                          <button key={part} onClick={() => setSelectedZone(part)} className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedZone === part ? "bg-primary text-primary-foreground font-medium" : "text-foreground hover:bg-accent"}`}>{part}</button>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </div>

        <div className="w-2/5 p-6 flex flex-col bg-card overflow-y-auto">
          <header className="mb-4">
            <h2 className="text-lg font-semibold text-foreground">Registro de Lesão</h2>
            <p className="text-sm text-muted-foreground">
              Local: <span className="font-medium text-primary">{selectedZone || "Nenhum selecionado"}</span>
            </p>
          </header>

          {circles.length > 0 && (
            <div className="mb-4 space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Áreas Marcadas ({circles.length})
              </Label>
              <div className="space-y-1">
                {circles.map((circle, i) => (
                  <div key={i} className="flex items-center justify-between bg-destructive/10 rounded-lg px-3 py-2 border border-destructive/20">
                    <div className="flex items-center gap-2">
                      <Circle className="w-3.5 h-3.5 text-destructive" />
                      <span className="text-xs font-medium text-foreground">
                        Área #{i + 1} — {circle.zoneName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        (ø {(circle.radius * 200).toFixed(0)}mm)
                      </span>
                    </div>
                    <button onClick={() => handleRemoveCircle(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 space-y-5">
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/40 transition-colors cursor-pointer bg-muted/30 group relative" onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
              {uploadedImage ? (
                <img src={uploadedImage} alt="Lesão" className="w-full h-40 object-cover rounded-lg" />
              ) : (
                <>
                  <div className="mx-auto w-11 h-11 rounded-full bg-card shadow-surface flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Upload da Imagem Dermatoscópica</p>
                  <p className="text-xs text-muted-foreground mt-1">Arraste ou clique para selecionar (JPG, PNG)</p>
                </>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Notas Clínicas</Label>
              <Textarea className="min-h-[100px] text-sm resize-none" placeholder="Descreva características visíveis, tempo de evolução, sintomas relatados..." />
            </div>
          </div>

          <Button disabled={!selectedZone} className="mt-6 w-full h-11 font-semibold gap-2 shadow-lg" onClick={() => navigate("/analysis")}>
            <BrainCircuit className="w-4 h-4" />
            Enviar para Análise de IA
          </Button>
        </div>
      </div>
    </div>
  );
}
