import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Box, RefreshCw, Eye, Sparkles } from 'lucide-react';

export interface AtomData {
  id: number;
  element: string;
  x: number;
  y: number;
  z: number;
  residue?: string;
}

export interface BondData {
  atom1: number;
  atom2: number;
  order?: number;
}

export interface MoleculeStructure {
  name: string;
  formula: string;
  atoms: AtomData[];
  bonds: BondData[];
}

// Standard CPK Color Scheme for Biochemistry
const CPK_COLORS: Record<string, number> = {
  C: 0x38bdf8, // Carbon: Cyan / Light Blue
  N: 0x3b82f6, // Nitrogen: Dark Blue
  O: 0xf43f5e, // Oxygen: Red
  H: 0xf8fafc, // Hydrogen: White
  S: 0xf59e0b, // Sulfur: Yellow
  P: 0xa855f7, // Phosphorus: Purple
  F: 0x10b981, // Fluorine: Green
  Cl: 0x10b981,// Chlorine: Green
  Fe: 0xd97706, // Iron: Dark Amber
};

// Atom radii according to element
const ATOM_RADII: Record<string, number> = {
  C: 0.5,
  N: 0.48,
  O: 0.45,
  H: 0.25,
  S: 0.65,
  P: 0.6,
  F: 0.4,
  Cl: 0.55,
  Fe: 0.7,
};

interface MoleculeRendererEngineProps {
  structure?: MoleculeStructure;
  autoRotate?: boolean;
}

// Default Drug Candidate Structure: EGFR Inhibitor Kinase Ligand
const DEFAULT_LIGAND: MoleculeStructure = {
  name: "Gefitinib (Iressa) - Kinase Binding Ligand",
  formula: "C22H24ClFN4O3",
  atoms: [
    { id: 0, element: "C", x: 0, y: 0, z: 0, residue: "CORE-1" },
    { id: 1, element: "N", x: 1.2, y: 0.8, z: 0.3, residue: "RING-A" },
    { id: 2, element: "C", x: 2.2, y: 0, z: -0.2, residue: "RING-A" },
    { id: 3, element: "C", x: 1.8, y: -1.3, z: -0.5, residue: "RING-A" },
    { id: 4, element: "N", x: 0.5, y: -1.2, z: -0.2, residue: "RING-A" },
    { id: 5, element: "Cl", x: -1.2, y: 0.5, z: 0.6, residue: "SUBST-1" },
    { id: 6, element: "O", x: 3.4, y: 0.4, z: -0.4, residue: "ETHER-1" },
    { id: 7, element: "C", x: 4.4, y: -0.5, z: -0.9, residue: "CHAIN-1" },
    { id: 8, element: "C", x: 5.6, y: 0.2, z: -1.2, residue: "CHAIN-1" },
    { id: 9, element: "N", x: 6.6, y: -0.7, z: -1.6, residue: "MORPHOLINE" },
    { id: 10, element: "O", x: 7.8, y: 0, z: -2.0, residue: "MORPHOLINE" },
    { id: 11, element: "F", x: 2.7, y: -2.4, z: -1.0, residue: "SUBST-2" },
    { id: 12, element: "C", x: -0.5, y: -2.4, z: -0.3, residue: "SIDECHAIN" },
    { id: 13, element: "S", x: -1.8, y: -2.2, z: -1.4, residue: "TARGET-BIND" },
    { id: 14, element: "C", x: -2.8, y: -3.4, z: -0.8, residue: "TARGET-BIND" },
  ],
  bonds: [
    { atom1: 0, atom2: 1, order: 2 },
    { atom1: 1, atom2: 2, order: 1 },
    { atom1: 2, atom2: 3, order: 2 },
    { atom1: 3, atom2: 4, order: 1 },
    { atom1: 4, atom2: 0, order: 1 },
    { atom1: 0, atom2: 5, order: 1 },
    { atom1: 2, atom2: 6, order: 1 },
    { atom1: 6, atom2: 7, order: 1 },
    { atom1: 7, atom2: 8, order: 1 },
    { atom1: 8, atom2: 9, order: 1 },
    { atom1: 9, atom2: 10, order: 1 },
    { atom1: 3, atom2: 11, order: 1 },
    { atom1: 4, atom2: 12, order: 1 },
    { atom1: 12, atom2: 13, order: 1 },
    { atom1: 13, atom2: 14, order: 1 },
  ]
};

export const MoleculeRendererEngine: React.FC<MoleculeRendererEngineProps> = ({
  structure = DEFAULT_LIGAND,
  autoRotate: initialAutoRotate = true,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [renderMode, setRenderMode] = useState<'ball_stick' | 'spacefill'>('ball_stick');
  const [isRotating, setIsRotating] = useState<boolean>(initialAutoRotate);
  const [hoveredAtom, setHoveredAtom] = useState<AtomData | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer setup
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 14);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    // Clear previous children
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 2. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dirLight1.position.set(10, 10, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xa855f7, 0.9);
    dirLight2.position.set(-10, -10, -10);
    scene.add(dirLight2);

    // 3. Molecule Parent Group
    const moleculeGroup = new THREE.Group();

    // Calculate center of mass to center the molecule
    let cx = 0, cy = 0, cz = 0;
    structure.atoms.forEach((a) => {
      cx += a.x;
      cy += a.y;
      cz += a.z;
    });
    cx /= structure.atoms.length;
    cy /= structure.atoms.length;
    cz /= structure.atoms.length;

    const atomMeshes: THREE.Mesh[] = [];

    // Render Atoms
    structure.atoms.forEach((atom) => {
      const radius = renderMode === 'spacefill'
        ? (ATOM_RADII[atom.element] || 0.5) * 1.4
        : (ATOM_RADII[atom.element] || 0.5) * 0.7;

      const geometry = new THREE.SphereGeometry(radius, 32, 32);
      const color = CPK_COLORS[atom.element] || 0x38bdf8;
      
      const material = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.2,
        metalness: 0.3,
        emissive: color,
        emissiveIntensity: 0.15,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(atom.x - cx, atom.y - cy, atom.z - cz);
      mesh.userData = { atomData: atom };

      moleculeGroup.add(mesh);
      atomMeshes.push(mesh);
    });

    // Render Bonds (Only in Ball & Stick mode)
    if (renderMode === 'ball_stick') {
      structure.bonds.forEach((bond) => {
        const a1 = structure.atoms.find((a) => a.id === bond.atom1);
        const a2 = structure.atoms.find((a) => a.id === bond.atom2);

        if (a1 && a2) {
          const v1 = new THREE.Vector3(a1.x - cx, a1.y - cy, a1.z - cz);
          const v2 = new THREE.Vector3(a2.x - cx, a2.y - cy, a2.z - cz);
          const distance = v1.distanceTo(v2);

          const bondGeometry = new THREE.CylinderGeometry(0.12, 0.12, distance, 16);
          const bondMaterial = new THREE.MeshStandardMaterial({
            color: 0x475569,
            roughness: 0.3,
            metalness: 0.5,
          });

          const bondMesh = new THREE.Mesh(bondGeometry, bondMaterial);

          // Position and rotate cylinder to connect v1 and v2
          const midpoint = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);
          bondMesh.position.copy(midpoint);

          const direction = new THREE.Vector3().subVectors(v2, v1).normalize();
          const axis = new THREE.Vector3(0, 1, 0); // Default cylinder orientation
          bondMesh.quaternion.setFromUnitVectors(axis, direction);

          moleculeGroup.add(bondMesh);
        }
      });
    }

    scene.add(moleculeGroup);

    // 4. Atom Raycasting Mouse Hover Highlight
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / container.clientHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(atomMeshes);

      if (intersects.length > 0) {
        const intersectedMesh = intersects[0].object as THREE.Mesh;
        const data = intersectedMesh.userData.atomData as AtomData;
        setHoveredAtom(data);

        // Highlight effect
        (intersectedMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.6;
      } else {
        setHoveredAtom(null);
        atomMeshes.forEach((mesh) => {
          (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.15;
        });
      }
    };

    container.addEventListener('mousemove', handleMouseMove);

    // 5. Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      if (isRotating) {
        moleculeGroup.rotation.y += 0.005;
        moleculeGroup.rotation.x += 0.002;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle Container Resize
    const handleContainerResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleContainerResize);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleContainerResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
    };
  }, [structure, renderMode, isRotating]);

  return (
    <div className="relative w-full h-[450px] sm:h-[500px] glass-panel rounded-3xl overflow-hidden border border-sky-500/20 shadow-2xl flex flex-col justify-between p-4">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Top Controls Overlay */}
      <div className="relative z-10 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center space-x-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-sky-500/30 text-xs text-sky-400 font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{structure.name}</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setRenderMode((m) => (m === 'ball_stick' ? 'spacefill' : 'ball_stick'))}
            className="px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md rounded-xl border border-slate-700 text-xs font-medium text-slate-300 transition-colors flex items-center space-x-1.5"
            title="Toggle Representation Mode"
          >
            <Box className="w-3.5 h-3.5 text-sky-400" />
            <span className="capitalize">{renderMode.replace('_', ' & ')}</span>
          </button>

          <button
            onClick={() => setIsRotating((r) => !r)}
            className={`p-2 rounded-xl backdrop-blur-md border transition-colors ${
              isRotating
                ? 'bg-sky-500/20 border-sky-500/40 text-sky-400'
                : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Toggle Auto-Rotation"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin-slow' : ''}`} />
          </button>
        </div>
      </div>

      {/* Atom Hover Raycast Tooltip */}
      {hoveredAtom && (
        <div className="relative z-10 self-center bg-slate-900/95 backdrop-blur-xl px-4 py-2 rounded-2xl border border-purple-500/40 shadow-2xl text-xs flex items-center space-x-3 animate-fade-in">
          <div
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: `#${(CPK_COLORS[hoveredAtom.element] || 0x38bdf8).toString(16)}`,
            }}
          />
          <div>
            <span className="font-bold text-white">Atom #{hoveredAtom.id}: {hoveredAtom.element}</span>
            <span className="text-slate-400 ml-2">({hoveredAtom.residue || 'LIGAND'})</span>
            <div className="text-[10px] text-sky-400 font-mono">
              X: {hoveredAtom.x} | Y: {hoveredAtom.y} | Z: {hoveredAtom.z}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Floating Legend */}
      <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 bg-slate-950/60 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-800">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" />
            <span>Carbon (C)</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            <span>Oxygen (O)</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
            <span>Nitrogen (N)</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
            <span>Halogen (Cl/F)</span>
          </span>
        </div>
        <div className="flex items-center space-x-1 text-sky-400">
          <Eye className="w-3.5 h-3.5" />
          <span>Interactive WebGL Three.js Engine</span>
        </div>
      </div>
    </div>
  );
};
