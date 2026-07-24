import React from 'react';
import { useFiles } from '../../context/FileContext';
import {
  HardDrive,
  FileImage,
  FileText,
  FileVideo,
  FileAudio,
  FileCode,
  Archive,
  Cloud,
  CheckCircle2,
  Lock,
  Database
} from 'lucide-react';

export const StorageWidget: React.FC = () => {
  const { storageStats } = useFiles();

  const formatSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const used = storageStats?.usedBytes || 0;
  const limit = storageStats?.limitBytes || 15 * 1024 * 1024 * 1024;
  const percent = Math.min(100, Math.round((used / limit) * 100));

  const categories = [
    { key: 'image', label: 'Images', icon: <FileImage className="w-5 h-5 text-emerald-500" />, color: 'bg-emerald-500' },
    { key: 'document', label: 'Documents', icon: <FileText className="w-5 h-5 text-blue-500" />, color: 'bg-blue-500' },
    { key: 'video', label: 'Videos', icon: <FileVideo className="w-5 h-5 text-purple-500" />, color: 'bg-purple-500' },
    { key: 'audio', label: 'Audio', icon: <FileAudio className="w-5 h-5 text-pink-500" />, color: 'bg-pink-500' },
    { key: 'code', label: 'Code & Dev', icon: <FileCode className="w-5 h-5 text-amber-500" />, color: 'bg-amber-500' },
    { key: 'archive', label: 'Archives', icon: <Archive className="w-5 h-5 text-orange-500" />, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Main Storage Gauge Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-md">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/20 text-xs font-bold">
              <Cloud className="w-3.5 h-3.5" />
              <span>AWS S3 & Firestore Engine</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">Cloud Capacity</h2>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Your files are synchronized with AWS S3 Object Storage and Firestore Metadata with end-to-end encryption.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 min-w-[260px] space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-2xl font-black">{formatSize(used)}</span>
              <span className="text-xs text-slate-300 font-semibold">of {formatSize(limit)}</span>
            </div>

            <div className="w-full h-3 bg-slate-700/80 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 transition-all duration-700"
                style={{ width: `${percent}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-300 font-semibold">
              <span>{percent}% Consumed</span>
              <span>{(100 - percent).toFixed(0)}% Free</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const catBytes = storageStats?.byCategory[cat.key as keyof typeof storageStats.byCategory] || 0;
          return (
            <div
              key={cat.key}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:shadow-md transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-slate-50 rounded-xl">{cat.icon}</div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{cat.label}</h4>
                  <p className="text-xs font-black text-slate-900 mt-0.5">{formatSize(catBytes)}</p>
                </div>
              </div>

              <div className={`w-2.5 h-2.5 rounded-full ${cat.color}`}></div>
            </div>
          );
        })}
      </div>

      {/* Security & Infrastructure Panel */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
          Cloud Infrastructure & Security Controls
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-slate-800 block">Pre-signed S3 URLs</span>
              <span className="text-[10px] text-slate-400 font-medium">1-hour expired secure access</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <Lock className="w-4 h-4 text-blue-500 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-slate-800 block">Firestore ABAC Security</span>
              <span className="text-[10px] text-slate-400 font-medium">User isolation rules enforced</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <Database className="w-4 h-4 text-purple-500 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-slate-800 block">Automatic File Versioning</span>
              <span className="text-[10px] text-slate-400 font-medium">Version history timeline preserved</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
