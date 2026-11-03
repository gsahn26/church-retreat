import { forwardRef } from "react";
import * as THREE from "three";
import type { OutfitColor, HairStyle } from "@/lib/store";

const OUTFIT_COLORS: Record<OutfitColor, string> = {
  charcoal: "#3a3a3f",
  navy: "#273a5c",
  burgundy: "#6b2e3a",
  cream: "#e8e0cc",
};

const HAIR_COLOR = "#2b2520";
const SKIN_COLOR = "#e8b894";

interface CharacterProps {
  outfit: OutfitColor;
  hair: HairStyle;
  lying?: boolean;
}

const Character = forwardRef<THREE.Group, CharacterProps>(
  ({ outfit, hair, lying }, ref) => {
    const coatColor = OUTFIT_COLORS[outfit];

    return (
      <group ref={ref} rotation-x={lying ? -Math.PI / 2 : 0}>
        <group position-y={lying ? 0.25 : 0}>
          {/* body / coat */}
          <mesh position={[0, 0.9, 0]} castShadow>
            <capsuleGeometry args={[0.28, 0.7, 4, 8]} />
            <meshStandardMaterial color={coatColor} />
          </mesh>
          {/* head */}
          <mesh position={[0, 1.55, 0]} castShadow>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshStandardMaterial color={SKIN_COLOR} />
          </mesh>
          {/* hair */}
          {hair !== "bald" && (
            <mesh position={[0, 1.63, hair === "long" ? -0.02 : 0]} castShadow>
              <sphereGeometry
                args={[0.235, 16, 16, 0, Math.PI * 2, 0, hair === "long" ? 2.2 : 1.8]}
              />
              <meshStandardMaterial color={HAIR_COLOR} />
            </mesh>
          )}
          {hair === "long" && (
            <mesh position={[0, 1.25, -0.15]} castShadow>
              <capsuleGeometry args={[0.07, 0.45, 4, 8]} />
              <meshStandardMaterial color={HAIR_COLOR} />
            </mesh>
          )}
          {/* collar accent */}
          <mesh position={[0, 1.18, 0.22]} rotation-x={0.1}>
            <boxGeometry args={[0.26, 0.07, 0.03]} />
            <meshStandardMaterial color="#f5f0e4" />
          </mesh>
        </group>
      </group>
    );
  }
);

Character.displayName = "Character";
export default Character;
