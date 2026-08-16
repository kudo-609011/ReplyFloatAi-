import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Smile, 
  Paperclip, 
  Phone, 
  Video, 
  MoreVertical, 
  ArrowLeft, 
  Search, 
  MessageSquare, 
  Flame, 
  Gamepad2, 
  Twitter, 
  Sparkles, 
  CheckCheck, 
  CornerDownRight, 
  RefreshCw, 
  Plus, 
  Zap, 
  MessageCircle,
  Layers,
  ShieldAlert,
  Terminal,
  Globe,
  Radio,
  Play,
  SkipForward,
  UserCheck,
  CheckCircle2,
  Users
} from 'lucide-react';
import { InstalledApp, ConversationMessage } from '../types';

interface SimulatedAppsProps {
  currentApp: InstalledApp;
  onSelectApp: (app: InstalledApp) => void;
  allApps: InstalledApp[];
  activeDetectedText: string;
  setActiveDetectedText: (text: string) => void;
  onInsertReplyToChat: (text: string) => void;
  insertedChatText: string;
  setInsertedChatText: (text: string) => void;
  onTriggerAnalysis: (customText?: string, customThread?: ConversationMessage[]) => void;
  currentConversationThread?: ConversationMessage[];
  onUpdateConversationThread?: (thread: ConversationMessage[]) => void;
}

interface TestScenario {
  id: string;
  title: string;
  badge: string;
  description: string;
  appName: string;
  messages: Array<{ sender: string; text: string; isMe?: boolean; time?: string; directedTo?: string }>;
}

const TEST_SCENARIOS: TestScenario[] = [
  {
    id: 'project-james-scenario',
    title: 'Project Update Thread (James Test Case)',
    badge: 'Multi-Turn Flow',
    description: 'Simulates the exact 5-step test sequence: Person A/B/C asking James -> James replying -> Follow-up -> "Never mind" resolution.',
    appName: 'WhatsApp',
    messages: [
      { sender: 'Person A', text: 'What happened to the project?', time: '10:40 AM' },
      { sender: 'Person B', text: 'I think James knows.', time: '10:41 AM' },
      { sender: 'Person C', text: 'James, do you know?', time: '10:42 AM', directedTo: 'James' },
      { sender: 'James', text: "I haven't checked yet.", isMe: true, time: '10:43 AM' },
      { sender: 'Person C', text: 'Can you check?', time: '10:44 AM', directedTo: 'James' },
      { sender: 'Person A', text: 'Never mind, I figured it out.', time: '10:45 AM' },
    ],
  },
  {
    id: 'proactive-statements-scenario',
    title: 'Proactive Reply Suggestions',
    badge: 'Smart Reactions',
    description: 'Statements, losses & banter requiring proactive follow-ups rather than literal question queries.',
    appName: 'WhatsApp',
    messages: [
      { sender: 'Sarah', text: 'I finally finished the project.', time: '2:15 PM' },
      { sender: 'Alex', text: "I don't think that plan will work.", time: '2:18 PM' },
      { sender: 'Gamer_Leo', text: 'Bro I just lost again 💀', time: '2:20 PM' },
    ],
  },
  {
    id: 'history-progression-scenario',
    title: 'History Bot (1996 vs 1997)',
    badge: 'Instant Switch',
    description: 'Tests dynamic question changes without getting stuck on stale history state.',
    appName: 'WhatsApp',
    messages: [
      { sender: 'History Bot', text: 'what happened to 1996?', time: '11:00 AM' },
      { sender: 'History Bot', text: 'what happened to 1997?', time: '11:02 AM' },
    ],
  },
  {
    id: 'social-banter-scenario',
    title: 'Casual Chat & Banter',
    badge: 'Group Chat',
    description: 'Natural group conversation flow with confirmation banter.',
    appName: 'WhatsApp',
    messages: [
      { sender: 'Mia', text: 'You coming tomorrow?', time: '6:30 PM' },
      { sender: 'James', text: 'Probably.', isMe: true, time: '6:31 PM' },
      { sender: 'Mia', text: 'Probably?? 😂', time: '6:32 PM' },
    ],
  },
];

export const SimulatedApps: React.FC<SimulatedAppsProps> = ({
  currentApp,
  onSelectApp,
  allApps,
  activeDetectedText,
  setActiveDetectedText,
  onInsertReplyToChat,
  insertedChatText,
  setInsertedChatText,
  onTriggerAnalysis,
  onUpdateConversationThread,
}) => {
  const [customInputText, setCustomInputText] = useState('');
  const [activeScenarioId, setActiveScenarioId] = useState<string>('project-james-scenario');
  const [scenarioStep, setScenarioStep] = useState<number>(3); // Default at Step 3 ("James, do you know?")

  // Internal chat messages
  const [chatMessages, setChatMessages] = useState<ConversationMessage[]>([
    {
      id: 'msg-1',
      sender: 'Person A',
      text: 'What happened to the project?',
      isMe: false,
      time: '10:40 AM',
    },
    {
      id: 'msg-2',
      sender: 'Person B',
      text: 'I think James knows.',
      isMe: false,
      time: '10:41 AM',
    },
    {
      id: 'msg-3',
      sender: 'Person C',
      text: 'James, do you know?',
      isMe: false,
      time: '10:42 AM',
      directedTo: 'James',
    },
  ]);

  // Sync with parent thread state on mount and update
  useEffect(() => {
    if (onUpdateConversationThread) {
      onUpdateConversationThread(chatMessages);
    }
  }, [chatMessages, onUpdateConversationThread]);

  // Load a scenario
  const handleLoadScenario = (scenario: TestScenario, stepIndex?: number) => {
    setActiveScenarioId(scenario.id);
    const targetStep = stepIndex !== undefined ? stepIndex : scenario.messages.length;
    setScenarioStep(targetStep);
    
    const slice = scenario.messages.slice(0, targetStep).map((m, idx) => ({
      id: `scen-${scenario.id}-${idx}-${Date.now()}`,
      sender: m.sender,
      text: m.text,
      isMe: m.isMe,
      time: m.time || '10:00 AM',
      directedTo: m.directedTo,
    }));

    setChatMessages(slice);
    const latest = slice[slice.length - 1];
    if (latest) {
      setActiveDetectedText(latest.text);
      onTriggerAnalysis(latest.text, slice);
    }
  };

  // Advance scenario step-by-step
  const handleNextStep = () => {
    const currentScen = TEST_SCENARIOS.find(s => s.id === activeScenarioId);
    if (!currentScen) return;

    if (scenarioStep < currentScen.messages.length) {
      const nextStepIndex = scenarioStep + 1;
      setScenarioStep(nextStepIndex);
      const nextMsgDef = currentScen.messages[scenarioStep];
      const newMsg: ConversationMessage = {
        id: `step-${Date.now()}`,
        sender: nextMsgDef.sender,
        text: nextMsgDef.text,
        isMe: nextMsgDef.isMe,
        time: nextMsgDef.time || 'Just now',
        directedTo: nextMsgDef.directedTo,
      };

      const updated = [...chatMessages, newMsg];
      setChatMessages(updated);
      setActiveDetectedText(newMsg.text);
      onTriggerAnalysis(newMsg.text, updated);
    }
  };

  // Sync messages when app changes
  useEffect(() => {
    if (currentApp.packageName === 'com.je.supersus') {
      const msgs: ConversationMessage[] = [
        {
          id: 'sus-1',
          sender: 'Player_Red',
          text: 'Where was Spacecrew Blue when the reactor sabotage happened? Sus!',
          isMe: false,
          time: 'Emergency Meeting',
        },
        {
          id: 'sus-2',
          sender: 'Detective_Yellow',
          text: 'I saw Green near the medical bay vent right after the body was reported.',
          isMe: false,
          time: 'Voting Phase',
        }
      ];
      setChatMessages(msgs);
      setActiveDetectedText(msgs[0].text);
    } else if (currentApp.packageName === 'com.lemur.virtualmaster') {
      const msgs: ConversationMessage[] = [
        {
          id: 'vm-1',
          sender: 'Guest App in VM',
          text: 'How do I bypass network proxy certificates in virtual space?',
          isMe: false,
          time: '10:15 AM',
        }
      ];
      setChatMessages(msgs);
      setActiveDetectedText(msgs[0].text);
    }
  }, [currentApp.packageName, setActiveDetectedText]);

  const handleSendMessage = () => {
    if (!insertedChatText.trim()) return;
    const newMsg: ConversationMessage = {
      id: `me-${Date.now()}`,
      sender: 'James (You)',
      text: insertedChatText.trim(),
      isMe: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updated = [...chatMessages, newMsg];
    setChatMessages(updated);
    setInsertedChatText('');
  };

  const handleCustomContextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInputText.trim()) return;
    const text = customInputText.trim();
    
    const newMsg: ConversationMessage = {
      id: `custom-${Date.now()}`,
      sender: 'Participant',
      text,
      isMe: false,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updated = [...chatMessages, newMsg];
    setChatMessages(updated);
    setActiveDetectedText(text);
    setCustomInputText('');
    onTriggerAnalysis(text, updated);
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-[#e1e4e8] select-none relative overflow-hidden">
      {/* Top App Selector Bar */}
      <div className="px-3 py-2 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none py-0.5">
          <span className="text-[10px] text-[#8b949e] font-semibold uppercase tracking-wider shrink-0 mr-1 flex items-center space-x-1">
            <Users className="w-3 h-3 text-[#3fb950]" />
            <span>App:</span>
          </span>
          {allApps.map(app => (
            <button
              key={app.packageName}
              onClick={() => onSelectApp(app)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all flex items-center space-x-1.5 ${
                currentApp.packageName === app.packageName
                  ? 'bg-[#238636] text-white shadow-sm font-bold'
                  : 'bg-[#21262d] text-[#8b949e] hover:bg-[#30363d] hover:text-[#e1e4e8]'
              }`}
            >
              <span>{app.appName.split(' ')[0]}</span>
              {!app.enabled && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#f85149]" title="Disabled in whitelist" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Scenario Selection Bar */}
      <div className="bg-[#0f141c] border-b border-[#30363d] px-3 py-1.5 flex items-center space-x-2 overflow-x-auto scrollbar-none z-10 shrink-0">
        <span className="text-[9px] font-bold text-[#58a6ff] uppercase tracking-wider shrink-0 flex items-center space-x-1">
          <Sparkles className="w-3 h-3 text-[#58a6ff]" />
          <span>Thread Scenarios:</span>
        </span>
        {TEST_SCENARIOS.map(scen => (
          <button
            key={scen.id}
            onClick={() => handleLoadScenario(scen, scen.id === 'project-james-scenario' ? 3 : undefined)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium shrink-0 transition-all border ${
              activeScenarioId === scen.id
                ? 'bg-[#58a6ff22] border-[#58a6ff] text-[#58a6ff] font-bold'
                : 'bg-[#161b22] border-[#30363d] text-[#8b949e] hover:border-[#8b949e] hover:text-[#e1e4e8]'
            }`}
          >
            {scen.title}
          </button>
        ))}

        {/* Step Forward Button for Interactive Multi-Turn Testing */}
        {activeScenarioId === 'project-james-scenario' && (
          <button
            onClick={handleNextStep}
            disabled={scenarioStep >= 6}
            className="px-2.5 py-1 rounded-lg bg-[#238636] hover:bg-[#2ea043] disabled:opacity-40 disabled:hover:bg-[#238636] text-white text-[11px] font-bold flex items-center space-x-1 shrink-0 ml-auto shadow-sm"
            title="Advance to next message in the thread"
          >
            <SkipForward className="w-3 h-3" />
            <span>Next Message ({scenarioStep}/6)</span>
          </button>
        )}
      </div>

      {/* Whitelist Warning Alert if App is Disabled */}
      {!currentApp.enabled && (
        <div className="bg-[#f8514922] border-b border-[#f8514944] px-3 py-1.5 flex items-center justify-between text-[11px] text-[#f85149] shrink-0 z-10">
          <div className="flex items-center space-x-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{currentApp.appName} is NOT whitelisted. ReplyFloat AI is inactive in this app.</span>
          </div>
        </div>
      )}

      {/* App Simulation View Area */}
      {currentApp.category === 'Gaming' ? (
        /* SUPER SUS / GAMING SIMULATION UI */
        <div className="flex-1 flex flex-col bg-[#0b0e14] relative overflow-hidden">
          {/* In-Game Emergency Meeting Banner */}
          <div className="bg-[#da363322] border-b border-[#da363355] p-3 text-center space-y-1">
            <div className="flex items-center justify-center space-x-2 text-[#f85149] font-black tracking-widest text-xs uppercase animate-pulse">
              <Radio className="w-4 h-4" />
              <span>EMERGENCY DISCUSSION IN PROGRESS</span>
            </div>
            <p className="text-[10px] text-[#8b949e]">Super Sus Voting Phase • Round 1</p>
          </div>

          {/* Gaming Discussion Chat Stream */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {chatMessages.map((msg, idx) => (
              <div
                key={msg.id || idx}
                onClick={() => {
                  if (!msg.isMe) {
                    setActiveDetectedText(msg.text);
                    onTriggerAnalysis(msg.text, chatMessages);
                  }
                }}
                className={`p-2.5 rounded-xl max-w-[85%] cursor-pointer transition-all border ${
                  msg.isMe
                    ? 'ml-auto bg-[#23863622] border-[#23863666] text-[#e1e4e8]'
                    : activeDetectedText === msg.text
                    ? 'bg-[#161b22] border-[#58a6ff] ring-1 ring-[#58a6ff]'
                    : 'bg-[#161b22] border-[#30363d] hover:border-[#8b949e]'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-[#8b949e] mb-1">
                  <span className={`font-bold ${msg.isMe ? 'text-[#3fb950]' : 'text-[#f85149]'}`}>
                    {msg.sender}
                  </span>
                  <span className="font-mono text-[9px]">{msg.time}</span>
                </div>
                <p className="text-xs text-[#e1e4e8] leading-snug">{msg.text}</p>
              </div>
            ))}
          </div>

          {/* In-Game Quick Chat Input */}
          <div className="p-2.5 bg-[#161b22] border-t border-[#30363d] flex items-center space-x-2">
            <input
              type="text"
              value={insertedChatText}
              onChange={e => setInsertedChatText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your alibi or tap reply..."
              className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-1.5 text-xs text-[#e1e4e8] placeholder-[#8b949e] outline-none"
            />
            <button
              onClick={handleSendMessage}
              className="p-2 rounded-xl bg-[#238636] text-white hover:bg-[#2ea043] shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : currentApp.isVirtualEnvironment ? (
        /* VIRTUAL MASTER VM CONTAINER SIMULATION */
        <div className="flex-1 flex flex-col bg-[#05080c] relative">
          <div className="bg-[#101923] border-b border-[#1f3a5a] p-2.5 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-[#58a6ff]" />
              <span className="text-xs font-bold text-[#e1e4e8]">Virtual Master (Guest Android 12)</span>
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded bg-[#58a6ff22] text-[#58a6ff] font-mono">
              Sandbox Layer
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {chatMessages.map((msg, idx) => (
              <div
                key={msg.id || idx}
                onClick={() => {
                  if (!msg.isMe) {
                    setActiveDetectedText(msg.text);
                    onTriggerAnalysis(msg.text, chatMessages);
                  }
                }}
                className={`p-3 rounded-xl border max-w-[85%] cursor-pointer ${
                  msg.isMe
                    ? 'ml-auto bg-[#23863622] border-[#3fb950]'
                    : 'bg-[#101923] border-[#1f3a5a] hover:border-[#58a6ff]'
                }`}
              >
                <span className="text-[10px] text-[#58a6ff] font-mono block mb-1">{msg.sender}</span>
                <p className="text-xs text-[#e1e4e8]">{msg.text}</p>
              </div>
            ))}
          </div>

          <div className="p-2.5 bg-[#101923] border-t border-[#1f3a5a] flex items-center space-x-2">
            <input
              type="text"
              value={insertedChatText}
              onChange={e => setInsertedChatText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              placeholder="Paste or type into VM container..."
              className="flex-1 bg-[#05080c] border border-[#1f3a5a] rounded-xl px-3 py-1.5 text-xs text-[#e1e4e8] outline-none"
            />
            <button
              onClick={handleSendMessage}
              className="p-2 rounded-xl bg-[#58a6ff] text-white hover:bg-[#79b8ff] shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* STANDARD MESSAGING (WHATSAPP, TELEGRAM, DISCORD) */
        <div className="flex-1 flex flex-col bg-[#0b0e14] relative">
          <div className="p-3 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-[#238636] flex items-center justify-center font-bold text-xs text-white">
                {currentApp.appName.charAt(0)}
              </div>
              <div>
                <span className="text-xs font-bold text-[#e1e4e8] block">{currentApp.appName} • Group Chat</span>
                <span className="text-[10px] text-[#3fb950] font-mono">
                  {chatMessages.length} messages active • User: James
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {chatMessages.map((msg, idx) => (
              <div
                key={msg.id || idx}
                onClick={() => {
                  if (!msg.isMe) {
                    setActiveDetectedText(msg.text);
                    onTriggerAnalysis(msg.text, chatMessages);
                  }
                }}
                className={`p-3 rounded-2xl max-w-[85%] cursor-pointer border transition-all ${
                  msg.isMe
                    ? 'ml-auto bg-[#238636] text-white border-[#3fb950]'
                    : activeDetectedText === msg.text
                    ? 'bg-[#161b22] text-[#e1e4e8] border-[#58a6ff] ring-1 ring-[#58a6ff]'
                    : 'bg-[#161b22] text-[#e1e4e8] border-[#30363d] hover:border-[#8b949e]'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] mb-1 opacity-80">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-semibold">{msg.sender}</span>
                    {msg.directedTo && (
                      <span className="px-1.5 py-0.2 rounded bg-[#58a6ff33] text-[#58a6ff] text-[9px] font-medium">
                        @{msg.directedTo}
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[9px]">{msg.time}</span>
                </div>
                <p className="text-xs leading-relaxed">{msg.text}</p>
              </div>
            ))}
          </div>

          {/* Chat Input Bar */}
          <div className="p-2.5 bg-[#161b22] border-t border-[#30363d] flex items-center space-x-2">
            <input
              type="text"
              value={insertedChatText}
              onChange={e => setInsertedChatText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type message or tap reply to insert..."
              className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-1.5 text-xs text-[#e1e4e8] placeholder-[#8b949e] outline-none focus:border-[#58a6ff]"
            />
            <button
              onClick={handleSendMessage}
              className="p-2 rounded-xl bg-[#238636] text-white hover:bg-[#2ea043] shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Manual Message Injector Form */}
      <form onSubmit={handleCustomContextSubmit} className="p-2 bg-[#0d1117] border-t border-[#30363d] flex items-center space-x-2 z-10">
        <input
          type="text"
          value={customInputText}
          onChange={e => setCustomInputText(e.target.value)}
          placeholder="Inject custom message into screen analysis..."
          className="flex-1 bg-[#161b22] border border-[#30363d] rounded-lg px-2.5 py-1 text-xs text-[#e1e4e8] placeholder-[#8b949e] outline-none focus:border-[#58a6ff]"
        />
        <button
          type="submit"
          className="px-2.5 py-1 bg-[#21262d] hover:bg-[#30363d] text-[#e1e4e8] rounded-lg text-xs font-semibold shrink-0"
        >
          Inject
        </button>
      </form>
    </div>
  );
};
