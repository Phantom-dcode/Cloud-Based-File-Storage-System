export type FileCategory = 'image' | 'document' | 'video' | 'audio' | 'archive' | 'code' | 'other';

export interface FileVersion {
  versionId: string;
  fileId?: string;
  versionNumber: number;
  fileName: string;
  size: number;
  mimeType: string;
  s3Key: string;
  storageType?: 's3' | 'local';
  blobUrl?: string;
  createdAt: string;
  uploadedBy: string;
  changelog?: string;
}

export interface FileItem {
  fileId: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhoto?: string;
  name: string;
  mimeType: string;
  category: FileCategory;
  size: number; // in bytes
  s3Key: string;
  storageType?: 's3' | 'local';
  blobUrl?: string;
  textContent?: string; // For text/code preview if applicable
  isPublic: boolean;
  isStarred: boolean;
  isDeleted: boolean;
  deletedAt?: string;
  parentFolderId: string | 'root';
  currentVersion: number;
  createdAt: string;
  updatedAt: string;
  shareId?: string;
  sharePermission?: 'view' | 'edit';
}

export interface FolderItem {
  folderId: string;
  ownerId: string;
  name: string;
  color?: string;
  parentFolderId: string | 'root';
  createdAt: string;
  updatedAt: string;
  isStarred?: boolean;
  isDeleted?: boolean;
}

export interface ShareConfig {
  shareId: string;
  fileId: string;
  createdBy: string;
  createdByName: string;
  isPublic: boolean;
  allowDownload: boolean;
  permission: 'view' | 'edit';
  expiresAt?: string;
  createdAt: string;
  accessCount: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  storageUsed: number;
  storageLimit: number;
  createdAt: string;
}

export interface StorageStats {
  usedBytes: number;
  limitBytes: number;
  byCategory: Record<FileCategory, number>;
  totalFiles: number;
  totalFolders: number;
}

export type ViewTab = 'my-drive' | 'shared' | 'recent' | 'starred' | 'trash' | 'storage';
export type DisplayMode = 'grid' | 'table';
