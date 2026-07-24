import React, { useState, useEffect } from 'react';
import { fileService } from '../../services/api';
import { ShareConfig, FileItem } from '../../types';
import { Download, HardDrive, FileText, Globe, ArrowLeft, ShieldCheck } from 'lucide-react';

interface ShareViewPageProps {
  shareId: string;
  onBackToApp: () => void;
}

export const ShareViewPage: React.FC<ShareViewPageProps> = ({ shareId, onBackToApp }) => {
  const [data, setData] = useState<{ share: ShareConfig; file: FileItem; downloadUrl: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSharedFile();
  }, [shareId]);

  const fetchSharedFile = async () => {
    setLoading(true);
    try {
      const res = await fileService.getSharedFile(shareId);
      setData(res);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Shared link not found or expired');
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-6">
      {/* Top Header */}
      <header className="flex items-center justify-between max-w-4xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white">CloudVault</span>
            <p className="text-[11px] text-slate-400 font-medium">Public Shared Asset</p>
          </div>
        </div>

        <button
          onClick={onBackToApp}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all border border-slate-700 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Open Drive</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl w-full mx-auto my-auto py-12">
        {loading ? (
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-400 font-medium">Loading shared asset...</p>
          </div>
        ) : error ? (
          <div className="bg-slate-800/80 border border-slate-700 p-8 rounded-3xl text-center space-y-4">
            <div className="w-12 h-12 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center mx-auto">
              <Globe className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white">Link Unavailable</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">{error}</p>
          </div>
        ) : data && (
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 w-fit">
              <Globe className="w-3.5 h-3.5" />
              <span>Shared File by {data.share.createdByName}</span>
            </div>

            <div className="space-y-1">
              <h1 className="text-xl font-black text-white">{data.file.name}</h1>
              <p className="text-xs text-slate-400 font-medium">
                Size: {formatSize(data.file.size)} • Version {data.file.currentVersion} • Updated {new Date(data.file.updatedAt).toLocaleDateString()}
              </p>
            </div>

            {/* Preview Box */}
            <div className="bg-slate-900 rounded-2xl p-4 border border-slate-700/60 min-h-[220px] flex items-center justify-center overflow-hidden">
              {data.file.category === 'image' ? (
                <img
                  src={data.downloadUrl}
                  alt={data.file.name}
                  className="max-h-64 object-contain rounded-xl"
                />
              ) : data.file.textContent ? (
                <div className="w-full max-h-64 overflow-auto font-mono text-xs text-slate-300 p-3">
                  <pre>{data.file.textContent}</pre>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <FileText className="w-12 h-12 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">Ready for direct download</p>
                </div>
              )}
            </div>

            <a
              href={data.downloadUrl}
              download={data.file.name}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Shared File ({formatSize(data.file.size)})</span>
            </a>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center text-[11px] text-slate-500 font-medium max-w-4xl w-full mx-auto">
        <span>Protected with CloudVault AWS S3 Storage Security</span>
      </footer>
    </div>
  );
};
