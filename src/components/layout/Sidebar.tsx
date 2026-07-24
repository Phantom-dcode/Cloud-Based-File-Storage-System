import React, { useState } from 'react';
import { useFiles } from '../../context/FileContext';
import { ViewTab } from '../../types';
import {
  Folder,
  HardDrive,
  Users,
  Clock,
  Star,
  Trash2,
  PieChart,
  Plus,
  UploadCloud,
  FolderPlus,
  Cloud,
  ChevronRight
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    storageStats,
    setIsUploadModalOpen,
    setIsNewFolderModalOpen
  } = useFiles();

  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);

  const formatSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 GB';
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb < 0.1) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${gb.toFixed(2)} GB`;
  };

  const used = storageStats?.usedBytes || 0;
  const limit = storageStats?.limitBytes || 15 * 1024 * 1024 * 1024;
  const percent = Math.min(100, Math.round((used / limit) * 100));

  const navItems: { tab: ViewTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { tab: 'my-drive', label: 'My Drive', icon: <HardDrive className="w-4 h-4" /> },
    { tab: 'shared', label: 'Shared with me', icon: <Users className="w-4 h-4" /> },
    { tab: 'recent', label: 'Recent Files', icon: <Clock className="w-4 h-4" /> },
    { tab: 'starred', label: 'Starred', icon: <Star className="w-4 h-4" /> },
    { tab: 'trash', label: 'Trash', icon: <Trash2 className="w-4 h-4" /> },
    { tab: 'storage', label: 'Storage Details', icon: <PieChart className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-60 bg-slate-50/60 border-r border-slate-200/80 flex flex-col justify-between shrink-0 p-3 select-none">
      <div className="space-y-4">
        {/* Create / Upload Action Button */}
        <div className="relative">
          <button
            onClick={() => setIsNewMenuOpen(!isNewMenuOpen)}
            className="w-full bg-white hover:bg-slate-50 text-slate-800 font-bold px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm hover:shadow transition-all flex items-center gap-3 cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Plus className="w-4 h-4 stroke-[3]" />
            </div>
            <span className="text-sm tracking-tight">New</span>
          </button>

          {/* Action Popover Menu */}
          {isNewMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsNewMenuOpen(false)}
              ></div>
              <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    setIsNewMenuOpen(false);
                    setIsUploadModalOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4 text-blue-500" />
                  <span>Upload File</span>
                </button>

                <button
                  onClick={() => {
                    setIsNewMenuOpen(false);
                    setIsNewFolderModalOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  <FolderPlus className="w-4 h-4 text-indigo-500" />
                  <span>New Folder</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => setActiveTab(item.tab)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-white' : 'text-slate-500'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Storage Gauge */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <div className="flex items-center gap-1.5">
            <Cloud className="w-3.5 h-3.5 text-blue-600" />
            <span>Storage</span>
          </div>
          <span className="text-[11px] text-slate-500">{percent}% used</span>
        </div>

        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              percent > 90 ? 'bg-amber-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'
            }`}
            style={{ width: `${percent}%` }}
          ></div>
        </div>

        <p className="text-[11px] text-slate-500 font-medium">
          {formatSize(used)} of {formatSize(limit)}
        </p>

        <button
          onClick={() => setActiveTab('storage')}
          className="w-full mt-1 text-center text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
        >
          Manage Storage →
        </button>
      </div>
    </aside>
  );
};
