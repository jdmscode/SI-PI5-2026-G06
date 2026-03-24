import { BodyPartMesh } from "./BodyPartMesh";

interface HumanoidModelProps {
  selectedZone: string | null;
  onSelectZone: (name: string) => void;
}

export function HumanoidPlaceholder({ selectedZone, onSelectZone }: HumanoidModelProps) {
  const isActive = (name: string) => selectedZone === name;

  return (
    <group position={[0, -0.3, 0]} scale={1.0}>
      <BodyPartMesh
        name="Cabeça"
        position={[0, 2.55, 0]}
        args={[0.24, 0.24, 16, 16]}
        geometry="sphere"
        onSelect={onSelectZone}
        active={isActive("Cabeça")}
      />

      <BodyPartMesh
        name="Pescoço"
        position={[0, 2.15, 0]}
        args={[0.08, 0.08, 0.18, 12]}
        geometry="cylinder"
        onSelect={onSelectZone}
        active={isActive("Pescoço")}
      />

      <BodyPartMesh
        name="Tórax"
        position={[0, 1.65, 0]}
        args={[0.38, 0.32, 0.7, 12]}
        geometry="cylinder"
        onSelect={onSelectZone}
        active={isActive("Tórax")}
        scale={[1, 1, 0.55]}
      />

      <BodyPartMesh
        name="Abdômen"
        position={[0, 1.05, 0]}
        args={[0.32, 0.28, 0.5, 12]}
        geometry="cylinder"
        onSelect={onSelectZone}
        active={isActive("Abdômen")}
        scale={[1, 1, 0.5]}
      />

      <BodyPartMesh
        name="Ombro Direito"
        position={[-0.5, 1.92, 0]}
        args={[0.12, 0.12, 16, 16]}
        geometry="sphere"
        onSelect={onSelectZone}
        active={isActive("Ombro Direito")}
      />
      <BodyPartMesh
        name="Ombro Esquerdo"
        position={[0.5, 1.92, 0]}
        args={[0.12, 0.12, 16, 16]}
        geometry="sphere"
        onSelect={onSelectZone}
        active={isActive("Ombro Esquerdo")}
      />

      <BodyPartMesh
        name="Braço Direito"
        position={[-0.58, 1.6, 0]}
        args={[0.08, 0.07, 0.35, 12]}
        geometry="cylinder"
        onSelect={onSelectZone}
        active={isActive("Braço Direito")}
      />
      <BodyPartMesh
        name="Braço Esquerdo"
        position={[0.58, 1.6, 0]}
        args={[0.08, 0.07, 0.35, 12]}
        geometry="cylinder"
        onSelect={onSelectZone}
        active={isActive("Braço Esquerdo")}
      />

      <BodyPartMesh
        name="Cotovelo Direito"
        position={[-0.6, 1.35, 0]}
        args={[0.075, 0.075, 12, 12]}
        geometry="sphere"
        onSelect={onSelectZone}
        active={isActive("Cotovelo Direito")}
      />
      <BodyPartMesh
        name="Cotovelo Esquerdo"
        position={[0.6, 1.35, 0]}
        args={[0.075, 0.075, 12, 12]}
        geometry="sphere"
        onSelect={onSelectZone}
        active={isActive("Cotovelo Esquerdo")}
      />

      <BodyPartMesh
        name="Antebraço Direito"
        position={[-0.62, 1.08, 0]}
        args={[0.07, 0.055, 0.35, 12]}
        geometry="cylinder"
        onSelect={onSelectZone}
        active={isActive("Antebraço Direito")}
      />
      <BodyPartMesh
        name="Antebraço Esquerdo"
        position={[0.62, 1.08, 0]}
        args={[0.07, 0.055, 0.35, 12]}
        geometry="cylinder"
        onSelect={onSelectZone}
        active={isActive("Antebraço Esquerdo")}
      />

      <BodyPartMesh
        name="Mão Direita"
        position={[-0.64, 0.82, 0]}
        args={[0.06, 0.08, 0.04]}
        geometry="box"
        onSelect={onSelectZone}
        active={isActive("Mão Direita")}
        scale={[1, 1, 0.5]}
      />
      <BodyPartMesh
        name="Mão Esquerda"
        position={[0.64, 0.82, 0]}
        args={[0.06, 0.08, 0.04]}
        geometry="box"
        onSelect={onSelectZone}
        active={isActive("Mão Esquerda")}
        scale={[1, 1, 0.5]}
      />

      <BodyPartMesh
        name="Quadril"
        position={[0, 0.72, 0]}
        args={[0.3, 0.25, 0.2, 12]}
        geometry="cylinder"
        onSelect={onSelectZone}
        active={isActive("Quadril")}
        scale={[1, 1, 0.45]}
      />

      <BodyPartMesh
        name="Coxa Direita"
        position={[-0.15, 0.3, 0]}
        args={[0.12, 0.1, 0.55, 12]}
        geometry="cylinder"
        onSelect={onSelectZone}
        active={isActive("Coxa Direita")}
      />
      <BodyPartMesh
        name="Coxa Esquerda"
        position={[0.15, 0.3, 0]}
        args={[0.12, 0.1, 0.55, 12]}
        geometry="cylinder"
        onSelect={onSelectZone}
        active={isActive("Coxa Esquerda")}
      />

      <BodyPartMesh
        name="Joelho Direito"
        position={[-0.15, -0.03, 0]}
        args={[0.09, 0.09, 12, 12]}
        geometry="sphere"
        onSelect={onSelectZone}
        active={isActive("Joelho Direito")}
      />
      <BodyPartMesh
        name="Joelho Esquerdo"
        position={[0.15, -0.03, 0]}
        args={[0.09, 0.09, 12, 12]}
        geometry="sphere"
        onSelect={onSelectZone}
        active={isActive("Joelho Esquerdo")}
      />

      <BodyPartMesh
        name="Panturrilha Direita"
        position={[-0.15, -0.4, 0]}
        args={[0.085, 0.065, 0.5, 12]}
        geometry="cylinder"
        onSelect={onSelectZone}
        active={isActive("Panturrilha Direita")}
      />
      <BodyPartMesh
        name="Panturrilha Esquerda"
        position={[0.15, -0.4, 0]}
        args={[0.085, 0.065, 0.5, 12]}
        geometry="cylinder"
        onSelect={onSelectZone}
        active={isActive("Panturrilha Esquerda")}
      />

      <BodyPartMesh
        name="Tornozelo Direito"
        position={[-0.15, -0.7, 0]}
        args={[0.06, 0.06, 12, 12]}
        geometry="sphere"
        onSelect={onSelectZone}
        active={isActive("Tornozelo Direito")}
      />
      <BodyPartMesh
        name="Tornozelo Esquerdo"
        position={[0.15, -0.7, 0]}
        args={[0.06, 0.06, 12, 12]}
        geometry="sphere"
        onSelect={onSelectZone}
        active={isActive("Tornozelo Esquerdo")}
      />

      <BodyPartMesh
        name="Pé Direito"
        position={[-0.15, -0.82, 0.04]}
        args={[0.06, 0.12, 0.04]}
        geometry="box"
        onSelect={onSelectZone}
        active={isActive("Pé Direito")}
        scale={[1, 0.5, 1]}
      />
      <BodyPartMesh
        name="Pé Esquerdo"
        position={[0.15, -0.82, 0.04]}
        args={[0.06, 0.12, 0.04]}
        geometry="box"
        onSelect={onSelectZone}
        active={isActive("Pé Esquerdo")}
        scale={[1, 0.5, 1]}
      />
    </group>
  );
}
