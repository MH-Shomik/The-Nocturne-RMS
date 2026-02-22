// 3D Restaurant Scene – The Nocturne branding, following HTML reference design
import React, { useRef, useMemo, createContext, useContext } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Html, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

// ─── Brand Colors ────────────────────────────────────────────────────────────
const BRAND = {
  available:  0xFBBF24, // brand-gold
  hover:      0xEA580C, // brand-orange
  reserved:   0xDC2626, // brand-red (brighter for 3D glow)
  background: '#0A0A0A',
};

// ─── Seat Context (avoids prop-drilling into deep sub-components) ─────────────
interface SeatCtx {
  statuses:  Record<string, 'available' | 'reserved'>;
  hoveredId: string | null;
  onToggle:  (id: string) => void;
  onHover:   (id: string | null) => void;
}
const SeatContext = createContext<SeatCtx>({
  statuses: {}, hoveredId: null,
  onToggle: () => {}, onHover: () => {},
});

function resolveLampHex(id: string, ctx: SeatCtx): number {
  if (ctx.statuses[id] === 'reserved') return BRAND.reserved;
  if (ctx.hoveredId === id)            return BRAND.hover;
  return BRAND.available;
}

// ─── Materials (memoised once) ───────────────────────────────────────────────
function useMaterials() {
  return useMemo(() => ({
    floor:     new THREE.MeshStandardMaterial({ color: '#111111', roughness: 0.15, metalness: 0.3 }),
    wall:      new THREE.MeshStandardMaterial({ color: '#1a1615', roughness: 0.9,  metalness: 0.1 }),
    woodDark:  new THREE.MeshStandardMaterial({ color: '#2c1e16', roughness: 0.7,  metalness: 0.1 }),
    marble:    new THREE.MeshStandardMaterial({ color: '#e8e0d0', roughness: 0.15, metalness: 0.15 }),
    marbleDark:new THREE.MeshStandardMaterial({ color: '#1e1e1e', roughness: 0.2,  metalness: 0.4  }),
    metal:     new THREE.MeshStandardMaterial({ color: '#aaaaaa', roughness: 0.3,  metalness: 0.9  }),
    metalDark: new THREE.MeshStandardMaterial({ color: '#333333', roughness: 0.5,  metalness: 0.8  }),
    glass:     new THREE.MeshPhysicalMaterial({ color: '#ffffff', metalness: 0.9,  roughness: 0.1,
                  transparent: true, opacity: 0.25 }),
    fabric:    new THREE.MeshStandardMaterial({ color: '#1a1010', roughness: 0.9 }),
    leaf:      new THREE.MeshStandardMaterial({ color: '#1b3020', roughness: 0.65 }),
    hiddenHit: new THREE.MeshBasicMaterial({ visible: false }),
  }), []);
}

// ─── Lamp Material helper ─────────────────────────────────────────────────────
function lampMat(hex: number): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color:            hex,
    emissive:         new THREE.Color(hex),
    emissiveIntensity: 2.2,
    roughness: 0.4,
    metalness: 0.2,
  });
}

// ─── Dining Table ─────────────────────────────────────────────────────────────
interface TableProps { id: string; position: [number, number, number]; round?: boolean }

const DiningTable: React.FC<TableProps> = ({ id, position, round = false }) => {
  const ctx        = useContext(SeatContext);
  const mat        = useMaterials();
  const lampRef    = useRef<THREE.Mesh>(null!);
  const lightRef   = useRef<THREE.PointLight>(null!);
  const tableY     = 2.5;
  const chairCount = round ? 5 : 4;

  // Sync lamp colour each frame
  useFrame(() => {
    const hex = resolveLampHex(id, ctx);
    if (lampRef.current) {
      const m = lampRef.current.material as THREE.MeshStandardMaterial;
      m.color.setHex(hex);
      m.emissive.setHex(hex);
    }
    if (lightRef.current) {
      lightRef.current.color.setHex(hex);
      lightRef.current.intensity = ctx.statuses[id] === 'reserved' ? 0.4 : 0.9;
    }
  });

  const chairAngles = Array.from({ length: chairCount }, (_, i) =>
    (i * Math.PI * 2) / chairCount + (round ? 0 : Math.PI / 4)
  );

  const hitRadius = round ? 2.6 : 2.2;

  return (
    <group position={position}>
      {/* Table top */}
      {round ? (
        <mesh material={mat.marble} position={[0, tableY, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[2, 2, 0.15, 32]} />
        </mesh>
      ) : (
        <mesh material={mat.marble} position={[0, tableY, 0]} castShadow receiveShadow>
          <boxGeometry args={[3, 0.15, 3]} />
        </mesh>
      )}

      {/* Pedestal leg */}
      <mesh material={mat.metalDark} position={[0, tableY / 2, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.4, tableY - 0.1, 16]} />
      </mesh>
      <mesh material={mat.metalDark} position={[0, 0.05, 0]} castShadow>
        <boxGeometry args={[1.5, 0.1, 1.5]} />
      </mesh>

      {/* Status lamp */}
      <group position={[0, tableY + 0.1, 0]}>
        <mesh material={mat.metal} position={[0, 0.025, 0]}>
          <cylinderGeometry args={[0.15, 0.2, 0.05, 16]} />
        </mesh>
        <mesh ref={lampRef} material={lampMat(BRAND.available)} position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.3, 16]} />
        </mesh>
        <pointLight ref={lightRef} color={BRAND.available} intensity={0.9} distance={5} position={[0, 0.5, 0]} />
      </group>

      {/* Chairs */}
      {chairAngles.map((angle, i) => (
        <group
          key={i}
          position={[Math.cos(angle) * 2.25, 0, Math.sin(angle) * 2.25]}
          rotation={[0, -angle - Math.PI / 2, 0]}
        >
          <mesh material={mat.fabric} position={[0, 1.2, 0]} castShadow>
            <boxGeometry args={[1, 0.18, 1]} />
          </mesh>
          <mesh material={mat.fabric} position={[0.4, 1.85, 0]} castShadow>
            <boxGeometry args={[0.15, 1.2, 1]} />
          </mesh>
          {([ [-0.4,-0.4],[-0.4,0.4],[0.4,-0.4],[0.4,0.4] ] as [number,number][]).map(([lx,lz],li)=>(
            <mesh key={li} material={mat.metalDark} position={[lx, 0.6, lz]} castShadow>
              <boxGeometry args={[0.1, 1.2, 0.1]} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Floating label */}
      <Html
        position={[0, tableY + 2.0, 0]}
        center
        style={{ pointerEvents: 'none' }}
        zIndexRange={[0, 0]}
        occlude
      >
        <span className="bg-black/80 text-xs font-bold px-2.5 py-1 rounded border border-white/10 backdrop-blur-md shadow-lg"
          style={{ color: '#F5F5F1', letterSpacing: '0.05em', userSelect: 'none', whiteSpace: 'nowrap' }}>
          {id}
        </span>
      </Html>

      {/* Invisible hit-box */}
      <mesh
        material={mat.hiddenHit}
        position={[0, tableY / 2, 0]}
        onPointerOver={e => { e.stopPropagation(); ctx.onHover(id); }}
        onPointerOut={e =>  { e.stopPropagation(); ctx.onHover(null); }}
        onClick={e =>       { e.stopPropagation(); ctx.onToggle(id); }}
      >
        <cylinderGeometry args={[hitRadius, hitRadius, tableY, 16]} />
      </mesh>
    </group>
  );
};

// ─── Bar Stool ────────────────────────────────────────────────────────────────
interface StoolProps { id: string; position: [number, number, number] }

const BarStool: React.FC<StoolProps> = ({ id, position }) => {
  const ctx       = useContext(SeatContext);
  const mat       = useMaterials();
  const seatRef   = useRef<THREE.Mesh>(null!);
  const seatY     = 2.9;

  useFrame(() => {
    const hex = resolveLampHex(id, ctx);
    if (seatRef.current) {
      (seatRef.current.material as THREE.MeshStandardMaterial).color.setHex(hex);
      (seatRef.current.material as THREE.MeshStandardMaterial).emissive?.setHex(hex);
    }
  });

  const seatColorMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: BRAND.available,
    emissive: new THREE.Color(BRAND.available),
    emissiveIntensity: 0.7,
    roughness: 0.7,
  }), []);

  return (
    <group position={position}>
      {/* Leg */}
      <mesh material={mat.metalDark} position={[0, seatY/2, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.3, seatY, 16]} />
      </mesh>
      {/* Base ring */}
      <mesh material={mat.metal} position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.8, 0.8, 0.08, 32]} />
      </mesh>
      {/* Seat cushion (colour-coded) */}
      <mesh ref={seatRef} material={seatColorMat} position={[0, seatY, 0]} castShadow>
        <cylinderGeometry args={[0.6, 0.6, 0.2, 32]} />
      </mesh>

      {/* Label */}
      <Html position={[0, seatY + 1.2, 0]} center style={{ pointerEvents: 'none' }} zIndexRange={[0,0]} occlude>
        <span className="bg-black/80 text-xs font-bold px-2.5 py-1 rounded border border-white/10 backdrop-blur-md shadow-lg"
          style={{ color: '#F5F5F1', userSelect: 'none', whiteSpace: 'nowrap' }}>
          {id}
        </span>
      </Html>

      {/* Hit-box */}
      <mesh
        material={mat.hiddenHit}
        position={[0, seatY / 2, 0]}
        onPointerOver={e => { e.stopPropagation(); ctx.onHover(id); }}
        onPointerOut={e =>  { e.stopPropagation(); ctx.onHover(null); }}
        onClick={e =>       { e.stopPropagation(); ctx.onToggle(id); }}
      >
        <cylinderGeometry args={[1, 1, seatY + 1, 16]} />
      </mesh>
    </group>
  );
};

// ─── Plant ────────────────────────────────────────────────────────────────────
const Plant: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const mat = useMaterials();
  const offsets = useMemo(() => Array.from({ length: 8 }, () => ({
    x: (Math.random() - 0.5) * 1.5,
    y: 1.5 + Math.random() * 2,
    z: (Math.random() - 0.5) * 1.5,
    s: 0.8 + Math.random() * 0.5,
  })), []);
  return (
    <group position={position}>
      <mesh material={mat.wall} position={[0, 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.8, 0.6, 1.5, 16]} />
      </mesh>
      {offsets.map((o, i) => (
        <mesh key={i} material={mat.leaf} position={[o.x, o.y, o.z]} castShadow>
          <sphereGeometry args={[o.s, 8, 8]} />
        </mesh>
      ))}
    </group>
  );
};

// ─── Kitchen ──────────────────────────────────────────────────────────────────
const Kitchen: React.FC = () => {
  const mat = useMaterials();
  return (
    <group position={[12, 0, -12]}>
      {/* Counter */}
      <mesh material={mat.metal} position={[0, 1.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[18, 3.5, 4]} />
      </mesh>
      {/* Hood */}
      <mesh material={mat.metalDark} position={[0, 11, -0.5]} castShadow>
        <boxGeometry args={[18, 2, 5]} />
      </mesh>
      {/* Grill warm light */}
      <pointLight color={0xff6600} intensity={2.0} distance={18} position={[0, 4, -1]} castShadow />
      {/* Pans */}
      {[0,1,2,3,4].map(i => (
        <mesh key={i} material={mat.metalDark} rotation={[Math.PI/2, 0, 0]} position={[-6 + i*3, 9, -0.5]}>
          <cylinderGeometry args={[0.5, 0.5, 0.1, 16]} />
        </mesh>
      ))}
    </group>
  );
};

// ─── Bar ──────────────────────────────────────────────────────────────────────
const Bar: React.FC = () => {
  const mat = useMaterials();
  const bottles = useMemo(() => Array.from({ length: 45 }, (_, i) => ({
    shelf: Math.floor(i / 15),
    pos: i % 15,
    h: 0.5 + Math.random() * 0.8,
    hue: Math.random(),
  })), []);
  return (
    <group position={[-18, 0, 0]}>
      {/* Counter base */}
      <mesh material={mat.woodDark} position={[0, 1.9, 0]} castShadow>
        <boxGeometry args={[4, 3.8, 24]} />
      </mesh>
      {/* Marble top */}
      <mesh material={mat.marbleDark} position={[0.2, 3.9, 0]} receiveShadow>
        <boxGeometry args={[4.4, 0.2, 24.4]} />
      </mesh>
      {/* Shelves & bottles */}
      {[0,1,2].map(shelf => (
        <group key={shelf}>
          <mesh material={mat.woodDark} position={[-4, 5 + shelf*2, 0]}>
            <boxGeometry args={[1, 0.18, 20]} />
          </mesh>
          {bottles.filter(b => b.shelf === shelf).map((b, i) => {
            const bottleMat = new THREE.MeshStandardMaterial({
              color: new THREE.Color().setHSL(b.hue, 0.8, 0.45),
              metalness: 0.2, roughness: 0.1, transparent: true, opacity: 0.82,
            });
            return (
              <mesh key={i} material={bottleMat}
                position={[-4, 5 + shelf*2 + b.h/2 + 0.1, -9 + b.pos*1.2 + (Math.random()-0.5)*0.3]}>
                <cylinderGeometry args={[0.15, 0.15, b.h, 8]} />
              </mesh>
            );
          })}
        </group>
      ))}
      {/* Under-bar warm glow */}
      <pointLight color={0xffcc88} intensity={1.5} distance={14} position={[2, 2, 0]} />
    </group>
  );
};

// ─── Restaurant Sign (Canvas texture) ────────────────────────────────────────
const RestaurantSign: React.FC<{ z: number }> = ({ z }) => {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#1a1615';
    ctx.fillRect(0, 0, 1024, 256);

    ctx.font = '500 90px "Playfair Display", Georgia, serif';
    ctx.textAlign  = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#FBBF24';
    ctx.shadowBlur  = 35;
    ctx.fillStyle   = '#FBBF24';
    ctx.fillText('T H E  N O C T U R N E', 512, 128);
    ctx.fillText('T H E  N O C T U R N E', 512, 128); // double for intensity

    return new THREE.CanvasTexture(canvas);
  }, []);

  return (
    <>
      <mesh position={[0, 9, z + 0.6]}>
        <planeGeometry args={[26, 6]} />
        <meshBasicMaterial map={texture} />
      </mesh>
      <pointLight color={0xFBBF24} intensity={1.5} distance={22} position={[0, 9, z + 2]} />
    </>
  );
};

// ─── Scene Interior (Walls, Floor, Entrance) ──────────────────────────────────
const Interior: React.FC = () => {
  const mat = useMaterials();
  const roomW = 50, roomD = 40, wallH = 14;
  return (
    <>
      {/* Floor */}
      <mesh material={mat.floor} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
        <planeGeometry args={[roomW, roomD]} />
      </mesh>
      <gridHelper args={[roomW, 25, '#222222', '#222222']} position={[0, 0.01, 0]} />

      {/* Walls */}
      <mesh material={mat.wall} position={[0, wallH/2, -roomD/2]} receiveShadow>
        <boxGeometry args={[roomW, wallH, 1]} />
      </mesh>
      <mesh material={mat.wall} position={[-roomW/2, wallH/2, 0]} receiveShadow>
        <boxGeometry args={[1, wallH, roomD]} />
      </mesh>
      <mesh material={mat.wall} position={[roomW/2, wallH/2, 0]} receiveShadow>
        <boxGeometry args={[1, wallH, roomD]} />
      </mesh>

      {/* Front entrance */}
      <group position={[0, 0, roomD/2]}>
        <mesh material={mat.wall} position={[-17.5, wallH/2, 0]} castShadow>
          <boxGeometry args={[15, wallH, 1]} />
        </mesh>
        <mesh material={mat.wall} position={[17.5, wallH/2, 0]} castShadow>
          <boxGeometry args={[15, wallH, 1]} />
        </mesh>
        <mesh material={mat.glass} position={[0, wallH/2, 0]}>
          <boxGeometry args={[20, wallH, 0.2]} />
        </mesh>
        {/* Door frames */}
        {[-3, 3].map(x => (
          <mesh key={x} material={mat.metalDark} position={[x, 4, 0]}>
            <boxGeometry args={[0.5, 8, 0.6]} />
          </mesh>
        ))}
      </group>

      {/* Restaurant sign */}
      <RestaurantSign z={-roomD/2} />
    </>
  );
};

// ─── Main exported SceneCanvas ────────────────────────────────────────────────
export interface SceneProps {
  statuses:  Record<string, 'available' | 'reserved'>;
  hoveredId: string | null;
  onToggle:  (id: string) => void;
  onHover:   (id: string | null) => void;
}

const RestaurantScene: React.FC<SceneProps> = ({ statuses, hoveredId, onToggle, onHover }) => {
  return (
    <SeatContext.Provider value={{ statuses, hoveredId, onToggle, onHover }}>
      {/* Camera */}
      <PerspectiveCamera makeDefault fov={50} position={[0, 25, 35]} near={0.1} far={150} />
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={10}
        maxDistance={60}
        target={[0, 2, 0]}
        makeDefault
      />

      {/* Lighting */}
      <ambientLight intensity={1.6} />
      <hemisphereLight args={[0xffffff, 0x887766, 1.4]} position={[0, 25, 0]} />
      <directionalLight
        color={0xfff5e0} intensity={2.2}
        position={[20, 40, 30]}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-30} shadow-camera-right={30}
        shadow-camera-top={30}   shadow-camera-bottom={-30}
        shadow-camera-near={10}  shadow-camera-far={100}
        shadow-bias={-0.0005}
      />

      {/* Fog — matches SVG background dark ground tone */}
      <fog attach="fog" args={['#030201', 50, 95]} />

      {/* Architecture */}
      <Interior />
      <Kitchen />
      <Bar />

      {/* ── Zone A: Front dining row (near entrance) ── */}
      <DiningTable id="T1" position={[-8, 0, 11]} />
      <DiningTable id="T2" position={[ 0, 0, 11]} />
      <DiningTable id="T3" position={[ 8, 0, 11]} />

      {/* ── Zone B: Mid dining row (main floor) ── */}
      <DiningTable id="T4" position={[-8, 0,  2]} />
      <DiningTable id="T5" position={[ 0, 0,  2]} />
      <DiningTable id="T6" position={[ 8, 0,  2]} />

      {/* ── Zone C: Back-left dining (clear of kitchen) ── */}
      <DiningTable id="T7" position={[-8, 0, -8]} />
      <DiningTable id="T8" position={[ 0, 0, -8]} />

      {/* ── VIP Round Tables (feature spots) ── */}
      <DiningTable id="V1" position={[17, 0,  7]} round />
      <DiningTable id="V2" position={[17, 0, -3]} round />
      <DiningTable id="V3" position={[-2, 0, 17]} round />
      <DiningTable id="V4" position={[ 8, 0, 17]} round />

      {/* ── Bar stools (along bar counter) ── */}
      {[0,1,2,3,4,5,6,7].map(i => (
        <BarStool key={i} id={`B${i+1}`} position={[-13, 0, -8.5 + i * 2.5]} />
      ))}

      {/* ── Decor plants (four corners) ── */}
      <Plant position={[-22, 0, -17]} />
      <Plant position={[ 22, 0, -17]} />
      <Plant position={[ 22, 0,  16]} />
      <Plant position={[-22, 0,  16]} />
    </SeatContext.Provider>
  );
};

export default RestaurantScene;
