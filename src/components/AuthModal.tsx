import React, { useState } from 'react';
import { X, ShieldCheck, Mail, Key, UserCheck, AlertCircle } from 'lucide-react';
import { ClimateLogo } from './ClimateLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [affiliation, setAffiliation] = useState('Academic Researcher');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl bg-surface-1 border border-slate-700/80 shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-6 space-y-2 text-center">
          <div className="flex justify-center mb-2">
            <ClimateLogo size={36} showText={false} />
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            ClimateLens Researcher Portal
          </h2>
          <p className="text-xs text-slate-400">
            Access high-frequency satellite telemetry, raw NetCDF streams, and custom scenario simulations.
          </p>
        </div>

        {isSubmitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <UserCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">Researcher Session Active</h3>
              <p className="text-xs text-slate-400">
                Logged in as <span className="text-emerald-400 font-mono">{email || 'researcher@climatelens.org'}</span> ({affiliation}). Demonstration session enabled with full API download tier.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-xs transition-colors shadow-lg shadow-emerald-500/20"
            >
              Continue to Observatory
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Institutional Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu or organization.org"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Research Role / Sector</label>
              <select
                value={affiliation}
                onChange={(e) => setAffiliation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="Academic Researcher">Academic / University Researcher</option>
                <option value="Climate Policy Analyst">Climate Policy & Governance Analyst</option>
                <option value="Environmental NGO">Environmental NGO / Non-profit</option>
                <option value="Corporate Sustainability">ESG & Corporate Sustainability</option>
                <option value="Citizen Scientist">Independent / Citizen Scientist</option>
              </select>
            </div>

            <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3 text-[11px] text-slate-400 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                Demonstration Auth: No password required. Grants instant access to full historical datasets, scenario comparison, and AI inquiries.
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs transition-colors shadow-lg shadow-emerald-500/20"
            >
              Enter Researcher Session
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
