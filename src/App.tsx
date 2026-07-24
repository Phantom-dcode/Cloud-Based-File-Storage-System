import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { FileProvider, useFiles } from './context/FileContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Breadcrumbs } from './components/files/Breadcrumbs';
import { FileCard } from './components/files/FileCard';
import { FileTable } from './components/files/FileTable';
import { StorageWidget } from './components/dashboard/StorageWidget';
import { FilePreviewModal } from './components/files/FilePreviewModal';
import { UploadModal } from './components/files/UploadModal';
import { ShareModal } from './components/files/ShareModal';
import { VersionHistoryModal } from './components/files/VersionHistoryModal';
import { NewFolderModal } from './components/files/NewFolderModal';
import { ShareViewPage } from './components/files/ShareViewPage';
import {
  Folder,
  FolderPlus,
  UploadCloud,
  FileQuestion,
  ChevronRight,
  HardDrive
} from 'lucide-react';

const DriveContent: React.FC = () => {
  const {
    activeTab,
    files,
    folders,
    loading,
    displayMode,
    navigateToFolder,
    setIsUploadModalOpen,
    setIsNewFolderModalOpen
  } = useFiles();

  if (activeTab === 'storage') {
    return (
      <div className="space-y-6">
        <Breadcrumbs />
        <StorageWidget />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs />

      {/* Folders Section (Only in My Drive tab) */}
      {activeTab === 'my-drive' && folders.length > 0 && (
        <div className="space-y-2.5">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
            Folders ({folders.length})
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {folders.map((folder) => (
              <div
                key={folder.folderId}
                onClick={() => navigateToFolder(folder.folderId, folder.name)}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 p-3 shadow-xs hover:shadow-md transition-all flex items-center justify-between group cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Folder
                    className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110"
                    style={{ color: folder.color || '#3B82F6' }}
                  />
                  <span className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                    {folder.name}
                  </span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Files Section */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
            Files ({files.length})
          </h2>
        </div>

        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-400 font-medium">Fetching files from cloud...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center space-y-4 max-w-lg mx-auto my-8">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mx-auto">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-800">No files found</h3>
              <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto">
                {activeTab === 'trash'
                  ? 'Your trash is currently empty.'
                  : activeTab === 'starred'
                  ? 'Star important files to quickly access them here.'
                  : 'Upload files or create folders to get started with CloudVault.'}
              </p>
            </div>

            {activeTab === 'my-drive' && (
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Upload File
                </button>
                <button
                  onClick={() => setIsNewFolderModalOpen(true)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  New Folder
                </button>
              </div>
            )}
          </div>
        ) : displayMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map((file) => (
              <FileCard key={file.fileId} file={file} />
            ))}
          </div>
        ) : (
          <FileTable files={files} />
        )}
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  const [shareId, setShareId] = useState<string | null>(null);

  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#share/')) {
        setShareId(hash.replace('#share/', ''));
      } else {
        setShareId(null);
      }
    };

    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  if (shareId) {
    return (
      <ShareViewPage
        shareId={shareId}
        onBackToApp={() => {
          window.location.hash = '';
          setShareId(null);
        }}
      />
    );
  }

  return (
    <AuthProvider>
      <FileProvider>
        <div className="min-h-screen bg-slate-100/60 flex flex-col font-sans text-slate-800 antialiased selection:bg-blue-500 selection:text-white">
          <Navbar />

          <div className="flex flex-1 overflow-hidden max-w-[1600px] w-full mx-auto">
            <Sidebar />

            <main className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
              <DriveContent />
            </main>
          </div>

          {/* Global Modals */}
          <FilePreviewModal />
          <UploadModal />
          <ShareModal />
          <VersionHistoryModal />
          <NewFolderModal />
        </div>
      </FileProvider>
    </AuthProvider>
  );
};

export default App;
