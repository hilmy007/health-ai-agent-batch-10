import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Upload,
  Download,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Search,
  RefreshCw,
  Sparkles,
  ArrowUpDown,
  FileCheck,
  FileUp,
} from 'lucide-react';
import Papa from 'papaparse';
import { PatientFeatures, PredictionResult, RiskLevel } from '../types';
import { predictDiabetesProba, flagAbnormalFeatures, getRiskLevel } from '../lib/mlEngine';

// Bundled sample PIMA CSV rows for instant evaluation
const PIMA_RAW_SAMPLE_CSV = `Pregnancies,Glucose,BloodPressure,SkinThickness,Insulin,BMI,DiabetesPedigreeFunction,Age
6,148,72,35,0,33.6,0.627,50
1,85,66,29,0,26.6,0.351,31
8,183,64,0,0,23.3,0.672,32
1,89,66,23,94,28.1,0.167,21
0,137,40,35,168,43.1,2.288,33
5,116,74,0,0,25.6,0.201,30
3,78,50,32,88,31,0.248,26
10,115,0,0,0,35.3,0.134,29
2,197,70,45,543,30.5,0.158,53
8,125,96,0,0,0,0.232,54
4,110,92,0,0,37.6,0.191,30
10,168,74,0,0,38,0.537,34
10,139,80,0,0,27.1,1.441,57
1,189,60,23,846,30.1,0.398,59
5,166,72,19,175,25.8,0.587,51
7,100,0,0,0,30,0.484,32
0,118,84,47,230,45.8,0.551,31
7,107,74,0,0,29.6,0.254,31
1,103,30,38,83,43.3,0.183,33
1,115,70,30,96,34.6,0.529,32
3,126,88,41,235,39.3,0.704,27
8,99,84,0,0,35.4,0.388,50
7,196,90,0,0,39.8,0.451,41
9,119,80,35,0,29,0.263,29
11,143,94,33,146,36.6,0.254,51
10,125,70,26,115,31.1,0.205,41
7,147,76,0,0,39.4,0.257,43
1,97,66,15,140,23.2,0.487,22
13,145,82,19,110,22.2,0.245,57
5,117,92,0,0,34.1,0.337,38
5,109,75,26,0,36,0.546,60
3,158,76,36,245,31.6,0.851,28
3,88,58,11,54,24.8,0.267,22
6,92,92,0,0,19.9,0.188,28
10,122,78,31,0,27.6,0.512,45
4,103,60,33,192,24,0.966,33
11,138,76,0,0,33.2,0.42,35
9,102,76,37,0,32.9,0.665,46
2,90,68,42,0,38.2,0.503,27
4,111,72,47,207,37.1,1.39,56
3,180,64,25,70,34,0.271,26
7,133,84,0,0,40.2,0.696,37
7,106,92,18,0,22.7,0.235,48
9,171,110,24,240,45.4,0.721,54
7,159,64,0,0,27.4,0.294,40
0,180,66,39,0,42,1.893,25
1,146,56,0,0,29.7,0.564,29
2,71,70,27,0,28,0.586,22
7,103,66,32,0,39.1,0.344,31
7,105,0,0,0,0,0.305,24`;

interface ScoredPatient {
  id: string;
  patientRef: string;
  features: PatientFeatures;
  probability: number;
  riskLevel: RiskLevel;
  flags: string[];
}

interface BatchPredictViewProps {
  onImportScoredPatient: (patient: ScoredPatient) => void;
}

export const BatchPredictView: React.FC<BatchPredictViewProps> = ({ onImportScoredPatient }) => {
  const [patients, setPatients] = useState<ScoredPatient[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterRisk, setFilterRisk] = useState<'ALL' | 'high' | 'moderate' | 'low'>('ALL');
  const [sortField, setSortField] = useState<'probability' | 'glucose' | 'bmi' | 'age'>('probability');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Process CSV string into scored patients
  const processCSVText = (csvString: string) => {
    setIsProcessing(true);
    Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        const rows = results.data as any[];
        const scored: ScoredPatient[] = rows.map((row, idx) => {
          const features: PatientFeatures = {
            pregnancies: Number(row.Pregnancies ?? row.pregnancies ?? 0),
            glucose: Number(row.Glucose ?? row.glucose ?? 0),
            bloodPressure: Number(row.BloodPressure ?? row.bloodPressure ?? 0),
            skinThickness: Number(row.SkinThickness ?? row.skinThickness ?? 0),
            insulin: Number(row.Insulin ?? row.insulin ?? 0),
            bmi: Number(row.BMI ?? row.bmi ?? 0),
            diabetesPedigreeFunction: Number(row.DiabetesPedigreeFunction ?? row.diabetesPedigreeFunction ?? 0.35),
            age: Number(row.Age ?? row.age ?? 30),
          };

          const prob = predictDiabetesProba(features);
          const risk = getRiskLevel(prob);
          const flags = flagAbnormalFeatures(features).map((f) => f.message);

          return {
            id: `batch-p-${idx + 1}`,
            patientRef: `PT-COHORT-${String(idx + 1).padStart(3, '0')}`,
            features,
            probability: prob,
            riskLevel: risk,
            flags,
          };
        });

        setPatients(scored);
        setIsProcessing(false);
      },
      error: (err) => {
        console.error('CSV Parsing Error:', err);
        setIsProcessing(false);
      },
    });
  };

  // Load sample dataset
  const handleLoadSamplePima = () => {
    processCSVText(PIMA_RAW_SAMPLE_CSV);
  };

  // Handle file input
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) processCSVText(content);
      };
      reader.readAsText(file);
    }
  };

  // Export scored CSV
  const handleExportCSV = () => {
    if (patients.length === 0) return;
    const exportRows = patients.map((p) => ({
      PatientRef: p.patientRef,
      RiskProbability: (p.probability * 100).toFixed(1) + '%',
      RiskLevel: p.riskLevel.toUpperCase(),
      Pregnancies: p.features.pregnancies,
      Glucose: p.features.glucose,
      BloodPressure: p.features.bloodPressure,
      SkinThickness: p.features.skinThickness,
      Insulin: p.features.insulin,
      BMI: p.features.bmi,
      DiabetesPedigreeFunction: p.features.diabetesPedigreeFunction,
      Age: p.features.age,
      AbnormalFlags: p.flags.join('; '),
    }));

    const csv = Papa.unparse(exportRows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ai_health_copilot_scored_cohort_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtering and Sorting
  const filteredPatients = patients
    .filter((p) => {
      if (filterRisk !== 'ALL' && p.riskLevel !== filterRisk) return false;
      if (
        searchQuery &&
        !p.patientRef.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !p.flags.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()))
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      let valA = a.probability;
      let valB = b.probability;
      if (sortField === 'glucose') {
        valA = a.features.glucose;
        valB = b.features.glucose;
      } else if (sortField === 'bmi') {
        valA = a.features.bmi;
        valB = b.features.bmi;
      } else if (sortField === 'age') {
        valA = a.features.age;
        valB = b.features.age;
      }
      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });

  const highRiskCount = patients.filter((p) => p.riskLevel === 'high').length;
  const moderateRiskCount = patients.filter((p) => p.riskLevel === 'moderate').length;
  const lowRiskCount = patients.filter((p) => p.riskLevel === 'low').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-teal-700 text-xs font-bold uppercase tracking-wider">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Population Health & Cohort Screening</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">Batch CSV Patient Risk Scoring</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Bulk inference pipeline with median zero-imputation, standard scaling, and deterministic abnormal flag generation.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleLoadSamplePima}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition-all flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Load 50-Patient PIMA Cohort</span>
          </button>

          {patients.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all flex items-center space-x-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Scored CSV ({patients.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Upload Zone */}
      {patients.length === 0 && (
        <div className="bg-white rounded-2xl p-10 border-2 border-dashed border-slate-300 hover:border-teal-500 transition-colors text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
            <FileUp className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900">Upload Patient Cohort CSV</h3>
            <p className="text-xs text-slate-500 mt-1">
              Supports standard 8-column format: Pregnancies, Glucose, BloodPressure, SkinThickness, Insulin, BMI,
              DiabetesPedigreeFunction, Age.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-colors shadow-xs">
              <span>Choose CSV File</span>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>
            <span className="text-xs text-slate-400 font-medium">or</span>
            <button
              onClick={handleLoadSamplePima}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
            >
              Try PIMA Sample Data
            </button>
          </div>
        </div>
      )}

      {/* Scored Results Section */}
      {patients.length > 0 && (
        <div className="space-y-4">
          {/* Cohort KPI Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 uppercase font-semibold">Cohort Scored</span>
              <div className="text-xl font-bold text-slate-900 mt-1">{patients.length} Patients</div>
            </div>
            <div className="bg-rose-50/70 p-4 rounded-xl border border-rose-200 shadow-xs">
              <span className="text-xs text-rose-700 uppercase font-bold">High Risk (≥ 70%)</span>
              <div className="text-xl font-bold text-rose-900 mt-1">
                {highRiskCount} ({((highRiskCount / patients.length) * 100).toFixed(1)}%)
              </div>
            </div>
            <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 shadow-xs">
              <span className="text-xs text-amber-700 uppercase font-bold">Moderate Risk</span>
              <div className="text-xl font-bold text-amber-900 mt-1">
                {moderateRiskCount} ({((moderateRiskCount / patients.length) * 100).toFixed(1)}%)
              </div>
            </div>
            <div className="bg-teal-50/70 p-4 rounded-xl border border-teal-200 shadow-xs">
              <span className="text-xs text-teal-700 uppercase font-bold">Low Risk</span>
              <div className="text-xl font-bold text-teal-900 mt-1">
                {lowRiskCount} ({((lowRiskCount / patients.length) * 100).toFixed(1)}%)
              </div>
            </div>
          </div>

          {/* Table Controls */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search patient code or flag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-hidden focus:ring-1 focus:ring-teal-500 font-medium"
              />
            </div>

            {/* Risk Filter Buttons */}
            <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto">
              {(['ALL', 'high', 'moderate', 'low'] as const).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setFilterRisk(tier)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    filterRisk === tier
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {tier.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Re-upload button */}
            <label className="cursor-pointer text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center space-x-1 shrink-0">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload New CSV</span>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Scored Cohort Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Patient Code</th>
                    <th className="py-3 px-4">
                      <button
                        onClick={() => {
                          setSortField('probability');
                          setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
                        }}
                        className="flex items-center space-x-1 hover:text-slate-900 cursor-pointer"
                      >
                        <span>T2D Probability</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-3 px-4">Risk Tier</th>
                    <th className="py-3 px-4">
                      <button
                        onClick={() => {
                          setSortField('glucose');
                          setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
                        }}
                        className="flex items-center space-x-1 hover:text-slate-900 cursor-pointer"
                      >
                        <span>Glucose</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-3 px-4">
                      <button
                        onClick={() => {
                          setSortField('bmi');
                          setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
                        }}
                        className="flex items-center space-x-1 hover:text-slate-900 cursor-pointer"
                      >
                        <span>BMI</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-3 px-4">
                      <button
                        onClick={() => {
                          setSortField('age');
                          setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
                        }}
                        className="flex items-center space-x-1 hover:text-slate-900 cursor-pointer"
                      >
                        <span>Age</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-3 px-4">Biomarker Flags</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPatients.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 font-mono">{p.patientRef}</td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-sm text-slate-900">
                          {(p.probability * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                            p.riskLevel === 'high'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : p.riskLevel === 'moderate'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-teal-50 text-teal-700 border-teal-200'
                          }`}
                        >
                          {p.riskLevel}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <span className={`font-semibold ${p.features.glucose > 99 ? 'text-rose-700' : 'text-slate-700'}`}>
                          {p.features.glucose}
                        </span>
                        <span className="text-slate-400 text-[10px] ml-1">mg/dL</span>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <span className={`font-semibold ${p.features.bmi > 24.9 ? 'text-amber-700' : 'text-slate-700'}`}>
                          {p.features.bmi}
                        </span>
                        <span className="text-slate-400 text-[10px] ml-1">kg/m²</span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-mono">{p.features.age} yrs</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {p.flags.length > 0 ? (
                            p.flags.slice(0, 2).map((fl, fi) => (
                              <span
                                key={fi}
                                className="inline-block px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] max-w-[150px] truncate"
                                title={fl}
                              >
                                {fl.split('—')[0]}
                              </span>
                            ))
                          ) : (
                            <span className="text-emerald-700 text-[11px] font-medium">Normal</span>
                          )}
                          {p.flags.length > 2 && (
                            <span className="text-[10px] text-slate-400 font-bold">+{p.flags.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onImportScoredPatient(p)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-teal-700 hover:bg-teal-50 border border-teal-200/60 transition-colors cursor-pointer"
                        >
                          Load Case
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
