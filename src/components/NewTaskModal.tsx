import React, { useState, useEffect } from 'react';
import { X, Plus, Calendar, User, CheckSquare, Stethoscope, AlertTriangle } from 'lucide-react';
import { ClinicalTask, ClinicalAlert } from '../types';

interface NewTaskModalProps {
  isOpen: boolean;
  prefilledAlert?: ClinicalAlert | null;
  onClose: () => void;
  onCreateTask: (task: Omit<ClinicalTask, 'id' | 'created_at'>) => void;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({
  isOpen,
  prefilledAlert,
  onClose,
  onCreateTask,
}) => {
  const [patientRef, setPatientRef] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [priority, setPriority] = useState<ClinicalTask['priority']>('HIGH');
  const [intervention, setIntervention] = useState<string>('Standard 2-Hour 75g Oral Glucose Tolerance Test (OGTT)');
  const [assignedTo, setAssignedTo] = useState<string>('Dr. Sarah Chen, MD');
  const [dueDate, setDueDate] = useState<string>('');

  useEffect(() => {
    if (prefilledAlert) {
      setPatientRef(prefilledAlert.patient_ref);
      setTitle(`Confirmatory OGTT & Metabolic Workup for ${prefilledAlert.patient_ref}`);
      setDescription(
        `High risk score ${(prefilledAlert.probability * 100).toFixed(1)}%. Abnormal flags: ${prefilledAlert.flags.join(', ')}. Order fasting labs and metabolic consult.`
      );
      setPriority(prefilledAlert.probability >= 0.8 ? 'URGENT' : 'HIGH');
      setAssignedTo(prefilledAlert.assigned_to || 'Dr. Sarah Chen, MD');

      // Due date +3 days
      const d = new Date();
      d.setDate(d.getDate() + 3);
      setDueDate(d.toISOString().split('T')[0]);
    } else {
      setPatientRef('PT-8942-EV');
      setTitle('Schedule Confirmatory Diagnostic Panel');
      setDescription('Order fasting blood glucose, HbA1c, and metabolic counseling.');
      setPriority('HIGH');
      const d = new Date();
      d.setDate(d.getDate() + 3);
      setDueDate(d.toISOString().split('T')[0]);
    }
  }, [prefilledAlert, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateTask({
      patient_ref: patientRef,
      title,
      description,
      status: 'TODO',
      priority,
      intervention,
      assigned_to: assignedTo,
      due_date: dueDate,
      alert_id: prefilledAlert?.id,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl w-full max-w-lg border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                {prefilledAlert ? 'Escalate Alert to Operational Task' : 'Create Clinical Task'}
              </h3>
              <p className="text-xs text-slate-500">ITDO Clinical Operations Kanban</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Patient Reference Code
            </label>
            <input
              type="text"
              required
              value={patientRef}
              onChange={(e) => setPatientRef(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold focus:outline-hidden focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Task Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium focus:outline-hidden focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:outline-hidden focus:ring-1 focus:ring-teal-500"
              >
                <option value="URGENT">URGENT (24-48h)</option>
                <option value="HIGH">HIGH (3-5 Days)</option>
                <option value="MEDIUM">MEDIUM (1-2 Weeks)</option>
                <option value="ROUTINE">ROUTINE (30 Days)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Due Date</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:outline-hidden focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Clinical Intervention Protocol
            </label>
            <select
              value={intervention}
              onChange={(e) => setIntervention(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:outline-hidden focus:ring-1 focus:ring-teal-500"
            >
              <option value="Standard 2-Hour 75g Oral Glucose Tolerance Test (OGTT)">
                Standard 2-Hour 75g Oral Glucose Tolerance Test (OGTT)
              </option>
              <option value="Medical Nutrition Therapy & Structured Lifestyle Coaching">
                Medical Nutrition Therapy & Structured Lifestyle Coaching
              </option>
              <option value="Endocrinology Specialist Clinical Consultation">
                Endocrinology Specialist Clinical Consultation
              </option>
              <option value="Continuous Glucose Monitor (CGM) 14-Day Sensor Onboarding">
                Continuous Glucose Monitor (CGM) 14-Day Sensor Onboarding
              </option>
              <option value="Fasting Metabolic Lipid & Renal Panel Requisition">
                Fasting Metabolic Lipid & Renal Panel Requisition
              </option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Assigned Clinician
            </label>
            <input
              type="text"
              required
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium focus:outline-hidden focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Clinical Instructions / Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium focus:outline-hidden focus:ring-1 focus:ring-teal-500 leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition-colors shadow-xs"
            >
              Create Operational Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
