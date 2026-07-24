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
  RotateCcw
} from 'lucide-react';

interface FileTableProps {
  files: FileItem[];
}

export const FileTable: React.FC<FileTableProps> = ({ files }) => {
  const {
    setPreviewFile,
    setShareFile,
    setVersionFile,
    refreshFiles,
    refreshStorageStats
  } = useFiles();

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

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
        return <FileImage className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'document':
        return <FileText className="w-4 h-4 text-blue-500 shrink-0" />;
      case 'video':
        return <FileVideo className="w-4 h-4 text-purple-500 shrink-0" />;
      case 'audio':
        return <FileAudio className="w-4 h-4 text-pink-500 shrink-0" />;
      case 'code':
        return <FileCode className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'archive':
        return <Archive className="w-4 h-4 text-orange-500 shrink-0" />;
      default:
        return <File className="w-4 h-4 text-slate-400 shrink-0" />;
    }
  };

  const handleToggleStar = async (fileId: string) => {
    try {
      await fileService.toggleStar(fileId);
      refreshFiles();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownload = async (fileId: string) => {
    setActiveMenuId(null);
    try {
      const { downloadUrl, fileName } = await fileService.getDownloadUrl(fileId);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTrash = async (fileId: string) => {
    setActiveMenuId(null);
    try {
      await fileService.moveToTrash(fileId);
      refreshFiles();
      refreshStorageStats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestore = async (fileId: string) => {
    setActiveMenuId(null);
    try {
      await fileService.restoreFile(fileId);
      refreshFiles();
      refreshStorageStats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePermanent = async (file: FileItem) => {
    if (!window.confirm(`Permanently delete "${file.name}"?`)) return;
    setActiveMenuId(null);
    try {
      await fileService.deletePermanently(file.fileId);
      refreshFiles();
      refreshStorageStats();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse select-none">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              <th className="py-3 px-4 w-10"></th>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Size</th>
              <th className="py-3 px-4">Owner</th>
              <th className="py-3 px-4">Last Modified</th>
              <th className="py-3 px-4 w-12 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
            {files.map((file) => (
              <tr
                key={file.fileId}
                onClick={() => setPreviewFile(file)}
                className="hover:bg-blue-50/50 transition-colors group cursor-pointer"
              >
                {/* Star Cell */}
                <td className="py-2.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleToggleStar(file.fileId)}
                    className={`p-1 rounded hover:bg-slate-100 cursor-pointer ${
                      file.isStarred ? 'text-amber-500' : 'text-slate-300 opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </button>
                </td>

                {/* Name Cell */}
                <td className="py-2.5 px-4">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {getCategoryIcon(file.category)}
                    <span className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate max-w-md">
                      {file.name}
                    </span>
                    {file.currentVersion > 1 && (
                      <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-amber-50 text-amber-600 border border-amber-200">
                        v{file.currentVersion}
                      </span>
                    )}
                  </div>
                </td>

                {/* Category Cell */}
                <td className="py-2.5 px-4 capitalize text-slate-500">
                  {file.category}
                </td>

                {/* Size Cell */}
                <td className="py-2.5 px-4 text-slate-600 font-mono text-[11px]">
                  {formatSize(file.size)}
                </td>

                {/* Owner Cell */}
                <td className="py-2.5 px-4">
                  <div className="flex items-center gap-1.5">
                    <img
                      src={file.ownerPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                      alt={file.ownerName}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span className="text-slate-600 text-[11px] truncate max-w-[120px]">
                      {file.ownerName}
                    </span>
                  </div>
                </td>

                {/* Date Cell */}
                <td className="py-2.5 px-4 text-slate-400 text-[11px]">
                  {new Date(file.updatedAt).toLocaleDateString()}
                </td>

                {/* Actions Cell */}
                <td className="py-2.5 px-4 text-right relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setActiveMenuId(activeMenuId === file.fileId ? null : file.fileId)}
                    className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {/* Menu Popover */}
                  {activeMenuId === file.fileId && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setActiveMenuId(null)}
                      ></div>
                      <div className="absolute right-4 top-full mt-1 w-44 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 z-50 text-left text-xs font-semibold text-slate-700">
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            setPreviewFile(file);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                        >
                          <Eye className="w-4 h-4 text-blue-500" />
                          <span>Preview</span>
                        </button>

                        <button
                          onClick={() => handleDownload(file.fileId)}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 cursor-pointer"
                        >
                          <Download className="w-4 h-4 text-emerald-500" />
                          <span>Download</span>
                        </button>

                        {!file.isDeleted && (
                          <>
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                setShareFile(file);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer"
                            >
                              <Share2 className="w-4 h-4 text-indigo-500" />
                              <span>Share Link</span>
                            </button>

                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                setVersionFile(file);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-amber-50 hover:text-amber-600 cursor-pointer"
                            >
                              <History className="w-4 h-4 text-amber-500" />
                              <span>Versions</span>
                            </button>

                            <div className="my-1 border-t border-slate-100"></div>

                            <button
                              onClick={() => handleTrash(file.fileId)}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4 text-rose-500" />
                              <span>Move to Trash</span>
                            </button>
                          </>
                        )}

                        {file.isDeleted && (
                          <>
                            <button
                              onClick={() => handleRestore(file.fileId)}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-emerald-50 text-emerald-600 cursor-pointer"
                            >
                              <RotateCcw className="w-4 h-4 text-emerald-500" />
                              <span>Restore</span>
                            </button>

                            <button
                              onClick={() => handleDeletePermanent(file)}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4 text-rose-500" />
                              <span>Delete Forever</span>
                            </button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
