import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Clock,
  User,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Trash2,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  FileCheck,
  Stethoscope,
} from 'lucide-react';
import { ClinicalTask, TaskStatus } from '../types';

interface TasksKanbanViewProps {
  tasks: ClinicalTask[];
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenNewTaskModal: () => void;
}

export const TasksKanbanView: React.FC<TasksKanbanViewProps> = ({
  tasks,
  onUpdateTaskStatus,
  onDeleteTask,
  onOpenNewTaskModal,
}) => {
  const columns: { id: TaskStatus; label: string; color: string; badgeBg: string }[] = [
    { id: 'TODO', label: 'To Do / Requisition', color: 'border-slate-300 text-slate-800', badgeBg: 'bg-slate-200 text-slate-800' },
    { id: 'IN_PROGRESS', label: 'In Progress / Protocol Active', color: 'border-amber-300 text-amber-800', badgeBg: 'bg-amber-100 text-amber-800' },
    { id: 'DONE', label: 'Completed / Diagnostic Confirmed', color: 'border-emerald-300 text-emerald-800', badgeBg: 'bg-emerald-100 text-emerald-800' },
    { id: 'CANCELLED', label: 'Cancelled / Discontinued', color: 'border-slate-200 text-slate-500', badgeBg: 'bg-slate-100 text-slate-600' },
  ];

  const getPriorityBadge = (priority: ClinicalTask['priority']) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'HIGH':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'MEDIUM':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-700 text-xs font-bold uppercase tracking-wider">
            <CheckSquare className="w-4 h-4" />
            <span>Operations Layer • ITDO Execution Kanban</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">Clinical Intervention Task Board</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Coordinate diagnostic OGTT confirmations, lifestyle education referrals, CGM onboarding, and endocrinology appointments.
          </p>
        </div>

        <button
          onClick={onOpenNewTaskModal}
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-all flex items-center space-x-1.5 shadow-xs shrink-0 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Clinical Task</span>
        </button>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          return (
            <div key={col.id} className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200 flex flex-col min-h-[500px]">
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-xs text-slate-900">{col.label}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${col.badgeBg}`}>
                    {colTasks.length}
                  </span>
                </div>
              </div>

              {/* Task Cards */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colTasks.length > 0 ? (
                  colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-3 group"
                    >
                      {/* Priority and Patient Code */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider border ${getPriorityBadge(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                        <span className="text-xs font-bold text-slate-600">{task.patient_ref}</span>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 leading-snug">{task.title}</h4>
                        {task.description && (
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                        )}
                      </div>

                      {/* Intervention Protocol Tag */}
                      <div className="p-2 rounded-lg bg-teal-50/60 border border-teal-100 text-[11px] text-teal-900 font-medium">
                        <span className="font-bold block text-[10px] text-teal-700 uppercase">Intervention:</span>
                        {task.intervention}
                      </div>

                      {/* Due date & Assignee */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{task.due_date || 'No due date'}</span>
                        </div>
                        <div className="flex items-center space-x-1 truncate max-w-[110px]" title={task.assigned_to}>
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{task.assigned_to}</span>
                        </div>
                      </div>

                      {/* Status Transition Action Buttons */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        {/* Move Left */}
                        {col.id === 'IN_PROGRESS' && (
                          <button
                            onClick={() => onUpdateTaskStatus(task.id, 'TODO')}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                            title="Move back to To Do"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {col.id === 'DONE' && (
                          <button
                            onClick={() => onUpdateTaskStatus(task.id, 'IN_PROGRESS')}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                            title="Re-open into In Progress"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {(col.id === 'TODO' || col.id === 'CANCELLED') && <div />}

                        {/* Quick Delete */}
                        <button
                          onClick={() => onDeleteTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-rose-600 transition-opacity"
                          title="Delete task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Move Right */}
                        {col.id === 'TODO' && (
                          <button
                            onClick={() => onUpdateTaskStatus(task.id, 'IN_PROGRESS')}
                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 flex items-center space-x-1"
                          >
                            <span>Start</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                        {col.id === 'IN_PROGRESS' && (
                          <button
                            onClick={() => onUpdateTaskStatus(task.id, 'DONE')}
                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 flex items-center space-x-1"
                          >
                            <span>Complete</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-40 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-400 font-medium">
                    No tasks in {col.label.split('/')[0]}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
