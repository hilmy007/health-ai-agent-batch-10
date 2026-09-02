import React, { useState } from 'react';
import { X, Code2, Copy, Check, FileText, Download } from 'lucide-react';
import { CODE_ARTIFACTS, CodeFile } from '../lib/codeArtifacts';

interface CodeArtifactsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CodeArtifactsModal: React.FC<CodeArtifactsModalProps> = ({ isOpen, onClose }) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentArtifact: CodeFile | undefined = CODE_ARTIFACTS[selectedIndex] || CODE_ARTIFACTS[0];

  const handleCopy = () => {
    if (currentArtifact) {
      navigator.clipboard.writeText(currentArtifact.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!currentArtifact) return;
    const blob = new Blob([currentArtifact.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = currentArtifact.path.split('/').pop() || 'artifact.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Chapter 10 Production Code Artifacts & Schemas
              </h2>
              <p className="text-xs text-slate-400">
                Full-stack FastAPI backend, Scikit-learn CRISP-DM training pipeline, Gemini agent, and Supabase SQL
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Sidebar: Artifact Selector */}
          <div className="w-full md:w-64 border-r border-slate-800 p-3 space-y-1 bg-slate-950/40 overflow-y-auto">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 block">
              Artifact Modules
            </span>
            {CODE_ARTIFACTS.map((item, idx) => {
              const isSelected = selectedIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedIndex(idx)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-medium transition-all flex flex-col cursor-pointer ${
                    isSelected
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <span className="truncate">{item.category}</span>
                  <span className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">{item.path}</span>
                </button>
              );
            })}
          </div>

          {/* Right Code Display Area */}
          <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
            {/* Artifact Info Bar */}
            {currentArtifact && (
              <div className="px-5 py-2.5 border-b border-slate-800/80 bg-slate-900/50 flex items-center justify-between text-xs">
                <span className="font-mono text-teal-400">{currentArtifact.path}</span>
                <span className="text-[11px] text-slate-400">{currentArtifact.description}</span>
              </div>
            )}

            {/* Code Pre Block */}
            <div className="flex-1 p-5 overflow-auto font-mono text-xs text-slate-300 leading-relaxed scrollbar-thin">
              <pre className="whitespace-pre">{currentArtifact?.content}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
