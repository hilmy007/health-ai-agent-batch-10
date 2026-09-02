import React, { useState } from 'react';
import {
  BellRing,
  AlertTriangle,
  CheckCircle2,
  Clock,
  UserCheck,
  PlusCircle,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
  MessageSquare,
  Check,
} from 'lucide-react';
import { ClinicalAlert, AlertStatus, ClinicalTask } from '../types';

interface AlertsViewProps {
  alerts: ClinicalAlert[];
  onUpdateAlertStatus: (alertId: string, status: AlertStatus, notes?: string) => void;
  onCreateTaskFromAlert: (alert: ClinicalAlert) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  onUpdateAlertStatus,
  onCreateTaskFromAlert,
}) => {
  const [filterStatus, setFilterStatus] = useState<'ALL' | AlertStatus>('OPEN');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAlertForNotes, setSelectedAlertForNotes] = useState<string | null>(null);
  const [notesInput, setNotesInput] = useState<string>('');

  const filteredAlerts = alerts.filter((a) => {
    if (filterStatus !== 'ALL' && a.status !== filterStatus) return false;
    if (
      searchQuery &&
      !a.patient_ref.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !a.assigned_to.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const openCount = alerts.filter((a) => a.status === 'OPEN').length;
  const ackCount = alerts.filter((a) => a.status === 'ACKNOWLEDGED').length;
  const resolvedCount = alerts.filter((a) => a.status === 'RESOLVED').length;

  const handleSaveNotes = (alertId: string) => {
    const alert = alerts.find((a) => a.id === alertId);
    if (alert) {
      onUpdateAlertStatus(alertId, alert.status, notesInput);
      setSelectedAlertForNotes(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-rose-700 text-xs font-bold uppercase tracking-wider">
            <BellRing className="w-4 h-4" />
            <span>Triggers Layer • Automated Risk Surveillance</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">Clinical Alert Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Auto-triggered on deterministic biomarker violations and high-risk ML predictions (≥ 0.70 threshold).
          </p>
        </div>

        {/* Tab Filter Counters */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilterStatus('OPEN')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              filterStatus === 'OPEN'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Open ({openCount})</span>
          </button>

          <button
            onClick={() => setFilterStatus('ACKNOWLEDGED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              filterStatus === 'ACKNOWLEDGED'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Acknowledged ({ackCount})</span>
          </button>

          <button
            onClick={() => setFilterStatus('RESOLVED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              filterStatus === 'RESOLVED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Resolved ({resolvedCount})</span>
          </button>

          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterStatus === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            All ({alerts.length})
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search patient code or clinician..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-hidden focus:ring-1 focus:ring-teal-500 font-medium"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">Showing {filteredAlerts.length} Alerts</span>
      </div>

      {/* Alerts Grid / Cards */}
      <div className="space-y-4">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white rounded-2xl p-5 border transition-all shadow-xs space-y-4 ${
                alert.status === 'OPEN'
                  ? 'border-rose-300 bg-gradient-to-r from-white via-white to-rose-50/20'
                  : alert.status === 'ACKNOWLEDGED'
                  ? 'border-amber-300 bg-gradient-to-r from-white via-white to-amber-50/20'
                  : 'border-slate-200 opacity-80'
              }`}
            >
              {/* Alert Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2.5 rounded-xl ${
                      alert.status === 'OPEN'
                        ? 'bg-rose-100 text-rose-700 ring-2 ring-rose-300/30'
                        : alert.status === 'ACKNOWLEDGED'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    <ShieldAlert className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-extrabold text-slate-900">{alert.patient_ref}</span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                          alert.status === 'OPEN'
                            ? 'bg-rose-100 text-rose-800 border-rose-200'
                            : alert.status === 'ACKNOWLEDGED'
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {alert.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Age {alert.age} • Triggered: {new Date(alert.created_at).toLocaleDateString()} at{' '}
                      {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 self-end sm:self-auto">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-medium">Model Probability</span>
                    <span className="text-base font-extrabold text-rose-700">
                      {(alert.probability * 100).toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1">(Threshold: 70%)</span>
                  </div>
                </div>
              </div>

              {/* Flags & Clinical Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Abnormal Clinical Flags:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {alert.flags.map((flag, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-900"
                      >
                        {flag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Assigned Lead Clinician:
                  </span>
                  <div className="flex items-center space-x-2 text-xs text-slate-800 font-medium bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <UserCheck className="w-4 h-4 text-teal-600" />
                    <span>{alert.assigned_to || 'Unassigned Care Lead'}</span>
                  </div>
                </div>
              </div>

              {/* Clinical Notes Section */}
              {alert.notes && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                  <span className="font-bold text-slate-900 mr-1.5">Clinical Note:</span>
                  {alert.notes}
                </div>
              )}

              {/* Note Editor Drawer if opened */}
              {selectedAlertForNotes === alert.id && (
                <div className="p-3 rounded-xl bg-teal-50/50 border border-teal-200 space-y-2">
                  <label className="text-xs font-bold text-teal-900 block">Add / Update Clinician Log Note</label>
                  <textarea
                    rows={2}
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-teal-300 bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-500 font-medium"
                    placeholder="Enter diagnostic orders sent, patient communication notes, or referral status..."
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setSelectedAlertForNotes(null)}
                      className="px-3 py-1 text-xs text-slate-600 hover:text-slate-900"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveNotes(alert.id)}
                      className="px-3 py-1 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold"
                    >
                      Save Note
                    </button>
                  </div>
                </div>
              )}

              {/* Status Action Buttons & Escalate to Operation */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                {/* Status transitions */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400 font-medium">Status:</span>
                  {alert.status !== 'OPEN' && (
                    <button
                      onClick={() => onUpdateAlertStatus(alert.id, 'OPEN')}
                      className="px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors"
                    >
                      Mark Open
                    </button>
                  )}
                  {alert.status !== 'ACKNOWLEDGED' && (
                    <button
                      onClick={() => onUpdateAlertStatus(alert.id, 'ACKNOWLEDGED')}
                      className="px-2.5 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-50 rounded-lg border border-amber-200 transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}
                  {alert.status !== 'RESOLVED' && (
                    <button
                      onClick={() => onUpdateAlertStatus(alert.id, 'RESOLVED')}
                      className="px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-lg border border-emerald-200 transition-colors flex items-center space-x-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>Resolve</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedAlertForNotes(alert.id);
                      setNotesInput(alert.notes || '');
                    }}
                    className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors flex items-center space-x-1"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>Note</span>
                  </button>
                </div>

                {/* Escalate to Operational Task (ITDO Framework) */}
                <button
                  onClick={() => onCreateTaskFromAlert(alert)}
                  className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Escalate to Task Kanban</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No {filterStatus} Alerts Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              All clinical surveillance thresholds are currently acknowledged or no matching alerts found for your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
