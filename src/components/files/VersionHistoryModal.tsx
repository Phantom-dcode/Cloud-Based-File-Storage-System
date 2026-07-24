import React, { useState, useEffect } from 'react';
import { useFiles } from '../../context/FileContext';
import { fileService } from '../../services/api';
import { FileVersion } from '../../types';
import { X, History, UploadCloud, Download, CheckCircle2, Clock } from 'lucide-react';

export const VersionHistoryModal: React.FC = () => {
  const {
    versionFile,
    setVersionFile,
    refreshFiles,
    refreshStorageStats
  } = useFiles();

  const [versionsList, setVersionsList] = useState<FileVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [newVersionFile, setNewVersionFile] = useState<File | null>(null);
  const [changelog, setChangelog] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (versionFile) {
      fetchVersions();
    }
  }, [versionFile]);

  if (!versionFile) return null;

  const fetchVersions = async () => {
    setLoading(true);
    try {
      const data = await fileService.getVersions(versionFile.fileId);
      setVersionsList(data.sort((a, b) => b.versionNumber - a.versionNumber));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersionFile) return;

    setUploading(true);
    try {
      await fileService.uploadNewVersion(versionFile.fileId, newVersionFile, changelog);
      setNewVersionFile(null);
      setChangelog('');
      fetchVersions();
      refreshFiles();
      refreshStorageStats();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">Version History - {versionFile.name}</h3>
              <p className="text-[11px] text-slate-400 font-medium">Manage and restore previous versions</p>
            </div>
          </div>

          <button
            onClick={() => setVersionFile(null)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Upload New Version Box */}
          <form onSubmit={handleUploadVersion} className="bg-amber-50/60 border border-amber-200/80 p-4 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-amber-900 flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-amber-600" />
              <span>Upload Version {versionFile.currentVersion + 1}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="file"
                required
                onChange={(e) => setNewVersionFile(e.target.files?.[0] || null)}
                className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-100 file:text-amber-700 hover:file:bg-amber-200 cursor-pointer"
              />

              <input
                type="text"
                placeholder="Changelog notes (optional)..."
                value={changelog}
                onChange={(e) => setChangelog(e.target.value)}
                className="bg-white text-xs px-3 py-1.5 rounded-xl border border-amber-200 outline-none focus:border-amber-500 font-medium placeholder:text-slate-400"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!newVersionFile || uploading}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                {uploading ? 'Uploading...' : 'Upload New Version'}
              </button>
            </div>
          </form>

          {/* Versions Timeline List */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Version Timeline ({versionsList.length})
            </h4>

            {loading ? (
              <div className="p-6 text-center text-xs text-slate-400 font-medium">Loading versions...</div>
            ) : (
              <div className="space-y-2.5">
                {versionsList.map((ver, idx) => {
                  const isCurrent = ver.versionNumber === versionFile.currentVersion;
                  return (
                    <div
                      key={ver.versionId}
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                        isCurrent
                          ? 'bg-blue-50/50 border-blue-200 text-slate-800'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                            isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          v{ver.versionNumber}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800 truncate" title={ver.fileName}>
                              {ver.fileName}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                Current
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                            {formatSize(ver.size)} • Uploaded by {ver.uploadedBy} on {new Date(ver.createdAt).toLocaleString()}
                          </p>

                          {ver.changelog && (
                            <p className="text-[11px] text-slate-500 font-semibold italic mt-1">
                              "{ver.changelog}"
                            </p>
                          )}
                        </div>
                      </div>

                      <a
                        href={`/api/files/${versionFile.fileId}/raw`}
                        download={ver.fileName}
                        className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shrink-0 cursor-pointer"
                        title="Download version"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex justify-end bg-slate-50/80">
          <button
            onClick={() => setVersionFile(null)}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
