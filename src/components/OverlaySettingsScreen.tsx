import React, { useState } from 'react';
import { 
  Layers, 
  Eye, 
  Move, 
  Maximize2, 
  ShieldAlert, 
  Lock, 
  Unlock, 
  Sliders, 
  SlidersHorizontal,
  Info,
  Smartphone,
  Sparkles,
  Type,
  Maximize,
  Minimize2,
  Copy,
  Check,
  SendHorizontal,
  Bot,
  RefreshCw,
  Edit3,
  Timer,
  RotateCcw,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { 
  OverlaySettings, 
  OverlayPosition, 
  OverlaySize, 
  OverlayInteractionMode,
  OverlayFontSize,
  OverlayCornerRadius,
  OverlaySpacing,
  OverlayDisplayMode
} from '../types';
import { copyToClipboard } from '../utils/clipboard';

interface OverlaySettingsScreenProps {
  settings: OverlaySettings;
  onUpdateSettings: (newSettings: Partial<OverlaySettings>) => void;
}

export const OverlaySettingsScreen: React.FC<OverlaySettingsScreenProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [copiedPreviewId, setCopiedPreviewId] = useState<string | null>(null);

  const autoHide = settings?.autoHide || {
    enabled: true,
    durationSeconds: 8,
    hideOnCopy: true,
    pauseOnHover: true,
  };

  const updateAutoHide = (patch: Partial<typeof autoHide>) => {
    onUpdateSettings({
      autoHide: {
        ...autoHide,
        ...patch,
      },
    });
  };

  const positions: Array<{ id: OverlayPosition; label: string }> = [
    { id: 'top-right', label: 'Top-Right' },
    { id: 'top-left', label: 'Top-Left' },
    { id: 'bottom-right', label: 'Bottom-Right' },
    { id: 'bottom-left', label: 'Bottom-Left' },
    { id: 'center', label: 'Screen Center' },
    { id: 'custom', label: 'Draggable / Free' },
  ];

  const modes: Array<{ id: OverlayInteractionMode; title: string; desc: string; icon: any }> = [
    {
      id: 'interactive',
      title: 'Interactive Mode',
      desc: 'Floating replies can be tapped, selected, edited, copied, and dragged.',
      icon: Lock,
    },
    {
      id: 'passthrough',
      title: 'Pass-through Mode',
      desc: 'Applies FLAG_NOT_TOUCHABLE. Touches pass directly through overlay to the underlying app.',
      icon: Unlock,
    },
    {
      id: 'minimal',
      title: 'Minimal Mode',
      desc: 'Collapses to a small floating indicator bubble. Tap to expand replies.',
      icon: Minimize2,
    },
  ];

  const fontSizes: Array<{ id: OverlayFontSize; label: string; sample: string }> = [
    { id: 'small', label: 'Small (11px)', sample: 'Compact font for tight gaming screens' },
    { id: 'medium', label: 'Medium (13px)', sample: 'Standard balanced size for messaging' },
    { id: 'large', label: 'Large (15px)', sample: 'Spacious typography for easier reading' },
    { id: 'xlarge', label: 'Extra Large (17px)', sample: 'High legibility and accessibility' },
  ];

  const cornerRadii: Array<{ id: OverlayCornerRadius; label: string; px: string }> = [
    { id: 'none', label: 'Sharp (0px)', px: '0px' },
    { id: 'small', label: 'Subtle (6px)', px: '6px' },
    { id: 'medium', label: 'Standard (12px)', px: '12px' },
    { id: 'large', label: 'Large (18px)', px: '18px' },
    { id: 'pill', label: 'Soft Pill (24px)', px: '24px' },
  ];

  const spacings: Array<{ id: OverlaySpacing; label: string; desc: string }> = [
    { id: 'compact', label: 'Compact (4px)', desc: 'Minimal gap between items' },
    { id: 'standard', label: 'Standard (8px)', desc: 'Balanced card separation' },
    { id: 'relaxed', label: 'Relaxed (12px)', desc: 'Airy spacious layout' },
  ];

  const currentMode = settings.interactionMode || (settings.passThroughMode ? 'passthrough' : 'interactive');

  // Preview styling helpers
  const previewFontSize = {
    small: 'text-[11px]',
    medium: 'text-xs',
    large: 'text-sm',
    xlarge: 'text-base',
  }[settings.fontSize || 'medium'];

  const previewRadius = {
    none: 'rounded-none',
    small: 'rounded-md',
    medium: 'rounded-xl',
    large: 'rounded-2xl',
    pill: 'rounded-3xl',
  }[settings.cornerRadius || 'medium'];

  const previewSpacing = {
    compact: 'space-y-1',
    standard: 'space-y-2',
    relaxed: 'space-y-3',
  }[settings.itemSpacing || 'standard'];

  const handlePreviewCopy = async (id: string, text: string) => {
    await copyToClipboard(text);
    setCopiedPreviewId(id);
    setTimeout(() => setCopiedPreviewId(null), 2000);
  };

  const appPositions: Record<string, { x: number; y: number }> = settings.appPositions || {
    'WhatsApp': { x: 15, y: 70 },
    'Super Sus': { x: 20, y: 35 },
    'Virtual Master': { x: 15, y: 80 },
    'Discord': { x: 25, y: 90 },
  };

  const handleResetAppPosition = (appName: string) => {
    const updated = { ...appPositions };
    delete updated[appName];
    onUpdateSettings({ appPositions: updated });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl p-5 space-y-1">
        <div className="flex items-center space-x-2">
          <Layers className="w-5 h-5 text-[#58a6ff]" />
          <h1 className="text-xl font-bold text-[#e1e4e8]">Floating Overlay Customization & Window Behavior</h1>
        </div>
        <p className="text-xs text-[#8b949e]">
          Configure Realme Bullet Notification style, auto-hide duration timers, per-app position memory, and touch pass-through.
        </p>
      </div>

      {/* SECTION 0: CONTINUOUS SCREEN ANALYSIS (ON / OFF) */}
      <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#30363d]">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-[#3fb950]" />
              <h2 className="text-base font-bold text-[#e1e4e8]">Continuous Screen Analysis</h2>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                settings.screenAnalysisEnabled !== false
                  ? 'bg-[#23863622] text-[#3fb950] border border-[#23863644]'
                  : 'bg-[#21262d] text-[#8b949e] border border-[#30363d]'
              }`}>
                {settings.screenAnalysisEnabled !== false ? 'Active (Continuous)' : 'Paused (Manual Only)'}
              </span>
            </div>
            <p className="text-xs text-[#8b949e]">
              When ON, the background Accessibility service continuously monitors on-screen messages and conversation changes to suggest replies proactively. When OFF, automatic analysis is paused and suggestions are only generated on manual request.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              id="toggle-screen-analysis"
              type="checkbox"
              checked={settings.screenAnalysisEnabled !== false}
              onChange={e => onUpdateSettings({ screenAnalysisEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-[#21262d] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#238636]"></div>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#8b949e]">
          <div className="p-3 rounded-xl bg-[#161b22] border border-[#30363d] space-y-1">
            <span className="font-bold text-[#e1e4e8]">Real-Time Accessibility Node Tracking</span>
            <p className="text-[11px]">
              Processes text changes off the UI thread without impacting device frame rates or foreground app responsiveness.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#161b22] border border-[#30363d] space-y-1">
            <span className="font-bold text-[#e1e4e8]">Smart Debounce & Rate Protection</span>
            <p className="text-[11px]">
              Filters non-chat UI noise and honors cooldown intervals to prevent unnecessary AI calls.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 1: OVERLAY DISPLAY STYLE (REALME BULLET NOTIFICATION VS STANDARD PANEL) */}
      <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl p-5 space-y-4">
        <div className="space-y-1 pb-3 border-b border-[#30363d]">
          <h2 className="text-base font-bold text-[#e1e4e8]">Overlay Display Architecture</h2>
          <p className="text-xs text-[#8b949e]">
            Choose between a non-intrusive Realme Bullet Notification capsule or a full floating conversation panel.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            onClick={() => onUpdateSettings({ overlayMode: 'bullet' })}
            className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
              settings.overlayMode === 'bullet'
                ? 'bg-[#58a6ff15] border-[#58a6ff] ring-1 ring-[#58a6ff]'
                : 'bg-[#161b22] border-[#30363d] hover:border-[#8b949e]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-lg bg-[#58a6ff] flex items-center justify-center text-white font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-bold text-[#e1e4e8]">Realme Bullet Notification</span>
              </div>
              {settings.overlayMode === 'bullet' && <CheckCircle2 className="w-4 h-4 text-[#58a6ff]" />}
            </div>
            <p className="text-xs text-[#8b949e] leading-relaxed">
              Ultra-compact, sleek horizontal pill that floats at the top/corner of your screen. Silently understands context, shows understanding + reply, and auto-minimizes upon copy.
            </p>
            <div className="p-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-[10px] text-[#58a6ff] font-mono">
              Ideal for gaming (Super Sus) & non-stop media viewing.
            </div>
          </div>

          <div
            onClick={() => onUpdateSettings({ overlayMode: 'standard' })}
            className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
              settings.overlayMode !== 'bullet'
                ? 'bg-[#dc262615] border-[#ef4444] ring-1 ring-[#ef4444]'
                : 'bg-[#161b22] border-[#30363d] hover:border-[#8b949e]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-lg bg-[#dc2626] flex items-center justify-center text-white font-bold">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-bold text-[#e1e4e8]">Standard Floating Panel</span>
              </div>
              {settings.overlayMode !== 'bullet' && <CheckCircle2 className="w-4 h-4 text-[#ef4444]" />}
            </div>
            <p className="text-xs text-[#8b949e] leading-relaxed">
              Comprehensive card with tone selector tabs, expandable response cards, inline text editing, and quick action bars.
            </p>
            <div className="p-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-[10px] text-[#f87171] font-mono">
              Ideal for detailed debates & multi-turn discussions (WhatsApp, Reddit).
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: COMPACT REPLYFLOAT BAR & LAUNCHER */}
      <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#30363d]">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-[#ef4444]" />
              <h2 className="text-base font-bold text-[#e1e4e8]">Compact ReplyFloat Bar</h2>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                settings.showCompactBar !== false 
                  ? 'bg-[#23863622] text-[#3fb950] border border-[#23863644]' 
                  : 'bg-[#21262d] text-[#8b949e]'
              }`}>
                {settings.showCompactBar !== false ? 'Enabled' : 'Hidden'}
              </span>
            </div>
            <p className="text-xs text-[#8b949e]">
              Show the floating capsule launcher when the overlay is collapsed or auto-hidden. You can drag and resize it independently from the full overlay.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              id="toggle-compact-bar"
              type="checkbox"
              checked={settings.showCompactBar !== false}
              onChange={e => onUpdateSettings({ showCompactBar: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-[#21262d] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ef4444]"></div>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#8b949e]">
          <div className="p-3 rounded-xl bg-[#161b22] border border-[#30363d] space-y-1">
            <span className="font-bold text-[#e1e4e8]">Independent Sizing & Position</span>
            <p className="text-[11px]">
              The compact bar has its own saved coordinates and dimensions. Drag corners to make it smaller or larger without affecting the full overlay.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#161b22] border border-[#30363d] space-y-1 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-[#e1e4e8]">Reset Compact Bar Dimensions</span>
              <p className="text-[11px]">
                Restore default size (approx 160px width) and corner position.
              </p>
            </div>
            <button
              onClick={() => {
                try {
                  localStorage.removeItem('replyfloat_compact_width');
                  localStorage.removeItem('replyfloat_compact_height');
                  localStorage.removeItem('replyfloat_compact_x');
                  localStorage.removeItem('replyfloat_compact_y');
                } catch {}
                onUpdateSettings({
                  compactWidth: undefined,
                  compactHeight: undefined,
                  compactX: 15,
                  compactY: 70,
                });
              }}
              className="px-2.5 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-white text-[11px] font-bold shrink-0 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 3: AUTO-HIDE & VISIBLE DURATION */}
      <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#30363d]">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Timer className="w-5 h-5 text-[#58a6ff]" />
              <h2 className="text-base font-bold text-[#e1e4e8]">Auto-Hide & Screen Timeout</h2>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                autoHide.enabled 
                  ? 'bg-[#58a6ff22] text-[#58a6ff] border border-[#58a6ff44]' 
                  : 'bg-[#21262d] text-[#8b949e]'
              }`}>
                {autoHide.enabled ? `${autoHide.durationSeconds}s Timeout` : 'Always Visible'}
              </span>
            </div>
            <p className="text-xs text-[#8b949e]">
              Automatically minimizes the floating overlay back into a compact bubble after a customizable period of inactivity.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              id="toggle-auto-hide"
              type="checkbox"
              checked={autoHide.enabled}
              onChange={e => updateAutoHide({ enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-[#21262d] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#58a6ff]"></div>
          </label>
        </div>

        {autoHide.enabled && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            {/* Duration Slider */}
            <div className="p-3.5 rounded-xl bg-[#161b22] border border-[#30363d] space-y-2 md:col-span-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#e1e4e8]">Visible Time on Screen</span>
                <span className="font-mono text-xs text-[#58a6ff] font-bold">{autoHide.durationSeconds}s</span>
              </div>
              <input
                type="range"
                min="3"
                max="30"
                step="1"
                value={autoHide.durationSeconds}
                onChange={e => updateAutoHide({ durationSeconds: parseInt(e.target.value, 10) })}
                className="w-full h-1.5 bg-[#21262d] rounded-lg appearance-none cursor-pointer accent-[#58a6ff]"
              />
              <p className="text-[10px] text-[#8b949e]">
                Timer pauses while you are actively touching or hovering over the card.
              </p>
            </div>

            {/* Hide on Copy */}
            <div className="p-3.5 rounded-xl bg-[#161b22] border border-[#30363d] flex items-center justify-between">
              <div className="space-y-0.5 pr-2">
                <span className="text-xs font-bold text-[#e1e4e8]">Auto-Hide on Copy</span>
                <p className="text-[11px] text-[#8b949e]">
                  Immediately minimizes to pill once you tap to copy a reply.
                </p>
              </div>
              <input
                type="checkbox"
                checked={autoHide.hideOnCopy}
                onChange={e => updateAutoHide({ hideOnCopy: e.target.checked })}
                className="w-4 h-4 rounded bg-[#0d1117] border-[#30363d] text-[#dc2626] focus:ring-0 cursor-pointer"
              />
            </div>

            {/* Pause on Hover */}
            <div className="p-3.5 rounded-xl bg-[#161b22] border border-[#30363d] flex items-center justify-between">
              <div className="space-y-0.5 pr-2">
                <span className="text-xs font-bold text-[#e1e4e8]">Pause on Touch / Hover</span>
                <p className="text-[11px] text-[#8b949e]">
                  Keeps card open while you are reading or interacting.
                </p>
              </div>
              <input
                type="checkbox"
                checked={autoHide.pauseOnHover}
                onChange={e => updateAutoHide({ pauseOnHover: e.target.checked })}
                className="w-4 h-4 rounded bg-[#0d1117] border-[#30363d] text-[#dc2626] focus:ring-0 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: PER-APP POSITION MEMORY */}
      <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl p-5 space-y-4">
        <div className="space-y-1 pb-3 border-b border-[#30363d]">
          <div className="flex items-center space-x-2">
            <Move className="w-5 h-5 text-[#f87171]" />
            <h2 className="text-base font-bold text-[#e1e4e8]">Per-Application Saved Positions</h2>
          </div>
          <p className="text-xs text-[#8b949e]">
            ReplyFloat AI independently remembers where you place the overlay for each app (e.g. top for Super Sus, middle for WhatsApp).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(appPositions).map(([appName, pos]) => (
            <div
              key={appName}
              className="p-3 rounded-xl bg-[#161b22] border border-[#30363d] flex items-center justify-between"
            >
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[#e1e4e8]">{appName}</span>
                <p className="text-[10px] text-[#8b949e] font-mono">
                  X: {pos.x}px • Y: {pos.y}px
                </p>
              </div>
              <button
                onClick={() => handleResetAppPosition(appName)}
                className="p-1 text-[#8b949e] hover:text-[#f85149] rounded transition-colors"
                title="Reset position"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: INTERACTION MODES */}
      <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl p-5 space-y-4">
        <div className="space-y-1 pb-3 border-b border-[#30363d]">
          <h2 className="text-base font-bold text-[#e1e4e8]">Overlay Interaction Modes</h2>
          <p className="text-xs text-[#8b949e]">
            Control how touches are processed by the Android WindowManager (Interactive, Pass-Through, or Minimal).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {modes.map(mode => {
            const isSelected = currentMode === mode.id;
            const Icon = mode.icon;
            return (
              <div
                key={mode.id}
                onClick={() => {
                  onUpdateSettings({
                    interactionMode: mode.id,
                    passThroughMode: mode.id === 'passthrough',
                  });
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                  isSelected
                    ? mode.id === 'passthrough'
                      ? 'bg-[#d2992215] border-[#d29922] ring-1 ring-[#d29922]'
                      : 'bg-[#dc262615] border-[#ef4444] ring-1 ring-[#ef4444]'
                    : 'bg-[#161b22] border-[#30363d] hover:border-[#8b949e]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className={`w-4 h-4 ${isSelected ? (mode.id === 'passthrough' ? 'text-[#d29922]' : 'text-[#f87171]') : 'text-[#8b949e]'}`} />
                    <span className="text-xs font-bold text-[#e1e4e8]">{mode.title}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#ef4444]" />}
                </div>
                <p className="text-[11px] text-[#8b949e] leading-snug">{mode.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 5: TRANSPARENCY, DIMENSIONS & SPACING */}
      <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl p-5 space-y-4">
        <div className="space-y-1 pb-3 border-b border-[#30363d]">
          <h2 className="text-base font-bold text-[#e1e4e8]">Dimensions, Transparency & Typography</h2>
          <p className="text-xs text-[#8b949e]">
            Fine-tune layout padding, background opacity, and font scales for perfect legibility.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Transparency Slider */}
          <div className="p-3.5 rounded-xl bg-[#161b22] border border-[#30363d] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#e1e4e8]">Overall Window Opacity</span>
              <span className="font-mono text-xs text-[#58a6ff] font-bold">
                {Math.round((settings.transparency ?? 0.95) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.15"
              max="1.0"
              step="0.05"
              value={settings.transparency ?? 0.95}
              onChange={e => onUpdateSettings({ transparency: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-[#21262d] rounded-lg appearance-none cursor-pointer accent-[#58a6ff]"
            />
          </div>

          {/* Background Surface Opacity */}
          <div className="p-3.5 rounded-xl bg-[#161b22] border border-[#30363d] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#e1e4e8]">Card Background Opacity</span>
              <span className="font-mono text-xs text-[#f87171] font-bold">
                {Math.round((settings.backgroundTransparency ?? 0.95) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.15"
              max="1.0"
              step="0.05"
              value={settings.backgroundTransparency ?? 0.95}
              onChange={e => onUpdateSettings({ backgroundTransparency: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-[#21262d] rounded-lg appearance-none cursor-pointer accent-[#dc2626]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
