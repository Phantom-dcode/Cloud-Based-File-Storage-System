import React from 'react';
import { useFiles } from '../../context/FileContext';
import { fileService } from '../../services/api';
import {
  X,
  Download,
  Share2,
  History,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileCode,
  Archive,
  File,
  ExternalLink
} from 'lucide-react';

export const FilePreviewModal: React.FC = () => {
  const { previewFile, setPreviewFile, setShareFile, setVersionFile } = useFiles();

  if (!previewFile) return null;

  const formatSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const handleDownload = async () => {
    try {
      const { downloadUrl, fileName } = await fileService.getDownloadUrl(previewFile.fileId);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-extrabold text-slate-800 truncate" title={previewFile.name}>
                {previewFile.name}
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                {formatSize(previewFile.size)} • Version {previewFile.currentVersion} • Modified {new Date(previewFile.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShareFile(previewFile)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>

            <button
              onClick={() => setVersionFile(previewFile)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-50 hover:text-amber-600 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              <History className="w-3.5 h-3.5" />
              <span>Versions</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            <button
              onClick={() => setPreviewFile(null)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors ml-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="flex-1 overflow-auto p-6 bg-slate-100/50 flex items-center justify-center min-h-[350px]">
          {previewFile.category === 'image' ? (
            <img
              src={`/api/files/${previewFile.fileId}/raw`}
              alt={previewFile.name}
              className="max-w-full max-h-[60vh] object-contain rounded-2xl shadow-lg border border-slate-200"
            />
          ) : previewFile.category === 'code' || previewFile.textContent ? (
            <div className="w-full h-full max-h-[60vh] bg-slate-900 text-slate-100 p-5 rounded-2xl font-mono text-xs overflow-auto border border-slate-800 shadow-inner">
              <pre>{previewFile.textContent || '// Raw text content available in download'}</pre>
            </div>
          ) : previewFile.category === 'audio' ? (
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 text-center space-y-4 max-w-md w-full">
              <div className="w-16 h-16 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center mx-auto">
                <FileAudio className="w-8 h-8" />
              </div>
              <p className="text-sm font-bold text-slate-800">{previewFile.name}</p>
              <audio controls className="w-full">
                <source src={`/api/files/${previewFile.fileId}/raw`} type={previewFile.mimeType} />
                Your browser does not support audio elements.
              </audio>
            </div>
          ) : previewFile.category === 'video' ? (
            <video controls className="max-w-full max-h-[60vh] rounded-2xl shadow-xl border border-slate-200">
              <source src={`/api/files/${previewFile.fileId}/raw`} type={previewFile.mimeType} />
              Your browser does not support video elements.
            </video>
          ) : (
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 text-center space-y-4 max-w-md w-full">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">{previewFile.name}</h3>
                <p className="text-xs text-slate-400 mt-1">Preview not inlineable for this document type.</p>
              </div>
              <button
                onClick={handleDownload}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Download & Open File
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
