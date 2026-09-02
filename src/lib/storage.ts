import { PredictionResult, ClinicalAlert, ClinicalTask, AppSettings, PatientFeatures } from '../types';
import { flagAbnormalFeatures, predictDiabetesProba, getRiskLevel, generateDeterministicExplanation } from './mlEngine';

const STORAGE_KEYS = {
  PREDICTIONS: 'health_copilot_predictions_v3',
  ALERTS: 'health_copilot_alerts_v3',
  TASKS: 'health_copilot_tasks_v3',
  SETTINGS: 'health_copilot_settings_v3',
};

export const DEFAULT_SETTINGS: AppSettings = {
  highRiskThreshold: 0.70,
  moderateRiskThreshold: 0.30,
  enableGeminiReasoning: true,
  selectedModel: 'RandomForest',
  customDisclaimer: 'CLINICAL DECISION SUPPORT DISCLAIMER: AI Health Copilot Pro is designed to assist clinical healthcare professionals in early risk stratification. It is not an automated diagnostic system and must not replace professional clinical judgment, physical examination, or laboratory diagnostic standards.',
  normalRanges: {
    glucose: [70, 99],
    bloodPressure: [60, 80],
    bmi: [18.5, 24.9],
    age: [0, 120],
  },
};

export const SAMPLE_PRESET_PATIENTS: { name: string; tag: string; description: string; features: PatientFeatures }[] = [
  {
    name: 'Eleanor Vance (High Risk, Elevated Glucose & BMI)',
    tag: 'Urgent Alert Example',
    description: '50 y/o female, Glucose 148 mg/dL, BMI 33.6 kg/m², DPF 0.627, 6 pregnancies.',
    features: {
      pregnancies: 6,
      glucose: 148,
      bloodPressure: 72,
      skinThickness: 35,
      insulin: 168,
      bmi: 33.6,
      diabetesPedigreeFunction: 0.627,
      age: 50,
    },
  },
  {
    name: 'Maria Santos (Extreme Hyperglycemia & Obese)',
    tag: 'Critical T2D Risk',
    description: '33 y/o female, Fasting Glucose 197 mg/dL, BMI 30.5 kg/m², DPF 0.158, Insulin 543.',
    features: {
      pregnancies: 2,
      glucose: 197,
      bloodPressure: 70,
      skinThickness: 45,
      insulin: 543,
      bmi: 30.5,
      diabetesPedigreeFunction: 0.158,
      age: 53,
    },
  },
  {
    name: 'Clara Jensen (Moderate Impaired Glucose)',
    tag: 'Moderate Metabolic Risk',
    description: '31 y/o female, Glucose 115 mg/dL, BMI 28.1 kg/m², BP 66 mmHg, DPF 0.351.',
    features: {
      pregnancies: 1,
      glucose: 115,
      bloodPressure: 70,
      skinThickness: 30,
      insulin: 96,
      bmi: 34.6,
      diabetesPedigreeFunction: 0.529,
      age: 32,
    },
  },
  {
    name: 'Marcus Thorne (Optimal Normoglycemic)',
    tag: 'Low Risk Benchmark',
    description: '21 y/o female, Glucose 89 mg/dL, BMI 28.1 kg/m², BP 66 mmHg, DPF 0.167.',
    features: {
      pregnancies: 1,
      glucose: 89,
      bloodPressure: 66,
      skinThickness: 23,
      insulin: 94,
      bmi: 24.2,
      diabetesPedigreeFunction: 0.167,
      age: 21,
    },
  },
  {
    name: 'Patricia Wu (Missing Zero BP & SkinFold Audit Case)',
    tag: 'Data Quality / Zero Imputed',
    description: '32 y/o female, BloodPressure=0, SkinThickness=0, Insulin=0, Glucose 100 mg/dL.',
    features: {
      pregnancies: 7,
      glucose: 100,
      bloodPressure: 0,
      skinThickness: 0,
      insulin: 0,
      bmi: 30.0,
      diabetesPedigreeFunction: 0.484,
      age: 32,
    },
  },
];

const INITIAL_PREDICTIONS: PredictionResult[] = [
  {
    prediction_id: 'pred-701a',
    patient_id: 'pat-1001',
    patient_ref: 'PT-8942-EV',
    features: {
      pregnancies: 6,
      glucose: 148,
      bloodPressure: 72,
      skinThickness: 35,
      insulin: 168,
      bmi: 33.6,
      diabetesPedigreeFunction: 0.627,
      age: 50,
    },
    probability: 0.814,
    risk_level: 'high',
    flags: [
      'Marked hyperglycemia (148 mg/dL ≥ 126 mg/dL diagnostic threshold for T2D).',
      'Class I Obesity (BMI 33.6 kg/m² ≥ 30.0), elevated metabolic burden.',
      'Age 50 qualifies for proactive ADA Type-2 diabetes screening guidelines (≥45 y/o).',
      'Strong familial genetic predisposition (DPF score 0.63 > 0.65).',
    ],
    detailedFlags: [
      {
        feature: 'glucose',
        featureName: 'Fasting Glucose',
        value: 148,
        unit: 'mg/dL',
        normalRange: [70, 99],
        status: 'critical',
        severity: 'danger',
        message: 'Marked hyperglycemia (148 mg/dL ≥ 126 mg/dL diagnostic threshold for T2D).',
      },
      {
        feature: 'bmi',
        featureName: 'Body Mass Index',
        value: 33.6,
        unit: 'kg/m²',
        normalRange: [18.5, 24.9],
        status: 'high',
        severity: 'warning',
        message: 'Class I Obesity (BMI 33.6 kg/m² ≥ 30.0), elevated metabolic burden.',
      },
    ],
    key_factors: [
      'Fasting plasma glucose is significantly elevated at 148 mg/dL (normal: 70–99 mg/dL), above the standard 126 mg/dL threshold.',
      'BMI of 33.6 kg/m² indicates Class I obesity, substantially exacerbating peripheral insulin resistance.',
      'High genetic pedigree function (0.627) and age (50 years) compounds physiological metabolic susceptibility.',
    ],
    recommendation:
      'Urgent diagnostic confirmation indicated: Order fasting HbA1c and standard 2-hour 75g Oral Glucose Tolerance Test (OGTT). Recommend comprehensive clinical metabolic assessment and nutritional counseling.',
    disclaimer: DEFAULT_SETTINGS.customDisclaimer,
    model_version: '3.1.0-prod-rf-calibrated',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    prediction_id: 'pred-702b',
    patient_id: 'pat-1002',
    patient_ref: 'PT-3819-CJ',
    features: {
      pregnancies: 1,
      glucose: 115,
      bloodPressure: 70,
      skinThickness: 30,
      insulin: 96,
      bmi: 34.6,
      diabetesPedigreeFunction: 0.529,
      age: 32,
    },
    probability: 0.542,
    risk_level: 'moderate',
    flags: [
      'Elevated fasting glucose (115 mg/dL vs normal 70-99 mg/dL) indicating impaired fasting glycaemia.',
      'Class I Obesity (BMI 34.6 kg/m² ≥ 30.0).',
    ],
    detailedFlags: [
      {
        feature: 'glucose',
        featureName: 'Fasting Glucose',
        value: 115,
        unit: 'mg/dL',
        normalRange: [70, 99],
        status: 'high',
        severity: 'warning',
        message: 'Elevated fasting glucose (115 mg/dL vs normal 70-99 mg/dL) indicating impaired fasting glycaemia.',
      },
    ],
    key_factors: [
      'Fasting glucose of 115 mg/dL represents impaired fasting glucose (prediabetic metabolic range 100-125 mg/dL).',
      'BMI of 34.6 kg/m² presents notable metabolic loading.',
    ],
    recommendation:
      'Schedule 3-month follow-up glycemic testing. Provide medical nutrition therapy and recommend a structured 150 min/week physical activity regimen targeting a 5-7% weight reduction.',
    disclaimer: DEFAULT_SETTINGS.customDisclaimer,
    model_version: '3.1.0-prod-rf-calibrated',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    prediction_id: 'pred-703c',
    patient_id: 'pat-1003',
    patient_ref: 'PT-4921-MT',
    features: {
      pregnancies: 1,
      glucose: 89,
      bloodPressure: 66,
      skinThickness: 23,
      insulin: 94,
      bmi: 24.2,
      diabetesPedigreeFunction: 0.167,
      age: 21,
    },
    probability: 0.082,
    risk_level: 'low',
    flags: [],
    detailedFlags: [],
    key_factors: [
      'Fasting plasma glucose (89 mg/dL) is well within normal clinical limits (70–99 mg/dL).',
      'Normal BMI (24.2 kg/m²) and minimal genetic pedigree score.',
    ],
    recommendation:
      'Maintain standard preventive health surveillance. Re-screen during routine annual check-ups.',
    disclaimer: DEFAULT_SETTINGS.customDisclaimer,
    model_version: '3.1.0-prod-rf-calibrated',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];

const INITIAL_ALERTS: ClinicalAlert[] = [
  {
    id: 'alt-801',
    prediction_id: 'pred-701a',
    patient_id: 'pat-1001',
    patient_ref: 'PT-8942-EV',
    age: 50,
    probability: 0.814,
    threshold: 0.70,
    risk_level: 'high',
    flags: ['Glucose: 148 mg/dL', 'BMI: 33.6 kg/m²', 'DPF: 0.63'],
    status: 'OPEN',
    assigned_to: 'Dr. Harry Patria',
    notes: 'Urgent clinical threshold exceeded (0.814 ≥ 0.70). Immediate OGTT and endocrine review requested.',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'alt-802',
    prediction_id: 'pred-704d',
    patient_id: 'pat-1004',
    patient_ref: 'PT-2940-MS',
    age: 53,
    probability: 0.895,
    threshold: 0.70,
    risk_level: 'high',
    flags: ['Glucose: 197 mg/dL', 'Insulin: 543 µU/mL', 'BMI: 30.5 kg/m²'],
    status: 'ACKNOWLEDGED',
    assigned_to: 'Dr. Sarah Lin (Care Lead)',
    notes: 'Contacted patient via care portal. Laboratory requisition sent for confirmatory HbA1c.',
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
];

const INITIAL_TASKS: ClinicalTask[] = [
  {
    id: 'tsk-901',
    alert_id: 'alt-801',
    patient_id: 'pat-1001',
    patient_ref: 'PT-8942-EV',
    title: 'Order Confirmatory 2hr 75g OGTT & HbA1c Lab Panel',
    description: 'High risk diabetes prediction (81.4%). Patient presents fasting glucose of 148 mg/dL.',
    intervention: 'Diagnostic Confirmation (Oral Glucose Tolerance Test + HbA1c)',
    priority: 'URGENT',
    status: 'TODO',
    due_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    assigned_to: 'Dr. Harry Patria',
    created_by: 'AI Health Copilot',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'tsk-902',
    alert_id: 'alt-802',
    patient_id: 'pat-1004',
    patient_ref: 'PT-2940-MS',
    title: 'Endocrinology Consult & Continuous Glucose Monitor (CGM) Onboarding',
    description: 'Marked hyperglycemia (197 mg/dL) with hyperinsulinemia (543 µU/mL). Coordinate specialized metabolic intake.',
    intervention: 'Endocrinology Referral & Remote CGM Monitoring Setup',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    due_date: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
    assigned_to: 'Nurse Specialist Megan Ross',
    created_by: 'Dr. Sarah Lin',
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    id: 'tsk-903',
    patient_id: 'pat-1002',
    patient_ref: 'PT-3819-CJ',
    title: 'Enroll in 12-Week Intensive Diabetes Prevention Program (DPP)',
    description: 'Moderate prediabetic risk (54.2%). Fasting glucose 115 mg/dL with BMI 34.6 kg/m².',
    intervention: 'Structured Medical Nutrition Therapy & Exercise Coaching',
    priority: 'MEDIUM',
    status: 'TODO',
    due_date: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    assigned_to: 'Care Coordinator Jason Lee',
    created_by: 'AI Health Copilot',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'tsk-904',
    patient_id: 'pat-1005',
    patient_ref: 'PT-1102-RW',
    title: 'Annual Preventative Metabolic Health Panel Review',
    description: 'Completed baseline routine wellness verification. Glycemic parameters optimal.',
    intervention: 'Preventative Health Counseling',
    priority: 'ROUTINE',
    status: 'DONE',
    due_date: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0],
    assigned_to: 'Dr. Harry Patria',
    created_by: 'Dr. Harry Patria',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

export function getStoredPredictions(): PredictionResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PREDICTIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PREDICTIONS, JSON.stringify(INITIAL_PREDICTIONS));
      return INITIAL_PREDICTIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_PREDICTIONS;
  }
}

export function savePrediction(pred: PredictionResult): PredictionResult[] {
  const all = getStoredPredictions();
  const updated = [pred, ...all.filter((p) => p.prediction_id !== pred.prediction_id)];
  localStorage.setItem(STORAGE_KEYS.PREDICTIONS, JSON.stringify(updated));
  return updated;
}

export function getStoredAlerts(): ClinicalAlert[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ALERTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(INITIAL_ALERTS));
      return INITIAL_ALERTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_ALERTS;
  }
}

export function saveAlert(alert: ClinicalAlert): ClinicalAlert[] {
  const all = getStoredAlerts();
  const updated = [alert, ...all.filter((a) => a.id !== alert.id)];
  localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(updated));
  return updated;
}

export function updateAlertStatus(alertId: string, status: ClinicalAlert['status'], notes?: string): ClinicalAlert[] {
  const all = getStoredAlerts();
  const updated = all.map((a) => {
    if (a.id === alertId) {
      return {
        ...a,
        status,
        notes: notes !== undefined ? notes : a.notes,
        updated_at: new Date().toISOString(),
      };
    }
    return a;
  });
  localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(updated));
  return updated;
}

export function getStoredTasks(): ClinicalTask[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(INITIAL_TASKS));
      return INITIAL_TASKS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_TASKS;
  }
}

export function saveTask(task: ClinicalTask): ClinicalTask[] {
  const all = getStoredTasks();
  const updated = [task, ...all.filter((t) => t.id !== task.id)];
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updated));
  return updated;
}

export function updateTaskStatus(taskId: string, status: ClinicalTask['status']): ClinicalTask[] {
  const all = getStoredTasks();
  const updated = all.map((t) => {
    if (t.id === taskId) {
      return { ...t, status, updated_at: new Date().toISOString() };
    }
    return t;
  });
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updated));
  return updated;
}

export function deleteTask(taskId: string): ClinicalTask[] {
  const all = getStoredTasks();
  const updated = all.filter((t) => t.id !== taskId);
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updated));
  return updated;
}

export function getStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): AppSettings {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  return settings;
}

export function resetToDefaults(): void {
  localStorage.setItem(STORAGE_KEYS.PREDICTIONS, JSON.stringify(INITIAL_PREDICTIONS));
  localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(INITIAL_ALERTS));
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(INITIAL_TASKS));
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
}

export const StorageService = {
  getPredictions: getStoredPredictions,
  savePrediction: savePrediction,
  getAlerts: getStoredAlerts,
  saveAlert: (alertData: Omit<ClinicalAlert, 'id' | 'created_at'>): ClinicalAlert[] => {
    const alert: ClinicalAlert = {
      ...alertData,
      id: `alt-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      created_at: new Date().toISOString(),
    };
    return saveAlert(alert);
  },
  updateAlertStatus: updateAlertStatus,
  getTasks: getStoredTasks,
  saveTask: (taskData: Omit<ClinicalTask, 'id' | 'created_at'>): ClinicalTask[] => {
    const task: ClinicalTask = {
      ...taskData,
      id: `tsk-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return saveTask(task);
  },
  updateTaskStatus: updateTaskStatus,
  deleteTask: deleteTask,
  getSettings: getStoredSettings,
  saveSettings: saveSettings,
  resetToDefaults: resetToDefaults,
};

