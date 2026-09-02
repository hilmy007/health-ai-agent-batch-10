import React from 'react';
import {
  Activity,
  LayoutDashboard,
  Stethoscope,
  FileSpreadsheet,
  Bell,
  CheckSquare,
  BarChart3,
  Settings,
  Code2,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'predict' | 'batch' | 'alerts' | 'tasks' | 'model' | 'settings';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  openAlertsCount: number;
  onOpenCodeModal: () => void;
  serverStatus: 'online' | 'offline' | 'checking';
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openAlertsCount,
  onOpenCodeModal,
  serverStatus,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'predict', label: 'Single Patient', icon: <Stethoscope className="w-4 h-4" /> },
    { id: 'batch', label: 'Batch CSV', icon: <FileSpreadsheet className="w-4 h-4" /> },
    {
      id: 'alerts',
      label: 'Alerts (Triggers)',
      icon: <Bell className="w-4 h-4" />,
      badge: openAlertsCount,
    },
    { id: 'tasks', label: 'Tasks (Operations)', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'model', label: 'Model Insights', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Clinical Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white shadow-xs">
              <Activity className="w-4.5 h-4.5" />
            </div>
            <div className="flex items-center gap-3">
              <h1 className="font-bold text-lg sm:text-xl tracking-tight text-slate-900">
                AI Health <span className="text-teal-600">Copilot Pro</span>
              </h1>
              <span className="hidden sm:inline-flex px-2 py-0.5 bg-slate-100 text-slate-500 text-xs font-mono rounded border border-slate-200">
                v3.1.0-STABLE
              </span>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-100 text-teal-700 border border-slate-200 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <span className={isActive ? 'text-teal-600' : 'text-slate-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 bg-rose-500 text-white text-[10px] font-mono font-bold rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-3">
            {/* Status Indicators */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <span className={`w-2 h-2 rounded-full ${serverStatus === 'online' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                <span className="font-mono text-[11px]">API: {serverStatus === 'online' ? 'ONLINE' : 'CONNECTING'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                <span className="font-mono text-[11px]">MODEL: RF-DIABETES-V1</span>
              </div>
            </div>

            {/* Architecture Code Artifacts */}
            <button
              onClick={onOpenCodeModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
              title="View Chapter 10 Code Artifacts & Architecture"
            >
              <Code2 className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">Code & Schema</span>
            </button>
          </div>
        </div>

        {/* Mobile Submenu Navigation */}
        <div className="lg:hidden flex items-center space-x-1 overflow-x-auto py-2 border-t border-slate-100 scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-teal-600 text-white font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full ${isActive ? 'bg-white text-teal-700' : 'bg-rose-500 text-white'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
