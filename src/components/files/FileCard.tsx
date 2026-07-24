import React, { useState } from 'react';
import { FileItem } from '../../types';
import { useFiles } from '../../context/FileContext';
import { fileService } from '../../services/api';
import {
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileCode,
  Archive,
  File,
  Star,
  MoreVertical,
  Eye,
  Download,
  Share2,
  History,
  Edit2,
  Trash2,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface FileCardProps {
  file: FileItem;
}

export const FileCard: React.FC<FileCardProps> = ({ file }) => {
  const {
    setPreviewFile,
    setShareFile,
    setVersionFile,
    refreshFiles,
    refreshStorageStats,
    activeTab
  } = useFiles();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(file.name);

  const formatSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'image':
        return <FileImage className="w-6 h-6 text-emerald-500" />;
      case 'document':
        return <FileText className="w-6 h-6 text-blue-500" />;
      case 'video':
        return <FileVideo className="w-6 h-6 text-purple-500" />;
      case 'audio':
        return <FileAudio className="w-6 h-6 text-pink-500" />;
      case 'code':
        return <FileCode className="w-6 h-6 text-amber-500" />;
      case 'archive':
        return <Archive className="w-6 h-6 text-orange-500" />;
      default:
        return <File className="w-6 h-6 text-slate-400" />;
    }
  };

  const handleToggleStar = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fileService.toggleStar(file.fileId);
      refreshFiles();
    } catch (err) {
      console.error('Star toggle failed', err);
    }
  };

  const handleDownload = async () => {
    setIsMenuOpen(false);
    try {
      const { downloadUrl, fileName } = await fileService.getDownloadUrl(file.fileId);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download error', err);
    }
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || newName === file.name) {
      setIsRenaming(false);
      return;
    }
    try {
      await fileService.renameFile(file.fileId, newName.trim());
      setIsRenaming(false);
      refreshFiles();
    } catch (err) {
      console.error('Rename failed', err);
    }
  };

  const handleTrash = async () => {
    setIsMenuOpen(false);
    try {
      await fileService.moveToTrash(file.fileId);
      refreshFiles();
      refreshStorageStats();
    } catch (err) {
      console.error('Trash error', err);
    }
  };

  const handleRestore = async () => {
    setIsMenuOpen(false);
    try {
      await fileService.restoreFile(file.fileId);
      refreshFiles();
      refreshStorageStats();
    } catch (err) {
      console.error('Restore error', err);
    }
  };

  const handleDeletePermanently = async () => {
    if (!window.confirm(`Permanently delete "${file.name}"? This action cannot be undone.`)) return;
    setIsMenuOpen(false);
    try {
      await fileService.deletePermanently(file.fileId);
      refreshFiles();
      refreshStorageStats();
    } catch (err) {
      console.error('Permanent delete error', err);
    }
  };

  return (
    <div
      onClick={() => setPreviewFile(file)}
      className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400/80 shadow-xs hover:shadow-md transition-all p-3.5 flex flex-col justify-between group relative select-none cursor-pointer"
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 bg-slate-50 group-hover:bg-blue-50/80 rounded-xl transition-colors shrink-0">
            {getCategoryIcon(file.category)}
          </div>

          <div className="min-w-0 flex-1">
            {isRenaming ? (
              <form onSubmit={handleRenameSubmit} onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onBlur={handleRenameSubmit}
                  className="w-full text-xs font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded outline-none border border-blue-500"
                />
              </form>
            ) : (
              <h3
                title={file.name}
                className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors leading-snug"
              >
                {file.name}
              </h3>
            )}
            <p className="text-[11px] text-slate-400 font-medium">
              {formatSize(file.size)}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          {/* Version Pill */}
          {file.currentVersion > 1 && (
            <span
              onClick={() => setVersionFile(file)}
              className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
              title="Version History"
            >
              v{file.currentVersion}
            </span>
          )}

          {/* Star Button */}
          {!file.isDeleted && (
            <button
              onClick={handleToggleStar}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                file.isStarred
                  ? 'text-amber-500 bg-amber-50'
                  : 'text-slate-300 opacity-0 group-hover:opacity-100 hover:text-amber-400 hover:bg-slate-100'
              }`}
              title={file.isStarred ? 'Unstar' : 'Star file'}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
            </button>
          )}

          {/* More Dropdown Trigger */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsMenuOpen(false)}
                ></div>
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs font-semibold text-slate-700">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setPreviewFile(file);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-blue-500" />
                    <span>Preview File</span>
                  </button>

                  <button
                    onClick={handleDownload}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-500" />
                    <span>Download</span>
                  </button>

                  {!file.isDeleted && (
                    <>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          setShareFile(file);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer"
                      >
                        <Share2 className="w-4 h-4 text-indigo-500" />
                        <span>Share Link</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          setVersionFile(file);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-amber-50 hover:text-amber-600 cursor-pointer"
                      >
                        <History className="w-4 h-4 text-amber-500" />
                        <span>Version History</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          setIsRenaming(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4 text-slate-500" />
                        <span>Rename</span>
                      </button>

                      <div className="my-1 border-t border-slate-100"></div>

                      <button
                        onClick={handleTrash}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 text-rose-500" />
                        <span>Move to Trash</span>
                      </button>
                    </>
                  )}

                  {file.isDeleted && (
                    <>
                      <button
                        onClick={handleRestore}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-emerald-50 text-emerald-600 cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4 text-emerald-500" />
                        <span>Restore</span>
                      </button>

                      <button
                        onClick={handleDeletePermanently}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 text-rose-500" />
                        <span>Delete Forever</span>
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Middle Thumbnail / Media Box */}
      <div className="w-full h-28 rounded-xl bg-slate-100/70 group-hover:bg-slate-100 flex items-center justify-center overflow-hidden my-1 relative transition-colors">
        {file.category === 'image' ? (
          <img
            src={`/api/files/${file.fileId}/raw`}
            alt={file.name}
            className="w-full h-full object-cover rounded-xl"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="flex flex-col items-center gap-1.5 opacity-60">
            {getCategoryIcon(file.category)}
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {file.category}
            </span>
          </div>
        )}
      </div>

      {/* Card Footer Info */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pt-2">
        <span>{new Date(file.updatedAt).toLocaleDateString()}</span>
        <span className="capitalize">{file.category}</span>
      </div>
    </div>
  );
};
