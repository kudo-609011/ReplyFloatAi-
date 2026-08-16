import React from 'react';
import { Wifi, Battery, Signal, Sparkles, Smartphone, Layers, ShieldCheck, Power } from 'lucide-react';
import { FloatingOverlay } from './FloatingOverlay';
import { SimulatedApps } from './SimulatedApps';
import { 
  InstalledApp, 
  OverlaySettings, 
  ReplySettings, 
  ReplySuggestion, 
  AIProviderConfig,
  ReplyStyle,
  RecentResultItem,
  ConversationMessage,
  ConversationSnapshot,
  ResponseIntent
} from '../types';

interface AndroidFrameProps {
  currentApp: InstalledApp;
  onSelectApp: (app: InstalledApp) => void;
  allApps: InstalledApp[];
  activeDetectedText: string;
  setActiveDetectedText: (text: string) => void;
  understandingSummary?: string;
  intentType?: ResponseIntent;
  intentLabel?: string;
  conversationThread?: ConversationMessage[];
  onUpdateConversationThread?: (thread: ConversationMessage[]) => void;
  conversationSnapshot?: ConversationSnapshot;
  onInsertReplyToChat: (text: string) => void;
  insertedChatText: string;
  setInsertedChatText: (text: string) => void;
  onTriggerAnalysis: (targetText?: string, customThread?: ConversationMessage[], overrideStyle?: ReplyStyle) => void;
  isServiceActive: boolean;
  setIsServiceActive: (active: boolean) => void;
  overlaySettings: OverlaySettings;
  replySettings: ReplySettings;
  activeProvider: AIProviderConfig;
  suggestions: ReplySuggestion[];
  isLoadingSuggestions: boolean;
  recentHistory?: RecentResultItem[];
  onSelectRecentItem?: (item: RecentResultItem) => void;
  onDeleteRecentItem?: (id: string) => void;
  onOpenSettings: () => void;
  onUpdateOverlaySettings: (newSettings: Partial<OverlaySettings>) => void;
  onUpdateReplySettings: (newSettings: Partial<ReplySettings>) => void;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  currentApp,
  onSelectApp,
  allApps,
  activeDetectedText,
  setActiveDetectedText,
  understandingSummary,
  intentType,
  intentLabel,
  conversationThread,
  onUpdateConversationThread,
  conversationSnapshot,
  onInsertReplyToChat,
  insertedChatText,
  setInsertedChatText,
  onTriggerAnalysis,
  isServiceActive,
  setIsServiceActive,
  overlaySettings,
  replySettings,
  activeProvider,
  suggestions,
  isLoadingSuggestions,
  recentHistory,
  onSelectRecentItem,
  onDeleteRecentItem,
  onOpenSettings,
  onUpdateOverlaySettings,
  onUpdateReplySettings,
}) => {
  return (
    <div className="w-full flex flex-col items-center justify-center p-1 sm:p-3">
      {/* Device Frame */}
      <div className="w-full max-w-[420px] h-[740px] bg-[#0a0c10] rounded-[40px] p-2.5 shadow-2xl border-4 border-[#30363d] flex flex-col relative overflow-hidden">
        {/* Top Speaker & Camera Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#161b22] border border-[#30363d] shadow-inner flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-[#dc2626]" />
          </div>
          <div className="w-12 h-1 bg-[#21262d] rounded-full" />
        </div>

        {/* Screen Bezel Container */}
        <div className="w-full h-full bg-[#0d1117] rounded-[30px] overflow-hidden flex flex-col relative border border-[#21262d]">
          {/* Android Status Bar */}
          <div className="h-7 bg-[#0d1117] text-[#8b949e] px-6 pt-1 flex items-center justify-between text-[11px] font-medium z-30 select-none border-b border-[#21262d]">
            <span className="font-mono text-[#e1e4e8]">10:42</span>
            <div className="flex items-center space-x-2">
              <span className="text-[9px] text-[#f87171] font-mono font-bold">5G</span>
              <Signal className="w-3 h-3 text-[#8b949e]" />
              <Wifi className="w-3 h-3 text-[#8b949e]" />
              <Battery className="w-3.5 h-3.5 text-[#8b949e]" />
            </div>
          </div>

          {/* Underlying Simulated Application */}
          <div className="flex-1 relative overflow-hidden flex flex-col">
            <SimulatedApps
              currentApp={currentApp}
              onSelectApp={onSelectApp}
              allApps={allApps}
              activeDetectedText={activeDetectedText}
              setActiveDetectedText={setActiveDetectedText}
              onInsertReplyToChat={onInsertReplyToChat}
              insertedChatText={insertedChatText}
              setInsertedChatText={setInsertedChatText}
              onTriggerAnalysis={onTriggerAnalysis}
              currentConversationThread={conversationThread}
              onUpdateConversationThread={onUpdateConversationThread}
            />

            {/* Floating Overlay Layer (Rendered on top of underlying app when active) */}
            {isServiceActive && overlaySettings.enabled && (
              <FloatingOverlay
                settings={overlaySettings}
                replySettings={replySettings}
                activeProvider={activeProvider}
                detectedText={activeDetectedText}
                contextApp={currentApp.appName}
                understandingSummary={understandingSummary}
                intentType={intentType}
                intentLabel={intentLabel}
                conversationSnapshot={conversationSnapshot}
                suggestions={suggestions}
                isLoadingSuggestions={isLoadingSuggestions}
                recentHistory={recentHistory}
                onSelectRecentItem={onSelectRecentItem}
                onDeleteRecentItem={onDeleteRecentItem}
                onRegenerate={(overrideStyle) => onTriggerAnalysis(undefined, undefined, overrideStyle)}
                onClose={() => setIsServiceActive(false)}
                onOpenSettings={onOpenSettings}
                onInsertToApp={onInsertReplyToChat}
                onUpdateOverlaySettings={onUpdateOverlaySettings}
                onUpdateReplySettings={onUpdateReplySettings}
              />
            )}
          </div>

          {/* Android Navigation Bar Pill */}
          <div className="h-4 bg-[#0d1117] flex items-center justify-center z-30 select-none">
            <div className="w-28 h-1 bg-[#30363d] rounded-full" />
          </div>
        </div>
      </div>

      {/* Simulator Guidance Info Card below phone */}
      <div className="mt-3 max-w-md w-full bg-[#0d1117] border border-[#30363d] rounded-xl p-3 text-xs text-[#8b949e] space-y-1.5 border-l-2 border-l-[#dc2626]">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-[#e1e4e8] flex items-center space-x-1.5 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#ef4444]" />
            <span>Conversation-Aware Floating Overlay</span>
          </span>
          <span className="text-[10px] bg-[#161b22] text-[#8b949e] px-2 py-0.5 rounded border border-[#30363d] font-mono">
            API 35 (Android 15)
          </span>
        </div>
        <ul className="space-y-1 text-[#8b949e] list-disc list-inside text-[11px] leading-relaxed">
          <li><strong className="text-[#e1e4e8]">Full Thread Intelligence:</strong> Understands ongoing chats, who was addressed, statements, banter, and questions.</li>
          <li><strong className="text-[#e1e4e8]">Dynamic Intent Badges:</strong> Seamlessly differentiates between Direct Answers, Suggested Replies, and Proactive Responses.</li>
          <li><strong className="text-[#e1e4e8]">No Stale Questions:</strong> Real-time screen analysis updates automatically with latest context and respects resolution states.</li>
        </ul>
      </div>
    </div>
  );
};
