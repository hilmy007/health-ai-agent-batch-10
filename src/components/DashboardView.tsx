import React from 'react';
import {
  Users,
  AlertTriangle,
  BellRing,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  Activity,
  Sparkles,
  Stethoscope,
  FileSpreadsheet,
  Workflow,
  ChevronRight,
  ClipboardList,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { PredictionResult, ClinicalAlert, ClinicalTask } from '../types';
import { SAMPLE_PRESET_PATIENTS } from '../lib/storage';

interface DashboardViewProps {
  predictions: PredictionResult[];
  alerts: ClinicalAlert[];
  tasks: ClinicalTask[];
  onNavigateToPredictWithPatient: (patientIndex: number) => void;
  onNavigateTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  predictions,
  alerts,
  tasks,
  onNavigateToPredictWithPatient,
  onNavigateTab,
}) => {
  const highRiskCount = predictions.filter((p) => p.risk_level === 'high').length;
  const moderateRiskCount = predictions.filter((p) => p.risk_level === 'moderate').length;
  const lowRiskCount = predictions.filter((p) => p.risk_level === 'low').length;

  const openAlertsCount = alerts.filter((a) => a.status === 'OPEN').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'TODO').length;

  const riskPieData = [
    { name: 'Low Risk (<30%)', value: lowRiskCount || 1, color: '#0d9488' }, // Teal
    { name: 'Moderate Risk (30-69%)', value: moderateRiskCount || 1, color: '#f59e0b' }, // Amber
    { name: 'High Risk (≥70%)', value: highRiskCount || 1, color: '#e11d48' }, // Rose
  ];

  const recentPredictions = predictions.slice(0, 5);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Clinical Mission Statement */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden border border-slate-800">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-3 border border-teal-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Agentic ML Clinical Risk Framework • Chapter 10</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Proactive Type-2 Diabetes Risk Stratification & Clinical Operations
          </h1>
          <p className="mt-2 text-slate-300 text-xs sm:text-sm leading-relaxed">
            Transitioning clinical practice from reactive lab results to proactive risk modelling. Powered by
            calibrated scikit-learn Pipelines, deterministic feature flagging safeguards, and structured Gemini LLM clinical reasoning.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigateTab('predict')}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition-all shadow-xs cursor-pointer"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Launch Single Predictor</span>
            </button>
            <button
              onClick={() => onNavigateTab('batch')}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-all border border-slate-700 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-teal-400" />
              <span>Score Cohort (CSV Batch)</span>
            </button>
            <button
              onClick={() => onNavigateTab('alerts')}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-200 border border-rose-800/60 font-medium text-xs transition-all cursor-pointer"
            >
              <BellRing className="w-3.5 h-3.5 text-rose-400" />
              <span>View Open Alerts ({openAlertsCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Screened */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Screened Patients</span>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-mono">{predictions.length}</div>
            <p className="text-xs text-slate-500 mt-1 flex items-center">
              <Activity className="w-3.5 h-3.5 text-teal-600 mr-1" />
              <span>Pima Indians Cohort calibrated</span>
            </p>
          </div>
        </div>

        {/* High Risk Count */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700">High Risk (≥0.70)</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-rose-700 font-mono">{highRiskCount}</div>
            <p className="text-xs text-rose-600 font-medium mt-1">
              {predictions.length ? ((highRiskCount / predictions.length) * 100).toFixed(1) : 0}% of screened population
            </p>
          </div>
        </div>

        {/* Active Alerts */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">Open Triggers (Alerts)</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <BellRing className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-amber-700 font-mono">{openAlertsCount}</div>
            <p className="text-xs text-amber-600 font-medium mt-1">
              Auto-escalated at ≥ 0.70 probability
            </p>
          </div>
        </div>

        {/* Operations Tasks */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Interventions</span>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-mono">{inProgressTasks}</div>
            <p className="text-xs text-slate-500 mt-1">
              Kanban operational tasks in flight
            </p>
          </div>
        </div>
      </div>

      {/* ITDO Framework Visual Architecture */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center">
              <Workflow className="w-4 h-4 text-teal-600 mr-2" />
              The ITDO Clinical Decision Loop (Chapter 10 Architecture)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Insights → Triggers → Decisions → Operations closed-loop workflow
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Step 1: Insight */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 hover:border-teal-300 transition-all">
            <div className="flex items-center space-x-2 text-teal-700 font-bold text-xs uppercase tracking-wider mb-2">
              <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">1</span>
              <span>Insight (ML Model)</span>
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Clinical Risk Predictor</h3>
            <p className="text-xs text-slate-600 mt-1">
              Calculates calibrated Type-2 diabetes probability using 8 standardized biomarkers (AUC-ROC: 0.852).
            </p>
          </div>

          {/* Step 2: Trigger */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 hover:border-amber-300 transition-all">
            <div className="flex items-center space-x-2 text-amber-700 font-bold text-xs uppercase tracking-wider mb-2">
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">2</span>
              <span>Trigger (Alerts)</span>
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Deterministic Flags</h3>
            <p className="text-xs text-slate-600 mt-1">
              Hard-coded normal range audits (Glucose, BP, BMI) automatically raise clinical alerts at ≥0.70 threshold.
            </p>
          </div>

          {/* Step 3: Decision */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 hover:border-cyan-300 transition-all">
            <div className="flex items-center space-x-2 text-cyan-700 font-bold text-xs uppercase tracking-wider mb-2">
              <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center text-[10px]">3</span>
              <span>Decision (LLM Agent)</span>
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Structured Reasoning</h3>
            <p className="text-xs text-slate-600 mt-1">
              Gemini LLM synthesizes deterministic flags into key drivers, clinical recommendations & disclaimers.
            </p>
          </div>

          {/* Step 4: Operation */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 hover:border-indigo-300 transition-all">
            <div className="flex items-center space-x-2 text-indigo-700 font-bold text-xs uppercase tracking-wider mb-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">4</span>
              <span>Operation (Tasks)</span>
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Actionable Kanban</h3>
            <p className="text-xs text-slate-600 mt-1">
              Assigns confirmatory OGTT lab orders, nutrition programs, and specialist consults with SLA due dates.
            </p>
          </div>
        </div>
      </div>

      {/* Middle Grid: Risk Analytics & Quick Presets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Population Risk Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 flex items-center justify-between">
            <span>Risk Tier Stratification</span>
            <span className="text-xs font-normal text-slate-500">{predictions.length} Screenings</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Distribution across clinical decision thresholds</p>

          <div className="h-52 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {riskPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val} Patients`, 'Count']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600 mr-2" />
                Low Risk (&lt; 30%)
              </span>
              <span className="font-semibold text-slate-700">{lowRiskCount} patients</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-2" />
                Moderate Risk (30%–69%)
              </span>
              <span className="font-semibold text-slate-700">{moderateRiskCount} patients</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 mr-2" />
                High Risk (≥ 70% Alert Trigger)
              </span>
              <span className="font-semibold text-rose-700">{highRiskCount} patients</span>
            </div>
          </div>
        </div>

        {/* 1-Click Preset Patient Case Launchers */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Clinical Benchmark Test Cases</h2>
              <p className="text-xs text-slate-500">
                Instantly load calibrated PIMA patient cohorts into the single predictor
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {SAMPLE_PRESET_PATIENTS.map((p, idx) => (
              <div
                key={idx}
                onClick={() => onNavigateToPredictWithPatient(idx)}
                className="group p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-teal-50/40 hover:border-teal-300 cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-teal-900 transition-colors">
                      {p.name.split('(')[0]}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        p.tag.includes('Urgent') || p.tag.includes('Critical')
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : p.tag.includes('Moderate')
                          ? 'bg-amber-100 text-amber-700 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {p.tag}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{p.description}</p>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-teal-700 font-semibold group-hover:translate-x-0.5 transition-transform">
                  <span>Load into Predictor</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Table: Recent Patient Screenings */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Patient Risk Evaluations</h2>
            <p className="text-xs text-slate-500">Live clinical logs and deterministic flagging records</p>
          </div>
          <button
            onClick={() => onNavigateTab('predict')}
            className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center space-x-1"
          >
            <span>New Assessment</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                <th className="pb-3 font-semibold">Patient ID</th>
                <th className="pb-3 font-semibold">Glucose (mg/dL)</th>
                <th className="pb-3 font-semibold">BMI (kg/m²)</th>
                <th className="pb-3 font-semibold">Age</th>
                <th className="pb-3 font-semibold">Calculated Risk</th>
                <th className="pb-3 font-semibold">Clinical Flags</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentPredictions.map((pred) => (
                <tr key={pred.prediction_id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 font-medium text-slate-900">
                    <div>{pred.patient_ref}</div>
                    <div className="text-[10px] text-slate-400">
                      {new Date(pred.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="py-3.5">
                    <span className={`font-semibold ${pred.features.glucose > 99 ? 'text-amber-700' : 'text-slate-700'}`}>
                      {pred.features.glucose}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">mg/dL</span>
                  </td>
                  <td className="py-3.5">
                    <span className={`font-semibold ${pred.features.bmi > 24.9 ? 'text-amber-700' : 'text-slate-700'}`}>
                      {pred.features.bmi}
                    </span>
                  </td>
                  <td className="py-3.5 text-slate-700">{pred.features.age} yrs</td>
                  <td className="py-3.5">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          pred.risk_level === 'high'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : pred.risk_level === 'moderate'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-teal-100 text-teal-800 border border-teal-200'
                        }`}
                      >
                        {(pred.probability * 100).toFixed(1)}% • {pred.risk_level.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {pred.flags.length > 0 ? (
                        pred.flags.slice(0, 2).map((fl, fi) => (
                          <span
                            key={fi}
                            className="inline-block text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded-md truncate max-w-[180px]"
                            title={fl}
                          >
                            {fl.split('—')[0]}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-medium">All normal</span>
                      )}
                      {pred.flags.length > 2 && (
                        <span className="text-[10px] text-slate-400 font-medium">+{pred.flags.length - 2} more</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => onNavigateTab('predict')}
                      className="px-2.5 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
