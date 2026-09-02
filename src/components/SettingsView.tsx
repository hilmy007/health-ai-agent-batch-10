import React, { useState } from 'react';
import {
  Settings,
  Save,
  RotateCcw,
  Sliders,
  Shield,
  FileText,
  Trash2,
  CheckCircle2,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsViewProps {
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  onResetStorage: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onResetStorage,
}) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const handleSave = () => {
    onSaveSettings(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleResetDefaults = () => {
    const defaults: AppSettings = {
      highRiskThreshold: 0.70,
      moderateRiskThreshold: 0.30,
      enableGeminiReasoning: true,
      selectedModel: 'RandomForest',
      customDisclaimer:
        'CLINICAL DECISION SUPPORT DISCLAIMER: AI Health Copilot Pro is an investigative analytics tool to support clinician workflows. It does not replace clinical evaluation or diagnostic lab tests.',
      normalRanges: {
        glucose: [70, 99],
        bloodPressure: [60, 80],
        bmi: [18.5, 24.9],
        age: [0, 120],
      },
    };
    setFormData(defaults);
    onSaveSettings(defaults);
    setIsSaved(true);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-teal-700 text-xs font-bold uppercase tracking-wider">
            <Settings className="w-4 h-4" />
            <span>Clinical Configuration & Thresholds</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">System & Model Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure decision thresholds, deterministic flagging ranges, and institutional disclaimer text.
          </p>
        </div>

        <button
          onClick={handleResetDefaults}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center space-x-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Decision Thresholds Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center space-x-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
          <Sliders className="w-4 h-4 text-teal-600" />
          <span>Clinical Alert & Risk Stratification Thresholds</span>
        </div>

        {/* High Risk Threshold Slider */}
        <div className="space-y-2 p-4 rounded-xl bg-rose-50/40 border border-rose-200/70">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-bold text-rose-900 block">
                High Risk Alert Trigger Threshold (Default: 0.70 / 70%)
              </label>
              <p className="text-[11px] text-rose-700 mt-0.5">
                Patients with predicted probability equal to or exceeding this threshold automatically generate an Open Trigger Alert.
              </p>
            </div>
            <span className="text-base font-extrabold text-rose-900 font-mono">
              {(formData.highRiskThreshold * 100).toFixed(0)}%
            </span>
          </div>

          <input
            type="range"
            min="0.50"
            max="0.90"
            step="0.05"
            value={formData.highRiskThreshold}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, highRiskThreshold: parseFloat(e.target.value) }))
            }
            className="w-full h-1.5 bg-rose-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
          />
        </div>

        {/* Moderate Risk Threshold Slider */}
        <div className="space-y-2 p-4 rounded-xl bg-amber-50/40 border border-amber-200/70">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-bold text-amber-900 block">
                Moderate Risk Threshold (Default: 0.30 / 30%)
              </label>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Patients with predicted probability between this value and the high-risk threshold are categorized as Moderate Risk.
              </p>
            </div>
            <span className="text-base font-extrabold text-amber-900 font-mono">
              {(formData.moderateRiskThreshold * 100).toFixed(0)}%
            </span>
          </div>

          <input
            type="range"
            min="0.15"
            max="0.45"
            step="0.05"
            value={formData.moderateRiskThreshold}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, moderateRiskThreshold: parseFloat(e.target.value) }))
            }
            className="w-full h-1.5 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
          />
        </div>
      </div>

      {/* Institutional Clinical Disclaimer Editor */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
          <Shield className="w-4 h-4 text-teal-600" />
          <span>Institutional Clinical Disclaimer</span>
        </div>
        <p className="text-xs text-slate-500">
          This disclaimer statement is mandatorily attached to all Gemini-generated clinical summaries, reports, and exported logs.
        </p>

        <textarea
          rows={3}
          value={formData.customDisclaimer}
          onChange={(e) => setFormData((prev) => ({ ...prev, customDisclaimer: e.target.value }))}
          className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-hidden focus:ring-1 focus:ring-teal-500 font-medium text-slate-800 leading-relaxed"
        />
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handleResetDefaults}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
        >
          Discard Changes
        </button>

        <button
          onClick={handleSave}
          className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-all flex items-center space-x-2 shadow-xs"
        >
          {isSaved ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
          <span>{isSaved ? 'Settings Saved Successfully!' : 'Save System Configuration'}</span>
        </button>
      </div>

      {/* Danger Zone: Storage Reset */}
      <div className="bg-rose-50/60 rounded-2xl p-6 border border-rose-200 space-y-3 mt-8">
        <div className="flex items-center space-x-2 text-rose-900 font-bold text-sm">
          <Trash2 className="w-4 h-4 text-rose-600" />
          <span>Storage & State Management</span>
        </div>
        <p className="text-xs text-rose-700 leading-relaxed">
          Reset all stored patient screening logs, active alerts, and Kanban task items back to initial Chapter 10 demo seeds.
        </p>
        <button
          onClick={() => {
            if (window.confirm('Reset all demo patient logs, alerts, and task items back to initial state?')) {
              onResetStorage();
            }
          }}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all shadow-xs"
        >
          Reset All Sample Data
        </button>
      </div>
    </div>
  );
};
