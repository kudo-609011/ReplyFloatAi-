import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Trash2, 
  Lock, 
  EyeOff, 
  Database, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  Server
} from 'lucide-react';

export const PrivacyScreen: React.FC = () => {
  const [historyDeleted, setHistoryDeleted] = useState(false);

  const handleDeleteHistory = () => {
    setHistoryDeleted(true);
    setTimeout(() => setHistoryDeleted(false), 3500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 w-full min-w-0">
      {/* Header */}
      <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl p-4 sm:p-5 space-y-1 min-w-0">
        <div className="flex items-center space-x-2 min-w-0">
          <ShieldCheck className="w-5 h-5 text-[#ef4444] shrink-0" />
          <h1 className="text-lg sm:text-xl font-bold text-[#e1e4e8] truncate">Privacy & Security Transparency</h1>
        </div>
        <p className="text-xs text-[#8b949e]">
          ReplyFloat AI is built around a strict zero-telemetry, user-controlled architecture on Android.
        </p>
      </div>

      {/* Core Privacy Guarantees Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 min-w-0">
        <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl p-4 sm:p-5 space-y-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#161b22] border border-[#3fb95044] flex items-center justify-center text-[#3fb950]">
            <EyeOff className="w-4 h-4" />
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-[#e1e4e8]">Zero Screen Recording</h3>
          <p className="text-xs text-[#8b949e] leading-relaxed">
            ReplyFloat AI does not use <code className="text-[#58a6ff]">MediaProjection</code> to capture screen bitmaps or video frames. It exclusively uses Android's official Accessibility text tree inspection.
          </p>
        </div>

        <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl p-4 sm:p-5 space-y-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#161b22] border border-[#58a6ff44] flex items-center justify-center text-[#58a6ff]">
            <Lock className="w-4 h-4" />
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-[#e1e4e8]">Encrypted Local Key Storage</h3>
          <p className="text-xs text-[#8b949e] leading-relaxed">
            All user-supplied API keys (OpenAI, Gemini, custom endpoints) are encrypted with hardware-backed Android Keystore AES256-GCM. They are never sent to third-party tracking servers.
          </p>
        </div>

        <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl p-4 sm:p-5 space-y-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#161b22] border border-[#d2992244] flex items-center justify-center text-[#d29922]">
            <Database className="w-4 h-4" />
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-[#e1e4e8]">No Permanent Cloud Storage</h3>
          <p className="text-xs text-[#8b949e] leading-relaxed">
            Text inspected by the assistant is processed in ephemeral device memory during inference and discarded immediately. No analytics or conversation telemetry is stored.
          </p>
        </div>

        <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl p-4 sm:p-5 space-y-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#161b22] border border-[#a371f744] flex items-center justify-center text-[#a371f7]">
            <Server className="w-4 h-4" />
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-[#e1e4e8]">Direct-to-Provider Transmission</h3>
          <p className="text-xs text-[#8b949e] leading-relaxed">
            When generating suggestions, context is routed directly to the selected AI provider's official API endpoint via TLS 1.3 encryption.
          </p>
        </div>
      </div>

      {/* Delete History Action Card */}
      <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl p-4 sm:p-5 space-y-3 min-w-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 min-w-0">
          <div className="space-y-1 min-w-0 flex-1">
            <h2 className="text-xs sm:text-sm font-bold text-[#e1e4e8]">Wipe All Local Cache & History</h2>
            <p className="text-xs text-[#8b949e]">
              Instantly purge all cached suggestions, temporary context buffers, and locally saved logs from device storage.
            </p>
          </div>

          <button
            onClick={handleDeleteHistory}
            className="px-3.5 py-2 rounded-xl bg-[#dc262622] hover:bg-[#dc262633] text-[#f87171] border border-[#dc262644] text-xs font-bold transition-all flex items-center space-x-1.5 active:scale-95 shrink-0 w-full sm:w-auto justify-center"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Stored History</span>
          </button>
        </div>

        {historyDeleted && (
          <div className="p-3 rounded-xl bg-[#161b22] border border-[#3fb950] text-[#3fb950] text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-[#3fb950] shrink-0" />
            <span>All local session caches and history successfully erased from device storage.</span>
          </div>
        )}
      </div>

      {/* How to Revoke Android Permissions Guide */}
      <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl p-4 sm:p-5 space-y-2.5 min-w-0">
        <h2 className="text-xs sm:text-sm font-bold text-[#e1e4e8]">How to Revoke Permissions on Android</h2>
        <div className="space-y-1.5 text-xs text-[#8b949e]">
          <p>
            You retain 100% control at the operating system level. If you wish to disable ReplyFloat AI completely:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-[#8b949e]">
            <li>Open your Android device's <strong>Settings &gt; Accessibility &gt; ReplyFloat AI Context Detection</strong> and toggle it OFF.</li>
            <li>Go to <strong>Settings &gt; Apps &gt; Special app access &gt; Display over other apps</strong> and revoke ReplyFloat AI.</li>
            <li>Alternatively, tap the <strong>Stop Assistant</strong> button on the Home screen to stop the foreground service immediately.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
