import React, { useState, useEffect } from 'react';
import { useFiles } from '../../context/FileContext';
import { fileService } from '../../services/api';
import { ShareConfig } from '../../types';
import { X, Share2, Copy, Check, Globe, Lock, ShieldCheck, Link2 } from 'lucide-react';

export const ShareModal: React.FC = () => {
  const { shareFile, setShareFile } = useFiles();

  const [permission, setPermission] = useState<'view' | 'edit'>('view');
  const [isPublic, setIsPublic] = useState(true);
  const [shareConfig, setShareConfig] = useState<ShareConfig | null>(null);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (shareFile) {
      handleGenerateShare();
    }
  }, [shareFile]);

  if (!shareFile) return null;

  const handleGenerateShare = async () => {
    setLoading(true);
    try {
      const res = await fileService.createShare(shareFile.fileId, permission, isPublic);
      setShareConfig(res.share);
      const hostUrl = window.location.origin;
      setShareUrl(`${hostUrl}/#share/${res.share.shareId}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">Share "{shareFile.name}"</h3>
              <p className="text-[11px] text-slate-400 font-medium">Configure link access & permissions</p>
            </div>
          </div>

          <button
            onClick={() => setShareFile(null)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Access Toggle */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">
              General Access
            </label>
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${isPublic ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-200 text-slate-600'}`}>
                  {isPublic ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    {isPublic ? 'Anyone with the link' : 'Restricted'}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {isPublic ? 'Anyone on the internet with this link can access' : 'Only specified accounts can access'}
                  </span>
                </div>
              </div>

              <select
                value={isPublic ? 'public' : 'private'}
                onChange={(e) => {
                  setIsPublic(e.target.value === 'public');
                  handleGenerateShare();
                }}
                className="text-xs font-bold bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 outline-none cursor-pointer"
              >
                <option value="public">Public</option>
                <option value="private">Restricted</option>
              </select>
            </div>
          </div>

          {/* Role Permission Selector */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">
              Role Permission
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setPermission('view');
                  handleGenerateShare();
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  permission === 'view'
                    ? 'border-indigo-500 bg-indigo-50/50 text-indigo-900 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="text-xs block">Viewer</span>
                <span className="text-[10px] text-slate-400 font-medium">Can view and download file</span>
              </button>

              <button
                onClick={() => {
                  setPermission('edit');
                  handleGenerateShare();
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  permission === 'edit'
                    ? 'border-indigo-500 bg-indigo-50/50 text-indigo-900 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="text-xs block">Editor</span>
                <span className="text-[10px] text-slate-400 font-medium">Can modify and re-share</span>
              </button>
            </div>
          </div>

          {/* Generated Shareable Link Field */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">
              Shareable Link
            </label>
            <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-2xl border border-slate-200">
              <Link2 className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full bg-transparent text-xs font-mono text-slate-700 outline-none truncate"
              />
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            <span>Protected with AWS S3 pre-signed tokens</span>
          </div>

          <button
            onClick={() => setShareFile(null)}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
