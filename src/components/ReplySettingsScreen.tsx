import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Sparkles, 
  Copy, 
  Check, 
  Zap, 
  ZapOff, 
  Clock, 
  ShieldCheck, 
  Gauge, 
  RotateCcw, 
  Filter, 
  Edit3, 
  MousePointerClick,
  Info,
  CheckCircle2,
  Brain,
  Trash2,
  HardDrive,
  Timer,
  FileText,
  Layers
} from 'lucide-react';
import { ReplySettings, ReplyStyle, ResponseLength, AutoGenerationSettings, SummaryLength } from '../types';
import { tempStorageManager, StorageStats } from '../utils/storageCleanup';

interface ReplySettingsScreenProps {
  settings: ReplySettings;
  onUpdateSettings: (newSettings: Partial<ReplySettings>) => void;
}

const STYLES: Array<{ name: ReplyStyle; desc: string; sample: string }> = [
  {
    name: '1-Line',
    desc: 'Ultra-compact single sentence reply with maximum punch.',
    sample: 'Gandhi led India to freedom through nonviolent civil resistance like the Salt March.'
  },
  {
    name: '2-Line',
    desc: 'Exactly two balanced sentences delivering clear context and point.',
    sample: 'Gandhi united millions across India through the philosophy of Satyagraha. His nonviolent campaigns dismantled British colonial authority.'
  },
  {
    name: 'Single-Word',
    desc: 'Strictly one powerful, unambiguous word.',
    sample: 'Satyagraha'
  },
  { 
    name: 'Debate', 
    desc: 'Persuasive, sharp counterpoints highlighting inconsistencies in premises.',
    sample: 'Legal liberation removes state-sponsored barriers; it does not automatically erase ingrained social biases without active reform.'
  },
  { 
    name: 'Funny', 
    desc: 'Witty and humorous reply without offensive language.',
    sample: 'Freedom came with a full user manual, but some people apparently skipped the chapter on equality.'
  },
  {
    name: 'Arrogant',
    desc: 'Smug, superior tone that playfully belittles opposing logic.',
    sample: 'If you honestly have to ask what Gandhi did, you might want to open a history book before debating.'
  },
  {
    name: 'Lord',
    desc: 'Aristocratic, regal demeanor speaking from majestic superiority.',
    sample: 'It is self-evident to any sovereign mind that his grace mobilized a continent with sheer spiritual fortitude.'
  },
  {
    name: 'Passive',
    desc: 'Non-confrontational, accommodating, and mild-mannered.',
    sample: 'Well, if you look at it, his peaceful protests seemed to help bring people together for independence.'
  },
  { 
    name: 'Logical', 
    desc: 'Structured, rational, and evidence-oriented reasoning.',
    sample: 'Freedom is a constitutional guarantee of civil equality, whereas prejudice is a behavioral issue that requires cultural evolution.'
  },
  { 
    name: 'Respectful', 
    desc: 'Polite, calm, empathetic, and constructive tone.',
    sample: 'While legal systems grant fundamental rights to all citizens, overcoming historical social attitudes remains an ongoing societal journey.'
  },
  { 
    name: 'Counterargument', 
    desc: 'Directly addresses counter-claims with rigorous analytical critique.',
    sample: 'The existence of discrimination does not negate constitutional freedom; rather, it highlights the gap between legal theory and social reality.'
  },
  { 
    name: 'Short', 
    desc: 'Direct, high-impact punchy responses.',
    sample: 'Laws mandate civil freedom; culture decides how fairly people treat each other.'
  },
  { 
    name: 'Casual', 
    desc: 'Natural, conversational everyday style.',
    sample: 'Having legal freedom is one thing, but changing age-old mindsets takes time and honest conversations.'
  },
  { 
    name: 'Formal', 
    desc: 'Professional, academic, and articulate phrasing.',
    sample: 'De jure equality guaranteed by constitutional frameworks often diverges from de facto social integration.'
  },
  { 
    name: 'Detailed', 
    desc: 'Comprehensive, multi-point explanation exploring nuances.',
    sample: '1. Constitutional freedom establishes legal equality before the law. 2. Social hierarchies persist due to generational conditioning. 3. Systemic reform requires both policy enforcement and educational initiatives.'
  },
];

export const ReplySettingsScreen: React.FC<ReplySettingsScreenProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const autoGen: AutoGenerationSettings = settings?.autoGenerate || {
    enabled: true,
    generateOnlyOnNewText: true,
    minDelayBeforeGeneratingMs: 500,
    cooldownBetweenRequestsMs: 2500,
    maxGenerationsPerMinute: 12,
    replaceOldSuggestions: true,
    keepPreviousSuggestions: false,
    filterUnrelatedUiText: true,
    conversationHeuristicStrictness: 'standard',
  };

  const understanding = settings?.understanding || {
    enabled: true,
    summaryLength: '1-line',
    autoGenerateWithUnderstanding: true,
  };

  const [storageStats, setStorageStats] = useState<StorageStats>(() => tempStorageManager.getStats());
  const [cleanedToast, setCleanedToast] = useState(false);
  const [minsUntilCleanup, setMinsUntilCleanup] = useState<number>(30);

  useEffect(() => {
    const unsub = tempStorageManager.subscribe(stats => {
      setStorageStats(stats);
      const remainingMs = Math.max(0, stats.nextAutoCleanupTimestamp - Date.now());
      setMinsUntilCleanup(Math.ceil(remainingMs / (60 * 1000)));
    });
    return unsub;
  }, []);

  const handleClearStorageNow = () => {
    const freshStats = tempStorageManager.clearAllNow();
    setStorageStats(freshStats);
    setCleanedToast(true);
    setTimeout(() => setCleanedToast(false), 2500);
  };

  const updateAutoGen = (patch: Partial<AutoGenerationSettings>) => {
    onUpdateSettings({
      autoGenerate: {
        ...autoGen,
        ...patch,
      },
    });
  };

  const updateUnderstanding = (patch: Partial<typeof understanding>) => {
    onUpdateSettings({
      understanding: {
        ...understanding,
        ...patch,
      },
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl p-5 space-y-1">
        <div className="flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-[#58a6ff]" />
          <h1 className="text-xl font-bold text-[#e1e4e8]">AI Reply Engine, Understanding & Storage Settings</h1>
        </div>
        <p className="text-xs text-[#8b949e]">
          Configure automatic context detection, Understanding Mode summaries, reply length presets, and 30-minute transient history purging.
        </p>
      </div>

      {/* SECTION 1: UNDERSTANDING MODE (NEW REQUIREMENT) */}
      <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#30363d]">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-[#58a6ff]" />
              <h2 className="text-base font-bold text-[#e1e4e8]">Understanding Mode</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#58a6ff22] text-[#58a6ff] border border-[#58a6ff44] font-mono">
                Context Explainer
              </span>
            </div>
            <p className="text-xs text-[#8b949e]">
              When ON, the AI first provides a brief, clear explanation of what the other person is saying or asking before presenting reply suggestions.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              id="toggle-understanding-mode"
              type="checkbox"
              checked={understanding.enabled}
              onChange={e => updateUnderstanding({ enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-[#21262d] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#58a6ff]"></div>
          </label>
        </div>

        {understanding.enabled && (
          <div className="space-y-4 pt-1">
            <div>
              <label className="text-xs font-semibold text-[#e1e4e8] block mb-2">
                Understanding Summary Length:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: '1-line' as SummaryLength,
                    title: '1-Line Summary',
                    desc: 'Crisp 10-15 word sentence explaining the core question.',
                    sample: 'Gandhi was a major leader of India\'s independence movement, known especially for nonviolence.'
                  },
                  {
                    id: '2-line' as SummaryLength,
                    title: '2-Line Summary',
                    desc: 'Concise 25-word summary capturing context and intent.',
                    sample: 'Asking about Gandhi\'s role in India\'s freedom struggle, focusing on civil disobedience and mass mobilization.'
                  },
                  {
                    id: 'detailed' as SummaryLength,
                    title: 'Detailed Summary',
                    desc: '3-4 sentence comprehensive breakdown of complex topics.',
                    sample: 'Analyzes the historical impact of Mahatma Gandhi on Indian sovereignty, highlighting key movements like the Salt March and moral diplomacy.'
                  },
                ].map(opt => {
                  const isSelected = (understanding.summaryLength || '1-line') === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => updateUnderstanding({ summaryLength: opt.id })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-[#58a6ff15] border-[#58a6ff] ring-1 ring-[#58a6ff]'
                          : 'bg-[#161b22] border-[#30363d] hover:border-[#8b949e]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#e1e4e8]">{opt.title}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#58a6ff]" />}
                      </div>
                      <p className="text-[11px] text-[#8b949e] leading-snug mb-2">{opt.desc}</p>
                      <div className="p-1.5 rounded bg-[#0d1117] border border-[#30363d] text-[10px] text-[#8b949e] italic font-mono">
                        "{opt.sample}"
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Preview Card */}
            <div className="p-3.5 rounded-xl bg-[#161b22] border border-[#30363d] space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#58a6ff]">
                <div className="flex items-center space-x-1.5">
                  <Brain className="w-4 h-4" />
                  <span>Real-Time Flow Example</span>
                </div>
                <span className="text-[10px] text-[#8b949e] font-mono">WhatsApp • Gandhi Question</span>
              </div>
              <div className="p-2 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-1">
                <div className="text-[10px] font-bold text-[#58a6ff] uppercase tracking-wider">UNDERSTANDING:</div>
                <p className="text-xs text-[#e1e4e8]">
                  Gandhi was a major leader of India's independence movement, known especially for nonviolent resistance.
                </p>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-[#f87171] uppercase tracking-wider">GENERATED REPLIES:</div>
                <div className="p-2 rounded bg-[#0d1117] border border-[#30363d] text-xs text-[#e1e4e8]">
                  1. "He played a major role through nonviolent movements like the Salt March and Quit India."
                </div>
                <div className="p-2 rounded bg-[#0d1117] border border-[#30363d] text-xs text-[#e1e4e8]">
                  2. "Gandhi helped lead India's independence movement using nonviolent resistance."
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: AUTOMATIC REPLY GENERATION (MASTER CONTROLS) */}
      <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#30363d]">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-[#ef4444]" />
              <h2 className="text-base font-bold text-[#e1e4e8]">Auto Generate Replies</h2>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                autoGen.enabled 
                  ? 'bg-[#dc262622] text-[#f87171] border border-[#dc262644]' 
                  : 'bg-[#21262d] text-[#8b949e] border border-[#30363d]'
              }`}>
                {autoGen.enabled ? 'AUTOMATIC (ACTIVE)' : 'MANUAL ONLY'}
              </span>
            </div>
            <p className="text-xs text-[#8b949e]">
              Automatically detects new relevant conversation text, analyzes context without manual button presses, and updates the floating panel in real time.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              id="toggle-auto-generate-master"
              type="checkbox"
              checked={autoGen.enabled}
              onChange={e => updateAutoGen({ enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-[#21262d] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#dc2626]"></div>
          </label>
        </div>

        {/* Detailed Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Sub-toggle: Generate only on new text */}
          <div className="p-3.5 rounded-xl bg-[#161b22] border border-[#30363d] flex items-center justify-between">
            <div className="space-y-0.5 pr-2">
              <span className="text-xs font-bold text-[#e1e4e8]">Generate only when new text appears</span>
              <p className="text-[11px] text-[#8b949e]">
                Prevents redundant AI API calls if screen content remains unchanged.
              </p>
            </div>
            <input
              type="checkbox"
              checked={autoGen.generateOnlyOnNewText}
              onChange={e => updateAutoGen({ generateOnlyOnNewText: e.target.checked })}
              className="w-4 h-4 rounded bg-[#0d1117] border-[#30363d] text-[#dc2626] focus:ring-0 cursor-pointer"
            />
          </div>

          {/* Sub-toggle: Filter unrelated UI text */}
          <div className="p-3.5 rounded-xl bg-[#161b22] border border-[#30363d] flex items-center justify-between">
            <div className="space-y-0.5 pr-2">
              <span className="text-xs font-bold text-[#e1e4e8]">Filter UI Buttons & Status Stamps</span>
              <p className="text-[11px] text-[#8b949e]">
                Ignores timestamps, battery percentages, and navigation buttons.
              </p>
            </div>
            <input
              type="checkbox"
              checked={autoGen.filterUnrelatedUiText}
              onChange={e => updateAutoGen({ filterUnrelatedUiText: e.target.checked })}
              className="w-4 h-4 rounded bg-[#0d1117] border-[#30363d] text-[#dc2626] focus:ring-0 cursor-pointer"
            />
          </div>

          {/* Minimum Delay Slider */}
          <div className="p-3.5 rounded-xl bg-[#161b22] border border-[#30363d] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#e1e4e8] flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-[#58a6ff]" />
                <span>Minimum Delay Before Generating</span>
              </span>
              <span className="font-mono text-xs text-[#58a6ff] font-bold">
                {autoGen.minDelayBeforeGeneratingMs}ms
              </span>
            </div>
            <input
              type="range"
              min="100"
              max="2000"
              step="50"
              value={autoGen.minDelayBeforeGeneratingMs}
              onChange={e => updateAutoGen({ minDelayBeforeGeneratingMs: parseInt(e.target.value, 10) })}
              className="w-full h-1.5 bg-[#21262d] rounded-lg appearance-none cursor-pointer accent-[#dc2626]"
            />
            <p className="text-[10px] text-[#8b949e]">
              Waits for typing/scrolling to settle before sending context to AI.
            </p>
          </div>

          {/* Cooldown Between AI Requests */}
          <div className="p-3.5 rounded-xl bg-[#161b22] border border-[#30363d] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#e1e4e8] flex items-center space-x-1.5">
                <Gauge className="w-3.5 h-3.5 text-[#d29922]" />
                <span>Cooldown Between AI Requests</span>
              </span>
              <span className="font-mono text-xs text-[#d29922] font-bold">
                {(autoGen.cooldownBetweenRequestsMs / 1000).toFixed(1)}s
              </span>
            </div>
            <input
              type="range"
              min="1000"
              max="10000"
              step="500"
              value={autoGen.cooldownBetweenRequestsMs}
              onChange={e => updateAutoGen({ cooldownBetweenRequestsMs: parseInt(e.target.value, 10) })}
              className="w-full h-1.5 bg-[#21262d] rounded-lg appearance-none cursor-pointer accent-[#d29922]"
            />
            <p className="text-[10px] text-[#8b949e]">
              Protects against rapid API rate-limits and spikes in network consumption.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 3: INDEPENDENT RETENTION & HISTORY CLEANUP TIMERS */}
      <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#30363d]">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <HardDrive className="w-5 h-5 text-[#f85149]" />
              <h2 className="text-base font-bold text-[#e1e4e8]">Dual Retention Timers (Recent Menu vs History Storage)</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-[#dc262622] text-[#f87171] border border-[#dc262644]">
                2-Min Recent / 5-Min History
              </span>
            </div>
            <p className="text-xs text-[#8b949e]">
              Enforces two independent timers: items stay in the floating Recent Results menu for <strong>2 minutes</strong>, and are permanently wiped from history storage after <strong>5 minutes</strong>.
            </p>
          </div>

          <button
            id="clear-storage-now-btn"
            onClick={handleClearStorageNow}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#f8514922] hover:bg-[#f8514933] text-[#f85149] border border-[#f8514944] rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Storage Now</span>
          </button>
        </div>

        {cleanedToast && (
          <div className="p-2.5 rounded-xl bg-[#dc262622] border border-[#ef4444] text-[#f87171] text-xs font-semibold flex items-center space-x-2">
            <Check className="w-4 h-4" />
            <span>Temporary context history cleared successfully. Storage reset to 0 KB.</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Timer 1: Recent Results Menu Visibility */}
          <div className="p-3.5 rounded-xl bg-[#161b22] border border-[#30363d] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#e1e4e8] flex items-center space-x-1.5">
                <Timer className="w-3.5 h-3.5 text-[#58a6ff]" />
                <span>Recent Results Menu Visibility</span>
              </span>
              <span className="font-mono text-xs text-[#58a6ff] font-bold">
                {Math.round((settings.recentRetentionSeconds ?? 120) / 60)} min ({settings.recentRetentionSeconds ?? 120}s)
              </span>
            </div>
            <input
              type="range"
              min="30"
              max="300"
              step="30"
              value={settings.recentRetentionSeconds ?? 120}
              onChange={e => {
                const val = parseInt(e.target.value, 10);
                onUpdateSettings({ recentRetentionSeconds: val });
                tempStorageManager.setRetentionSettings(val, settings.historyRetentionSeconds ?? 300);
              }}
              className="w-full h-1.5 bg-[#21262d] rounded-lg appearance-none cursor-pointer accent-[#58a6ff]"
            />
            <p className="text-[10px] text-[#8b949e]">
              Previous questions and replies stay visible in the floating Recent Results menu for 2 minutes before fading.
            </p>
          </div>

          {/* Timer 2: Permanent History Storage Cleanup */}
          <div className="p-3.5 rounded-xl bg-[#161b22] border border-[#30363d] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#e1e4e8] flex items-center space-x-1.5">
                <HardDrive className="w-3.5 h-3.5 text-[#ef4444]" />
                <span>History Storage Purge Timer</span>
              </span>
              <span className="font-mono text-xs text-[#ef4444] font-bold">
                {Math.round((settings.historyRetentionSeconds ?? 300) / 60)} min ({settings.historyRetentionSeconds ?? 300}s)
              </span>
            </div>
            <input
              type="range"
              min="60"
              max="600"
              step="60"
              value={settings.historyRetentionSeconds ?? 300}
              onChange={e => {
                const val = parseInt(e.target.value, 10);
                onUpdateSettings({ historyRetentionSeconds: val });
                tempStorageManager.setRetentionSettings(settings.recentRetentionSeconds ?? 120, val);
              }}
              className="w-full h-1.5 bg-[#21262d] rounded-lg appearance-none cursor-pointer accent-[#ef4444]"
            />
            <p className="text-[10px] text-[#8b949e]">
              Permanently purges conversation context cache from device memory after 5 minutes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="p-3.5 rounded-xl bg-[#161b22] border border-[#30363d] space-y-1">
            <span className="text-[11px] text-[#8b949e] font-medium">Temporary Storage In Use</span>
            <p className="text-lg font-bold text-[#e1e4e8] font-mono">{storageStats.formattedSize}</p>
            <span className="text-[10px] text-[#6e7681] font-mono">{storageStats.itemCount} transient entries cached</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#161b22] border border-[#30363d] space-y-1">
            <span className="text-[11px] text-[#8b949e] font-medium">Next Storage Purge</span>
            <div className="flex items-center space-x-1.5">
              <Timer className="w-4 h-4 text-[#58a6ff]" />
              <p className="text-lg font-bold text-[#58a6ff] font-mono">~{minsUntilCleanup} min</p>
            </div>
            <span className="text-[10px] text-[#6e7681]">
              History window: {Math.round((settings.historyRetentionSeconds ?? 300) / 60)}m
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#161b22] border border-[#30363d] space-y-1">
            <span className="text-[11px] text-[#8b949e] font-medium">Permanent User Settings</span>
            <p className="text-lg font-bold text-[#f87171] font-mono">Protected</p>
            <span className="text-[10px] text-[#6e7681]">API keys & app preferences retained</span>
          </div>
        </div>
      </div>

      {/* SECTION 4: EXPANDABLE REPLIES & REPLY LENGTH */}
      <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#30363d]">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-[#58a6ff]" />
              <h2 className="text-base font-bold text-[#e1e4e8]">Expandable Replies</h2>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                (settings.expandableReplies ?? true)
                  ? 'bg-[#58a6ff22] text-[#58a6ff] border border-[#58a6ff44]'
                  : 'bg-[#21262d] text-[#8b949e] border border-[#30363d]'
              }`}>
                {(settings.expandableReplies ?? true) ? 'ON (Collapsible)' : 'OFF (Fixed View)'}
              </span>
            </div>
            <p className="text-xs text-[#8b949e]">
              When ON, long reply cards display preview snippets with an expand button (🔽/🔼) to view full text. Tapping Copy always copies the complete response text.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              id="toggle-expandable-replies"
              type="checkbox"
              checked={settings.expandableReplies ?? true}
              onChange={e => onUpdateSettings({ expandableReplies: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-[#21262d] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#58a6ff]"></div>
          </label>
        </div>

        <div className="space-y-1 pt-1">
          <h3 className="text-xs font-bold text-[#e1e4e8]">Preset Response Length:</h3>
          <p className="text-xs text-[#8b949e]">
            Select your default response length preset. The floating panel dynamically adjusts its height to fit the selected size.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'very-short' as ResponseLength, label: 'Very Short', desc: '~1 line (40-60 chars)' },
            { id: 'short' as ResponseLength, label: 'Short', desc: '~2 lines (80-120 chars)' },
            { id: 'normal' as ResponseLength, label: 'Normal', desc: '~3-4 lines (150-250 chars)' },
            { id: 'long' as ResponseLength, label: 'Long', desc: '~5+ lines (Comprehensive)' },
          ].map(len => {
            const isSelected = (settings.responseLength || 'normal') === len.id;
            return (
              <button
                key={len.id}
                onClick={() => onUpdateSettings({ responseLength: len.id })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-[#dc262615] border-[#ef4444] ring-1 ring-[#ef4444]'
                    : 'bg-[#161b22] border-[#30363d] hover:border-[#8b949e]'
                }`}
              >
                <span className="text-xs font-bold text-[#e1e4e8] block mb-0.5">{len.label}</span>
                <p className="text-[10px] text-[#8b949e] font-mono">{len.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Custom Character Limit Slider */}
        <div className="p-3.5 rounded-xl bg-[#161b22] border border-[#30363d] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#e1e4e8] flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5 text-[#58a6ff]" />
              <span>Custom Maximum Character Limit</span>
            </span>
            <span className="font-mono text-xs text-[#58a6ff] font-bold">
              {settings.customMaxCharLimit || 280} chars
            </span>
          </div>
          <input
            type="range"
            min="40"
            max="600"
            step="10"
            value={settings.customMaxCharLimit || 280}
            onChange={e => onUpdateSettings({ customMaxCharLimit: parseInt(e.target.value, 10) })}
            className="w-full h-1.5 bg-[#21262d] rounded-lg appearance-none cursor-pointer accent-[#58a6ff]"
          />
        </div>
      </div>

      {/* SECTION 5: REPLY STYLE MATRIX */}
      <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl p-5 space-y-4">
        <div className="space-y-1 pb-3 border-b border-[#30363d]">
          <h2 className="text-base font-bold text-[#e1e4e8]">Reply Style & Reasoning Archetype</h2>
          <p className="text-xs text-[#8b949e]">
            Choose the baseline personality and reasoning style applied to generated replies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {STYLES.map(st => {
            const isSelected = settings.selectedStyle === st.name;
            return (
              <div
                key={st.name}
                onClick={() => onUpdateSettings({ selectedStyle: st.name })}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                  isSelected
                    ? 'bg-[#dc262615] border-[#ef4444] ring-1 ring-[#ef4444]'
                    : 'bg-[#161b22] border-[#30363d] hover:border-[#8b949e]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#e1e4e8]">{st.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#ef4444]" />}
                </div>
                <p className="text-[11px] text-[#8b949e] leading-snug">{st.desc}</p>
                <div className="p-2 rounded bg-[#0d1117] border border-[#30363d] text-[10px] text-[#8b949e] font-mono">
                  "{st.sample}"
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
