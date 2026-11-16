import React, { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EXHIBITS, LightingPreset } from '../data/exhibits';
import {
  getMarbleTexture,
  getTravertineTexture,
  isSoftwareGl,
} from './materialsAndTextures';
import {
  CycladicIdolSculpture,
  DipylonAmphoraSculpture,
  DelosCapitalSculpture,
  RhodesAstrolabeSculpture,
  AegeanMonolithSculpture,
} from './ExhibitSculptures';

// Pre-allocated math helpers at module scope (zero GC in render loop)
const _targetCameraPos = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();
const _currentLookAt = new THREE.Vector3(0, 1.8, -6);
const _sunTargetPos = new THREE.Vector3();

interface GallerySceneProps {
  activeExhibitIndex: number;
  scrollProgress: number; // 0 to 1 continuous scroll progress across the 5 exhibits
  isFreeInspectMode: boolean;
  inspectRotationY: number;
  inspectZoomOffset: number;
  explodedFactor: number;
  lightingPreset: LightingPreset;
  onSelectExhibit: (index: number) => void;
}

/**
 * Initializes RoomEnvironment PMREM studio reflections and tone mapping
 */
const StudioEnvironmentInitializer: React.FC<{ lightingPreset: LightingPreset }> = ({
  lightingPreset,
}) => {
  const { gl, scene } = useThree();

  useEffect(() => {
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.08;

    const pmremGenerator = new THREE.PMREMGenerator(gl);
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();

    return () => {
      envTexture.dispose();
    };
  }, [gl, scene]);

  useEffect(() => {
    scene.background = new THREE.Color(lightingPreset.backgroundHex);
    scene.fog = new THREE.FogExp2(lightingPreset.fogHex, 0.022);
  }, [scene, lightingPreset]);

  return null;
};

/**
 * Mediterranean Minimalist Limestone Architecture:
 * - Curved colonnade of monolithic arches
 * - Overhead skylight pergola louvres casting architectural shadows
 * - Central shallow obsidian reflective water basin
 */
const MediterraneanArchitecture: React.FC = () => {
  const travertineTex = useMemo(() => {
    const t = getTravertineTexture();
    t.repeat.set(6, 6);
    return t;
  }, []);
  const marbleTex = useMemo(() => getMarbleTexture(), []);

  const colonnadeInstancedRef = useRef<THREE.InstancedMesh>(null);
  const louvreInstancedRef = useRef<THREE.InstancedMesh>(null);

  // Build monolithic limestone arch geometry
  const archWallGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-2.2, 0);
    shape.lineTo(-2.2, 5.2);
    shape.lineTo(2.2, 5.2);
    shape.lineTo(2.2, 0);
    shape.lineTo(1.25, 0);
    shape.lineTo(1.25, 3.1);
    shape.absarc(0, 3.1, 1.25, 0, Math.PI, false);
    shape.lineTo(-1.25, 0);
    shape.closePath();

    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.55,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelSegments: 3,
    });
  }, []);

  // Populate InstancedMesh for background peristyle columns and overhead skylight beams
  useEffect(() => {
    if (colonnadeInstancedRef.current) {
      const dummy = new THREE.Object3D();
      const count = 24;
      for (let i = 0; i < count; i++) {
        const angle = ((i / (count - 1)) - 0.5) * Math.PI * 0.88;
        const radius = 19.5;
        dummy.position.set(
          Math.sin(angle) * radius,
          2.8,
          -Math.cos(angle) * radius + 4
        );
        dummy.rotation.set(0, -angle, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        colonnadeInstancedRef.current.setMatrixAt(i, dummy.matrix);
      }
      colonnadeInstancedRef.current.instanceMatrix.needsUpdate = true;
      colonnadeInstancedRef.current.computeBoundingSphere();
    }

    if (louvreInstancedRef.current) {
      const dummy = new THREE.Object3D();
      const count = 22;
      for (let i = 0; i < count; i++) {
        dummy.position.set((i - 10.5) * 1.65, 5.65, -5.5);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        louvreInstancedRef.current.setMatrixAt(i, dummy.matrix);
      }
      louvreInstancedRef.current.instanceMatrix.needsUpdate = true;
      louvreInstancedRef.current.computeBoundingSphere();
    }
  }, []);

  // 5 Arched Bays behind each of the 5 exhibits
  const bayTransforms = useMemo(
    () => [
      { pos: [-14.2, 0, -6.2] as [number, number, number], rotY: 0.42 },
      { pos: [-7.2, 0, -9.2] as [number, number, number], rotY: 0.21 },
      { pos: [0, 0, -10.8] as [number, number, number], rotY: 0 },
      { pos: [7.2, 0, -9.2] as [number, number, number], rotY: -0.21 },
      { pos: [14.2, 0, -6.2] as [number, number, number], rotY: -0.42 },
    ],
    []
  );

  return (
    <group>
      {/* Main Honed Limestone Gallery Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -4]} receiveShadow>
        <planeGeometry args={[70, 50]} />
        <meshStandardMaterial
          map={travertineTex}
          color="#F5F3EE"
          roughness={0.78}
          metalness={0.02}
        />
      </mesh>

      {/* Subtle Architectural Floor Grid Lines & Courtyard Reflecting Basin (offset Y +0.02 to prevent Z-fighting) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 2.2]} receiveShadow>
        <planeGeometry args={[18, 5.5]} />
        <meshPhysicalMaterial
          color="#161615"
          roughness={0.08}
          metalness={0.15}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
        />
      </mesh>

      {/* Travertine Coping Rim around the Reflecting Pool */}
      <mesh position={[0, 0.04, -0.58]} receiveShadow>
        <boxGeometry args={[18.4, 0.08, 0.18]} />
        <meshStandardMaterial color="#E5E2DA" roughness={0.6} />
      </mesh>

      {/* 5 Monolithic Mediterranean Limestone Arches framing each exhibit */}
      {bayTransforms.map((bay, idx) => (
        <mesh
          key={idx}
          position={bay.pos}
          rotation={[0, bay.rotY, 0]}
          geometry={archWallGeo}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            map={marbleTex}
            color="#FAF9F5"
            roughness={0.85}
            metalness={0.01}
          />
        </mesh>
      ))}

      {/* Instanced Peristyle Colonnade (24 columns) */}
      <instancedMesh
        ref={colonnadeInstancedRef}
        args={[undefined, undefined, 24]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.38, 0.44, 5.6, 24]} />
        <meshStandardMaterial
          map={marbleTex}
          color="#F2EFE9"
          roughness={0.75}
          metalness={0.02}
        />
      </instancedMesh>

      {/* Instanced Overhead Skylight Brise-Soleil Beams (22 beams casting rhythmic shadows) */}
      <instancedMesh
        ref={louvreInstancedRef}
        args={[undefined, undefined, 22]}
        castShadow
      >
        <boxGeometry args={[0.24, 0.35, 14]} />
        <meshStandardMaterial color="#F7F5F0" roughness={0.8} metalness={0.02} />
      </instancedMesh>
    </group>
  );
};

/**
 * Smooth Damped Camera & Solar Lighting Controller
 * Interpolates smoothly between exhibit waypoints based on scrollProgress or activeExhibitIndex
 */
const CameraAndLightController: React.FC<{
  activeExhibitIndex: number;
  scrollProgress: number;
  isFreeInspectMode: boolean;
  inspectZoomOffset: number;
  lightingPreset: LightingPreset;
}> = ({
  activeExhibitIndex,
  scrollProgress,
  isFreeInspectMode,
  inspectZoomOffset,
  lightingPreset,
}) => {
  const { camera } = useThree();
  const keyLightRef = useRef<THREE.DirectionalLight>(null);

  useFrame((_, delta) => {
    const totalStops = EXHIBITS.length - 1;

    if (isFreeInspectMode) {
      // Focused close-up inspection on the active exhibit
      const ex = EXHIBITS[activeExhibitIndex] || EXHIBITS[0];
      _targetCameraPos.set(
        ex.cameraPosition[0],
        ex.cameraPosition[1] - 0.1,
        ex.cameraPosition[2] - 1.15 + inspectZoomOffset
      );
      _targetLookAt.set(
        ex.cameraTarget[0],
        ex.cameraTarget[1] + 0.05,
        ex.cameraTarget[2]
      );
    } else {
      // Smooth continuous interpolation along the 5-exhibit curatorial path
      const exactIndex = THREE.MathUtils.clamp(scrollProgress * totalStops, 0, totalStops);
      const idxLow = Math.floor(exactIndex);
      const idxHigh = Math.min(idxLow + 1, totalStops);
      const t = THREE.MathUtils.smoothstep(exactIndex - idxLow, 0, 1);

      const exA = EXHIBITS[idxLow];
      const exB = EXHIBITS[idxHigh];

      _targetCameraPos.set(
        THREE.MathUtils.lerp(exA.cameraPosition[0], exB.cameraPosition[0], t),
        THREE.MathUtils.lerp(exA.cameraPosition[1], exB.cameraPosition[1], t),
        THREE.MathUtils.lerp(exA.cameraPosition[2], exB.cameraPosition[2], t) +
          inspectZoomOffset
      );

      _targetLookAt.set(
        THREE.MathUtils.lerp(exA.cameraTarget[0], exB.cameraTarget[0], t),
        THREE.MathUtils.lerp(exA.cameraTarget[1], exB.cameraTarget[1], t),
        THREE.MathUtils.lerp(exA.cameraTarget[2], exB.cameraTarget[2], t)
      );
    }

    // Frame-rate independent exponential damping
    camera.position.x = THREE.MathUtils.damp(camera.position.x, _targetCameraPos.x, 5.5, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, _targetCameraPos.y, 5.5, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, _targetCameraPos.z, 5.5, delta);

    _currentLookAt.x = THREE.MathUtils.damp(_currentLookAt.x, _targetLookAt.x, 6.5, delta);
    _currentLookAt.y = THREE.MathUtils.damp(_currentLookAt.y, _targetLookAt.y, 6.5, delta);
    _currentLookAt.z = THREE.MathUtils.damp(_currentLookAt.z, _targetLookAt.z, 6.5, delta);

    camera.lookAt(_currentLookAt);

    // Smoothly damp directional sun light position when switching solar presets
    if (keyLightRef.current) {
      _sunTargetPos.set(
        lightingPreset.sunPosition[0],
        lightingPreset.sunPosition[1],
        lightingPreset.sunPosition[2]
      );
      keyLightRef.current.position.x = THREE.MathUtils.damp(
        keyLightRef.current.position.x,
        _sunTargetPos.x,
        4,
        delta
      );
      keyLightRef.current.position.y = THREE.MathUtils.damp(
        keyLightRef.current.position.y,
        _sunTargetPos.y,
        4,
        delta
      );
      keyLightRef.current.position.z = THREE.MathUtils.damp(
        keyLightRef.current.position.z,
        _sunTargetPos.z,
        4,
        delta
      );
    }
  });

  return (
    <>
      {/* Warm/Cool Hemisphere Fill Light */}
      <hemisphereLight
        args={['#FFFFFF', '#D8D4CC', lightingPreset.hemiIntensity]}
        position={[0, 18, 0]}
      />

      {/* Subtle Ambient Light */}
      <ambientLight intensity={lightingPreset.ambientIntensity} color="#FAF8F5" />

      {/* Primary Mediterranean Sun Key Light with calibrated shadow bounds */}
      <directionalLight
        ref={keyLightRef}
        position={lightingPreset.sunPosition}
        intensity={lightingPreset.keyIntensity}
        color="#FFFDF9"
        castShadow={!isSoftwareGl}
        shadow-mapSize-width={isSoftwareGl ? 512 : 2048}
        shadow-mapSize-height={isSoftwareGl ? 512 : 2048}
        shadow-camera-near={1}
        shadow-camera-far={45}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />

      {/* Cool Architectural Rim/Back Light */}
      <directionalLight
        position={[0, 9, -16]}
        intensity={0.85}
        color="#EFECE6"
      />
    </>
  );
};

export const MuseumGalleryScene: React.FC<GallerySceneProps> = ({
  activeExhibitIndex,
  scrollProgress,
  isFreeInspectMode,
  inspectRotationY,
  inspectZoomOffset,
  explodedFactor,
  lightingPreset,
  onSelectExhibit,
}) => {
  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        shadows={!isSoftwareGl}
        dpr={isSoftwareGl ? 1 : [1, 2]}
        gl={{
          antialias: !isSoftwareGl,
          powerPreference: 'high-performance',
        }}
        camera={{
          fov: 42,
          near: 0.1,
          far: 90,
          position: EXHIBITS[0].cameraPosition,
        }}
      >
        <StudioEnvironmentInitializer lightingPreset={lightingPreset} />
        <CameraAndLightController
          activeExhibitIndex={activeExhibitIndex}
          scrollProgress={scrollProgress}
          isFreeInspectMode={isFreeInspectMode}
          inspectZoomOffset={inspectZoomOffset}
          lightingPreset={lightingPreset}
        />

        <MediterraneanArchitecture />

        {/* Exhibit 01: Idol of Keros */}
        <CycladicIdolSculpture
          position={EXHIBITS[0].plinthPosition}
          isSelected={activeExhibitIndex === 0}
          explodedFactor={explodedFactor}
          inspectRotationY={activeExhibitIndex === 0 ? inspectRotationY : 0}
          onSelect={() => onSelectExhibit(0)}
        />

        {/* Exhibit 02: Dipylon Geometric Amphora */}
        <DipylonAmphoraSculpture
          position={EXHIBITS[1].plinthPosition}
          isSelected={activeExhibitIndex === 1}
          explodedFactor={explodedFactor}
          inspectRotationY={activeExhibitIndex === 1 ? inspectRotationY : 0}
          onSelect={() => onSelectExhibit(1)}
        />

        {/* Exhibit 03: Peristyle Capital of Delos */}
        <DelosCapitalSculpture
          position={EXHIBITS[2].plinthPosition}
          isSelected={activeExhibitIndex === 2}
          explodedFactor={explodedFactor}
          inspectRotationY={activeExhibitIndex === 2 ? inspectRotationY : 0}
          onSelect={() => onSelectExhibit(2)}
        />

        {/* Exhibit 04: Astrolabe of Rhodes */}
        <RhodesAstrolabeSculpture
          position={EXHIBITS[3].plinthPosition}
          isSelected={activeExhibitIndex === 3}
          explodedFactor={explodedFactor}
          inspectRotationY={activeExhibitIndex === 3 ? inspectRotationY : 0}
          onSelect={() => onSelectExhibit(3)}
        />

        {/* Exhibit 05: Monolith of the Aegean Horizon */}
        <AegeanMonolithSculpture
          position={EXHIBITS[4].plinthPosition}
          isSelected={activeExhibitIndex === 4}
          explodedFactor={explodedFactor}
          inspectRotationY={activeExhibitIndex === 4 ? inspectRotationY : 0}
          onSelect={() => onSelectExhibit(4)}
        />
      </Canvas>
    </div>
  );
};
