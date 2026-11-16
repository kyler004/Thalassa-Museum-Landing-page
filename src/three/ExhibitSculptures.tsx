import React, { useMemo, useRef, useState } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import {
  getMarbleTexture,
  getTravertineTexture,
  getGeometricAmphoraTexture,
  getAstrolabeDialTexture,
  getContactShadowTexture,
} from './materialsAndTextures';

interface SculptureProps {
  position: [number, number, number];
  isSelected: boolean;
  explodedFactor: number; // 0 to 1
  inspectRotationY: number;
  onSelect: () => void;
}

/**
 * Shared architectural travertine museum plinth with stepped base, brass accession plaque,
 * and soft radial contact shadow grounding.
 */
const MuseumPlinth: React.FC<{
  isSelected: boolean;
  travertineTex: THREE.CanvasTexture;
  shadowTex: THREE.CanvasTexture;
}> = ({ isSelected, travertineTex, shadowTex }) => {
  return (
    <group>
      {/* Radial Contact Shadow Plane (offset +0.01 on Y to prevent coplanar Z-fighting) */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.8, 2.8]} />
        <meshBasicMaterial
          map={shadowTex}
          transparent
          depthWrite={false}
          opacity={0.75}
          polygonOffset
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-1}
        />
      </mesh>

      {/* Bottom Shadow Gap Reveal Base */}
      <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.28, 0.12, 1.28]} />
        <meshStandardMaterial color="#181816" roughness={0.7} metalness={0.15} />
      </mesh>

      {/* Main Monolithic Limestone Plinth Shaft */}
      <mesh position={[0, 0.62, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.18, 1.0, 1.18]} />
        <meshStandardMaterial
          map={travertineTex}
          color="#F3F1EC"
          roughness={0.82}
          metalness={0.02}
        />
      </mesh>

      {/* Upper Beveled Plinth Cap */}
      <mesh position={[0, 1.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.22, 0.06, 1.22]} />
        <meshStandardMaterial
          map={travertineTex}
          color={isSelected ? '#141413' : '#E7E4DC'}
          roughness={0.45}
          metalness={0.1}
        />
      </mesh>

      {/* Front Obsidian Accession Plaque */}
      <mesh position={[0, 0.88, 0.595]}>
        <boxGeometry args={[0.42, 0.14, 0.015]} />
        <meshStandardMaterial color="#141413" roughness={0.25} metalness={0.6} />
      </mesh>
    </group>
  );
};

/**
 * EXHIBIT 01: Keros Folded-Arm Cycladic Figure (8-part composite procedural sculpture)
 */
export const CycladicIdolSculpture: React.FC<SculptureProps> = ({
  position,
  isSelected,
  explodedFactor,
  inspectRotationY,
  onSelect,
}) => {
  const sculptureGroupRef = useRef<THREE.Group>(null);
  const headGroupRef = useRef<THREE.Group>(null);
  const torsoGroupRef = useRef<THREE.Group>(null);
  const legsGroupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const marbleTex = useMemo(() => getMarbleTexture(), []);
  const travertineTex = useMemo(() => getTravertineTexture(), []);
  const shadowTex = useMemo(() => getContactShadowTexture(), []);

  // Lyre-shaped Cycladic head profile via ExtrudeGeometry with bevels
  const headGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, -0.22);
    shape.bezierCurveTo(0.15, -0.2, 0.19, 0.08, 0.14, 0.25);
    shape.bezierCurveTo(0.08, 0.31, -0.08, 0.31, -0.14, 0.25);
    shape.bezierCurveTo(-0.19, 0.08, -0.15, -0.2, 0, -0.22);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.12,
      bevelEnabled: true,
      bevelThickness: 0.045,
      bevelSize: 0.04,
      bevelSegments: 5,
    });
    geo.center();
    return geo;
  }, []);

  // Trapezoidal Cycladic torso
  const torsoGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.24, 0.28);
    shape.lineTo(0.24, 0.28);
    shape.lineTo(0.16, -0.26);
    shape.lineTo(-0.16, -0.26);
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.09,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.025,
      bevelSegments: 4,
    });
    geo.center();
    return geo;
  }, []);

  useFrame((_, delta) => {
    if (!sculptureGroupRef.current) return;
    const targetRotY = inspectRotationY + (isSelected ? 0.15 : 0);
    sculptureGroupRef.current.rotation.y = THREE.MathUtils.damp(
      sculptureGroupRef.current.rotation.y,
      targetRotY,
      6,
      delta
    );

    const exp = isSelected ? explodedFactor : 0;
    if (headGroupRef.current && torsoGroupRef.current && legsGroupRef.current) {
      headGroupRef.current.position.y = THREE.MathUtils.damp(
        headGroupRef.current.position.y,
        2.32 + exp * 0.38,
        7,
        delta
      );
      torsoGroupRef.current.position.y = THREE.MathUtils.damp(
        torsoGroupRef.current.position.y,
        1.78 + exp * 0.16,
        7,
        delta
      );
      legsGroupRef.current.position.y = THREE.MathUtils.damp(
        legsGroupRef.current.position.y,
        1.34,
        7,
        delta
      );
    }
  });

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onSelect();
  };

  return (
    <group
      position={position}
      onPointerDown={handlePointerDown}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      <MuseumPlinth
        isSelected={isSelected || hovered}
        travertineTex={travertineTex}
        shadowTex={shadowTex}
      />

      <group ref={sculptureGroupRef}>
        {/* Part 1 & 2: Brushed Dark Bronze Mounting Armature & Stepped Pedestal Block */}
        <mesh position={[0, 1.23, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.26, 0.3, 0.1, 32]} />
          <meshStandardMaterial color="#191918" roughness={0.35} metalness={0.8} />
        </mesh>
        <mesh position={[0, 1.52, -0.05]} castShadow>
          <cylinderGeometry args={[0.022, 0.022, 0.58, 16]} />
          <meshStandardMaterial color="#272725" roughness={0.25} metalness={0.9} />
        </mesh>

        {/* Part 3 & 4: Lower Columnar Legs & Incised Cleft */}
        <group ref={legsGroupRef} position={[0, 1.34, 0]}>
          <mesh position={[-0.075, 0.12, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.075, 0.05, 0.42, 24]} />
            <meshStandardMaterial
              map={marbleTex}
              color="#FAF8F5"
              roughness={0.32}
              metalness={0.04}
            />
          </mesh>
          <mesh position={[0.075, 0.12, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.075, 0.05, 0.42, 24]} />
            <meshStandardMaterial
              map={marbleTex}
              color="#FAF8F5"
              roughness={0.32}
              metalness={0.04}
            />
          </mesh>
        </group>

        {/* Part 5, 6 & 7: Trapezoidal Torso & Canonical Folded Left/Right Arms */}
        <group ref={torsoGroupRef} position={[0, 1.78, 0]}>
          <mesh geometry={torsoGeo} castShadow receiveShadow>
            <meshStandardMaterial
              map={marbleTex}
              color="#FBF9F5"
              roughness={0.28}
              metalness={0.05}
            />
          </mesh>
          {/* Left folded forearm bar */}
          <mesh position={[-0.03, -0.14, 0.068]} rotation={[0, 0, 0.05]} castShadow>
            <boxGeometry args={[0.31, 0.055, 0.04]} />
            <meshStandardMaterial
              map={marbleTex}
              color="#F5F3EE"
              roughness={0.38}
              metalness={0.04}
            />
          </mesh>
          {/* Right folded forearm bar below left */}
          <mesh position={[0.03, -0.205, 0.068]} rotation={[0, 0, -0.04]} castShadow>
            <boxGeometry args={[0.31, 0.055, 0.04]} />
            <meshStandardMaterial
              map={marbleTex}
              color="#F5F3EE"
              roughness={0.38}
              metalness={0.04}
            />
          </mesh>
        </group>

        {/* Part 8, 9 & 10: Cylindrical Neck, Tilted Lyre Head & Sculpted Nasal Ridge */}
        <group ref={headGroupRef} position={[0, 2.32, 0]}>
          {/* Neck cylinder */}
          <mesh position={[0, -0.18, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.07, 0.085, 0.22, 24]} />
            <meshStandardMaterial
              map={marbleTex}
              color="#F3F0EA"
              roughness={0.42}
              metalness={0.03}
            />
          </mesh>
          {/* Tilted Lyre Cranial Plane */}
          <group rotation={[-0.28, 0, 0]}>
            <mesh geometry={headGeo} castShadow receiveShadow>
              <meshPhysicalMaterial
                map={marbleTex}
                color="#FFFFFF"
                roughness={0.22}
                metalness={0.02}
                clearcoat={0.25}
                clearcoatRoughness={0.35}
              />
            </mesh>
            {/* Geometric Nasal Prism */}
            <mesh position={[0, 0.02, 0.095]} castShadow>
              <boxGeometry args={[0.032, 0.19, 0.045]} />
              <meshStandardMaterial color="#FFFFFF" roughness={0.18} metalness={0.05} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
};

/**
 * EXHIBIT 02: Dipylon Geometric Amphora (7-part Lathe & Tube composite vessel)
 */
export const DipylonAmphoraSculpture: React.FC<SculptureProps> = ({
  position,
  isSelected,
  explodedFactor,
  inspectRotationY,
  onSelect,
}) => {
  const vesselGroupRef = useRef<THREE.Group>(null);
  const neckRimRef = useRef<THREE.Group>(null);
  const handlesRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const amphoraTex = useMemo(() => getGeometricAmphoraTexture(), []);
  const travertineTex = useMemo(() => getTravertineTexture(), []);
  const shadowTex = useMemo(() => getContactShadowTexture(), []);

  // Lathe profile for ovoid belly
  const bellyGeo = useMemo(() => {
    const pts = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.18, 0.0),
      new THREE.Vector2(0.14, 0.08),
      new THREE.Vector2(0.28, 0.28),
      new THREE.Vector2(0.38, 0.52),
      new THREE.Vector2(0.35, 0.72),
      new THREE.Vector2(0.18, 0.86),
    ];
    return new THREE.LatheGeometry(pts, 48);
  }, []);

  // Lathe profile for elongated geometric neck & flared lip
  const neckGeo = useMemo(() => {
    const pts = [
      new THREE.Vector2(0.17, 0.0),
      new THREE.Vector2(0.155, 0.18),
      new THREE.Vector2(0.165, 0.36),
      new THREE.Vector2(0.24, 0.44),
      new THREE.Vector2(0.21, 0.46),
    ];
    return new THREE.LatheGeometry(pts, 48);
  }, []);

  // Curved loop handles via TubeGeometry
  const { leftHandleGeo, rightHandleGeo } = useMemo(() => {
    const leftCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.31, 0.68, 0),
      new THREE.Vector3(-0.44, 0.82, 0),
      new THREE.Vector3(-0.38, 1.04, 0),
      new THREE.Vector3(-0.17, 1.06, 0),
    ]);
    const rightCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.31, 0.68, 0),
      new THREE.Vector3(0.44, 0.82, 0),
      new THREE.Vector3(0.38, 1.04, 0),
      new THREE.Vector3(0.17, 1.06, 0),
    ]);
    return {
      leftHandleGeo: new THREE.TubeGeometry(leftCurve, 32, 0.026, 16, false),
      rightHandleGeo: new THREE.TubeGeometry(rightCurve, 32, 0.026, 16, false),
    };
  }, []);

  useFrame((_, delta) => {
    if (!vesselGroupRef.current) return;
    vesselGroupRef.current.rotation.y = THREE.MathUtils.damp(
      vesselGroupRef.current.rotation.y,
      inspectRotationY + 0.35,
      6,
      delta
    );
    const exp = isSelected ? explodedFactor : 0;
    if (neckRimRef.current && handlesRef.current) {
      neckRimRef.current.position.y = THREE.MathUtils.damp(
        neckRimRef.current.position.y,
        0.85 + exp * 0.32,
        7,
        delta
      );
      handlesRef.current.scale.x = THREE.MathUtils.damp(
        handlesRef.current.scale.x,
        1 + exp * 0.22,
        7,
        delta
      );
    }
  });

  return (
    <group
      position={position}
      onPointerDown={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      <MuseumPlinth
        isSelected={isSelected || hovered}
        travertineTex={travertineTex}
        shadowTex={shadowTex}
      />

      <group ref={vesselGroupRef} position={[0, 1.18, 0]}>
        {/* Part 1: Stepped Obsidian Ceramic Foot Ring */}
        <mesh position={[0, 0.04, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.21, 0.25, 0.08, 36]} />
          <meshStandardMaterial color="#141413" roughness={0.35} metalness={0.12} />
        </mesh>

        {/* Part 2: Main Ovoid Amphora Belly with Geometric Meander Texture */}
        <mesh position={[0, 0.06, 0]} geometry={bellyGeo} castShadow receiveShadow>
          <meshStandardMaterial
            map={amphoraTex}
            roughness={0.42}
            metalness={0.06}
          />
        </mesh>

        {/* Part 3: Shoulder Tectonic Collar Ring */}
        <mesh position={[0, 0.91, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.18, 0.018, 16, 48]} />
          <meshStandardMaterial color="#141413" roughness={0.25} metalness={0.2} />
        </mesh>

        {/* Part 4 & 5: Neck Cylinder & Flared Rim */}
        <group ref={neckRimRef} position={[0, 0.85, 0]}>
          <mesh geometry={neckGeo} castShadow receiveShadow>
            <meshStandardMaterial
              map={amphoraTex}
              roughness={0.38}
              metalness={0.08}
            />
          </mesh>
          <mesh position={[0, 0.45, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[0.225, 0.022, 16, 48]} />
            <meshStandardMaterial color="#141413" roughness={0.22} metalness={0.18} />
          </mesh>
        </group>

        {/* Part 6 & 7: Twin Arching Loop Handles */}
        <group ref={handlesRef}>
          <mesh geometry={leftHandleGeo} castShadow>
            <meshStandardMaterial color="#171715" roughness={0.3} metalness={0.15} />
          </mesh>
          <mesh geometry={rightHandleGeo} castShadow>
            <meshStandardMaterial color="#171715" roughness={0.3} metalness={0.15} />
          </mesh>
        </group>
      </group>
    </group>
  );
};

/**
 * EXHIBIT 03: Peristyle Capital of Delos (9-part architectural order study)
 */
export const DelosCapitalSculpture: React.FC<SculptureProps> = ({
  position,
  isSelected,
  explodedFactor,
  inspectRotationY,
  onSelect,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const abacusRef = useRef<THREE.Group>(null);
  const echinusRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const marbleTex = useMemo(() => getMarbleTexture(), []);
  const travertineTex = useMemo(() => getTravertineTexture(), []);
  const shadowTex = useMemo(() => getContactShadowTexture(), []);

  // Fluted column drum profile
  const fluteAngles = useMemo(
    () => Array.from({ length: 16 }, (_, i) => (i * Math.PI * 2) / 16),
    []
  );

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = THREE.MathUtils.damp(
      groupRef.current.rotation.y,
      inspectRotationY - 0.25,
      6,
      delta
    );
    const exp = isSelected ? explodedFactor : 0;
    if (abacusRef.current && echinusRef.current) {
      abacusRef.current.position.y = THREE.MathUtils.damp(
        abacusRef.current.position.y,
        0.92 + exp * 0.36,
        7,
        delta
      );
      echinusRef.current.position.y = THREE.MathUtils.damp(
        echinusRef.current.position.y,
        0.64 + exp * 0.18,
        7,
        delta
      );
    }
  });

  return (
    <group
      position={position}
      onPointerDown={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      <MuseumPlinth
        isSelected={isSelected || hovered}
        travertineTex={travertineTex}
        shadowTex={shadowTex}
      />

      <group ref={groupRef} position={[0, 1.18, 0]}>
        {/* Part 1: Lower Stylobate Bedding Slab */}
        <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.86, 0.1, 0.86]} />
          <meshStandardMaterial color="#191918" roughness={0.5} metalness={0.2} />
        </mesh>

        {/* Part 2: Fluted Classical Column Drum Core */}
        <group position={[0, 0.36, 0]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.31, 0.34, 0.54, 32]} />
            <meshStandardMaterial
              map={marbleTex}
              color="#F8F6F1"
              roughness={0.35}
              metalness={0.03}
            />
          </mesh>
          {/* Radial Arris Ridges */}
          {fluteAngles.map((ang, idx) => (
            <mesh
              key={idx}
              position={[Math.cos(ang) * 0.318, 0, Math.sin(ang) * 0.318]}
              rotation={[0, -ang, 0]}
              castShadow
            >
              <boxGeometry args={[0.018, 0.52, 0.035]} />
              <meshStandardMaterial
                map={marbleTex}
                color="#ECE9E2"
                roughness={0.48}
                metalness={0.02}
              />
            </mesh>
          ))}
        </group>

        {/* Part 3, 4 & 5: Necking Annulets & Hyperbolic Echinus Cushion */}
        <group ref={echinusRef} position={[0, 0.64, 0]}>
          <mesh position={[0, 0.0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[0.32, 0.016, 12, 40]} />
            <meshStandardMaterial color="#1E1E1C" roughness={0.35} metalness={0.4} />
          </mesh>
          <mesh position={[0, 0.11, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.46, 0.31, 0.18, 40]} />
            <meshStandardMaterial
              map={marbleTex}
              color="#FAF8F4"
              roughness={0.26}
              metalness={0.04}
            />
          </mesh>
          {/* Dual Ionic Volute Scrolls */}
          {[-0.38, 0.38].map((xPos, i) => (
            <group key={i} position={[xPos, 0.14, 0]}>
              <mesh rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.14, 0.14, 0.68, 28]} />
                <meshStandardMaterial
                  map={marbleTex}
                  color="#F3F0E8"
                  roughness={0.3}
                  metalness={0.05}
                />
              </mesh>
              {/* Obsidian Eye of the Volute */}
              <mesh position={[0, 0, 0.345]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.045, 0.045, 0.02, 20]} />
                <meshStandardMaterial color="#141413" roughness={0.2} metalness={0.6} />
              </mesh>
              <mesh position={[0, 0, -0.345]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.045, 0.045, 0.02, 20]} />
                <meshStandardMaterial color="#141413" roughness={0.2} metalness={0.6} />
              </mesh>
            </group>
          ))}
        </group>

        {/* Part 6, 7 & 8: Monolithic Abacus Slab & Architrave Epistyle Beam */}
        <group ref={abacusRef} position={[0, 0.92, 0]}>
          <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.92, 0.11, 0.82]} />
            <meshStandardMaterial
              map={marbleTex}
              color="#FFFFFF"
              roughness={0.24}
              metalness={0.04}
            />
          </mesh>
          <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.84, 0.13, 0.72]} />
            <meshStandardMaterial
              map={travertineTex}
              color="#EAE6DE"
              roughness={0.55}
              metalness={0.02}
            />
          </mesh>
          {/* Central Empolion Bronze Dowel Pin */}
          <mesh position={[0, 0.22, 0]} castShadow>
            <boxGeometry args={[0.09, 0.08, 0.09]} />
            <meshStandardMaterial color="#181816" roughness={0.22} metalness={0.85} />
          </mesh>
        </group>
      </group>
    </group>
  );
};

/**
 * EXHIBIT 04: Celestial Astrolabe of Rhodes (8-part kinetic bronze & marble instrument)
 */
export const RhodesAstrolabeSculpture: React.FC<SculptureProps> = ({
  position,
  isSelected,
  explodedFactor,
  inspectRotationY,
  onSelect,
}) => {
  const rootRef = useRef<THREE.Group>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);
  const eclipticRingRef = useRef<THREE.Group>(null);
  const alidadeRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const dialTex = useMemo(() => getAstrolabeDialTexture(), []);
  const marbleTex = useMemo(() => getMarbleTexture(), []);
  const travertineTex = useMemo(() => getTravertineTexture(), []);
  const shadowTex = useMemo(() => getContactShadowTexture(), []);

  useFrame((state, delta) => {
    if (!rootRef.current) return;
    const t = state.clock.getElapsedTime();
    rootRef.current.rotation.y = THREE.MathUtils.damp(
      rootRef.current.rotation.y,
      inspectRotationY + t * 0.08,
      6,
      delta
    );
    const exp = isSelected ? explodedFactor : 0;
    if (eclipticRingRef.current && alidadeRef.current && outerRingRef.current) {
      eclipticRingRef.current.rotation.z = 0.41 + Math.sin(t * 0.4) * 0.12;
      alidadeRef.current.rotation.z = -t * 0.25;
      outerRingRef.current.position.y = THREE.MathUtils.damp(
        outerRingRef.current.position.y,
        0.68 + exp * 0.22,
        7,
        delta
      );
      eclipticRingRef.current.position.y = THREE.MathUtils.damp(
        eclipticRingRef.current.position.y,
        0.68 + exp * 0.38,
        7,
        delta
      );
    }
  });

  return (
    <group
      position={position}
      onPointerDown={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      <MuseumPlinth
        isSelected={isSelected || hovered}
        travertineTex={travertineTex}
        shadowTex={shadowTex}
      />

      <group ref={rootRef} position={[0, 1.18, 0]}>
        {/* Part 1: Stepped White Marble Sundial Pedestal */}
        <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.32, 0.38, 0.16, 36]} />
          <meshStandardMaterial
            map={marbleTex}
            color="#FAF8F5"
            roughness={0.28}
            metalness={0.05}
          />
        </mesh>

        {/* Part 2: Patinated Black-Bronze Horizon Cradle Arc */}
        <mesh position={[0, 0.42, 0]} rotation={[0, 0, Math.PI]} castShadow>
          <torusGeometry args={[0.48, 0.024, 16, 48, Math.PI]} />
          <meshStandardMaterial color="#181816" roughness={0.22} metalness={0.88} />
        </mesh>

        {/* Part 3: Vertical Polar Axis Column */}
        <mesh position={[0, 0.26, 0]} castShadow>
          <cylinderGeometry args={[0.032, 0.048, 0.28, 20]} />
          <meshStandardMaterial color="#181816" roughness={0.2} metalness={0.9} />
        </mesh>

        {/* Part 4: Outer Graduated Meridian Ring */}
        <mesh ref={outerRingRef} position={[0, 0.68, 0]} castShadow>
          <torusGeometry args={[0.44, 0.028, 20, 64]} />
          <meshStandardMaterial color="#141413" roughness={0.18} metalness={0.92} />
        </mesh>

        {/* Part 5 & 6: Inclined Ecliptic Band & Equatorial Ring */}
        <group ref={eclipticRingRef} position={[0, 0.68, 0]} rotation={[0.35, 0.2, 0.41]}>
          <mesh castShadow>
            <torusGeometry args={[0.36, 0.032, 16, 64]} />
            <meshStandardMaterial color="#D8D4CB" roughness={0.24} metalness={0.85} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[0.31, 0.018, 16, 64]} />
            <meshStandardMaterial color="#262624" roughness={0.28} metalness={0.88} />
          </mesh>
        </group>

        {/* Part 7 & 8: Central Graduated Tympan Plate & Revolving Sighting Alidade */}
        <group ref={alidadeRef} position={[0, 0.68, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.21, 0.21, 0.022, 48]} />
            <meshStandardMaterial
              map={dialTex}
              roughness={0.3}
              metalness={0.75}
            />
          </mesh>
          {/* Sighting Alidade Rule */}
          <mesh castShadow>
            <boxGeometry args={[0.52, 0.026, 0.036]} />
            <meshStandardMaterial color="#EAE6DF" roughness={0.18} metalness={0.9} />
          </mesh>
          {/* Central Axis Finial Sphere */}
          <mesh castShadow>
            <sphereGeometry args={[0.048, 24, 24]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.15} metalness={0.1} />
          </mesh>
        </group>
      </group>
    </group>
  );
};

/**
 * EXHIBIT 05: Monolith of the Aegean Horizon (7-part contemporary Carrara marble & basalt sculpture)
 */
export const AegeanMonolithSculpture: React.FC<SculptureProps> = ({
  position,
  isSelected,
  explodedFactor,
  inspectRotationY,
  onSelect,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const leftArchRef = useRef<THREE.Mesh>(null);
  const rightArchRef = useRef<THREE.Mesh>(null);
  const basaltRingRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const marbleTex = useMemo(() => getMarbleTexture(), []);
  const travertineTex = useMemo(() => getTravertineTexture(), []);
  const shadowTex = useMemo(() => getContactShadowTexture(), []);

  // Architectural minimalist arch geometry via ExtrudeGeometry
  const archGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.34, 0);
    shape.lineTo(-0.34, 0.72);
    shape.absarc(0, 0.72, 0.34, Math.PI, 0, true);
    shape.lineTo(0.34, 0);
    shape.lineTo(0.18, 0);
    shape.lineTo(0.18, 0.72);
    shape.absarc(0, 0.72, 0.18, 0, Math.PI, false);
    shape.lineTo(-0.18, 0);
    shape.closePath();

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.18,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 4,
    });
    geo.center();
    return geo;
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = THREE.MathUtils.damp(
      groupRef.current.rotation.y,
      inspectRotationY + 0.2,
      6,
      delta
    );
    const exp = isSelected ? explodedFactor : 0;
    if (leftArchRef.current && rightArchRef.current && basaltRingRef.current) {
      leftArchRef.current.position.x = THREE.MathUtils.damp(
        leftArchRef.current.position.x,
        -0.12 - exp * 0.24,
        7,
        delta
      );
      rightArchRef.current.position.x = THREE.MathUtils.damp(
        rightArchRef.current.position.x,
        0.12 + exp * 0.24,
        7,
        delta
      );
      basaltRingRef.current.position.y = THREE.MathUtils.damp(
        basaltRingRef.current.position.y,
        0.74 + exp * 0.32,
        7,
        delta
      );
    }
  });

  return (
    <group
      position={position}
      onPointerDown={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      <MuseumPlinth
        isSelected={isSelected || hovered}
        travertineTex={travertineTex}
        shadowTex={shadowTex}
      />

      <group ref={groupRef} position={[0, 1.18, 0]}>
        {/* Part 1: Reflective Honed Obsidian Basalt Mirror Base */}
        <mesh position={[0, 0.04, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.92, 0.08, 0.92]} />
          <meshPhysicalMaterial
            color="#111110"
            roughness={0.12}
            metalness={0.2}
            clearcoat={0.8}
            clearcoatRoughness={0.1}
          />
        </mesh>

        {/* Part 2: Primary Honed White Carrara Arch */}
        <mesh
          ref={leftArchRef}
          position={[-0.12, 0.56, -0.08]}
          geometry={archGeo}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            map={marbleTex}
            color="#FFFFFF"
            roughness={0.22}
            metalness={0.03}
          />
        </mesh>

        {/* Part 3: Secondary Interlocking Limestone Arch */}
        <mesh
          ref={rightArchRef}
          position={[0.12, 0.48, 0.1]}
          rotation={[0, Math.PI / 2, 0]}
          geometry={archGeo}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            map={travertineTex}
            color="#EAE7E0"
            roughness={0.48}
            metalness={0.02}
          />
        </mesh>

        {/* Part 4: Suspended Volcanic Basalt Void Ring */}
        <mesh
          ref={basaltRingRef}
          position={[0, 0.74, 0]}
          rotation={[0.2, 0.4, 0]}
          castShadow
          receiveShadow
        >
          <torusGeometry args={[0.26, 0.052, 24, 64]} />
          <meshStandardMaterial color="#141413" roughness={0.32} metalness={0.45} />
        </mesh>

        {/* Part 5: Suspended Parian Marble Horizon Sphere */}
        <mesh position={[0, 0.74, 0]} castShadow>
          <sphereGeometry args={[0.095, 32, 32]} />
          <meshPhysicalMaterial
            color="#FFFFFF"
            roughness={0.15}
            metalness={0.02}
            clearcoat={0.5}
          />
        </mesh>
      </group>
    </group>
  );
};
