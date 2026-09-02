export interface PatientFeatures {
  pregnancies: number;
  glucose: number;
  bloodPressure: number;
  skinThickness: number;
  insulin: number;
  bmi: number;
  diabetesPedigreeFunction: number;
  age: number;
}

export type RiskLevel = 'low' | 'moderate' | 'high';

export interface DeterministicFlag {
  feature: string;
  featureName: string;
  value: number;
  unit: string;
  normalRange: [number, number];
  status: 'normal' | 'low' | 'high' | 'critical';
  severity: 'info' | 'warning' | 'danger';
  message: string;
}

export interface ClinicalExplanation {
  risk_level: RiskLevel;
  key_factors: string[];
  recommendation: string;
  disclaimer: string;
}

export interface PredictionResult {
  prediction_id: string;
  patient_id: string;
  patient_ref: string;
  features: PatientFeatures;
  probability: number;
  risk_level: RiskLevel;
  flags: string[];
  detailedFlags: DeterministicFlag[];
  key_factors: string[];
  recommendation: string;
  disclaimer: string;
  model_version: string;
  created_at: string;
}

export type AlertStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface ClinicalAlert {
  id: string;
  prediction_id: string;
  patient_id: string;
  patient_ref: string;
  age: number;
  probability: number;
  threshold: number;
  risk_level: RiskLevel;
  flags: string[];
  status: AlertStatus;
  assigned_to: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';

export interface ClinicalTask {
  id: string;
  alert_id?: string;
  patient_id: string;
  patient_ref: string;
  title: string;
  description: string;
  intervention: string;
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'ROUTINE';
  status: TaskStatus;
  due_date: string;
  assigned_to: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ModelMetrics {
  auc_roc: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  model_version: string;
  trained_at: string;
  model_name: string;
  total_samples: number;
  train_samples: number;
  test_samples: number;
  zero_replacement_counts: Record<string, number>;
  feature_importance: { feature: string; importance: number; rank: number }[];
  confusion_matrix: {
    true_negative: number;
    false_positive: number;
    false_negative: number;
    true_positive: number;
  };
  roc_curve: { fpr: number; tpr: number; threshold: number }[];
  pr_curve: { precision: number; recall: number; threshold: number }[];
}

export interface AppSettings {
  highRiskThreshold: number;
  moderateRiskThreshold: number;
  enableGeminiReasoning: boolean;
  selectedModel: 'RandomForest' | 'LogisticRegression';
  customDisclaimer: string;
  normalRanges: {
    glucose: [number, number];
    bloodPressure: [number, number];
    bmi: [number, number];
    age: [number, number];
  };
}
