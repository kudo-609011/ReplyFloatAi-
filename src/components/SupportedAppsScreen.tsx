import React, { useState } from 'react';
import { 
  AppWindow, 
  Search, 
  CheckSquare, 
  Square, 
  ShieldCheck, 
  MessageSquare, 
  Flame, 
  Gamepad2, 
  Twitter, 
  Globe, 
  Briefcase,
  Camera,
  Send,
  Sparkles,
  Info,
  Plus,
  Layers,
  AlertTriangle,
  Cpu,
  CheckCircle2,
  Terminal,
  X
} from 'lucide-react';
import { InstalledApp } from '../types';

interface SupportedAppsScreenProps {
  apps: InstalledApp[];
  onToggleApp: (packageName: string, enabled: boolean) => void;
  onToggleAll: (enableAll: boolean) => void;
  onAddCustomApp?: (app: InstalledApp) => void;
}

export const SupportedAppsScreen: React.FC<SupportedAppsScreenProps> = ({
  apps,
  onToggleApp,
  onToggleAll,
  onAddCustomApp,
}) => {
  const [activeTab, setActiveTab] = useState<'apps' | 'vm'>('apps');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [newPackageName, setNewPackageName] = useState('');
  const [newCategory, setNewCategory] = useState<'Messaging' | 'Gaming' | 'Social' | 'Browser' | 'Work' | 'VirtualMachine'>('Gaming');

  const categories = ['All', 'Messaging', 'Gaming', 'VirtualMachine', 'Browser', 'Social', 'Work'];

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.appName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.packageName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || app.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const enabledCount = apps.filter(a => a.enabled).length;

  const handleAddAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName.trim() || !newPackageName.trim()) return;

    const newApp: InstalledApp = {
      appName: newAppName.trim(),
      packageName: newPackageName.trim(),
      category: newCategory,
      icon: newCategory === 'Gaming' ? 'Gamepad2' : newCategory === 'VirtualMachine' ? 'Layers' : 'AppWindow',
      enabled: true,
      sampleConversations: [
        {
          sender: 'Test User',
          text: `Sample message in ${newAppName}`,
          timestamp: 'Just now',
        },
      ],
    };

    if (onAddCustomApp) {
      onAddCustomApp(newApp);
    }
    setNewAppName('');
    setNewPackageName('');
    setShowAddModal(false);
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'MessageSquare': return <MessageSquare className="w-5 h-5 text-[#3fb950]" />;
      case 'Gamepad2': return <Gamepad2 className="w-5 h-5 text-[#bc8cff]" />;
      case 'Layers': return <Layers className="w-5 h-5 text-[#58a6ff]" />;
      case 'Send': return <Send className="w-5 h-5 text-[#58a6ff]" />;
      case 'Globe': return <Globe className="w-5 h-5 text-[#39c5cf]" />;
      case 'Flame': return <Flame className="w-5 h-5 text-[#f0883e]" />;
      case 'Briefcase': return <Briefcase className="w-5 h-5 text-[#d2a8ff]" />;
      default: return <AppWindow className="w-5 h-5 text-[#8b949e]" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header & Tabs */}
      <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <AppWindow className="w-5 h-5 text-[#58a6ff]" />
              <h1 className="text-xl font-bold text-[#e1e4e8]">Application Whitelist & VM Environments</h1>
            </div>
            <p className="text-xs text-[#8b949e]">
              ReplyFloat AI only observes and assists within selected applications. Virtual Master & sandbox environments are supported.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-xs font-bold text-white transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom App</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-[#30363d] pb-2">
          <button
            onClick={() => setActiveTab('apps')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'apps'
                ? 'bg-[#21262d] text-[#e1e4e8] border border-[#30363d]'
                : 'text-[#8b949e] hover:text-[#e1e4e8]'
            }`}
          >
            <AppWindow className="w-3.5 h-3.5" />
            <span>Whitelisted Apps ({enabledCount}/{apps.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('vm')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'vm'
                ? 'bg-[#21262d] text-[#58a6ff] border border-[#30363d]'
                : 'text-[#8b949e] hover:text-[#58a6ff]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#58a6ff]" />
            <span>Virtual Master & Sandboxes</span>
          </button>
        </div>
      </div>

      {activeTab === 'apps' ? (
        <div className="space-y-4">
          {/* Search & Category Filter */}
          <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 bg-[#161b22] rounded-xl px-3 py-2 border border-[#30363d] flex items-center space-x-2 focus-within:border-[#58a6ff]">
                <Search className="w-4 h-4 text-[#8b949e] shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search WhatsApp, Super Sus, Virtual Master, Discord..."
                  className="w-full bg-transparent text-xs text-[#e1e4e8] placeholder-[#8b949e] outline-none"
                />
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onToggleAll(true)}
                  className="px-3 py-1.5 rounded-xl bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-xs font-semibold text-[#e1e4e8] transition-colors"
                >
                  Enable All
                </button>
                <button
                  onClick={() => onToggleAll(false)}
                  className="px-3 py-1.5 rounded-xl bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-xs font-semibold text-[#8b949e] hover:text-[#e1e4e8] transition-colors"
                >
                  Disable All
                </button>
              </div>
            </div>

            {/* Category Chips */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-[#58a6ff] text-white'
                      : 'bg-[#161b22] text-[#8b949e] hover:bg-[#21262d] hover:text-[#e1e4e8] border border-[#30363d]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* App List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredApps.map(app => (
              <div
                key={app.packageName}
                onClick={() => onToggleApp(app.packageName, !app.enabled)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                  app.enabled
                    ? 'bg-[#161b22] border-[#30363d] hover:border-[#58a6ff]'
                    : 'bg-[#0d1117] border-[#21262d] opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-center space-x-3 pr-2 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#0d1117] border border-[#30363d] flex items-center justify-center shrink-0">
                    {getIconComponent(app.icon)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-bold text-[#e1e4e8] truncate">{app.appName}</span>
                      {app.isVirtualEnvironment && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#58a6ff22] text-[#58a6ff] font-mono shrink-0">
                          VM Sandbox
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#8b949e] font-mono truncate">{app.packageName}</p>
                  </div>
                </div>

                <div className="shrink-0 pl-2">
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                      app.enabled
                        ? 'bg-[#dc2626] border-[#ef4444] text-white'
                        : 'border-[#30363d] bg-[#0d1117]'
                    }`}
                  >
                    {app.enabled && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* VIRTUAL MASTER & VM COMPATIBILITY GUIDE */
        <div className="space-y-4">
          <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl p-5 space-y-4">
            <div className="flex items-center space-x-2 text-[#58a6ff]">
              <Layers className="w-5 h-5" />
              <h2 className="text-base font-bold text-[#e1e4e8]">Virtual Master (Android VM) Compatibility & Bridge</h2>
            </div>
            <p className="text-xs text-[#8b949e] leading-relaxed">
              Virtual Master runs a full secondary Android operating system inside a container. ReplyFloat AI is designed to overlay seamlessly over Virtual Master windows on your host Android device.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-[#3fb950]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Host Window Overlay Mode (Standard)</span>
                </div>
                <p className="text-[11px] text-[#8b949e] leading-relaxed">
                  ReplyFloat AI's floating bullet card sits on the Host Android display (using <code className="text-[#58a6ff]">TYPE_APPLICATION_OVERLAY</code>). It floats right over Virtual Master without interrupting guest OS performance or touch events.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-[#d29922]">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Graceful Android Sandbox Limitations</span>
                </div>
                <p className="text-[11px] text-[#8b949e] leading-relaxed">
                  If Virtual Master's guest sandbox security policies prevent host-level accessibility node traversal, ReplyFloat AI gracefully falls back to user-triggered context capture or internal VM APK installation.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#161b22] border border-[#30363d] space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#e1e4e8]">
                <Terminal className="w-4 h-4 text-[#58a6ff]" />
                <span>Virtual Master Recommended Setup</span>
              </div>
              <ul className="text-xs text-[#8b949e] space-y-1.5 list-disc list-inside">
                <li>Keep <strong className="text-[#e1e4e8]">Virtual Master</strong> enabled in the ReplyFloat AI whitelist.</li>
                <li>Set Overlay Display Style to <strong className="text-[#e1e4e8]">Realme Bullet Notification</strong> so game controls in Virtual Master are never obstructed.</li>
                <li>Enable <strong className="text-[#e1e4e8]">Auto-Hide (5s to 8s)</strong> so replies automatically dismiss after copying.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Custom Application */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
              <h3 className="text-sm font-bold text-[#e1e4e8]">Add Custom Application to Whitelist</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#8b949e] hover:text-[#e1e4e8]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddAppSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#8b949e]">Application Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Genshin Impact, Super Sus Beta"
                  value={newAppName}
                  onChange={e => setNewAppName(e.target.value)}
                  className="w-full bg-[#161b22] border border-[#30363d] rounded-xl px-3 py-2 text-xs text-[#e1e4e8] outline-none focus:border-[#58a6ff]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#8b949e]">Android Package Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. com.example.game"
                  value={newPackageName}
                  onChange={e => setNewPackageName(e.target.value)}
                  className="w-full bg-[#161b22] border border-[#30363d] rounded-xl px-3 py-2 text-xs text-[#e1e4e8] outline-none focus:border-[#58a6ff] font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#8b949e]">Category</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value as any)}
                  className="w-full bg-[#161b22] border border-[#30363d] rounded-xl px-3 py-2 text-xs text-[#e1e4e8] outline-none"
                >
                  <option value="Gaming">Gaming</option>
                  <option value="Messaging">Messaging</option>
                  <option value="VirtualMachine">Virtual Machine</option>
                  <option value="Browser">Browser</option>
                  <option value="Social">Social</option>
                  <option value="Work">Work</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#30363d]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-[#21262d] text-xs font-semibold text-[#8b949e] hover:text-[#e1e4e8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#238636] hover:bg-[#2ea043] text-xs font-bold text-white"
                >
                  Save Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
