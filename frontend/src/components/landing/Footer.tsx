import React, { useState } from 'react';
import { Dna, Github, Mail, Send } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useToast } from '../../contexts/ToastContext';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const { showToast } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    showToast('Subscribed to HelixQ Biotechnology Research Bulletins!', 'success');
    setEmail('');
  };

  return (
    <footer className="relative z-10 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800/80 pt-16 pb-12 text-slate-600 dark:text-slate-400 text-xs transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-200 dark:border-slate-900">
          
          {/* Col 1: Brand */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-purple-600 p-0.5 shadow-lg shadow-purple-500/10 dark:shadow-sky-500/20">
                <div className="w-full h-full bg-slate-900 dark:bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Dna className="w-5 h-5 text-sky-400" />
                </div>
              </div>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Helix<span className="text-gradient">Q</span>
              </span>
            </div>

            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed max-w-sm">
              Quantum-Enhanced AI Platform for Intelligent Virtual Drug Screening. Empowering global biotechnology researchers to accelerate target sequence discovery.
            </p>

            <div className="pt-2 text-slate-500 font-mono text-[11px]">
              ISO-27001 Certified | HIPAA Compliant Architecture Layer
            </div>
          </div>

          {/* Col 2: Research & Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Research & Platform</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="hover:text-purple-600 dark:hover:text-sky-400 transition-colors">Protein Intelligence</a></li>
              <li><a href="#workflow" className="hover:text-purple-600 dark:hover:text-sky-400 transition-colors">Virtual Screening</a></li>
              <li><a href="#technology" className="hover:text-purple-600 dark:hover:text-sky-400 transition-colors">QUBO Quantum Engine</a></li>
              <li><a href="#home" className="hover:text-purple-600 dark:hover:text-sky-400 transition-colors">3D Molecular WebGL</a></li>
              <li><a href="#metrics" className="hover:text-purple-600 dark:hover:text-sky-400 transition-colors">System Telemetry</a></li>
            </ul>
          </div>

          {/* Col 3: Documentation & Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Documentation</h4>
            <ul className="space-y-2">
              <li><a href="/api/v1/docs" target="_blank" rel="noreferrer" className="hover:text-purple-600 dark:hover:text-sky-400 transition-colors">FastAPI OpenAPI Specification</a></li>
              <li><a href="/api/v1/redoc" target="_blank" rel="noreferrer" className="hover:text-purple-600 dark:hover:text-sky-400 transition-colors">ReDoc API Specs</a></li>
              <li><a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-purple-600 dark:hover:text-sky-400 transition-colors flex items-center space-x-1"><Github className="w-3.5 h-3.5 inline" /> <span>GitHub Repository</span></a></li>
              <li><a href="#home" className="hover:text-purple-600 dark:hover:text-sky-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#home" className="hover:text-purple-600 dark:hover:text-sky-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          {/* Col 4: Research Newsletter */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Biotech Bulletin</h4>
            <p className="text-slate-600 dark:text-slate-400 text-xs">
              Subscribe to quarterly releases on computational chemistry, QUBO algorithms, and ESM-2 models.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2 pt-1">
              <Input
                type="email"
                placeholder="researcher@biotech.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
              />
              <Button type="submit" variant="glow" size="sm" className="w-full justify-center" icon={<Send className="w-3.5 h-3.5" />}>
                Subscribe
              </Button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} HelixQ Inc. All rights reserved. Enterprise Biotechnology Software.
          </div>
          <div className="mt-2 sm:mt-0 font-mono">
            Powered by FastAPI, PostgreSQL, PyTorch, D-Wave & React
          </div>
        </div>

      </div>
    </footer>
  );
};
