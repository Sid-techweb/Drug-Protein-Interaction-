import React, { useState } from 'react';
import { ArrowRight, BookOpen, Play, Sparkles, ShieldCheck, Cpu, Zap } from 'lucide-react';
import { Button } from '../ui/Button';
import { MoleculeRendererEngine } from './MoleculeRendererEngine';
import { Modal } from '../ui/Modal';
import { useNavigate } from 'react-router-dom';

export const Hero: React.FC = () => {
  const navigate = useNavigate();
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);

  return (
    <section id="home" className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headlines & Call-to-Actions */}
          <div className="lg:col-span-7 flex flex-col space-y-6 text-center lg:text-left">
            
            {/* Top Pill Badge */}
            <div className="inline-flex items-center space-x-2 self-center lg:self-start bg-white/90 dark:bg-slate-900/90 border border-purple-200 dark:border-sky-500/30 rounded-full px-4 py-1.5 backdrop-blur-md shadow-sm">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-sky-400 animate-pulse" />
              <span className="text-xs font-semibold text-purple-900 dark:text-sky-300">
                Enterprise Biotech Platform v1.0 Production Release
              </span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]">
              Quantum-Enhanced AI Platform for{' '}
              <span className="text-gradient">Intelligent Virtual Drug Screening</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-2xl">
              Accelerate drug discovery by combining Artificial Intelligence, Deep Learning,
              Quantum Optimization, Explainable AI, Interactive Molecular Visualization and Human
              Expert Feedback.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Button
                variant="glow"
                size="lg"
                icon={<ArrowRight className="w-5 h-5" />}
                onClick={() => navigate('/screening')}
              >
                Start Screening
              </Button>

              <Button
                variant="secondary"
                size="lg"
                icon={<BookOpen className="w-5 h-5 text-purple-600 dark:text-sky-400" />}
                onClick={() => window.open('/api/v1/docs', '_blank')}
              >
                Documentation
              </Button>

              <Button
                variant="outline"
                size="lg"
                icon={<Play className="w-4 h-4 text-purple-600 dark:text-purple-400 fill-purple-600 dark:fill-purple-400" />}
                onClick={() => setIsDemoModalOpen(true)}
              >
                Watch Demo
              </Button>
            </div>

            {/* Scientific Architecture Trust Badges */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-3 gap-4 text-center lg:text-left">
              <div>
                <div className="flex items-center space-x-1.5 text-sky-600 dark:text-sky-400 font-bold text-sm">
                  <Cpu className="w-4 h-4" />
                  <span>ESM-2 & EGNN</span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">Deep Transformer AI</span>
              </div>

              <div>
                <div className="flex items-center space-x-1.5 text-purple-600 dark:text-purple-400 font-bold text-sm">
                  <Zap className="w-4 h-4" />
                  <span>QUBO Quantum</span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">D-Wave Ocean SDK</span>
              </div>

              <div>
                <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  <span>PostgreSQL 15</span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">Enterprise Core</span>
              </div>
            </div>

          </div>

          {/* Right Column: Three.js Interactive WebGL 3D Molecule Center Visual */}
          <div className="lg:col-span-5 relative">
            <MoleculeRendererEngine />
          </div>

        </div>
      </div>

      {/* Watch Demo Modal */}
      <Modal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        title="HelixQ Platform Overview & Demo Architecture"
        subtitle="Quantum-Accelerated Drug Discovery Pipeline"
      >
        <div className="space-y-4">
          <div className="w-full h-56 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-sky-500/20 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center mb-4 border border-purple-300 dark:border-purple-500/40">
              <Play className="w-8 h-8 text-purple-600 dark:text-purple-400 fill-purple-600 dark:fill-purple-400 ml-1" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">Interactive Video Walkthrough</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
              Visualizes target protein sequence resolution, ESM-2 transformer embeddings, QUBO quantum annealing, and 3D ligand interaction mapping.
            </p>
          </div>
          <div className="flex justify-end pt-2">
            <Button size="sm" onClick={() => setIsDemoModalOpen(false)}>
              Close Architecture Preview
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
};
