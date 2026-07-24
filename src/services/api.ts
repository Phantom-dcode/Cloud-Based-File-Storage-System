import axios from 'axios';
import { FileItem, FolderItem, StorageStats, UserProfile, FileVersion, ShareConfig } from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// Fallback in-memory state in case server API is offline or returning Network Error
let fallbackUser: UserProfile = {
  uid: 'usr_demo_123',
  email: 'alex.dev@cloudvault.app',
  displayName: 'Alex Morgan',
  photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
  storageUsed: 4802400,
  storageLimit: 16106127360,
  createdAt: new Date().toISOString(),
};

let fallbackFolders: FolderItem[] = [
  {
    folderId: 'fld_projects',
    ownerId: 'usr_demo_123',
    name: 'Q3 Product Roadmap',
    color: '#3B82F6',
    parentFolderId: 'root',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    isStarred: true,
  },
  {
    folderId: 'fld_design',
    ownerId: 'usr_demo_123',
    name: 'UI Design Assets',
    color: '#8B5CF6',
    parentFolderId: 'root',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    folderId: 'fld_finance',
    ownerId: 'usr_demo_123',
    name: 'Financial Reports',
    color: '#10B981',
    parentFolderId: 'root',
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  }
];

let fallbackFiles: FileItem[] = [
  {
    fileId: 'file_cloud_arch_doc',
    ownerId: 'usr_demo_123',
    ownerName: 'Alex Morgan',
    ownerEmail: 'alex.dev@cloudvault.app',
    ownerPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    name: 'CloudVault Architecture Blueprint.pdf',
    mimeType: 'application/pdf',
    category: 'document',
    size: 2450000,
    s3Key: 'usr_demo_123/cloud_arch_doc.pdf',
    storageType: 'local',
    textContent: 'CloudVault Architecture Blueprint\n\n1. Front-end: React 19 + Tailwind CSS + Lucide Icons\n2. Backend: Express REST API + AWS S3 SDK v3\n3. Metadata Storage: Firestore NoSQL Schema\n4. Authentication: Google OAuth 2.0\n5. Security: Time-limited AWS Pre-signed URLs',
    isPublic: true,
    isStarred: true,
    isDeleted: false,
    parentFolderId: 'fld_projects',
    currentVersion: 2,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    shareId: 'share_arch_blueprint'
  },
  {
    fileId: 'file_hero_banner',
    ownerId: 'usr_demo_123',
    ownerName: 'Alex Morgan',
    ownerEmail: 'alex.dev@cloudvault.app',
    ownerPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    name: 'Cloud Storage Dashboard Preview.png',
    mimeType: 'image/png',
    category: 'image',
    size: 1840000,
    s3Key: 'usr_demo_123/dashboard_preview.png',
    storageType: 'local',
    isPublic: false,
    isStarred: true,
    isDeleted: false,
    parentFolderId: 'fld_design',
    currentVersion: 1,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    fileId: 'file_db_schema_ts',
    ownerId: 'usr_demo_123',
    ownerName: 'Alex Morgan',
    ownerEmail: 'alex.dev@cloudvault.app',
    ownerPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    name: 'database.schema.ts',
    mimeType: 'text/typescript',
    category: 'code',
    size: 12400,
    s3Key: 'usr_demo_123/database_schema.ts',
    storageType: 'local',
    textContent: `// Firestore Schema Definitions for CloudVault
export interface UserDocument {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  storageUsed: number;
  createdAt: string;
}

export interface FileDocument {
  fileId: string;
  ownerId: string;
  name: string;
  mimeType: string;
  size: number;
  s3Key: string;
  isPublic: boolean;
  isStarred: boolean;
  isDeleted: boolean;
  parentFolderId: string;
  currentVersion: number;
  createdAt: string;
  updatedAt: string;
}`,
    isPublic: false,
    isStarred: false,
    isDeleted: false,
    parentFolderId: 'root',
    currentVersion: 1,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    fileId: 'file_quarterly_budget',
    ownerId: 'usr_demo_123',
    ownerName: 'Alex Morgan',
    ownerEmail: 'alex.dev@cloudvault.app',
    ownerPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    name: 'Q3 Infrastructure Budget & Projections.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    category: 'document',
    size: 512000,
    s3Key: 'usr_demo_123/q3_budget.xlsx',
    storageType: 'local',
    isPublic: false,
    isStarred: false,
    isDeleted: false,
    parentFolderId: 'fld_finance',
    currentVersion: 1,
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
  {
    fileId: 'file_old_notes',
    ownerId: 'usr_demo_123',
    ownerName: 'Alex Morgan',
    ownerEmail: 'alex.dev@cloudvault.app',
    ownerPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    name: 'Deprecated Server Setup Notes.txt',
    mimeType: 'text/plain',
    category: 'document',
    size: 4200,
    s3Key: 'usr_demo_123/old_notes.txt',
    storageType: 'local',
    textContent: 'Old server configuration notes from initial staging deployment.',
    isPublic: false,
    isStarred: false,
    isDeleted: true,
    deletedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    parentFolderId: 'root',
    currentVersion: 1,
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  }
];

let fallbackVersions: FileVersion[] = [
  {
    versionId: 'ver_1',
    fileId: 'file_cloud_arch_doc',
    versionNumber: 1,
    fileName: 'CloudVault Architecture Draft.pdf',
    size: 1900000,
    mimeType: 'application/pdf',
    s3Key: 'usr_demo_123/cloud_arch_doc_v1.pdf',
    storageType: 'local',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    uploadedBy: 'Alex Morgan',
    changelog: 'Initial draft proposal',
  },
  {
    versionId: 'ver_2',
    fileId: 'file_cloud_arch_doc',
    versionNumber: 2,
    fileName: 'CloudVault Architecture Blueprint.pdf',
    size: 2450000,
    mimeType: 'application/pdf',
    s3Key: 'usr_demo_123/cloud_arch_doc.pdf',
    storageType: 'local',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    uploadedBy: 'Alex Morgan',
    changelog: 'Updated AWS S3 pre-signed URL workflow and security rules',
  }
];

let fallbackShares: ShareConfig[] = [
  {
    shareId: 'share_arch_blueprint',
    fileId: 'file_cloud_arch_doc',
    createdBy: 'usr_demo_123',
    createdByName: 'Alex Morgan',
    isPublic: true,
    allowDownload: true,
    permission: 'view',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    accessCount: 14,
  }
];

function getCategoryFromMimeAndName(mimeType: string, filename: string): any {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) return 'image';
  if (mimeType.startsWith('video/') || ['mp4', 'webm', 'mkv', 'mov'].includes(ext)) return 'video';
  if (mimeType.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) return 'audio';
  if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'csv', 'xlsx', 'pptx'].includes(ext) || mimeType.includes('pdf') || mimeType.includes('word') || mimeType.includes('text')) return 'document';
  if (['zip', 'tar', 'gz', '7z', 'rar'].includes(ext)) return 'archive';
  if (['js', 'ts', 'jsx', 'tsx', 'py', 'json', 'html', 'css', 'sql', 'sh', 'java', 'cpp'].includes(ext)) return 'code';
  return 'other';
}

export const authService = {
  getMe: async (): Promise<UserProfile> => {
    try {
      const res = await api.get('/auth/me');
      return res.data.data;
    } catch (err) {
      console.warn('Backend unavailable, using fallback auth data');
      const totalUsed = fallbackFiles.filter(f => !f.isDeleted).reduce((a, b) => a + b.size, 0);
      return { ...fallbackUser, storageUsed: totalUsed };
    }
  },
  syncUser: async (user: Partial<UserProfile>): Promise<UserProfile> => {
    try {
      const res = await api.post('/auth/sync', user);
      return res.data.data;
    } catch (err) {
      if (user.email) fallbackUser.email = user.email;
      if (user.displayName) fallbackUser.displayName = user.displayName;
      if (user.photoURL) fallbackUser.photoURL = user.photoURL;
      return fallbackUser;
    }
  },
};

export const fileService = {
  getFiles: async (params?: {
    folderId?: string;
    tab?: string;
    search?: string;
    category?: string;
  }): Promise<FileItem[]> => {
    try {
      const res = await api.get('/files', { params });
      return res.data.data;
    } catch (err) {
      console.warn('Backend unavailable, using fallback files list');
      let result = [...fallbackFiles];
      const { folderId, tab, search, category } = params || {};

      if (tab === 'trash') {
        result = result.filter(f => f.isDeleted);
      } else {
        result = result.filter(f => !f.isDeleted);

        if (tab === 'starred') {
          result = result.filter(f => f.isStarred);
        } else if (tab === 'shared') {
          result = result.filter(f => f.isPublic || f.shareId);
        } else if (tab === 'recent') {
          result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        } else if (folderId) {
          result = result.filter(f => f.parentFolderId === folderId);
        }
      }

      if (category && category !== 'all') {
        result = result.filter(f => f.category === category);
      }

      if (search && typeof search === 'string' && search.trim()) {
        const q = search.toLowerCase().trim();
        result = result.filter(f => f.name.toLowerCase().includes(q));
      }

      return result;
    }
  },

  getFolders: async (parentFolderId = 'root'): Promise<FolderItem[]> => {
    try {
      const res = await api.get('/files/folders', { params: { parentFolderId } });
      return res.data.data;
    } catch (err) {
      console.warn('Backend unavailable, using fallback folders list');
      return fallbackFolders.filter(f => !f.isDeleted && f.parentFolderId === parentFolderId);
    }
  },

  createFolder: async (name: string, parentFolderId = 'root', color?: string): Promise<FolderItem> => {
    try {
      const res = await api.post('/files/folder', { name, parentFolderId, color });
      return res.data.data;
    } catch (err) {
      const newFolder: FolderItem = {
        folderId: `fld_${Math.random().toString(36).slice(2, 10)}`,
        ownerId: fallbackUser.uid,
        name: name.trim(),
        color: color || '#3B82F6',
        parentFolderId: parentFolderId || 'root',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isStarred: false,
        isDeleted: false,
      };
      fallbackFolders.push(newFolder);
      return newFolder;
    }
  },

  uploadFile: async (
    file: File,
    parentFolderId = 'root',
    onProgress?: (percent: number) => void
  ): Promise<FileItem> => {
    try {
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
    } catch (err) {
      if (onProgress) onProgress(100);
      const fileId = `file_${Math.random().toString(36).slice(2, 12)}`;
      const mimeType = file.type || 'application/octet-stream';
      const category = getCategoryFromMimeAndName(mimeType, file.name);

      const newFile: FileItem = {
        fileId,
        ownerId: fallbackUser.uid,
        ownerName: fallbackUser.displayName,
        ownerEmail: fallbackUser.email,
        ownerPhoto: fallbackUser.photoURL,
        name: file.name,
        mimeType,
        category,
        size: file.size,
        s3Key: `${fallbackUser.uid}/${fileId}_${file.name}`,
        storageType: 'local',
        isPublic: false,
        isStarred: false,
        isDeleted: false,
        parentFolderId,
        currentVersion: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      fallbackFiles.push(newFile);
      fallbackVersions.push({
        versionId: `ver_${Math.random().toString(36).slice(2, 10)}`,
        fileId,
        versionNumber: 1,
        fileName: file.name,
        size: file.size,
        mimeType,
        s3Key: newFile.s3Key,
        storageType: 'local',
        createdAt: new Date().toISOString(),
        uploadedBy: fallbackUser.displayName,
        changelog: 'Initial upload',
      });

      return newFile;
    }
  },

  getDownloadUrl: async (fileId: string): Promise<{ downloadUrl: string; fileName: string }> => {
    try {
      const res = await api.get(`/files/${fileId}/download`);
      return res.data;
    } catch (err) {
      const file = fallbackFiles.find(f => f.fileId === fileId);
      return {
        downloadUrl: `/api/files/${fileId}/raw`,
        fileName: file?.name || 'download',
      };
    }
  },

  renameFile: async (fileId: string, name: string): Promise<FileItem> => {
    try {
      const res = await api.patch(`/files/${fileId}/rename`, { name });
      return res.data.data;
    } catch (err) {
      const file = fallbackFiles.find(f => f.fileId === fileId);
      if (file) {
        file.name = name.trim();
        file.updatedAt = new Date().toISOString();
        return file;
      }
      throw err;
    }
  },

  toggleStar: async (fileId: string): Promise<FileItem> => {
    try {
      const res = await api.patch(`/files/${fileId}/star`);
      return res.data.data;
    } catch (err) {
      const file = fallbackFiles.find(f => f.fileId === fileId);
      if (file) {
        file.isStarred = !file.isStarred;
        file.updatedAt = new Date().toISOString();
        return file;
      }
      throw err;
    }
  },

  moveToTrash: async (fileId: string): Promise<FileItem> => {
    try {
      const res = await api.patch(`/files/${fileId}/trash`);
      return res.data.data;
    } catch (err) {
      const file = fallbackFiles.find(f => f.fileId === fileId);
      if (file) {
        file.isDeleted = true;
        file.deletedAt = new Date().toISOString();
        return file;
      }
      throw err;
    }
  },

  restoreFile: async (fileId: string): Promise<FileItem> => {
    try {
      const res = await api.patch(`/files/${fileId}/restore`);
      return res.data.data;
    } catch (err) {
      const file = fallbackFiles.find(f => f.fileId === fileId);
      if (file) {
        file.isDeleted = false;
        file.deletedAt = undefined;
        file.updatedAt = new Date().toISOString();
        return file;
      }
      throw err;
    }
  },

  deletePermanently: async (fileId: string): Promise<void> => {
    try {
      await api.delete(`/files/${fileId}`);
    } catch (err) {
      fallbackFiles = fallbackFiles.filter(f => f.fileId !== fileId);
    }
  },

  getVersions: async (fileId: string): Promise<FileVersion[]> => {
    try {
      const res = await api.get(`/files/${fileId}/versions`);
      return res.data.data;
    } catch (err) {
      return fallbackVersions.filter(v => v.fileId === fileId);
    }
  },

  uploadNewVersion: async (fileId: string, file: File, changelog?: string): Promise<FileItem> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (changelog) formData.append('changelog', changelog);

      const res = await api.post(`/files/${fileId}/version`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.data;
    } catch (err) {
      const existing = fallbackFiles.find(f => f.fileId === fileId);
      if (existing) {
        const nextVer = existing.currentVersion + 1;
        existing.currentVersion = nextVer;
        existing.size = file.size;
        existing.updatedAt = new Date().toISOString();

        fallbackVersions.push({
          versionId: `ver_${Math.random().toString(36).slice(2, 10)}`,
          fileId,
          versionNumber: nextVer,
          fileName: file.name,
          size: file.size,
          mimeType: file.type || existing.mimeType,
          s3Key: existing.s3Key,
          storageType: 'local',
          createdAt: new Date().toISOString(),
          uploadedBy: fallbackUser.displayName,
          changelog: changelog || `Uploaded version ${nextVer}`,
        });
        return existing;
      }
      throw err;
    }
  },

  createShare: async (fileId: string, permission = 'view', isPublic = true): Promise<{ share: ShareConfig; shareUrl: string }> => {
    try {
      const res = await api.post('/shares', { fileId, permission, isPublic });
      return res.data;
    } catch (err) {
      let share = fallbackShares.find(s => s.fileId === fileId);
      if (!share) {
        share = {
          shareId: `share_${Math.random().toString(36).slice(2, 10)}`,
          fileId,
          createdBy: fallbackUser.uid,
          createdByName: fallbackUser.displayName,
          isPublic,
          allowDownload: true,
          permission: permission as 'view' | 'edit',
          createdAt: new Date().toISOString(),
          accessCount: 0,
        };
        fallbackShares.push(share);
      } else {
        share.permission = permission as 'view' | 'edit';
        share.isPublic = isPublic;
      }

      const file = fallbackFiles.find(f => f.fileId === fileId);
      if (file) {
        file.shareId = share.shareId;
        file.isPublic = isPublic;
      }

      return {
        share,
        shareUrl: `${window.location.origin}/#share/${share.shareId}`,
      };
    }
  },

  getSharedFile: async (shareId: string): Promise<{ share: ShareConfig; file: FileItem; downloadUrl: string }> => {
    try {
      const res = await api.get(`/shares/${shareId}`);
      return res.data;
    } catch (err) {
      const share = fallbackShares.find(s => s.shareId === shareId);
      if (!share) throw new Error('Share not found');
      const file = fallbackFiles.find(f => f.fileId === share.fileId);
      if (!file) throw new Error('Shared file not found');
      share.accessCount += 1;
      return {
        share,
        file,
        downloadUrl: `/api/files/${file.fileId}/raw`,
      };
    }
  },

  getStorageStats: async (): Promise<StorageStats> => {
    try {
      const res = await api.get('/storage/stats');
      return res.data.stats;
    } catch (err) {
      console.warn('Backend unavailable, using fallback storage stats');
      const activeFiles = fallbackFiles.filter(f => !f.isDeleted);
      const usedBytes = activeFiles.reduce((acc, curr) => acc + curr.size, 0);
      const byCategory: Record<string, number> = {
        image: 0,
        document: 0,
        video: 0,
        audio: 0,
        archive: 0,
        code: 0,
        other: 0,
      };

      activeFiles.forEach(f => {
        const cat = f.category || 'other';
        byCategory[cat] = (byCategory[cat] || 0) + f.size;
      });

      return {
        usedBytes,
        limitBytes: fallbackUser.storageLimit,
        byCategory,
        totalFiles: activeFiles.length,
        totalFolders: fallbackFolders.filter(f => !f.isDeleted).length,
      };
    }
  },
};

