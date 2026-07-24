import axios from 'axios';
import { FileItem, FolderItem, StorageStats, UserProfile, FileVersion, ShareConfig } from '../types';

const api = axios.create({
  baseURL: '/api',
});

export const authService = {
  getMe: async (): Promise<UserProfile> => {
    const res = await api.get('/auth/me');
    return res.data.data;
  },
  syncUser: async (user: Partial<UserProfile>): Promise<UserProfile> => {
    const res = await api.post('/auth/sync', user);
    return res.data.data;
  },
};

export const fileService = {
  getFiles: async (params?: {
    folderId?: string;
    tab?: string;
    search?: string;
    category?: string;
  }): Promise<FileItem[]> => {
    const res = await api.get('/files', { params });
    return res.data.data;
  },

  getFolders: async (parentFolderId = 'root'): Promise<FolderItem[]> => {
    const res = await api.get('/files/folders', { params: { parentFolderId } });
    return res.data.data;
  },

  createFolder: async (name: string, parentFolderId = 'root', color?: string): Promise<FolderItem> => {
    const res = await api.post('/files/folder', { name, parentFolderId, color });
    return res.data.data;
  },

  uploadFile: async (
    file: File,
    parentFolderId = 'root',
    onProgress?: (percent: number) => void
  ): Promise<FileItem> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('parentFolderId', parentFolderId);

    const res = await api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });
    return res.data.data;
  },

  getDownloadUrl: async (fileId: string): Promise<{ downloadUrl: string; fileName: string }> => {
    const res = await api.get(`/files/${fileId}/download`);
    return res.data;
  },

  renameFile: async (fileId: string, name: string): Promise<FileItem> => {
    const res = await api.patch(`/files/${fileId}/rename`, { name });
    return res.data.data;
  },

  toggleStar: async (fileId: string): Promise<FileItem> => {
    const res = await api.patch(`/files/${fileId}/star`);
    return res.data.data;
  },

  moveToTrash: async (fileId: string): Promise<FileItem> => {
    const res = await api.patch(`/files/${fileId}/trash`);
    return res.data.data;
  },

  restoreFile: async (fileId: string): Promise<FileItem> => {
    const res = await api.patch(`/files/${fileId}/restore`);
    return res.data.data;
  },

  deletePermanently: async (fileId: string): Promise<void> => {
    await api.delete(`/files/${fileId}`);
  },

  getVersions: async (fileId: string): Promise<FileVersion[]> => {
    const res = await api.get(`/files/${fileId}/versions`);
    return res.data.data;
  },

  uploadNewVersion: async (fileId: string, file: File, changelog?: string): Promise<FileItem> => {
    const formData = new FormData();
    formData.append('file', file);
    if (changelog) formData.append('changelog', changelog);

    const res = await api.post(`/files/${fileId}/version`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  createShare: async (fileId: string, permission = 'view', isPublic = true): Promise<{ share: ShareConfig; shareUrl: string }> => {
    const res = await api.post('/shares', { fileId, permission, isPublic });
    return res.data;
  },

  getSharedFile: async (shareId: string): Promise<{ share: ShareConfig; file: FileItem; downloadUrl: string }> => {
    const res = await api.get(`/shares/${shareId}`);
    return res.data;
  },

  getStorageStats: async (): Promise<StorageStats> => {
    const res = await api.get('/storage/stats');
    return res.data.stats;
  },
};
