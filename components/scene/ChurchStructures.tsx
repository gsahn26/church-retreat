const WINDOW_COLORS = ["#7a5ca8", "#3d7a9c", "#c9975a", "#8a3d4a"];

function StainedWindow({ x, z, rotY }: { x: number; z: number; rotY: number }) {
  return (
    <group position={[x, 3, z]} rotation-y={rotY}>
      {WINDOW_COLORS.slice(0, 3).map((color, i) => (
        <mesh key={color} position={[(i - 1) * 0.75, 0, 0]}>
          <planeGeometry args={[0.6, 2.4]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.55}
            transparent
            opacity={0.85}
            side={2}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function ChurchStructures() {
  return (
    <group>
      {/* ground */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#9ca889" />
      </mesh>

      {/* stone path from gate to sanctuary */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, -2]} receiveShadow>
        <planeGeometry args={[3, 20]} />
        <meshStandardMaterial color="#d8d0bd" />
      </mesh>

      {/* entrance archway */}
      <group position={[0, 0, 10]}>
        <mesh position={[-2.2, 2, 0]} castShadow>
          <boxGeometry args={[0.5, 4, 0.5]} />
          <meshStandardMaterial color="#e8e2d2" />
        </mesh>
        <mesh position={[2.2, 2, 0]} castShadow>
          <boxGeometry args={[0.5, 4, 0.5]} />
          <meshStandardMaterial color="#e8e2d2" />
        </mesh>
        <mesh position={[0, 4.1, 0]} castShadow>
          <boxGeometry args={[5.4, 0.4, 0.5]} />
          <meshStandardMaterial color="#cfc6ae" />
        </mesh>
        {/* pediment */}
        <mesh position={[0, 4.9, 0]} rotation-z={Math.PI} castShadow>
          <coneGeometry args={[2.9, 1.3, 3]} />
          <meshStandardMaterial color="#cfc6ae" />
        </mesh>
        {/* cross on top */}
        <mesh position={[0, 6.3, 0]} castShadow>
          <boxGeometry args={[0.16, 1, 0.16]} />
          <meshStandardMaterial color="#5c4a30" />
        </mesh>
        <mesh position={[0, 6.6, 0]} castShadow>
          <boxGeometry args={[0.6, 0.16, 0.16]} />
          <meshStandardMaterial color="#5c4a30" />
        </mesh>
      </group>

      {/* Sanctuary */}
      <group position={[0, 0, -15]}>
        {/* floor platform */}
        <mesh position={[0, 0.3, 0]} receiveShadow>
          <boxGeometry args={[11, 0.6, 9]} />
          <meshStandardMaterial color="#e4ded0" />
        </mesh>
        {/* walls */}
        <mesh position={[0, 3, -4.4]} castShadow receiveShadow>
          <boxGeometry args={[11, 5.4, 0.4]} />
          <meshStandardMaterial color="#efe9db" />
        </mesh>
        <mesh position={[-5.4, 3, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.4, 5.4, 9]} />
          <meshStandardMaterial color="#efe9db" />
        </mesh>
        <mesh position={[5.4, 3, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.4, 5.4, 9]} />
          <meshStandardMaterial color="#efe9db" />
        </mesh>

        {/* stained glass windows, both sides */}
        <StainedWindow x={-5.1} z={-2} rotY={Math.PI / 2} />
        <StainedWindow x={-5.1} z={1.5} rotY={Math.PI / 2} />
        <StainedWindow x={5.1} z={-2} rotY={-Math.PI / 2} />
        <StainedWindow x={5.1} z={1.5} rotY={-Math.PI / 2} />

        {/* pitched roof */}
        <mesh position={[0, 5.9, 0]} castShadow>
          <boxGeometry args={[12.5, 0.5, 10.5]} />
          <meshStandardMaterial color="#5c5245" />
        </mesh>
        <mesh position={[-3.1, 7.1, 0]} rotation-z={0.5} castShadow>
          <boxGeometry args={[6.6, 0.3, 10.8]} />
          <meshStandardMaterial color="#49413a" />
        </mesh>
        <mesh position={[3.1, 7.1, 0]} rotation-z={-0.5} castShadow>
          <boxGeometry args={[6.6, 0.3, 10.8]} />
          <meshStandardMaterial color="#49413a" />
        </mesh>

        {/* pews, four rows each side of the aisle */}
        {[1.8, 0.3, -1.2, -2.7].map((rowZ) => (
          <group key={rowZ}>
            <mesh position={[-2.6, 0.9, rowZ]} castShadow receiveShadow>
              <boxGeometry args={[2.6, 0.9, 0.5]} />
              <meshStandardMaterial color="#6b5438" />
            </mesh>
            <mesh position={[2.6, 0.9, rowZ]} castShadow receiveShadow>
              <boxGeometry args={[2.6, 0.9, 0.5]} />
              <meshStandardMaterial color="#6b5438" />
            </mesh>
          </group>
        ))}

        {/* wooden cross on back wall */}
        <mesh position={[0, 3.1, -4.15]} castShadow>
          <boxGeometry args={[0.3, 2.6, 0.2]} />
          <meshStandardMaterial color="#4a3826" />
        </mesh>
        <mesh position={[0, 3.7, -4.15]} castShadow>
          <boxGeometry args={[1.5, 0.3, 0.2]} />
          <meshStandardMaterial color="#4a3826" />
        </mesh>

        {/* communion table / altar */}
        <mesh position={[0, 1.1, -3.3]} castShadow>
          <boxGeometry args={[2.4, 1, 0.8]} />
          <meshStandardMaterial color="#5c3a22" />
        </mesh>
        <mesh position={[0, 1.65, -3.3]} receiveShadow>
          <boxGeometry args={[2.3, 0.06, 0.7]} />
          <meshStandardMaterial color="#f5f0e4" />
        </mesh>
        {/* candle on the table */}
        <mesh position={[0, 1.95, -3.3]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 0.5, 10]} />
          <meshStandardMaterial color="#f0e6cc" />
        </mesh>
        <pointLight position={[0, 2.3, -3.3]} intensity={3} color="#ffd9a0" distance={5} />

        {/* pulpit */}
        <group position={[-3.1, 0, -3]}>
          <mesh position={[0, 0.6, 0]} castShadow>
            <boxGeometry args={[0.7, 1.2, 0.5]} />
            <meshStandardMaterial color="#4a3826" />
          </mesh>
        </group>

        {/* kneeling cushion for praying */}
        <mesh position={[0, 0.65, -0.5]} receiveShadow>
          <cylinderGeometry args={[0.6, 0.6, 0.12, 20]} />
          <meshStandardMaterial color="#8a2e3a" />
        </mesh>
      </group>

      {/* Quiet Room */}
      <group position={[10, 0, -5]}>
        <mesh position={[0, 0.25, 0]} receiveShadow>
          <boxGeometry args={[6, 0.5, 6]} />
          <meshStandardMaterial color="#d9d2bf" />
        </mesh>
        <mesh position={[0, 2.5, -2.8]} castShadow receiveShadow>
          <boxGeometry args={[6, 4.5, 0.3]} />
          <meshStandardMaterial color="#c4b998" />
        </mesh>
        <mesh position={[-2.85, 2.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.3, 4.5, 6]} />
          <meshStandardMaterial color="#c4b998" />
        </mesh>
        <mesh position={[2.85, 2.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.3, 4.5, 6]} />
          <meshStandardMaterial color="#c4b998" />
        </mesh>
        <mesh position={[0, 4.9, 0]} castShadow>
          <boxGeometry args={[6.6, 0.4, 6.6]} />
          <meshStandardMaterial color="#49413a" />
        </mesh>
        {/* resting mat */}
        <mesh position={[0, 0.55, 0]} receiveShadow>
          <boxGeometry args={[2.2, 0.15, 3.2]} />
          <meshStandardMaterial color="#efe9db" />
        </mesh>
        {/* small window light */}
        <pointLight position={[0, 3.5, 0]} intensity={8} color="#ffdca8" distance={8} />
      </group>

      {/* garden spot: flower bed + watering can */}
      <group position={[-8, 0, 5]}>
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 0]} receiveShadow>
          <circleGeometry args={[1.4, 24]} />
          <meshStandardMaterial color="#5c4a30" />
        </mesh>
        {[...Array(7)].map((_, i) => {
          const angle = (i / 7) * Math.PI * 2;
          const r = 0.7 + (i % 2) * 0.3;
          return (
            <group key={i} position={[Math.cos(angle) * r, 0.18, Math.sin(angle) * r]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.02, 0.02, 0.3, 6]} />
                <meshStandardMaterial color="#3f5c3a" />
              </mesh>
              <mesh position={[0, 0.2, 0]} castShadow>
                <sphereGeometry args={[0.12, 8, 8]} />
                <meshStandardMaterial
                  color={i % 2 === 0 ? "#e89cb0" : "#f0c572"}
                />
              </mesh>
            </group>
          );
        })}
        {/* watering can */}
        <group position={[1.1, 0, -0.2]} rotation-y={0.4}>
          <mesh position={[0, 0.25, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.22, 0.4, 10]} />
            <meshStandardMaterial color="#5c8a7a" />
          </mesh>
          <mesh position={[0.28, 0.4, 0]} rotation-z={0.5} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.35, 8]} />
            <meshStandardMaterial color="#5c8a7a" />
          </mesh>
        </group>
      </group>

      {/* garden trees / flowering shrubs */}
      {[
        [-12, 0, -12, "#6b8f5a"],
        [12, 0, -14, "#9c7aa8"],
        [-14, 0, 2, "#6b8f5a"],
        [14, 0, 6, "#d99cae"],
        [-6, 0, 12, "#9c7aa8"],
        [6, 0, 14, "#6b8f5a"],
      ].map(([x, , z, color], i) => (
        <group key={i} position={[x as number, 0, z as number]}>
          <mesh position={[0, 1, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.2, 2, 8]} />
            <meshStandardMaterial color="#5c4530" />
          </mesh>
          <mesh position={[0, 2.4, 0]} castShadow>
            <sphereGeometry args={[1.1, 10, 10]} />
            <meshStandardMaterial color={color as string} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
