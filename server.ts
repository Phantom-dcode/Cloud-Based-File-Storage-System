import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import helmet from 'helmet';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { createServer as createViteServer } from 'vite';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Interfaces
interface FileRecord {
  fileId: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhoto?: string;
  name: string;
  mimeType: string;
  category: string;
  size: number;
  s3Key: string;
  storageType: 's3' | 'local';
  localBufferKey?: string;
  textContent?: string;
  isPublic: boolean;
  isStarred: boolean;
  isDeleted: boolean;
  deletedAt?: string;
  parentFolderId: string;
  currentVersion: number;
  createdAt: string;
  updatedAt: string;
  shareId?: string;
}

interface VersionRecord {
  versionId: string;
  fileId: string;
  versionNumber: number;
  fileName: string;
  size: number;
  mimeType: string;
  s3Key: string;
  storageType: 's3' | 'local';
  localBufferKey?: string;
  createdAt: string;
  uploadedBy: string;
  changelog?: string;
}

interface FolderRecord {
  folderId: string;
  ownerId: string;
  name: string;
  color?: string;
  parentFolderId: string;
  createdAt: string;
  updatedAt: string;
  isStarred?: boolean;
  isDeleted?: boolean;
}

interface ShareRecord {
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

// Memory / Local Persistent Storage Engine
const STORAGE_DIR = path.join(process.cwd(), 'cloud_storage_blobs');
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

// AWS S3 Setup
const awsConfigured = !!(
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.AWS_S3_BUCKET_NAME
);

const s3Client = awsConfigured
  ? new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })
  : null;

// Multer in-memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// Category helper
function getFileCategory(mimeType: string, filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) return 'image';
  if (mimeType.startsWith('video/') || ['mp4', 'webm', 'mkv', 'mov'].includes(ext)) return 'video';
  if (mimeType.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) return 'audio';
  if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'csv', 'xlsx', 'pptx'].includes(ext) || mimeType.includes('pdf') || mimeType.includes('word') || mimeType.includes('text')) return 'document';
  if (['zip', 'tar', 'gz', '7z', 'rar'].includes(ext)) return 'archive';
  if (['js', 'ts', 'jsx', 'tsx', 'py', 'json', 'html', 'css', 'sql', 'sh', 'java', 'cpp'].includes(ext)) return 'code';
  return 'other';
}

// Seed initial state
let currentUser = {
  uid: 'usr_demo_123',
  email: 'alex.dev@cloudvault.app',
  displayName: 'Alex Morgan',
  photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
  storageLimit: 15 * 1024 * 1024 * 1024, // 15 GB
};

let folders: FolderRecord[] = [
  {
    folderId: 'fld_projects',
    ownerId: currentUser.uid,
    name: 'Q3 Product Roadmap',
    color: '#3B82F6',
    parentFolderId: 'root',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    isStarred: true,
  },
  {
    folderId: 'fld_design',
    ownerId: currentUser.uid,
    name: 'UI Design Assets',
    color: '#8B5CF6',
    parentFolderId: 'root',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    folderId: 'fld_finance',
    ownerId: currentUser.uid,
    name: 'Financial Reports',
    color: '#10B981',
    parentFolderId: 'root',
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  }
];

let files: FileRecord[] = [
  {
    fileId: 'file_cloud_arch_doc',
    ownerId: currentUser.uid,
    ownerName: currentUser.displayName,
    ownerEmail: currentUser.email,
    ownerPhoto: currentUser.photoURL,
    name: 'CloudVault Architecture Blueprint.pdf',
    mimeType: 'application/pdf',
    category: 'document',
    size: 2450000,
    s3Key: `${currentUser.uid}/cloud_arch_doc.pdf`,
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
    ownerId: currentUser.uid,
    ownerName: currentUser.displayName,
    ownerEmail: currentUser.email,
    ownerPhoto: currentUser.photoURL,
    name: 'Cloud Storage Dashboard Preview.png',
    mimeType: 'image/png',
    category: 'image',
    size: 1840000,
    s3Key: `${currentUser.uid}/dashboard_preview.png`,
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
    ownerId: currentUser.uid,
    ownerName: currentUser.displayName,
    ownerEmail: currentUser.email,
    ownerPhoto: currentUser.photoURL,
    name: 'database.schema.ts',
    mimeType: 'text/typescript',
    category: 'code',
    size: 12400,
    s3Key: `${currentUser.uid}/database_schema.ts`,
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
    ownerId: currentUser.uid,
    ownerName: currentUser.displayName,
    ownerEmail: currentUser.email,
    ownerPhoto: currentUser.photoURL,
    name: 'Q3 Infrastructure Budget & Projections.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    category: 'document',
    size: 512000,
    s3Key: `${currentUser.uid}/q3_budget.xlsx`,
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
    ownerId: currentUser.uid,
    ownerName: currentUser.displayName,
    ownerEmail: currentUser.email,
    ownerPhoto: currentUser.photoURL,
    name: 'Deprecated Server Setup Notes.txt',
    mimeType: 'text/plain',
    category: 'document',
    size: 4200,
    s3Key: `${currentUser.uid}/old_notes.txt`,
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

let versions: VersionRecord[] = [
  {
    versionId: 'ver_1',
    fileId: 'file_cloud_arch_doc',
    versionNumber: 1,
    fileName: 'CloudVault Architecture Draft.pdf',
    size: 1900000,
    mimeType: 'application/pdf',
    s3Key: `${currentUser.uid}/cloud_arch_doc_v1.pdf`,
    storageType: 'local',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    uploadedBy: currentUser.displayName,
    changelog: 'Initial draft proposal',
  },
  {
    versionId: 'ver_2',
    fileId: 'file_cloud_arch_doc',
    versionNumber: 2,
    fileName: 'CloudVault Architecture Blueprint.pdf',
    size: 2450000,
    mimeType: 'application/pdf',
    s3Key: `${currentUser.uid}/cloud_arch_doc.pdf`,
    storageType: 'local',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    uploadedBy: currentUser.displayName,
    changelog: 'Updated AWS S3 pre-signed URL workflow and security rules',
  }
];

let shares: ShareRecord[] = [
  {
    shareId: 'share_arch_blueprint',
    fileId: 'file_cloud_arch_doc',
    createdBy: currentUser.uid,
    createdByName: currentUser.displayName,
    isPublic: true,
    allowDownload: true,
    permission: 'view',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    accessCount: 14
  }
];

// Server start function
async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // --- API ROUTES --- //

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'UP',
      awsConfigured,
      timestamp: new Date().toISOString(),
      version: '1.0.0-CloudVault'
    });
  });

  // Auth me & sync
  app.get('/api/auth/me', (req, res) => {
    const totalUsed = files
      .filter((f) => !f.isDeleted)
      .reduce((acc, curr) => acc + curr.size, 0);

    res.json({
      success: true,
      data: {
        ...currentUser,
        storageUsed: totalUsed,
      }
    });
  });

  app.post('/api/auth/sync', (req, res) => {
    const { email, displayName, photoURL } = req.body || {};
    if (email) currentUser.email = email;
    if (displayName) currentUser.displayName = displayName;
    if (photoURL) currentUser.photoURL = photoURL;

    res.json({
      success: true,
      data: currentUser
    });
  });

  // Storage Stats
  app.get('/api/storage/stats', (req, res) => {
    const activeFiles = files.filter(f => !f.isDeleted);
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

    res.json({
      success: true,
      stats: {
        usedBytes,
        limitBytes: currentUser.storageLimit,
        byCategory,
        totalFiles: activeFiles.length,
        totalFolders: folders.filter(f => !f.isDeleted).length
      }
    });
  });

  // Get Folders
  app.get('/api/files/folders', (req, res) => {
    const parentFolderId = (req.query.parentFolderId as string) || 'root';
    const activeFolders = folders.filter(f => !f.isDeleted && f.parentFolderId === parentFolderId);
    res.json({ success: true, data: activeFolders });
  });

  // Create Folder
  app.post('/api/files/folder', (req, res) => {
    const { name, parentFolderId = 'root', color } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Folder name is required' });
    }

    const newFolder: FolderRecord = {
      folderId: `fld_${uuidv4().slice(0, 8)}`,
      ownerId: currentUser.uid,
      name: name.trim(),
      color: color || '#3B82F6',
      parentFolderId: parentFolderId || 'root',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isStarred: false,
      isDeleted: false
    };

    folders.push(newFolder);
    res.status(201).json({ success: true, data: newFolder });
  });

  // Get Files (Filtered by folder, tab, search, category)
  app.get('/api/files', (req, res) => {
    const { folderId, tab, search, category } = req.query;

    let result = [...files];

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

    res.json({ success: true, data: result });
  });

  // Upload File
  app.post('/api/files/upload', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      const parentFolderId = (req.body.parentFolderId as string) || 'root';
      const fileId = `file_${uuidv4().slice(0, 10)}`;
      const mimeType = req.file.mimetype || 'application/octet-stream';
      const category = getFileCategory(mimeType, req.file.originalname);
      const s3Key = `${currentUser.uid}/${fileId}_${req.file.originalname}`;

      let storageType: 's3' | 'local' = 'local';
      let localBufferKey: string | undefined = undefined;

      if (awsConfigured && s3Client) {
        try {
          const putCmd = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: s3Key,
            Body: req.file.buffer,
            ContentType: mimeType,
          });
          await s3Client.send(putCmd);
          storageType = 's3';
        } catch (s3Err) {
          console.warn('S3 Upload failed, falling back to local storage engine:', s3Err);
          storageType = 'local';
        }
      }

      if (storageType === 'local') {
        localBufferKey = `${fileId}_blob`;
        const blobPath = path.join(STORAGE_DIR, localBufferKey);
        fs.writeFileSync(blobPath, req.file.buffer);
      }

      let textContent: string | undefined = undefined;
      if (mimeType.startsWith('text/') || mimeType.includes('json') || mimeType.includes('javascript') || mimeType.includes('typescript')) {
        textContent = req.file.buffer.toString('utf-8').slice(0, 20000);
      }

      const newFile: FileRecord = {
        fileId,
        ownerId: currentUser.uid,
        ownerName: currentUser.displayName,
        ownerEmail: currentUser.email,
        ownerPhoto: currentUser.photoURL,
        name: req.file.originalname,
        mimeType,
        category,
        size: req.file.size,
        s3Key,
        storageType,
        localBufferKey,
        textContent,
        isPublic: false,
        isStarred: false,
        isDeleted: false,
        parentFolderId,
        currentVersion: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      files.push(newFile);

      // Record Version 1
      versions.push({
        versionId: `ver_${uuidv4().slice(0, 8)}`,
        fileId,
        versionNumber: 1,
        fileName: req.file.originalname,
        size: req.file.size,
        mimeType,
        s3Key,
        storageType,
        localBufferKey,
        createdAt: new Date().toISOString(),
        uploadedBy: currentUser.displayName,
        changelog: 'Initial upload'
      });

      res.status(201).json({ success: true, data: newFile });
    } catch (err: any) {
      console.error('File Upload Error:', err);
      res.status(500).json({ success: false, message: err.message || 'Upload processing failed' });
    }
  });

  // Get raw file content / preview / stream
  app.get('/api/files/:id/raw', async (req, res) => {
    const file = files.find(f => f.fileId === req.params.id);
    if (!file) return res.status(404).send('File not found');

    if (file.storageType === 's3' && awsConfigured && s3Client) {
      try {
        const getCmd = new GetObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME!,
          Key: file.s3Key,
        });
        const s3Res = await s3Client.send(getCmd);
        res.setHeader('Content-Type', file.mimeType);
        if (s3Res.Body) {
          return (s3Res.Body as any).pipe(res);
        }
      } catch (err) {
        console.warn('Error streaming from S3:', err);
      }
    }

    if (file.localBufferKey) {
      const blobPath = path.join(STORAGE_DIR, file.localBufferKey);
      if (fs.existsSync(blobPath)) {
        res.setHeader('Content-Type', file.mimeType);
        return fs.createReadStream(blobPath).pipe(res);
      }
    }

    // SVG / Text fallback preview generator for demo files
    if (file.mimeType.startsWith('image/')) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400">
        <rect width="100%" height="100%" fill="#1E293B"/>
        <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" fill="#38BDF8" font-family="sans-serif" font-size="28" font-weight="bold">${file.name}</text>
        <text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" fill="#94A3B8" font-family="sans-serif" font-size="16">CloudVault Image Preview (${(file.size / 1024 / 1024).toFixed(2)} MB)</text>
      </svg>`;
      res.setHeader('Content-Type', 'image/svg+xml');
      return res.send(svg);
    }

    res.setHeader('Content-Type', 'text/plain');
    res.send(file.textContent || `Preview for ${file.name}\nSize: ${file.size} bytes\nCategory: ${file.category}`);
  });

  // Get download URL / link
  app.get('/api/files/:id/download', async (req, res) => {
    const file = files.find(f => f.fileId === req.params.id);
    if (!file) return res.status(404).json({ success: false, message: 'File not found' });

    let downloadUrl = `/api/files/${file.fileId}/raw`;

    if (file.storageType === 's3' && awsConfigured && s3Client) {
      try {
        const getCmd = new GetObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME!,
          Key: file.s3Key,
        });
        downloadUrl = await getSignedUrl(s3Client, getCmd, { expiresIn: 3600 });
      } catch (err) {
        console.warn('Failed to generate pre-signed URL:', err);
      }
    }

    res.json({ success: true, downloadUrl, fileName: file.name });
  });

  // Rename File
  app.patch('/api/files/:id/rename', (req, res) => {
    const file = files.find(f => f.fileId === req.params.id);
    if (!file) return res.status(404).json({ success: false, message: 'File not found' });

    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'Invalid name' });

    file.name = name.trim();
    file.updatedAt = new Date().toISOString();
    res.json({ success: true, data: file });
  });

  // Star File
  app.patch('/api/files/:id/star', (req, res) => {
    const file = files.find(f => f.fileId === req.params.id);
    if (!file) return res.status(404).json({ success: false, message: 'File not found' });

    file.isStarred = !file.isStarred;
    file.updatedAt = new Date().toISOString();
    res.json({ success: true, data: file });
  });

  // Trash / Restore
  app.patch('/api/files/:id/trash', (req, res) => {
    const file = files.find(f => f.fileId === req.params.id);
    if (!file) return res.status(404).json({ success: false, message: 'File not found' });

    file.isDeleted = true;
    file.deletedAt = new Date().toISOString();
    res.json({ success: true, data: file });
  });

  app.patch('/api/files/:id/restore', (req, res) => {
    const file = files.find(f => f.fileId === req.params.id);
    if (!file) return res.status(404).json({ success: false, message: 'File not found' });

    file.isDeleted = false;
    file.deletedAt = undefined;
    file.updatedAt = new Date().toISOString();
    res.json({ success: true, data: file });
  });

  // Delete Permanently
  app.delete('/api/files/:id', async (req, res) => {
    const index = files.findIndex(f => f.fileId === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'File not found' });

    const file = files[index];

    if (file.storageType === 's3' && awsConfigured && s3Client) {
      try {
        const delCmd = new DeleteObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME!,
          Key: file.s3Key,
        });
        await s3Client.send(delCmd);
      } catch (err) {
        console.warn('Error deleting S3 object:', err);
      }
    }

    if (file.localBufferKey) {
      const blobPath = path.join(STORAGE_DIR, file.localBufferKey);
      if (fs.existsSync(blobPath)) fs.unlinkSync(blobPath);
    }

    files.splice(index, 1);
    res.json({ success: true, message: 'File permanently deleted' });
  });

  // Versions
  app.get('/api/files/:id/versions', (req, res) => {
    const fileVersions = versions.filter(v => v.fileId === req.params.id);
    res.json({ success: true, data: fileVersions });
  });

  app.post('/api/files/:id/version', upload.single('file'), async (req, res) => {
    try {
      const file = files.find(f => f.fileId === req.params.id);
      if (!file) return res.status(404).json({ success: false, message: 'File not found' });

      if (!req.file) return res.status(400).json({ success: false, message: 'No version file attached' });

      const nextVerNumber = file.currentVersion + 1;
      const mimeType = req.file.mimetype || file.mimeType;
      const s3Key = `${currentUser.uid}/${file.fileId}_v${nextVerNumber}_${req.file.originalname}`;

      let storageType: 's3' | 'local' = 'local';
      let localBufferKey: string | undefined = undefined;

      if (awsConfigured && s3Client) {
        try {
          const putCmd = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: s3Key,
            Body: req.file.buffer,
            ContentType: mimeType,
          });
          await s3Client.send(putCmd);
          storageType = 's3';
        } catch (err) {
          console.warn('S3 upload failed for new version, saving locally');
        }
      }

      if (storageType === 'local') {
        localBufferKey = `${file.fileId}_v${nextVerNumber}_blob`;
        const blobPath = path.join(STORAGE_DIR, localBufferKey);
        fs.writeFileSync(blobPath, req.file.buffer);
      }

      file.currentVersion = nextVerNumber;
      file.size = req.file.size;
      file.mimeType = mimeType;
      file.s3Key = s3Key;
      file.storageType = storageType;
      file.localBufferKey = localBufferKey;
      file.updatedAt = new Date().toISOString();

      const newVer: VersionRecord = {
        versionId: `ver_${uuidv4().slice(0, 8)}`,
        fileId: file.fileId,
        versionNumber: nextVerNumber,
        fileName: req.file.originalname,
        size: req.file.size,
        mimeType,
        s3Key,
        storageType,
        localBufferKey,
        createdAt: new Date().toISOString(),
        uploadedBy: currentUser.displayName,
        changelog: req.body.changelog || `Uploaded version ${nextVerNumber}`
      };

      versions.push(newVer);
      res.status(201).json({ success: true, data: file, newVersion: newVer });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Version upload failed' });
    }
  });

  // Sharing
  app.post('/api/shares', (req, res) => {
    const { fileId, permission = 'view', isPublic = true, allowDownload = true } = req.body;
    const file = files.find(f => f.fileId === fileId);
    if (!file) return res.status(404).json({ success: false, message: 'File not found' });

    let share = shares.find(s => s.fileId === fileId);
    if (!share) {
      share = {
        shareId: `share_${uuidv4().slice(0, 8)}`,
        fileId,
        createdBy: currentUser.uid,
        createdByName: currentUser.displayName,
        isPublic,
        allowDownload,
        permission,
        createdAt: new Date().toISOString(),
        accessCount: 0
      };
      shares.push(share);
    } else {
      share.permission = permission;
      share.isPublic = isPublic;
      share.allowDownload = allowDownload;
    }

    file.shareId = share.shareId;
    file.isPublic = isPublic;

    res.status(201).json({
      success: true,
      share,
      shareUrl: `${process.env.APP_URL || ''}/#share/${share.shareId}`
    });
  });

  app.get('/api/shares/:shareId', (req, res) => {
    const share = shares.find(s => s.shareId === req.params.shareId);
    if (!share) return res.status(404).json({ success: false, message: 'Share link invalid or expired' });

    const file = files.find(f => f.fileId === share.fileId);
    if (!file || file.isDeleted) return res.status(404).json({ success: false, message: 'Shared file no longer exists' });

    share.accessCount += 1;

    res.json({
      success: true,
      share,
      file,
      downloadUrl: `/api/files/${file.fileId}/raw`
    });
  });

  // --- VITE MIDDLEWARE / PRODUCTION STATIC SERVING --- //
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CloudVault server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
