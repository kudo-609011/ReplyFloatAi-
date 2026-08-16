import React from 'react';
import { 
  Bot, 
  Power, 
  Layers, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Smartphone, 
  ArrowRight, 
  Sliders, 
  AppWindow, 
  Cpu,
  RefreshCw,
  ExternalLink,
  Zap,
  ZapOff,
  MousePointerClick
} from 'lucide-react';
import { 
  InstalledApp, 
  OverlaySettings, 
  AIProviderConfig, 
  PermissionStatus,
  ReplySettings
} from '../types';

interface HomeScreenProps {
  isServiceActive: boolean;
  setIsServiceActive: (active: boolean) => void;
  overlaySettings: OverlaySettings;
  replySettings: ReplySettings;
  activeProvider: AIProviderConfig;
  currentApp: InstalledApp;
  supportedAppsCount: number;
  permissions: PermissionStatus;
  onNavigateTab: (tab: any) => void;
  onTriggerTest: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  isServiceActive,
  setIsServiceActive,
  overlaySettings,
  replySettings,
  activeProvider,
  currentApp,
  supportedAppsCount,
  permissions,
  onNavigateTab,
  onTriggerTest,
}) => {
  const isAuto = replySettings?.autoGenerate?.enabled ?? true;
  const providerName = activeProvider?.name || 'Google Gemini';
  const providerModel = activeProvider?.model || 'gemini-3.7-flash';
  const selectedStyle = replySettings?.selectedStyle || 'Logical';
  const suggestionCount = replySettings?.suggestionCount || 3;
  const responseLength = replySettings?.responseLength || 'normal';
  const debounceMs = replySettings?.autoGenerate?.minDelayBeforeGeneratingMs || 500;
  const transparency = Math.round(((overlaySettings?.transparency ?? 0.95)) * 100);
  const isPassThrough = overlaySettings?.passThroughMode || overlaySettings?.interactionMode === 'passthrough';

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Hero Master Status Banner */}
      <div className={`p-5 rounded-2xl border transition-all ${
        isServiceActive
          ? 'bg-[#0d1117] border-[#dc2626] shadow-sm'
          : 'bg-[#0d1117] border-[#30363d]'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className={`w-2.5 h-2.5 rounded-full ${isServiceActive ? 'bg-[#ef4444] animate-pulse' : 'bg-[#6e7681]'}`} />
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#8b949e]">
                System Assistant Status
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#e1e4e8] tracking-tight">
              {isServiceActive ? 'ReplyFloat AI Daemon: ACTIVE' : 'ReplyFloat AI Daemon: PAUSED'}
            </h1>
            <p className="text-xs text-[#8b949e] max-w-xl leading-relaxed">
              {isServiceActive
                ? `Inspecting text node trees with ${isAuto ? 'Automatic Reply Generation (Hands-Free)' : 'Manual Generation'}. Overlays float unobtrusively over whitelisted apps.`
                : 'Service paused. Enable to resume context extraction and floating overlay controls.'}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="home-master-toggle-btn"
              onClick={() => setIsServiceActive(!isServiceActive)}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all shadow-sm active:scale-95 ${
                isServiceActive
                  ? 'bg-[#21262d] text-[#8b949e] border border-[#30363d] hover:bg-[#30363d]'
                  : 'bg-[#dc2626] hover:bg-[#b91c1c] text-white'
              }`}
            >
              <Power className="w-4 h-4" />
              <span>{isServiceActive ? 'STOP ASSISTANT' : 'START ASSISTANT'}</span>
            </button>
          </div>
        </div>

        {/* Live Quick Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-[#30363d]">
          <div className="bg-[#161b22] p-2.5 rounded-xl border border-[#30363d]">
            <span className="text-[10px] text-[#8b949e] uppercase font-bold tracking-wider">AI Provider</span>
            <div className="text-xs font-bold text-[#58a6ff] truncate mt-0.5">{providerName}</div>
            <span className="text-[10px] text-[#6e7681] font-mono">{providerModel}</span>
          </div>

          <div className="bg-[#161b22] p-2.5 rounded-xl border border-[#30363d]">
            <span className="text-[10px] text-[#8b949e] uppercase font-bold tracking-wider">Auto-Generation</span>
            <div className={`text-xs font-bold mt-0.5 flex items-center space-x-1 ${isAuto ? 'text-[#f87171]' : 'text-[#8b949e]'}`}>
              {isAuto ? <Zap className="w-3 h-3 text-[#ef4444]" /> : <ZapOff className="w-3 h-3 text-[#8b949e]" />}
              <span>{isAuto ? 'ACTIVE (Auto)' : 'MANUAL ONLY'}</span>
            </div>
            <span className="text-[10px] text-[#6e7681]">{debounceMs}ms Debounce</span>
          </div>

          <div className="bg-[#161b22] p-2.5 rounded-xl border border-[#30363d]">
            <span className="text-[10px] text-[#8b949e] uppercase font-bold tracking-wider">Active Reply Style</span>
            <div className="text-xs font-bold text-[#d29922] mt-0.5">{selectedStyle}</div>
            <span className="text-[10px] text-[#6e7681]">{suggestionCount} choices • {responseLength}</span>
          </div>

          <div className="bg-[#161b22] p-2.5 rounded-xl border border-[#30363d]">
            <span className="text-[10px] text-[#8b949e] uppercase font-bold tracking-wider">Overlay Opacity</span>
            <div className="text-xs font-bold text-[#e1e4e8] mt-0.5">{transparency}% Opacity</div>
            <span className="text-[10px] text-[#6e7681]">{isPassThrough ? 'Pass-Through Active' : 'Interactive Touch'}</span>
          </div>
        </div>
      </div>

      {/* Permission Checklist & Diagnostic Status */}
      <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#58a6ff]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#e1e4e8]">Android System Permissions Audit</h2>
          </div>
          <span className="text-[10px] font-bold text-[#f87171] bg-[#dc262622] px-2.5 py-0.5 rounded border border-[#dc262644]">
            ALL PRIVILEGES GRANTED
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Overlay Permission */}
          <div className="p-3 bg-[#161b22] rounded-xl border border-[#30363d] space-y-1.5 border-l-2 border-l-[#dc2626]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#e1e4e8]">Display Over Apps</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#ef4444]" />
            </div>
            <p className="text-[11px] text-[#8b949e] leading-snug">
              Enables transparent floating reply panel via WindowManager TYPE_APPLICATION_OVERLAY.
            </p>
            <span className="text-[10px] text-[#f87171] font-mono block">SYSTEM_ALERT_WINDOW: OK</span>
          </div>

          {/* Accessibility Service */}
          <div className="p-3 bg-[#161b22] rounded-xl border border-[#30363d] space-y-1.5 border-l-2 border-l-[#dc2626]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#e1e4e8]">Accessibility Context</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#ef4444]" />
            </div>
            <p className="text-[11px] text-[#8b949e] leading-snug">
              Reads text node tree on whitelisted apps without taking invasive screenshots.
            </p>
            <span className="text-[10px] text-[#f87171] font-mono block">BIND_ACCESSIBILITY_SERVICE: OK</span>
          </div>

          {/* Foreground Service & Quick Tile */}
          <div className="p-3 bg-[#161b22] rounded-xl border border-[#30363d] space-y-1.5 border-l-2 border-l-[#dc2626]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#e1e4e8]">Foreground Daemon</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#ef4444]" />
            </div>
            <p className="text-[11px] text-[#8b949e] leading-snug">
              Prevents Android OS from killing assistant during gaming or heavy multitasking.
            </p>
            <span className="text-[10px] text-[#f87171] font-mono block">FOREGROUND_SERVICE: OK</span>
          </div>
        </div>
      </div>

      {/* Quick Access Action Hub */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Test in Simulator Card */}
        <div 
          onClick={() => onNavigateTab('simulator')}
          className="p-4 rounded-xl bg-[#0d1117] hover:bg-[#161b22] border border-[#30363d] hover:border-[#58a6ff] transition-all cursor-pointer group space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-[#21262d] border border-[#30363d] flex items-center justify-center text-[#58a6ff]">
              <Smartphone className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-[#6e7681] group-hover:text-[#58a6ff] group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#e1e4e8] group-hover:text-[#58a6ff] transition-colors">
              Interactive Phone Simulator
            </h3>
            <p className="text-[11px] text-[#8b949e] mt-0.5 leading-snug">
              Test floating replies over WhatsApp, Reddit, Discord, and custom questions with automatic generation in real time.
            </p>
          </div>
        </div>

        {/* Auto-Generation & Reply Settings */}
        <div 
          onClick={() => onNavigateTab('reply-settings')}
          className="p-4 rounded-xl bg-[#0d1117] hover:bg-[#161b22] border border-[#30363d] hover:border-[#3fb950] transition-all cursor-pointer group space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-[#21262d] border border-[#30363d] flex items-center justify-center text-[#3fb950]">
              <Zap className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-[#6e7681] group-hover:text-[#3fb950] group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#e1e4e8] group-hover:text-[#3fb950] transition-colors">
              Auto-Generate & Reply Engine
            </h3>
            <p className="text-[11px] text-[#8b949e] mt-0.5 leading-snug">
              Configure debounce timing, request cooldowns, rate limits, and tap-to-copy interactions.
            </p>
          </div>
        </div>

        {/* Floating Overlay Customization */}
        <div 
          onClick={() => onNavigateTab('overlay-settings')}
          className="p-4 rounded-xl bg-[#0d1117] hover:bg-[#161b22] border border-[#30363d] hover:border-[#d29922] transition-all cursor-pointer group space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-[#21262d] border border-[#30363d] flex items-center justify-center text-[#d29922]">
              <Layers className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-[#6e7681] group-hover:text-[#d29922] group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#e1e4e8] group-hover:text-[#d29922] transition-colors">
              Overlay Customizer & Live Preview
            </h3>
            <p className="text-[11px] text-[#8b949e] mt-0.5 leading-snug">
              Adjust width, scale, font size, corner radius, background transparency, and switch between 3 interaction modes.
            </p>
          </div>
        </div>

        {/* Codebase Inspector */}
        <div 
          onClick={() => onNavigateTab('code')}
          className="p-4 rounded-xl bg-[#0d1117] hover:bg-[#161b22] border border-[#30363d] hover:border-[#a371f7] transition-all cursor-pointer group space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-[#21262d] border border-[#30363d] flex items-center justify-center text-[#a371f7]">
              <Cpu className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-[#6e7681] group-hover:text-[#a371f7] group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#e1e4e8] group-hover:text-[#a371f7] transition-colors">
              Inspect & Export APK Project
            </h3>
            <p className="text-[11px] text-[#8b949e] mt-0.5 leading-snug">
              Download complete Android Studio Kotlin project ready for APK compilation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
