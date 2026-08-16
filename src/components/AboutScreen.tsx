import React from 'react';
import { 
  Bot, 
  Cpu, 
  Layers, 
  ShieldCheck, 
  Smartphone, 
  Sparkles, 
  CheckCircle2, 
  GitBranch,
  Terminal
} from 'lucide-react';

export const AboutScreen: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 w-full min-w-0">
      {/* Header Banner */}
      <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl p-4 sm:p-5 flex items-center space-x-3.5 min-w-0">
        <div className="w-12 h-12 rounded-xl bg-[#dc2626] flex items-center justify-center text-white shrink-0 shadow-md">
          <Bot className="w-7 h-7 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <h1 className="text-lg sm:text-xl font-bold text-[#e1e4e8] truncate">ReplyFloat AI</h1>
            <span className="text-[10px] font-mono bg-[#dc262622] text-[#f87171] border border-[#dc262644] px-2 py-0.5 rounded-full font-bold">
              v1.0.0 (API 35)
            </span>
          </div>
          <p className="text-xs text-[#8b949e] mt-0.5 truncate">
            Intelligent Floating Contextual Reply Engine for Android
          </p>
        </div>
      </div>

      {/* Architecture Breakdown Diagram */}
      <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl p-4 sm:p-5 space-y-3 min-w-0">
        <h2 className="text-xs sm:text-sm font-bold text-[#e1e4e8] flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-[#ef4444]" />
          <span>System Pipeline & Android Architecture</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs min-w-0">
          <div className="p-3.5 rounded-xl bg-[#161b22] border border-[#30363d] space-y-1.5 min-w-0 border-l-2 border-l-[#dc2626]">
            <div className="text-[10px] font-bold text-[#f87171] uppercase font-mono">1. Detection Hook</div>
            <h4 className="font-bold text-[#e1e4e8]">AccessibilityService</h4>
            <p className="text-[#8b949e] text-[11px] leading-relaxed">
              Monitors window events on whitelisted apps. Inspects the node hierarchy without screen capture.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#161b22] border border-[#30363d] space-y-1.5 min-w-0 border-l-2 border-l-[#58a6ff]">
            <div className="text-[10px] font-bold text-[#58a6ff] uppercase font-mono">2. Debounce Filter</div>
            <h4 className="font-bold text-[#e1e4e8]">Package Whitelist</h4>
            <p className="text-[#8b949e] text-[11px] leading-relaxed">
              Discards typing noise, micro-scrolls, and unselected packages to save CPU and battery life.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#161b22] border border-[#30363d] space-y-1.5 min-w-0 border-l-2 border-l-[#a371f7]">
            <div className="text-[10px] font-bold text-[#a371f7] uppercase font-mono">3. AI Provider Engine</div>
            <h4 className="font-bold text-[#e1e4e8]">Multi-Model Client</h4>
            <p className="text-[#8b949e] text-[11px] leading-relaxed">
              Dispatches structured prompt to Gemini, OpenAI, or custom endpoint for instant reply synthesis.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#161b22] border border-[#30363d] space-y-1.5 min-w-0 border-l-2 border-l-[#3fb950]">
            <div className="text-[10px] font-bold text-[#3fb950] uppercase font-mono">4. Floating Surface</div>
            <h4 className="font-bold text-[#e1e4e8]">WindowManager Overlay</h4>
            <p className="text-[#8b949e] text-[11px] leading-relaxed">
              Renders ComposeView with configurable opacity, drag mechanics, and touch pass-through flags.
            </p>
          </div>
        </div>
      </div>

      {/* Android Version Compatibility */}
      <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl p-4 sm:p-5 space-y-2.5 min-w-0">
        <h2 className="text-xs sm:text-sm font-bold text-[#e1e4e8]">Target Compatibility & Stack Specifications</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs min-w-0">
          <div className="p-2.5 bg-[#161b22] rounded-xl border border-[#30363d] min-w-0">
            <span className="text-[#8b949e] block text-[10px]">Min Android SDK</span>
            <span className="font-bold text-[#e1e4e8] font-mono text-[11px]">API 26 (Android 8.0)</span>
          </div>
          <div className="p-2.5 bg-[#161b22] rounded-xl border border-[#30363d] min-w-0">
            <span className="text-[#8b949e] block text-[10px]">Target Android SDK</span>
            <span className="font-bold text-[#f87171] font-mono text-[11px]">API 35 (Android 15)</span>
          </div>
          <div className="p-2.5 bg-[#161b22] rounded-xl border border-[#30363d] min-w-0">
            <span className="text-[#8b949e] block text-[10px]">UI Framework</span>
            <span className="font-bold text-[#e1e4e8] font-mono text-[11px]">Jetpack Compose 2025</span>
          </div>
          <div className="p-2.5 bg-[#161b22] rounded-xl border border-[#30363d] min-w-0">
            <span className="text-[#8b949e] block text-[10px]">Language</span>
            <span className="font-bold text-[#e1e4e8] font-mono text-[11px]">Kotlin 2.1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};
