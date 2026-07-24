import React from 'react';
import { useFiles } from '../../context/FileContext';
import { ChevronRight, Folder, FolderPlus, ArrowLeft } from 'lucide-react';

export const Breadcrumbs: React.FC = () => {
  const {
    folderPath,
    navigateToFolder,
    navigateUp,
    activeTab,
    setIsNewFolderModalOpen
  } = useFiles();

  if (activeTab !== 'my-drive') {
    const titles: Record<string, string> = {
      shared: 'Shared with me',
      recent: 'Recent Files',
      starred: 'Starred Files',
      trash: 'Trash / Bin',
      storage: 'Storage Overview',
    };

    return (
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-4">
        <h1 className="text-lg font-bold text-slate-800 tracking-tight">
          {titles[activeTab] || 'Files'}
        </h1>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-4">
      {/* Path Breadcrumb */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {folderPath.length > 1 && (
          <button
            onClick={navigateUp}
            className="p-1 rounded-lg text-slate-500 hover:bg-slate-200/60 hover:text-slate-800 transition-colors mr-1 cursor-pointer"
            title="Go back up"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}

        {folderPath.map((item, index) => {
          const isLast = index === folderPath.length - 1;
          return (
            <React.Fragment key={item.folderId}>
              {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
              <button
                onClick={() => navigateToFolder(item.folderId)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isLast
                    ? 'text-slate-800 bg-slate-100 font-extrabold'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                {index === 0 && <Folder className="w-3.5 h-3.5 text-blue-500" />}
                <span>{item.name}</span>
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* New Folder Quick Action */}
      <button
        onClick={() => setIsNewFolderModalOpen(true)}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 px-2.5 py-1.5 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer"
      >
        <FolderPlus className="w-4 h-4 text-blue-500" />
        <span>New Folder</span>
      </button>
    </div>
  );
};
