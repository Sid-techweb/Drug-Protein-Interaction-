import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { usePasteProtein, useUploadFASTA, useSearchUniProt } from '../../hooks/useProtein';
import { useToast } from '../../contexts/ToastContext';
import { Protein } from '../../types';
import { FileText, Upload, Search, Dna, CheckCircle2, Sparkles } from 'lucide-react';

interface ProteinInputPanelProps {
  onProteinCreated: (protein: Protein) => void;
}

export const ProteinInputPanel: React.FC<ProteinInputPanelProps> = ({ onProteinCreated }) => {
  const [activeTab, setActiveTab] = useState<'paste' | 'fasta' | 'uniprot'>('uniprot');
  
  // Paste Form State
  const [proteinName, setProteinName] = useState('');
  const [rawSequence, setRawSequence] = useState('');
  const [organism, setOrganism] = useState('Homo sapiens');
  
  // UniProt Search State
  const [uniprotQuery, setUniprotQuery] = useState('P00533'); // Default EGFR for demonstration

  // FASTA Upload File
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { showToast } = useToast();
  
  const pasteMutation = usePasteProtein();
  const fastaMutation = useUploadFASTA();
  const uniprotMutation = useSearchUniProt();

  // Handle Paste Submit
  const handlePasteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proteinName || !rawSequence) {
      showToast('Please provide both Protein Name and Sequence.', 'error');
      return;
    }

    try {
      const res = await pasteMutation.mutateAsync({ name: proteinName, sequence: rawSequence, organism });
      showToast(`Protein '${res.name}' validated and stored in PostgreSQL!`, 'success');
      onProteinCreated(res);
      setRawSequence('');
      setProteinName('');
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Sequence validation failed.';
      showToast(msg, 'error');
    }
  };

  // Handle FASTA Submit
  const handleFASTASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      showToast('Please select a .fasta or .txt file.', 'error');
      return;
    }

    try {
      const res = await fastaMutation.mutateAsync(selectedFile);
      showToast(`FASTA file '${selectedFile.name}' parsed and stored!`, 'success');
      onProteinCreated(res);
      setSelectedFile(null);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'FASTA file validation failed.';
      showToast(msg, 'error');
    }
  };

  // Handle UniProt Search Submit
  const handleUniProtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uniprotQuery.trim()) {
      showToast('Please enter a UniProt Accession or Gene Symbol.', 'error');
      return;
    }

    try {
      const res = await uniprotMutation.mutateAsync(uniprotQuery.trim());
      showToast(`Fetched UniProt entry '${res.name}' (${res.accession_id}) dynamically!`, 'success');
      onProteinCreated(res);
    } catch (err: any) {
      const msg = err.message || err.response?.data?.detail || 'UniProt search failed.';
      showToast(msg, 'error');
    }
  };

  return (
    <Card glowColor="cyan" className="p-6">
      
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Dna className="w-5 h-5 text-purple-600 dark:text-sky-400" />
            <span>Target Protein Intelligence Input</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Prepare target sequence using UniProt REST lookup, FASTA file upload, or manual paste.
          </p>
        </div>

        {/* 3-Tab Controls */}
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('uniprot')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
              activeTab === 'uniprot'
                ? 'bg-purple-100 text-purple-700 border border-purple-300 dark:bg-sky-500/20 dark:text-sky-400 dark:border-sky-500/40 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>UniProt Search</span>
          </button>

          <button
            onClick={() => setActiveTab('paste')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
              activeTab === 'paste'
                ? 'bg-purple-100 text-purple-700 border border-purple-300 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/40 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Paste Sequence</span>
          </button>

          <button
            onClick={() => setActiveTab('fasta')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
              activeTab === 'fasta'
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload FASTA</span>
          </button>
        </div>
      </div>

      {/* Tab 1: UniProt Search */}
      {activeTab === 'uniprot' && (
        <form onSubmit={handleUniProtSubmit} className="space-y-4">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <Input
                label="UniProt Accession ID or Gene Symbol"
                placeholder="e.g., P00533 (EGFR), P04637 (TP53), or HER2"
                value={uniprotQuery}
                onChange={(e) => setUniprotQuery(e.target.value)}
                icon={<Search className="w-4 h-4 text-purple-600 dark:text-sky-400" />}
              />
            </div>
            <Button
              type="submit"
              variant="glow"
              disabled={uniprotMutation.isPending}
              icon={uniprotMutation.isPending ? <span className="animate-spin">⏳</span> : <Sparkles className="w-4 h-4" />}
            >
              {uniprotMutation.isPending ? 'Loading Protein Target...' : 'Load Protein'}
            </Button>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-slate-600 dark:text-slate-400 font-mono bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Executes live REST HTTP query to https://rest.uniprot.org/uniprotkb/ and calculates properties automatically.</span>
          </div>
        </form>
      )}

      {/* Tab 2: Paste Sequence */}
      {activeTab === 'paste' && (
        <form onSubmit={handlePasteSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Target Protein Name"
              placeholder="e.g. Kinase Receptor Target A"
              value={proteinName}
              onChange={(e) => setProteinName(e.target.value)}
              required
            />
            <Input
              label="Organism"
              placeholder="Homo sapiens"
              value={organism}
              onChange={(e) => setOrganism(e.target.value)}
            />
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Amino Acid Sequence (Single-Letter IUPAC)</span>
              <span className="text-[10px] text-purple-600 dark:text-sky-400 font-mono">{rawSequence.replace(/\s/g, '').length} Residues</span>
            </label>
            <textarea
              rows={4}
              placeholder="MTEYKLVVVGAGGVGKSALTIQLIQNHFVDEYDPTIEDSYRKQVVIDGETCLLDILDTAGQEEYSAMRDQYMRTGEGFLCVFAINNTKSFEDIHHYREQIKRVKDSEDVPMVLVGNKCDL..."
              value={rawSequence}
              onChange={(e) => setRawSequence(e.target.value)}
              className="w-full bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700/80 rounded-xl p-3 text-xs font-mono text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500 dark:focus:border-sky-500 focus:ring-1 focus:ring-purple-500 dark:focus:ring-sky-500 uppercase tracking-widest transition-all duration-200"
              required
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="glow"
              disabled={pasteMutation.isPending}
              icon={pasteMutation.isPending ? <span className="animate-spin">⏳</span> : <CheckCircle2 className="w-4 h-4" />}
            >
              {pasteMutation.isPending ? 'Validating Sequence...' : 'Validate & Analyze Protein'}
            </Button>
          </div>
        </form>
      )}

      {/* Tab 3: Upload FASTA */}
      {activeTab === 'fasta' && (
        <form onSubmit={handleFASTASubmit} className="space-y-4">
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500/50 rounded-2xl p-8 text-center transition-colors bg-slate-50 dark:bg-slate-900/40">
            <Upload className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
            <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
              Drag & Drop FASTA (.fasta, .fa, .txt) file here
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 mb-4">
              Standard IUPAC amino acid sequence format supported.
            </p>

            <input
              type="file"
              accept=".fasta,.fa,.txt"
              id="fasta-upload-input"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedFile(e.target.files[0]);
                }
              }}
            />
            <label
              htmlFor="fasta-upload-input"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-purple-600 dark:text-sky-400 rounded-xl cursor-pointer transition-colors border border-slate-300 dark:border-slate-700 shadow-sm"
            >
              <span>Choose File</span>
            </label>

            {selectedFile && (
              <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 mt-3">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="glow"
              disabled={!selectedFile || fastaMutation.isPending}
              icon={fastaMutation.isPending ? <span className="animate-spin">⏳</span> : <Upload className="w-4 h-4" />}
            >
              {fastaMutation.isPending ? 'Parsing FASTA...' : 'Parse & Validate FASTA'}
            </Button>
          </div>
        </form>
      )}

    </Card>
  );
};
