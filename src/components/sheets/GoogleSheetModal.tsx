import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import {
  FileSpreadsheet,
  ExternalLink,
  RefreshCw,
  PlusCircle,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  X,
  LogOut,
  Info,
} from 'lucide-react';

interface GoogleSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleSheetModal: React.FC<GoogleSheetModalProps> = ({ isOpen, onClose }) => {
  const {
    googleUser,
    googleToken,
    isLoggingInGoogle,
    loginWithGoogle,
    logoutFromGoogle,
    sheetId,
    sheetUrl,
    sheetLastSync,
    isSyncingSheet,
    createAndConnectSheet,
    connectExistingSheet,
    syncMenuFromConnectedSheet,
    menuItems,
  } = useCafe();

  const [inputUrlOrId, setInputUrlOrId] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    action: () => Promise<void>;
  } | null>(null);

  if (!isOpen) return null;

  const handleCreateNewSheet = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Create Menu Sheet in Google Drive?',
      description:
        'This will create a new Google Spreadsheet titled "CafeOrder Menu & Pricing" in your Google Drive and pre-populate it with your current café items and INR prices.',
      action: async () => {
        try {
          const url = await createAndConnectSheet();
          setFeedback({
            type: 'success',
            message: 'Spreadsheet created and connected successfully!',
          });
        } catch (err: any) {
          setFeedback({ type: 'error', message: err.message || 'Failed to create sheet' });
        }
      },
    });
  };

  const handleConnectExisting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrlOrId.trim()) return;

    try {
      await connectExistingSheet(inputUrlOrId.trim());
      setFeedback({
        type: 'success',
        message: 'Connected to Google Sheet and synced menu items successfully!',
      });
      setInputUrlOrId('');
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to connect sheet' });
    }
  };

  const handleSyncNow = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Sync Latest Menu from Google Sheets?',
      description:
        'This will fetch the latest products, prices, and descriptions from your connected Google Sheet and update the customer menu in real time.',
      action: async () => {
        try {
          const count = await syncMenuFromConnectedSheet();
          setFeedback({
            type: 'success',
            message: `Successfully synchronized ${count} menu items from Google Sheets!`,
          });
        } catch (err: any) {
          setFeedback({ type: 'error', message: err.message || 'Failed to sync from sheet' });
        }
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-stone-900 leading-tight">
                Google Sheets Menu Manager
              </h2>
              <p className="text-xs text-stone-500">
                Manage products, pricing, and descriptions directly via Google Sheets
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-stone-200 flex items-center justify-center text-stone-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-stone-700">
          {/* Status Feedback */}
          {feedback && (
            <div
              className={`p-3 rounded-xl border flex items-center gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* SECTION 1: Google Authentication */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-800 uppercase tracking-wider text-[11px]">
                Google Account Connection
              </span>
              {googleUser ? (
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                  Connected
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-stone-500 bg-stone-200 px-2 py-0.5 rounded-md">
                  Not Signed In
                </span>
              )}
            </div>

            {!googleUser ? (
              <div className="space-y-2">
                <p className="text-stone-600">
                  Sign in with your Google account to grant access to view and sync your menu spreadsheet.
                </p>
                {/* Official Google Material Button Style */}
                <button
                  type="button"
                  onClick={loginWithGoogle}
                  disabled={isLoggingInGoogle}
                  className="w-full inline-flex items-center justify-center gap-3 px-4 py-2.5 bg-white hover:bg-stone-100 text-stone-700 font-semibold text-xs rounded-xl border border-stone-300 shadow-xs transition-all cursor-pointer disabled:opacity-60"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                  <span>{isLoggingInGoogle ? 'Signing in...' : 'Sign in with Google'}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2.5">
                  {googleUser.photoURL ? (
                    <img
                      src={googleUser.photoURL}
                      alt="Avatar"
                      className="w-7 h-7 rounded-full border border-stone-300"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-stone-300 flex items-center justify-center font-bold">
                      {googleUser.email?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <span className="font-semibold text-stone-900 block leading-tight">
                      {googleUser.displayName || 'Google User'}
                    </span>
                    <span className="text-[11px] text-stone-500 font-mono">
                      {googleUser.email}
                    </span>
                  </div>
                </div>

                <button
                  onClick={logoutFromGoogle}
                  className="px-2.5 py-1 text-[11px] text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Disconnect</span>
                </button>
              </div>
            )}
          </div>

          {/* SECTION 2: Connected Google Sheet Status */}
          {googleUser && (
            <div className="space-y-4">
              {sheetId ? (
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950 text-xs">
                      Connected Spreadsheet
                    </span>
                    {sheetLastSync && (
                      <span className="text-[11px] text-emerald-700 font-mono">
                        Last synced: {sheetLastSync}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-stone-600 block text-[11px]">
                      Spreadsheet ID:{' '}
                      <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-200 text-stone-900">
                        {sheetId}
                      </code>
                    </span>
                    <span className="text-stone-600 block text-[11px]">
                      Active Menu Items: <strong>{menuItems.length} products loaded</strong>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {sheetUrl && (
                      <a
                        href={sheetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold text-xs transition-colors shadow-xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open in Google Sheets ↗</span>
                      </a>
                    )}

                    <button
                      onClick={handleSyncNow}
                      disabled={isSyncingSheet}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-800 rounded-lg font-semibold text-xs border border-stone-300 transition-colors cursor-pointer shadow-xs disabled:opacity-60"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 text-stone-600 ${isSyncingSheet ? 'animate-spin' : ''}`}
                      />
                      <span>{isSyncingSheet ? 'Syncing...' : 'Sync Menu Now'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl border border-stone-200 bg-white space-y-2">
                    <span className="font-bold text-stone-900 text-xs block">
                      Option A: Create a New Menu Spreadsheet
                    </span>
                    <p className="text-stone-600 text-xs leading-relaxed">
                      Automatically generate a pre-formatted Google Sheet in your Google Drive populated with all current {menuItems.length} café drinks and dishes.
                    </p>
                    <button
                      onClick={handleCreateNewSheet}
                      disabled={isSyncingSheet}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-semibold text-xs transition-colors cursor-pointer shadow-xs disabled:opacity-60"
                    >
                      <PlusCircle className="w-4 h-4 text-amber-400" />
                      <span>{isSyncingSheet ? 'Creating...' : 'Create New Menu Sheet in Google Drive'}</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-xl border border-stone-200 bg-white space-y-2">
                    <span className="font-bold text-stone-900 text-xs block">
                      Option B: Connect an Existing Spreadsheet
                    </span>
                    <form onSubmit={handleConnectExisting} className="space-y-2">
                      <input
                        type="text"
                        value={inputUrlOrId}
                        onChange={(e) => setInputUrlOrId(e.target.value)}
                        placeholder="Paste Google Sheet URL or Spreadsheet ID..."
                        className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-stone-900 font-mono"
                      />
                      <button
                        type="submit"
                        disabled={isSyncingSheet || !inputUrlOrId.trim()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg font-semibold text-xs border border-stone-300 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                        <span>Connect & Sync</span>
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* Instructions on Column format */}
              <div className="p-3.5 rounded-xl bg-stone-100 border border-stone-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-stone-800 font-semibold text-[11px]">
                  <Info className="w-3.5 h-3.5 text-stone-500" />
                  <span>How to Edit or Add Products in Google Sheets:</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Open your sheet and edit any price in column <strong>D (Price)</strong> or add a new row with <strong>ID, Name, Category, Price, Description, Dietary</strong>.
                  Then click <strong>Sync Menu Now</strong> to refresh your live website instantly!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="py-2 px-4 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-100 rounded-lg border border-stone-300 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Confirmation Dialog for Destructive / Sync Operations (Mandatory per Skill) */}
      {confirmDialog?.isOpen && (
        <div className="fixed inset-0 z-60 bg-stone-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in zoom-in-95">
            <h3 className="font-serif text-base font-bold text-stone-900">
              {confirmDialog.title}
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              {confirmDialog.description}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const act = confirmDialog.action;
                  setConfirmDialog(null);
                  await act();
                }}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
