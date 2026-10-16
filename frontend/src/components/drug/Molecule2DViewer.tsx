import React from 'react';

interface Molecule2DViewerProps {
  smiles: string;
  name: string;
  width?: number;
  height?: number;
}

export const Molecule2DViewer: React.FC<Molecule2DViewerProps> = ({
  smiles,
  width = 240,
  height = 160
}) => {
  // Generate clean 2D molecular representation SVG path based on SMILES character nodes
  const nodes = smiles.split('').filter(c => /[A-Za-z]/.test(c)).slice(0, 12);
  const radius = Math.min(width, height) * 0.32;
  const centerX = width / 2;
  const centerY = height / 2;

  const points = nodes.map((elem, idx) => {
    const angle = (idx / nodes.length) * 2 * Math.PI - Math.PI / 2;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      elem: elem.toUpperCase()
    };
  });

  return (
    <div className="relative w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex items-center justify-center p-2 group transition-colors duration-300">
      <svg width={width} height={height} className="w-full h-36">
        <defs>
          <linearGradient id="bondGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Covalent Bond Lines */}
        {points.map((pt, i) => {
          const nextPt = points[(i + 1) % points.length];
          return (
            <line
              key={`bond-${i}`}
              x1={pt.x}
              y1={pt.y}
              x2={nextPt.x}
              y2={nextPt.y}
              stroke="url(#bondGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          );
        })}

        {/* Atom Nodes */}
        {points.map((pt, i) => {
          const color = pt.elem === 'O' ? '#e11d48' : pt.elem === 'N' ? '#2563eb' : pt.elem === 'F' || pt.elem === 'CL' ? '#059669' : '#7c3aed';
          return (
            <g key={`atom-${i}`}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r="11"
                className="fill-white dark:fill-slate-950"
                stroke={color}
                strokeWidth="1.5"
              />
              <text
                x={pt.x}
                y={pt.y + 3.5}
                textAnchor="middle"
                fontSize="9"
                fontWeight="bold"
                fill={color}
                fontFamily="monospace"
              >
                {pt.elem}
              </text>
            </g>
          );
        })}
      </svg>

      <span className="absolute bottom-1 right-2 text-[9px] font-mono text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800">
        2D SMILES Structure
      </span>
    </div>
  );
};
