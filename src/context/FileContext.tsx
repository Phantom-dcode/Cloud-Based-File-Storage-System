import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { FileItem, FolderItem, StorageStats, ViewTab, DisplayMode, FileCategory } from '../types';
import { fileService } from '../services/api';

interface FolderBreadcrumb {
  folderId: string;
  name: string;
}

interface FileContextType {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  currentFolderId: string;
  setCurrentFolderId: (folderId: string) => void;
  folderPath: FolderBreadcrumb[];
  navigateToFolder: (folderId: string, folderName?: string) => void;
  navigateUp: () => void;
  
  files: FileItem[];
  folders: FolderItem[];
  storageStats: StorageStats | null;
  loading: boolean;
  
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: FileCategory | 'all';
  setSelectedCategory: (cat: FileCategory | 'all') => void;
  displayMode: DisplayMode;
  setDisplayMode: (mode: DisplayMode) => void;

  // Modals state
  previewFile: FileItem | null;
  setPreviewFile: (file: FileItem | null) => void;
  shareFile: FileItem | null;
  setShareFile: (file: FileItem | null) => void;
  versionFile: FileItem | null;
  setVersionFile: (file: FileItem | null) => void;
  isUploadModalOpen: boolean;
  setIsUploadModalOpen: (open: boolean) => void;
  isNewFolderModalOpen: boolean;
  setIsNewFolderModalOpen: (open: boolean) => void;

  // Actions
  refreshFiles: () => Promise<void>;
  refreshFolders: () => Promise<void>;
  refreshStorageStats: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export const FileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTabState] = useState<ViewTab>('my-drive');
  const [currentFolderId, setCurrentFolderId] = useState<string>('root');
  const [folderPath, setFolderPath] = useState<FolderBreadcrumb[]>([{ folderId: 'root', name: 'My Drive' }]);

  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<FileCategory | 'all'>('all');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('grid');

  // Modals
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [shareFile, setShareFile] = useState<FileItem | null>(null);
  const [versionFile, setVersionFile] = useState<FileItem | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState<boolean>(false);

  const setActiveTab = (tab: ViewTab) => {
    setActiveTabState(tab);
    if (tab !== 'my-drive') {
      setCurrentFolderId('root');
      setFolderPath([{ folderId: 'root', name: 'My Drive' }]);
    }
  };

  const refreshFiles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fileService.getFiles({
        folderId: activeTab === 'my-drive' ? currentFolderId : undefined,
        tab: activeTab,
        search: searchQuery,
        category: selectedCategory,
      });
      setFiles(data);
    } catch (err) {
      console.error('Error fetching files:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentFolderId, searchQuery, selectedCategory]);

  const refreshFolders = useCallback(async () => {
    if (activeTab !== 'my-drive') {
      setFolders([]);
      return;
    }
    try {
      const data = await fileService.getFolders(currentFolderId);
      setFolders(data);
    } catch (err) {
      console.error('Error fetching folders:', err);
    }
  }, [activeTab, currentFolderId]);

  const refreshStorageStats = useCallback(async () => {
    try {
      const stats = await fileService.getStorageStats();
      setStorageStats(stats);
    } catch (err) {
      console.error('Error fetching storage stats:', err);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([refreshFiles(), refreshFolders(), refreshStorageStats()]);
  }, [refreshFiles, refreshFolders, refreshStorageStats]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const navigateToFolder = (folderId: string, folderName?: string) => {
    if (folderId === 'root') {
      setCurrentFolderId('root');
      setFolderPath([{ folderId: 'root', name: 'My Drive' }]);
      return;
    }

    const existingIndex = folderPath.findIndex((p) => p.folderId === folderId);
    if (existingIndex !== -1) {
      setFolderPath(folderPath.slice(0, existingIndex + 1));
    } else if (folderName) {
      setFolderPath([...folderPath, { folderId, name: folderName }]);
    }
    setCurrentFolderId(folderId);
  };

  const navigateUp = () => {
    if (folderPath.length > 1) {
      const newPath = folderPath.slice(0, folderPath.length - 1);
      setFolderPath(newPath);
      setCurrentFolderId(newPath[newPath.length - 1].folderId);
    }
  };

  return (
    <FileContext.Provider
      value={{
        activeTab,
        setActiveTab,
        currentFolderId,
        setCurrentFolderId,
        folderPath,
        navigateToFolder,
        navigateUp,
        files,
        folders,
        storageStats,
        loading,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        displayMode,
        setDisplayMode,
        previewFile,
        setPreviewFile,
        shareFile,
        setShareFile,
        versionFile,
        setVersionFile,
        isUploadModalOpen,
        setIsUploadModalOpen,
        isNewFolderModalOpen,
        setIsNewFolderModalOpen,
        refreshFiles,
        refreshFolders,
        refreshStorageStats,
        refreshAll,
      }}
    >
      {children}
    </FileContext.Provider>
  );
};

export const useFiles = () => {
  const context = useContext(FileContext);
  if (!context) throw new Error('useFiles must be used within a FileProvider');
  return context;
};
