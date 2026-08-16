import React from 'react';
import { 
  Bot, 
  Smartphone, 
  Code2, 
  Sliders, 
  Layers, 
  ShieldCheck, 
  Sparkles, 
  Download,
  Power,
  AppWindow,
  Activity
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'simulator' | 'home' | 'apps' | 'providers' | 'reply-settings' | 'overlay-settings' | 'privacy' | 'about' | 'code';
  setActiveTab: (tab: any) => void;
  isServiceActive: boolean;
  setIsServiceActive: (active: boolean) => void;
  onExportZip: () => void;
  isExporting: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isServiceActive,
  setIsServiceActive,
  onExportZip,
  isExporting,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-[#0d1117]/95 backdrop-blur-md border-b border-[#30363d] px-3 sm:px-4 py-2 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col xl:flex-row xl:items-center xl:justify-between gap-2.5 w-full min-w-0">
        {/* Top row: Brand & Action Buttons */}
        <div className="flex items-center justify-between w-full xl:w-auto gap-2 min-w-0">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#dc2626] flex items-center justify-center shadow-lg shadow-[#dc262633] text-white shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 min-w-0">
                <span className="font-bold text-sm sm:text-base tracking-tight text-[#e1e4e8] truncate">ReplyFloat AI</span>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-[#dc262622] text-[#f87171] border border-[#dc262644] px-1.5 py-0.2 rounded shrink-0">
                  API 35
                </span>
              </div>
              <p className="text-[10px] text-[#8b949e] hidden sm:block truncate">
                Floating Transparent AI Assistant
              </p>
            </div>
          </div>

          {/* Action buttons: Service Switch & Export ZIP */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            <button
              id="toggle-master-service-btn"
              onClick={() => setIsServiceActive(!isServiceActive)}
              className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all shadow-md ${
                isServiceActive
                  ? 'bg-[#dc262622] text-[#f87171] border border-[#dc262644] hover:bg-[#dc262633]'
                  : 'bg-[#21262d] text-[#8b949e] border border-[#30363d] hover:bg-[#30363d]'
              }`}
              title="Toggle Floating Assistant Service"
            >
              <Power className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isServiceActive ? 'text-[#ef4444] animate-pulse' : 'text-[#8b949e]'}`} />
              <span>{isServiceActive ? 'RUNNING' : 'PAUSED'}</span>
            </button>

            <button
              id="export-android-zip-btn"
              onClick={onExportZip}
              disabled={isExporting}
              className="flex items-center space-x-1 sm:space-x-1.5 bg-[#21262d] hover:bg-[#30363d] text-[#e1e4e8] hover:text-white border border-[#30363d] text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-xl transition-all active:scale-95 disabled:opacity-50"
            >
              <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#58a6ff]" />
              <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export ZIP'}</span>
              <span className="sm:hidden">ZIP</span>
            </button>
          </div>
        </div>

        {/* Center / Bottom Nav Tabs */}
        <nav className="flex items-center space-x-1 overflow-x-auto scrollbar-none bg-[#161b22] p-1 rounded-xl border border-[#30363d] text-xs w-full xl:w-auto max-w-full min-w-0">
          <button
            id="nav-tab-simulator"
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1 rounded-lg font-medium transition-all shrink-0 whitespace-nowrap text-xs ${
              activeTab === 'simulator'
                ? 'bg-[#dc2626] text-white shadow-sm font-semibold'
                : 'text-[#8b949e] hover:text-[#e1e4e8] hover:bg-[#21262d]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 shrink-0" />
            <span>Simulator</span>
          </button>

          <button
            id="nav-tab-home"
            onClick={() => setActiveTab('home')}
            className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1 rounded-lg font-medium transition-all shrink-0 whitespace-nowrap text-xs ${
              activeTab === 'home'
                ? 'bg-[#dc2626] text-white shadow-sm font-semibold'
                : 'text-[#8b949e] hover:text-[#e1e4e8] hover:bg-[#21262d]'
            }`}
          >
            <Bot className="w-3.5 h-3.5 shrink-0" />
            <span>Dashboard</span>
          </button>

          <button
            id="nav-tab-apps"
            onClick={() => setActiveTab('apps')}
            className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1 rounded-lg font-medium transition-all shrink-0 whitespace-nowrap text-xs ${
              activeTab === 'apps'
                ? 'bg-[#dc2626] text-white shadow-sm font-semibold'
                : 'text-[#8b949e] hover:text-[#e1e4e8] hover:bg-[#21262d]'
            }`}
          >
            <AppWindow className="w-3.5 h-3.5 shrink-0" />
            <span>Apps</span>
          </button>

          <button
            id="nav-tab-providers"
            onClick={() => setActiveTab('providers')}
            className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1 rounded-lg font-medium transition-all shrink-0 whitespace-nowrap text-xs ${
              activeTab === 'providers'
                ? 'bg-[#dc2626] text-white shadow-sm font-semibold'
                : 'text-[#8b949e] hover:text-[#e1e4e8] hover:bg-[#21262d]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>Providers</span>
          </button>

          <button
            id="nav-tab-overlay-settings"
            onClick={() => setActiveTab('overlay-settings')}
            className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1 rounded-lg font-medium transition-all shrink-0 whitespace-nowrap text-xs ${
              activeTab === 'overlay-settings'
                ? 'bg-[#dc2626] text-white shadow-sm font-semibold'
                : 'text-[#8b949e] hover:text-[#e1e4e8] hover:bg-[#21262d]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span>Overlay</span>
          </button>

          <button
            id="nav-tab-reply-settings"
            onClick={() => setActiveTab('reply-settings')}
            className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1 rounded-lg font-medium transition-all shrink-0 whitespace-nowrap text-xs ${
              activeTab === 'reply-settings'
                ? 'bg-[#dc2626] text-white shadow-sm font-semibold'
                : 'text-[#8b949e] hover:text-[#e1e4e8] hover:bg-[#21262d]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 shrink-0" />
            <span>Replies</span>
          </button>

          <button
            id="nav-tab-privacy"
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1 rounded-lg font-medium transition-all shrink-0 whitespace-nowrap text-xs ${
              activeTab === 'privacy'
                ? 'bg-[#dc2626] text-white shadow-sm font-semibold'
                : 'text-[#8b949e] hover:text-[#e1e4e8] hover:bg-[#21262d]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>Privacy</span>
          </button>

          <button
            id="nav-tab-code"
            onClick={() => setActiveTab('code')}
            className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1 rounded-lg font-medium transition-all shrink-0 whitespace-nowrap text-xs ${
              activeTab === 'code'
                ? 'bg-[#dc2626] text-white shadow-sm font-semibold'
                : 'text-[#8b949e] hover:text-[#e1e4e8] hover:bg-[#21262d]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 shrink-0" />
            <span>Codebase</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
