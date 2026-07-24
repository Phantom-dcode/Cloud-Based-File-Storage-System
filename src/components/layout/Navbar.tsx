import React from 'react';
import { useFiles } from '../../context/FileContext';
import { useAuth } from '../../context/AuthContext';
import { FileCategory } from '../../types';
import { Search, LayoutGrid, List, Plus, Filter, HardDrive, ShieldCheck } from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    displayMode,
    setDisplayMode,
    setIsUploadModalOpen,
    setIsNewFolderModalOpen
  } = useFiles();

  const { user } = useAuth();

  const categories: { label: string; value: FileCategory | 'all' }[] = [
    { label: 'All Types', value: 'all' },
    { label: 'Documents', value: 'document' },
    { label: 'Images', value: 'image' },
    { label: 'Videos', value: 'video' },
    { label: 'Audio', value: 'audio' },
    { label: 'Code', value: 'code' },
    { label: 'Archives', value: 'archive' },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 py-2.5 flex items-center justify-between gap-4">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 w-60 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <HardDrive className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xl font-black tracking-tight text-slate-800 font-sans flex items-center gap-1.5">
            CloudVault
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200">v2.4</span>
          </span>
          <p className="text-[11px] text-slate-400 font-medium">Enterprise Cloud Storage</p>
        </div>
      </div>

      {/* Central Search Bar */}
      <div className="flex-1 max-w-2xl flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files, documents, images or code..."
            className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-slate-800 pl-10 pr-4 py-2 rounded-xl text-sm border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none font-medium placeholder:text-slate-400"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as FileCategory | 'all')}
            className="bg-slate-100 hover:bg-slate-200/70 text-slate-700 text-xs font-semibold py-2 pl-8 pr-6 rounded-xl border-none outline-none cursor-pointer appearance-none"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          <Filter className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Quick Upload Button */}
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="hidden sm:flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Upload File</span>
        </button>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/60">
          <button
            onClick={() => setDisplayMode('grid')}
            title="Grid View"
            className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
              displayMode === 'grid' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDisplayMode('table')}
            title="List View"
            className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
              displayMode === 'table' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* User Account */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="relative group cursor-pointer">
            <img
              src={user?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
              alt={user?.displayName}
              className="w-8 h-8 rounded-full border border-slate-200 object-cover"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>
        </div>
      </div>
    </header>
  );
};
