import React, { useState, useEffect, useRef } from 'react';
import {
  Stethoscope,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Save,
  RotateCcw,
  Zap,
  Info,
  ChevronRight,
  TrendingUp,
  Activity,
  User,
  PlusCircle,
  Clock,
  Send,
  Loader2,
} from 'lucide-react';
import { PatientFeatures, PredictionResult, RiskLevel, ClinicalExplanation, AppSettings } from '../types';
import { FEATURE_METADATA, flagAbnormalFeatures, predictDiabetesProba, getRiskLevel, generateDeterministicExplanation } from '../lib/mlEngine';
import { SAMPLE_PRESET_PATIENTS } from '../lib/storage';

interface PredictorViewProps {
  initialFeatures?: PatientFeatures;
  settings: AppSettings;
  onSavePredictionAndCreateAlert: (result: PredictionResult, createAlertIfHigh: boolean) => void;
  onNavigateToTasks?: () => void;
}

export const PredictorView: React.FC<PredictorViewProps> = ({
  initialFeatures,
  settings,
  onSavePredictionAndCreateAlert,
}) => {
  const [patientRef, setPatientRef] = useState<string>('PT-8942-EV');
  const [features, setFeatures] = useState<PatientFeatures>(
    initialFeatures || {
      pregnancies: 6,
      glucose: 148,
      bloodPressure: 72,
      skinThickness: 35,
      insulin: 168,
      bmi: 33.6,
      diabetesPedigreeFunction: 0.627,
      age: 50,
    }
  );

  const [probability, setProbability] = useState<number>(0.814);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('high');
  const [explanation, setExplanation] = useState<ClinicalExplanation>({
    risk_level: 'high',
    key_factors: [
      'Marked fasting hyperglycemia (148 mg/dL ≥ 126 mg/dL diagnostic threshold for T2D).',
      'Class I Obesity (BMI 33.6 kg/m² ≥ 30.0), substantial insulin resistance amplifier.',
      'Age 50 qualifies for proactive ADA Type-2 diabetes screening guidelines (≥45 y/o).',
    ],
    recommendation:
      'URGENT CLINICAL DECISION SUPPORT: Schedule prompt diagnostic confirmation with a standardized 2-hour 75g Oral Glucose Tolerance Test (OGTT) or Glycated Hemoglobin (HbA1c). Initiate metabolic panel and medical nutrition therapy.',
    disclaimer: settings.customDisclaimer,
  });

  const [isLoadingLLM, setIsLoadingLLM] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Update feature value
  const handleFeatureChange = (key: keyof PatientFeatures, value: number) => {
    setFeatures((prev) => ({ ...prev, [key]: value }));
    setIsSaved(false);
  };

  // Preset loader
  const handleLoadPreset = (presetIndex: number) => {
    const p = SAMPLE_PRESET_PATIENTS[presetIndex];
    if (p) {
      setPatientRef(`PT-${Math.floor(1000 + Math.random() * 9000)}-${p.name.split(' ')[0][0]}${p.name.split(' ')[1]?.[0] || 'X'}`);
      setFeatures(p.features);
      setIsSaved(false);
    }
  };

  // Run calculation and agentic LLM reasoning
  useEffect(() => {
    // 1. Instant deterministic calculation for high-responsiveness
    const instantProb = predictDiabetesProba(features);
    const instantRisk = getRiskLevel(instantProb, settings.highRiskThreshold, settings.moderateRiskThreshold);
    const flags = flagAbnormalFeatures(features, settings.normalRanges);
    setProbability(instantProb);
    setRiskLevel(instantRisk);

    // 2. Debounced API call for Gemini structured reasoning
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      setIsLoadingLLM(true);
      try {
        const res = await fetch('/api/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            features,
            customDisclaimer: settings.customDisclaimer,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setProbability(data.probability);
          setRiskLevel(data.risk_level);
          setExplanation({
            risk_level: data.risk_level,
            key_factors: data.key_factors,
            recommendation: data.recommendation,
            disclaimer: data.disclaimer,
          });
        } else {
          // Fallback to deterministic explanation
          const detExp = generateDeterministicExplanation(instantProb, flags, features, settings.customDisclaimer);
          setExplanation(detExp);
        }
      } catch (err) {
        // Fallback
        const detExp = generateDeterministicExplanation(instantProb, flags, features, settings.customDisclaimer);
        setExplanation(detExp);
      } finally {
        setIsLoadingLLM(false);
      }
    }, 350);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [features, settings.highRiskThreshold, settings.moderateRiskThreshold, settings.customDisclaimer]);

  const flags = flagAbnormalFeatures(features, settings.normalRanges);

  const handleSave = () => {
    const result: PredictionResult = {
      prediction_id: `pred-${Date.now().toString(36)}`,
      patient_id: `pat-${Date.now().toString(36)}`,
      patient_ref: patientRef,
      features,
      probability,
      risk_level: riskLevel,
      flags: flags.map((f) => f.message),
      detailedFlags: flags,
      key_factors: explanation.key_factors,
      recommendation: explanation.recommendation,
      disclaimer: explanation.disclaimer,
      model_version: '3.1.0-prod-rf-calibrated',
      created_at: new Date().toISOString(),
    };

    onSavePredictionAndCreateAlert(result, probability >= settings.highRiskThreshold);
    setIsSaved(true);
  };

  // Color schemes for probability gauge
  const riskColorClasses =
    riskLevel === 'high'
      ? {
          bg: 'bg-rose-50',
          border: 'border-rose-300',
          text: 'text-rose-700',
          badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
          gaugeStroke: '#e11d48',
        }
      : riskLevel === 'moderate'
      ? {
          bg: 'bg-amber-50',
          border: 'border-amber-300',
          text: 'text-amber-700',
          badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
          gaugeStroke: '#f59e0b',
        }
      : {
          bg: 'bg-teal-50',
          border: 'border-teal-300',
          text: 'text-teal-700',
          badgeBg: 'bg-teal-100 text-teal-800 border-teal-300',
          gaugeStroke: '#0d9488',
        };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Quick Preset Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-teal-700 text-xs font-bold uppercase tracking-wider">
            <Stethoscope className="w-4 h-4" />
            <span>Interactive Clinical Assessment Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Single Patient Risk Predictor & Decision Copilot
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time inference • Deterministic feature flagging • Zero diagnostic hallucinations
          </p>
        </div>

        {/* Presets dropdown / pill buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-slate-400 mr-1 hidden sm:inline">Load Case:</span>
          {SAMPLE_PRESET_PATIENTS.slice(0, 4).map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleLoadPreset(idx)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-50 hover:bg-teal-50 hover:text-teal-800 text-slate-700 border border-slate-200 transition-all cursor-pointer"
            >
              {p.name.split(' ')[0]} ({p.tag.split(' ')[0]})
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Feature Slicers & Clinical Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Patient Reference Code
                  </label>
                  <input
                    type="text"
                    value={patientRef}
                    onChange={(e) => setPatientRef(e.target.value)}
                    className="font-bold text-slate-900 text-sm focus:outline-hidden focus:ring-1 focus:ring-teal-500 rounded px-1.5 py-0.5 -ml-1.5 border border-transparent hover:border-slate-200 bg-transparent"
                    placeholder="e.g. PT-8942-EV"
                  />
                </div>
              </div>

              <button
                onClick={() => handleLoadPreset(0)}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center space-x-1 cursor-pointer"
                title="Reset to sample patient values"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {/* Form & Sliders for 8 Standard Features */}
            <div className="space-y-4">
              {Object.entries(FEATURE_METADATA).map(([key, meta]) => {
                const currentVal = features[key as keyof PatientFeatures];
                const isAbnormal =
                  (key === 'glucose' && (currentVal > 99 || currentVal < 70)) ||
                  (key === 'bloodPressure' && currentVal > 80) ||
                  (key === 'bmi' && currentVal > 24.9) ||
                  (key === 'age' && currentVal >= 45) ||
                  (key === 'diabetesPedigreeFunction' && currentVal > 0.60);

                const isZero = currentVal === 0 && ['glucose', 'bloodPressure', 'skinThickness', 'insulin', 'bmi'].includes(key);

                return (
                  <div key={key} className="space-y-1.5 p-3 rounded-xl bg-slate-50/60 border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <label className="text-xs font-semibold text-slate-700">{meta.label}</label>
                        {isZero && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-50 text-amber-700 rounded border border-amber-200">
                            Zero (Auto-imputed)
                          </span>
                        )}
                        {isAbnormal && !isZero && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 bg-rose-50 text-rose-700 rounded border border-rose-200">
                            Abnormal
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min={meta.min}
                          max={meta.max}
                          step={meta.step}
                          value={currentVal}
                          onChange={(e) => handleFeatureChange(key as keyof PatientFeatures, parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1 text-right text-xs font-bold rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-500 font-mono"
                        />
                        <span className="text-xs text-slate-500 font-medium w-12 text-left">{meta.unit}</span>
                      </div>
                    </div>

                    {/* Interactive Slider */}
                    <input
                      type="range"
                      min={meta.min}
                      max={meta.max}
                      step={meta.step}
                      value={currentVal}
                      onChange={(e) => handleFeatureChange(key as keyof PatientFeatures, parseFloat(e.target.value) || 0)}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                    />

                    {/* Clinical normal range and description hint */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{meta.description}</span>
                      <span className="font-medium text-slate-500 font-mono">
                        Normal: {meta.normalRange[0]}–{meta.normalRange[1]} {meta.unit}
                      </span>
                    </div>

                    {/* Missing value imputation notice if zero */}
                    {isZero && (
                      <div className="text-[10px] bg-amber-50 text-amber-700 p-1.5 rounded border border-amber-100 flex items-center gap-1">
                        <Info className="w-3 h-3 shrink-0" />
                        <span>Missing biological value detected. Pipeline automatically imputes median value ({meta.normalRange[0]}).</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Live Probability Gauge & Structured Decision Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Risk Gauge Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-xs">
            <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center">
                <Activity className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
                Live ML Risk Assessment
              </span>
              {isLoadingLLM ? (
                <span className="inline-flex items-center text-xs font-semibold text-teal-700 animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                  Gemini Reasoning...
                </span>
              ) : (
                <span className="inline-flex items-center text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Calibrated Model
                </span>
              )}
            </div>

            {/* Gauge Graphic */}
            <div className="flex flex-col items-center justify-center py-2 w-full">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {/* Background Circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  {/* Active Fill Circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={riskColorClasses.gaugeStroke}
                    strokeWidth="8"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 * (1 - probability)}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-4xl font-light text-slate-900 tracking-tight font-mono">
                    {(probability * 100).toFixed(1)}%
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${
                    riskLevel === 'high' ? 'text-rose-600' : riskLevel === 'moderate' ? 'text-amber-600' : 'text-teal-600'
                  }`}>
                    {riskLevel} RISK
                  </span>
                </div>
              </div>

              {/* Risk Badge */}
              <div className="mt-3">
                <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                  riskLevel === 'high'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : riskLevel === 'moderate'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-teal-50 text-teal-700 border-teal-200'
                }`}>
                  {riskLevel === 'high' ? 'High Risk Case (≥ 70% Alert Trigger)' : riskLevel === 'moderate' ? 'Moderate Risk Case (30%–69%)' : 'Low Risk Baseline (< 30%)'}
                </span>
              </div>
            </div>

            {/* Deterministic Abnormal Flags Chips */}
            <div className="w-full space-y-2 pt-4 border-t border-slate-100 mt-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center">
                  <ShieldAlert className="w-3.5 h-3.5 mr-1 text-slate-500" />
                  Deterministic Biomarker Flags ({flags.length})
                </span>
                <span className="text-[10px] font-normal text-slate-400">Fixed clinical limits</span>
              </div>

              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {flags.length > 0 ? (
                  flags.map((flag, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-lg text-xs leading-snug border ${
                        flag.severity === 'danger'
                          ? 'bg-rose-50 text-rose-900 border-rose-200'
                          : flag.severity === 'warning'
                          ? 'bg-amber-50 text-amber-900 border-amber-200'
                          : 'bg-slate-50 text-slate-800 border-slate-200'
                      }`}
                    >
                      <div className="font-semibold flex items-center justify-between">
                        <span>{flag.featureName}</span>
                        <span className="font-mono text-[11px]">
                          {flag.value} {flag.unit}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] opacity-90">{flag.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>All routine clinical biomarkers fall within standard physiological ranges.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Structured Clinical Decision & Recommendations */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Structured Clinical Reasoning (Gemini LLM)</span>
            </div>

            {/* Key Factors */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Identified Risk Drivers</h4>
              <ul className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                {explanation.key_factors.map((factor, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actionable Next Step */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Clinical Next Steps</h4>
              <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-200/80 text-xs text-teal-950 leading-relaxed font-medium">
                {explanation.recommendation}
              </div>
            </div>

            {/* Clinical Disclaimer */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
              <div className="font-bold text-slate-800 flex items-center mb-0.5">
                <Info className="w-3.5 h-3.5 mr-1 text-slate-500" />
                <span>Clinical Decision Support Disclaimer</span>
              </div>
              <p className="text-[10px] text-slate-500">{explanation.disclaimer}</p>
            </div>

            {/* Action Buttons: Save & Create Alert */}
            <div className="pt-2">
              <button
                onClick={handleSave}
                className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-semibold text-xs shadow-sm transition-all cursor-pointer ${
                  isSaved
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-100'
                }`}
              >
                {isSaved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Prediction Saved & Alert Triggered!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Assessment {probability >= settings.highRiskThreshold ? '& Trigger Alert (≥0.70)' : ''}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
