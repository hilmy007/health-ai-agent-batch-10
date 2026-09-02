import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { PredictorView } from './components/PredictorView';
import { BatchPredictView } from './components/BatchPredictView';
import { AlertsView } from './components/AlertsView';
import { TasksKanbanView } from './components/TasksKanbanView';
import { ModelInsightsView } from './components/ModelInsightsView';
import { SettingsView } from './components/SettingsView';
import { CodeArtifactsModal } from './components/CodeArtifactsModal';
import { NewTaskModal } from './components/NewTaskModal';
import {
  StorageService,
  SAMPLE_PRESET_PATIENTS,
} from './lib/storage';
import {
  PatientFeatures,
  PredictionResult,
  ClinicalAlert,
  ClinicalTask,
  AppSettings,
  AlertStatus,
  TaskStatus,
} from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [alerts, setAlerts] = useState<ClinicalAlert[]>([]);
  const [tasks, setTasks] = useState<ClinicalTask[]>([]);
  const [settings, setSettings] = useState<AppSettings>(StorageService.getSettings());

  // Modal states
  const [isCodeModalOpen, setIsCodeModalOpen] = useState<boolean>(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState<boolean>(false);
  const [prefilledAlertForTask, setPrefilledAlertForTask] = useState<ClinicalAlert | null>(null);

  // Selected patient features for predictor view
  const [selectedFeaturesForPredictor, setSelectedFeaturesForPredictor] = useState<PatientFeatures | undefined>(undefined);

  // Server health status
  const [serverStatus, setServerStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  // Load initial data from StorageService
  useEffect(() => {
    setPredictions(StorageService.getPredictions());
    setAlerts(StorageService.getAlerts());
    setTasks(StorageService.getTasks());
    setSettings(StorageService.getSettings());

    // Check backend health
    fetch('/api/health')
      .then((res) => (res.ok ? setServerStatus('online') : setServerStatus('offline')))
      .catch(() => setServerStatus('offline'));
  }, []);

  // Save prediction and trigger alert if high risk
  const handleSavePrediction = (result: PredictionResult, shouldCreateAlert: boolean) => {
    const updatedPredictions = StorageService.savePrediction(result);
    setPredictions(updatedPredictions);

    if (shouldCreateAlert) {
      const newAlert: Omit<ClinicalAlert, 'id' | 'created_at'> = {
        prediction_id: result.prediction_id,
        patient_id: result.patient_id,
        patient_ref: result.patient_ref,
        age: result.features.age,
        probability: result.probability,
        threshold: settings.highRiskThreshold,
        risk_level: result.risk_level,
        flags: result.flags,
        status: 'OPEN',
        assigned_to: 'Dr. Sarah Chen, MD',
        notes: `High risk ${(result.probability * 100).toFixed(1)}%. Deterministic flags: ${result.flags.join(', ')}`,
        updated_at: new Date().toISOString(),
      };
      const updatedAlerts = StorageService.saveAlert(newAlert);
      setAlerts(updatedAlerts);
    }
  };

  // Update alert status
  const handleUpdateAlertStatus = (alertId: string, status: AlertStatus, notes?: string) => {
    const updated = StorageService.updateAlertStatus(alertId, status, notes);
    setAlerts(updated);
  };

  // Escalate Alert to Task
  const handleCreateTaskFromAlert = (alert: ClinicalAlert) => {
    setPrefilledAlertForTask(alert);
    setIsNewTaskModalOpen(true);
  };

  // Create new task
  const handleCreateTask = (taskData: Omit<ClinicalTask, 'id' | 'created_at'>) => {
    const updated = StorageService.saveTask(taskData);
    setTasks(updated);

    // If linked to an alert, mark alert as ACKNOWLEDGED
    if (taskData.alert_id) {
      const updatedAlerts = StorageService.updateAlertStatus(
        taskData.alert_id,
        'ACKNOWLEDGED',
        `Task created and assigned to ${taskData.assigned_to}`
      );
      setAlerts(updatedAlerts);
    }
  };

  // Update task status
  const handleUpdateTaskStatus = (taskId: string, status: TaskStatus) => {
    const updated = StorageService.updateTaskStatus(taskId, status);
    setTasks(updated);
  };

  // Delete task
  const handleDeleteTask = (taskId: string) => {
    const updated = StorageService.deleteTask(taskId);
    setTasks(updated);
  };

  // Save settings
  const handleSaveSettings = (newSettings: AppSettings) => {
    StorageService.saveSettings(newSettings);
    setSettings(newSettings);
  };

  // Reset storage
  const handleResetStorage = () => {
    StorageService.resetToDefaults();
    setPredictions(StorageService.getPredictions());
    setAlerts(StorageService.getAlerts());
    setTasks(StorageService.getTasks());
    setSettings(StorageService.getSettings());
  };

  // Navigate to predictor with preset
  const handleNavigateToPredictWithPatient = (patientIndex: number) => {
    const p = SAMPLE_PRESET_PATIENTS[patientIndex];
    if (p) {
      setSelectedFeaturesForPredictor(p.features);
      setActiveTab('predict');
    }
  };

  // Import scored patient from batch view
  const handleImportScoredPatient = (patient: { patientRef: string; features: PatientFeatures }) => {
    setSelectedFeaturesForPredictor(patient.features);
    setActiveTab('predict');
  };

  const openAlertsCount = alerts.filter((a) => a.status === 'OPEN').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Clinical Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openAlertsCount={openAlertsCount}
        onOpenCodeModal={() => setIsCodeModalOpen(true)}
        serverStatus={serverStatus}
      />

      {/* Main Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            predictions={predictions}
            alerts={alerts}
            tasks={tasks}
            onNavigateToPredictWithPatient={handleNavigateToPredictWithPatient}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'predict' && (
          <PredictorView
            initialFeatures={selectedFeaturesForPredictor}
            settings={settings}
            onSavePredictionAndCreateAlert={handleSavePrediction}
          />
        )}

        {activeTab === 'batch' && (
          <BatchPredictView onImportScoredPatient={handleImportScoredPatient} />
        )}

        {activeTab === 'alerts' && (
          <AlertsView
            alerts={alerts}
            onUpdateAlertStatus={handleUpdateAlertStatus}
            onCreateTaskFromAlert={handleCreateTaskFromAlert}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksKanbanView
            tasks={tasks}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onDeleteTask={handleDeleteTask}
            onOpenNewTaskModal={() => {
              setPrefilledAlertForTask(null);
              setIsNewTaskModalOpen(true);
            }}
          />
        )}

        {activeTab === 'model' && <ModelInsightsView />}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onResetStorage={handleResetStorage}
          />
        )}
      </main>

      {/* Chapter 10 Code & Schema Inspection Modal */}
      <CodeArtifactsModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
      />

      {/* New Task / Alert Escalation Modal */}
      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        prefilledAlert={prefilledAlertForTask}
        onClose={() => {
          setIsNewTaskModalOpen(false);
          setPrefilledAlertForTask(null);
        }}
        onCreateTask={handleCreateTask}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AI Health Copilot Pro v3.1.0 • Chapter 10 Agentic ML Integration</span>
          <span className="text-slate-400">
            Dr. Harry Patria, Chief Data & AI Officer • Patria & Co.
          </span>
        </div>
      </footer>
    </div>
  );
}
export default App;
