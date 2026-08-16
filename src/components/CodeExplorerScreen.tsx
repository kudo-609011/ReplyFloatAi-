import React, { useState } from 'react';
import { 
  Code2, 
  Download, 
  FileCode, 
  Folder, 
  Copy, 
  Check, 
  Terminal, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { ANDROID_PROJECT_FILES } from '../data/androidSourceCode';
import { copyToClipboard } from '../utils/clipboard';

interface CodeExplorerScreenProps {
  onExportZip: () => void;
  isExporting: boolean;
}

export const CodeExplorerScreen: React.FC<CodeExplorerScreenProps> = ({
  onExportZip,
  isExporting,
}) => {
  const [selectedFileIndex, setSelectedFileIndex] = useState(4); // Default to AndroidManifest.xml or FloatingOverlayService
  const [copied, setCopied] = useState(false);

  const selectedFile = ANDROID_PROJECT_FILES[selectedFileIndex] || ANDROID_PROJECT_FILES[0];

  const handleCopyCode = async () => {
    await copyToClipboard(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 w-full min-w-0">
      {/* Header with Export CTA */}
      <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 min-w-0">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center space-x-2 min-w-0">
            <Code2 className="w-5 h-5 text-[#58a6ff] shrink-0" />
            <h1 className="text-lg sm:text-xl font-bold text-[#e1e4e8] truncate">Android Kotlin Codebase</h1>
          </div>
          <p className="text-xs text-[#8b949e]">
            Ready-to-build Android source tree featuring Jetpack Compose, WindowManager Overlay, and AccessibilityService.
          </p>
        </div>

        <button
          onClick={onExportZip}
          disabled={isExporting}
          className="px-4 py-2 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold text-xs flex items-center space-x-2 transition-all shadow-md active:scale-95 disabled:opacity-50 shrink-0 w-full sm:w-auto justify-center"
        >
          <Download className="w-4 h-4 shrink-0" />
          <span>{isExporting ? 'Packaging ZIP...' : 'Download Project (.ZIP)'}</span>
        </button>
      </div>

      {/* Code Browser split view */}
      <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-auto md:h-[620px] w-full min-w-0">
        {/* Left: File Tree Explorer */}
        <div className="w-full md:w-72 bg-[#161b22] border-b md:border-b-0 md:border-r border-[#30363d] flex flex-col shrink-0 min-w-0">
          <div className="p-3 border-b border-[#30363d] flex items-center justify-between">
            <span className="text-xs font-bold text-[#e1e4e8] uppercase tracking-wider flex items-center space-x-1.5">
              <Folder className="w-4 h-4 text-[#58a6ff]" />
              <span>Project Files</span>
            </span>
            <span className="text-[10px] text-[#8b949e] font-mono">{ANDROID_PROJECT_FILES.length} Files</span>
          </div>

          <div className="max-h-48 md:max-h-none flex-1 overflow-y-auto p-2 space-y-1">
            {ANDROID_PROJECT_FILES.map((file, idx) => {
              const isSelected = idx === selectedFileIndex;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFileIndex(idx)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center space-x-2 transition-all min-w-0 ${
                    isSelected
                      ? 'bg-[#dc262622] text-[#f87171] border border-[#dc262644] font-semibold'
                      : 'text-[#8b949e] hover:text-[#e1e4e8] hover:bg-[#21262d]'
                  }`}
                >
                  <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#f87171]' : 'text-[#8b949e]'}`} />
                  <span className="truncate font-mono text-[11px] min-w-0 flex-1">{file.path}</span>
                </button>
              );
            })}
          </div>

          <div className="p-2.5 bg-[#0d1117] border-t border-[#30363d] text-[11px] text-[#8b949e] space-y-1">
            <span className="font-semibold text-[#e1e4e8] block text-[10px]">APK Build Command:</span>
            <code className="text-[#58a6ff] block font-mono text-[10px] bg-[#161b22] px-2 py-1 rounded border border-[#30363d] truncate">
              ./gradlew assembleDebug
            </code>
          </div>
        </div>

        {/* Right: Code Viewer */}
        <div className="flex-1 flex flex-col bg-[#0a0c10] overflow-hidden min-w-0 max-w-full">
          {/* File Header */}
          <div className="bg-[#161b22] px-3 sm:px-4 py-2.5 border-b border-[#30363d] flex items-center justify-between gap-2 min-w-0">
            <div className="space-y-0.5 min-w-0 flex-1">
              <div className="flex items-center space-x-2 min-w-0">
                <span className="text-xs font-bold text-[#e1e4e8] font-mono truncate">{selectedFile.path}</span>
                <span className="text-[9px] uppercase px-1.5 py-0.2 bg-[#21262d] text-[#8b949e] rounded shrink-0">
                  {selectedFile.language}
                </span>
              </div>
              <p className="text-[10px] text-[#8b949e] truncate">{selectedFile.description}</p>
            </div>

            <button
              onClick={handleCopyCode}
              className="px-2.5 py-1 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-[#e1e4e8] text-xs font-medium flex items-center space-x-1.5 transition-colors shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#3fb950]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Code Text Area */}
          <div className="flex-1 overflow-x-auto overflow-y-auto p-3 sm:p-4 font-mono text-xs text-[#e1e4e8] leading-relaxed bg-[#0a0c10] min-w-0 max-w-full h-80 md:h-auto">
            <pre className="whitespace-pre font-mono text-[11px] sm:text-xs leading-relaxed inline-block min-w-full">{selectedFile.content}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
