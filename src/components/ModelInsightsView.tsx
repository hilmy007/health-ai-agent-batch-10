import React from 'react';
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  FileCode,
  Layers,
  Database,
  Cpu,
  Workflow,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
} from 'recharts';
import { FEATURE_IMPORTANCE_DATA, ZERO_AUDIT_DATA, MODEL_METRICS } from '../lib/mlEngine';

// Simulated ROC Curve data points (AUC 0.852)
const ROC_CURVE_DATA = [
  { fpr: 0.0, tpr: 0.0, baseline: 0.0 },
  { fpr: 0.02, tpr: 0.28, baseline: 0.02 },
  { fpr: 0.06, tpr: 0.52, baseline: 0.06 },
  { fpr: 0.12, tpr: 0.68, baseline: 0.12 },
  { fpr: 0.18, tpr: 0.77, baseline: 0.18 },
  { fpr: 0.25, tpr: 0.83, baseline: 0.25 },
  { fpr: 0.35, tpr: 0.89, baseline: 0.35 },
  { fpr: 0.50, tpr: 0.94, baseline: 0.50 },
  { fpr: 0.70, tpr: 0.98, baseline: 0.70 },
  { fpr: 1.0, tpr: 1.0, baseline: 1.0 },
];

export const ModelInsightsView: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2 text-teal-700 text-xs font-bold uppercase tracking-wider">
          <BarChart3 className="w-4 h-4" />
          <span>Machine Learning Governance & CRISP-DM Methodology</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
          Model Insights, Evaluation & Feature Attribution
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Standardized scikit-learn Pipeline architecture with Median Imputation, StandardScaler, and Calibrated Random Forest Ensemble (AUC-ROC 0.852).
        </p>
      </div>

      {/* Model KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-teal-200 shadow-xs bg-gradient-to-b from-white to-teal-50/30">
          <span className="text-xs text-teal-700 font-bold uppercase tracking-wider">AUC-ROC (Primary)</span>
          <div className="text-2xl font-extrabold text-teal-950 mt-1">{MODEL_METRICS.auc_roc.toFixed(3)}</div>
          <span className="text-[11px] text-teal-600 font-medium">5-Fold Stratified CV</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Accuracy</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{(MODEL_METRICS.accuracy * 100).toFixed(1)}%</div>
          <span className="text-[11px] text-slate-500">Test Cohort (n=154)</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Precision</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{(MODEL_METRICS.precision * 100).toFixed(1)}%</div>
          <span className="text-[11px] text-slate-500">Positive Predictive Val</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Recall (Sensitivity)</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{(MODEL_METRICS.recall * 100).toFixed(1)}%</div>
          <span className="text-[11px] text-slate-500">True Positive Rate</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">F1-Score</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{MODEL_METRICS.f1_score.toFixed(3)}</div>
          <span className="text-[11px] text-slate-500">Harmonic Mean</span>
        </div>
      </div>

      {/* CRISP-DM 6 Phases Step-Through */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center">
          <Workflow className="w-4 h-4 text-teal-600 mr-2" />
          The CRISP-DM 6-Phase Clinical Workflow
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs font-extrabold text-teal-700 uppercase">Phase 1</span>
            <h3 className="font-bold text-slate-900 text-sm mt-0.5">Business & Clinical Understanding</h3>
            <p className="text-xs text-slate-600 mt-1">
              Framing Type-2 Diabetes as a proactive risk screening problem to prevent cardiovascular and renal complications before symptoms appear.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs font-extrabold text-teal-700 uppercase">Phase 2</span>
            <h3 className="font-bold text-slate-900 text-sm mt-0.5">Data Understanding & Biological Zeros</h3>
            <p className="text-xs text-slate-600 mt-1">
              Auditing 768 patient records for physiologically impossible zeros (Insulin 48.7%, SkinThickness 29.6%, Glucose 0.65%, BP 4.56%, BMI 1.43%).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs font-extrabold text-teal-700 uppercase">Phase 3</span>
            <h3 className="font-bold text-slate-900 text-sm mt-0.5">Data Preparation & Pipeline</h3>
            <p className="text-xs text-slate-600 mt-1">
              Scikit-learn `Pipeline([('imputer', SimpleImputer(median)), ('scaler', StandardScaler()), ('clf', Model)])` preventing data leakage.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs font-extrabold text-teal-700 uppercase">Phase 4</span>
            <h3 className="font-bold text-slate-900 text-sm mt-0.5">Modeling & Interaction Effects</h3>
            <p className="text-xs text-slate-600 mt-1">
              Calibrated ensemble leveraging Logistic Regression baseline and Random Forest non-linear biomarker interactions.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs font-extrabold text-teal-700 uppercase">Phase 5</span>
            <h3 className="font-bold text-slate-900 text-sm mt-0.5">Evaluation & Clinical Thresholds</h3>
            <p className="text-xs text-slate-600 mt-1">
              Stratified 5-Fold Cross-Validation, AUC-ROC 0.852, with calibrated alert threshold set at 0.70 to balance clinical sensitivity.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs font-extrabold text-teal-700 uppercase">Phase 6</span>
            <h3 className="font-bold text-slate-900 text-sm mt-0.5">Deployment & Closed-Loop ITDO</h3>
            <p className="text-xs text-slate-600 mt-1">
              FastAPI REST service, structured Gemini agent reasoning, and Kanban operational task execution for complete clinical closed-loop care.
            </p>
          </div>
        </div>
      </div>

      {/* Charts Grid: Feature Importance & ROC Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Importance Bar Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-slate-900">Feature Importance Ranking</h3>
            <span className="text-xs text-slate-500 font-medium">Random Forest Gini Impurity</span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Relative contribution of each clinical feature to T2D probability calculation.
          </p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={FEATURE_IMPORTANCE_DATA} layout="vertical" margin={{ left: 20, right: 30, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 0.35]} tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#334155' }} width={80} />
                <Tooltip
                  formatter={(value: any) => [`${(Number(value) * 100).toFixed(1)}%`, 'Contribution']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="importance" fill="#0d9488" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ROC-AUC Curve */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-slate-900">ROC Curve (Receiver Operating Characteristic)</h3>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
              AUC = 0.852
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            True Positive Rate (Sensitivity) vs False Positive Rate across all decision thresholds.
          </p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ROC_CURVE_DATA} margin={{ left: 0, right: 20, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="fpr" tick={{ fontSize: 11 }} label={{ value: 'False Positive Rate (1 - Specificity)', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                <YAxis domain={[0, 1]} tick={{ fontSize: 11 }} label={{ value: 'True Positive Rate (Sensitivity)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                <Tooltip
                  formatter={(val: any, name: string) => [
                    `${(Number(val) * 100).toFixed(1)}%`,
                    name === 'tpr' ? 'Model TPR' : 'Random Guessing Baseline',
                  ]}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="tpr" stroke="#0d9488" strokeWidth={3} dot={{ r: 3, fill: '#0d9488' }} />
                <Line type="monotone" dataKey="baseline" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Phase 2 Zero-to-NaN Data Audit Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Phase 2: Biological Zero Data Imputation Audit</h3>
            <p className="text-xs text-slate-500">
              Biomarkers where 0 represents missing laboratory records rather than actual physiological zero values.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-2.5 px-3">Biomarker Feature</th>
                <th className="py-2.5 px-3">Zero Count</th>
                <th className="py-2.5 px-3">% Missing (Zeros)</th>
                <th className="py-2.5 px-3">Biological Reality</th>
                <th className="py-2.5 px-3">Imputation Strategy</th>
                <th className="py-2.5 px-3">Median Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ZERO_AUDIT_DATA.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-bold text-slate-900">{row.feature}</td>
                  <td className="py-2.5 px-3 font-semibold text-rose-700">{row.zeroCount} / 768</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                      parseFloat(row.zeroPercentage) > 20 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {row.zeroPercentage}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{row.clinicalImpact}</td>
                  <td className="py-2.5 px-3 text-slate-700 font-medium">{row.imputationStrategy}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-teal-800">{row.medianValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
