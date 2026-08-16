import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { AndroidFrame } from './components/AndroidFrame';
import { HomeScreen } from './components/HomeScreen';
import { SupportedAppsScreen } from './components/SupportedAppsScreen';
import { AIProvidersScreen } from './components/AIProvidersScreen';
import { ReplySettingsScreen } from './components/ReplySettingsScreen';
import { OverlaySettingsScreen } from './components/OverlaySettingsScreen';
import { PrivacyScreen } from './components/PrivacyScreen';
import { AboutScreen } from './components/AboutScreen';
import { CodeExplorerScreen } from './components/CodeExplorerScreen';
import { INITIAL_INSTALLED_APPS } from './data/mockApps';
import { generateRepliesWithAI } from './services/apiClient';
import { exportAndroidProjectZip, downloadBlob } from './utils/zipExporter';
import { AutoGenerationManager, isMeaningfulConversation, isDifferentQuestion, analyzeConversationThread } from './utils/contextDetection';
import { tempStorageManager } from './utils/storageCleanup';
import { 
  InstalledApp, 
  OverlaySettings, 
  ReplySettings, 
  AIProviderConfig, 
  ReplySuggestion, 
  PermissionStatus,
  ReplyStyle,
  RecentResultItem,
  ConversationMessage,
  ConversationSnapshot,
  ResponseIntent
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'simulator' | 'home' | 'apps' | 'providers' | 'reply-settings' | 'overlay-settings' | 'privacy' | 'about' | 'code'
  >('simulator');

  const [isServiceActive, setIsServiceActive] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Installed & Whitelisted Apps
  const [apps, setApps] = useState<InstalledApp[]>(INITIAL_INSTALLED_APPS);
  const [currentSimulatedApp, setCurrentSimulatedApp] = useState<InstalledApp>(INITIAL_INSTALLED_APPS[0]);

  // Detected Context & Understanding State
  const [activeDetectedText, setActiveDetectedText] = useState<string>(
    'James, do you know?'
  );
  const [understandingSummary, setUnderstandingSummary] = useState<string>(
    'Person C is asking you directly for an update on the project.'
  );
  const [activeIntentType, setActiveIntentType] = useState<ResponseIntent>('suggested_reply');
  const [activeIntentLabel, setActiveIntentLabel] = useState<string>('Suggested Reply');
  const [conversationThread, setConversationThread] = useState<ConversationMessage[]>([
    { id: '1', sender: 'Person A', text: 'What happened to the project?', isMe: false, time: '10:40 AM' },
    { id: '2', sender: 'Person B', text: 'I think James knows.', isMe: false, time: '10:41 AM' },
    { id: '3', sender: 'Person C', text: 'James, do you know?', isMe: false, time: '10:42 AM', directedTo: 'James' },
  ]);
  const [currentSnapshot, setCurrentSnapshot] = useState<ConversationSnapshot | undefined>();
  const [insertedChatText, setInsertedChatText] = useState<string>('');

  // AI Providers
  const [providers, setProviders] = useState<AIProviderConfig[]>([
    {
      id: 'gemini-default',
      name: 'Google Gemini',
      type: 'gemini',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta',
      model: 'gemini-3.7-flash',
      apiKey: '',
      enabled: true,
      isDefault: true,
    },
    {
      id: 'openai-gpt4o',
      name: 'OpenAI',
      type: 'openai',
      endpoint: 'https://api.openai.com/v1/chat/completions',
      model: 'gpt-4o-mini',
      apiKey: '',
      enabled: false,
      isDefault: false,
    },
    {
      id: 'groq-llama3',
      name: 'Groq Llama 3.3',
      type: 'custom',
      endpoint: 'https://api.groq.com/openai/v1/chat/completions',
      model: 'llama-3.3-70b-versatile',
      apiKey: '',
      enabled: false,
      isDefault: false,
    },
  ]);
  const [activeProviderId, setActiveProviderId] = useState('gemini-default');

  // Overlay Settings with Realme Bullet Notification style & per-app positions
  const [overlaySettings, setOverlaySettings] = useState<OverlaySettings>(() => {
    // Attempt to restore user's preferred saved overlay size/dimensions
    try {
      const savedWidth = localStorage.getItem('replyfloat_overlay_width');
      const savedHeight = localStorage.getItem('replyfloat_overlay_height');
      return {
        enabled: true,
        interactionMode: 'interactive',
        overlayMode: 'bullet', // Default to sleek Realme Bullet Notification
        transparency: 0.95,
        backgroundTransparency: 0.95,
        size: 'normal',
        position: 'top-right',
        customX: 15,
        customY: 70,
        customWidth: savedWidth ? parseInt(savedWidth, 10) : 330,
        customHeight: savedHeight ? parseInt(savedHeight, 10) : undefined,
        appPositions: {
          'WhatsApp': { x: 15, y: 70 },
          'Super Sus': { x: 20, y: 35 },
          'Virtual Master': { x: 15, y: 80 },
          'Discord': { x: 25, y: 90 },
        },
        passThroughMode: false,
        fontSize: 'medium',
        cornerRadius: 'medium',
        itemSpacing: 'standard',
        scale: 1.0,
        maxVisibleReplies: 3,
        autoDetect: true,
        debounceMs: 500,
        showTriggerBubble: true,
        bubbleSize: 'medium',
        dockToEdge: true,
        animationSpeed: 'normal',
        autoHide: {
          enabled: true,
          durationSeconds: 8,
          hideOnCopy: true,
          pauseOnHover: true,
        },
      };
    } catch {
      return {
        enabled: true,
        interactionMode: 'interactive',
        overlayMode: 'bullet',
        transparency: 0.95,
        backgroundTransparency: 0.95,
        size: 'normal',
        position: 'top-right',
        customX: 15,
        customY: 70,
        customWidth: 330,
        appPositions: {
          'WhatsApp': { x: 15, y: 70 },
          'Super Sus': { x: 20, y: 35 },
          'Virtual Master': { x: 15, y: 80 },
          'Discord': { x: 25, y: 90 },
        },
        passThroughMode: false,
        fontSize: 'medium',
        cornerRadius: 'medium',
        itemSpacing: 'standard',
        scale: 1.0,
        maxVisibleReplies: 3,
        autoDetect: true,
        debounceMs: 500,
        showTriggerBubble: true,
        bubbleSize: 'medium',
        dockToEdge: true,
        animationSpeed: 'normal',
        autoHide: {
          enabled: true,
          durationSeconds: 8,
          hideOnCopy: true,
          pauseOnHover: true,
        },
      };
    }
  });

  // Reply Settings with Understanding Mode, Expandable Replies & Auto Generation controls
  const [replySettings, setReplySettings] = useState<ReplySettings>({
    selectedStyle: 'Logical',
    suggestionCount: 3,
    responseLength: 'normal',
    customMaxCharLimit: 280,
    expandableReplies: true, // Default: ON
    understanding: {
      enabled: true,
      summaryLength: '1-line',
      autoGenerateWithUnderstanding: true,
    },
    autoCopyOnSelect: true,
    tapToCopy: true,
    longPressToCopy: true,
    editBeforeCopying: false,
    showCopyToast: true,
    toneModifiers: ['rational', 'balanced'],
    enableHistory: false,
    autoGenerate: {
      enabled: true,
      generateOnlyOnNewText: true,
      minDelayBeforeGeneratingMs: 500,
      cooldownBetweenRequestsMs: 2500,
      maxGenerationsPerMinute: 12,
      replaceOldSuggestions: true,
      keepPreviousSuggestions: false,
      filterUnrelatedUiText: true,
      conversationHeuristicStrictness: 'standard',
    },
  });

  // Permission Diagnostics Status
  const [permissions] = useState<PermissionStatus>({
    accessibility: true,
    overlay: true,
    notifications: true,
    virtualMachineBridge: true,
  });

  // Recent History Items (2-minute retention in floating menu)
  const [recentHistory, setRecentHistory] = useState<RecentResultItem[]>([
    {
      id: 'recent-1',
      requestId: 1,
      question: 'What did Gandhi do for India\'s freedom?',
      appName: 'WhatsApp',
      understanding: 'Gandhi was a major leader of India\'s independence movement, known especially for nonviolent resistance.',
      suggestions: [
        {
          id: 'init-1',
          style: 'Logical',
          text: 'He played a major role through nonviolent mass movements like the Salt March and Quit India, mobilizing millions against British colonial rule.',
          tone: 'Historical & Analytical',
          confidence: 0.96,
        },
        {
          id: 'init-2',
          style: 'Debate',
          text: 'Gandhi helped lead India\'s independence movement using nonviolent resistance, which united diverse classes and pressured British administration.',
          tone: 'Persuasive',
          confidence: 0.94,
        },
      ],
      timestamp: Date.now() - 25 * 1000, // 25s ago
      historyTimestamp: Date.now() - 25 * 1000,
      style: 'Logical',
    }
  ]);

  // Initial Suggestions
  const [suggestions, setSuggestions] = useState<ReplySuggestion[]>([
    {
      id: 'init-1',
      style: 'Logical',
      text: 'He played a major role through nonviolent mass movements like the Salt March and Quit India, mobilizing millions against British colonial rule.',
      tone: 'Historical & Analytical',
      confidence: 0.96,
    },
    {
      id: 'init-2',
      style: 'Debate',
      text: 'Gandhi helped lead India\'s independence movement using nonviolent resistance, which united diverse classes and pressured British administration.',
      tone: 'Persuasive',
      confidence: 0.94,
    },
    {
      id: 'init-3',
      style: 'Short',
      text: 'He championed nonviolent civil disobedience (Satyagraha) to unite India and achieve independence in 1947.',
      tone: 'Concise',
      confidence: 0.95,
    },
  ]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Monotonically increasing request ID counter for latest-request-wins logic
  const requestIdCounterRef = useRef<number>(1);
  const activeRequestIdRef = useRef<number>(1);

  // References for Auto-Generation Engine & Request Cancellation
  const autoGenManagerRef = useRef<AutoGenerationManager>(new AutoGenerationManager());
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeAbortRef = useRef<AbortController | null>(null);

  const activeProvider = providers.find(p => p.id === activeProviderId) || providers[0];

  // Periodic pruning of recent-result items that passed the 2-minute (or configured) retention window
  useEffect(() => {
    const pruneTimer = setInterval(() => {
      const retentionSec = replySettings.recentRetentionSeconds || 120;
      const cutoff = Date.now() - retentionSec * 1000;
      setRecentHistory(prev => prev.filter(item => item.timestamp > cutoff));
    }, 4000);
    return () => clearInterval(pruneTimer);
  }, [replySettings.recentRetentionSeconds]);

  // Stop / Cancel active generation
  const handleStopGeneration = useCallback(() => {
    if (activeAbortRef.current) {
      activeAbortRef.current.abort();
      activeAbortRef.current = null;
    }
    setIsLoadingSuggestions(false);
  }, []);

  // AI Generation trigger (Latest-Request-Wins logic)
  const handleTriggerAnalysis = useCallback(async (
    targetText?: string, 
    customThread?: ConversationMessage[], 
    overrideStyle?: ReplyStyle
  ) => {
    const thread = customThread || conversationThread;
    const questionText = (targetText || activeDetectedText || '').trim();
    if (!questionText && (!thread || thread.length === 0)) return;

    // Check if the current app is whitelisted/enabled
    if (!currentSimulatedApp.enabled) {
      console.log(`[ReplyFloat AI] Skipped generation: ${currentSimulatedApp.appName} is not whitelisted.`);
      return;
    }

    // Perform comprehensive thread analysis
    const snapshot = analyzeConversationThread(thread, currentSimulatedApp.appName, 'James');
    setCurrentSnapshot(snapshot);
    setActiveIntentType(snapshot.intentType);
    setActiveIntentLabel(
      snapshot.intentType === 'direct_answer'
        ? 'Direct Answer'
        : snapshot.intentType === 'suggested_reply'
        ? 'Suggested Reply'
        : snapshot.intentType === 'no_response_needed'
        ? 'No Response Needed'
        : 'Suggested Response'
    );

    // If conversation indicates resolution or no response needed, suppress generation gracefully
    if (!snapshot.needsResponse) {
      setUnderstandingSummary(snapshot.contextSummary || 'Topic resolved; no response needed.');
      setSuggestions([]);
      setIsLoadingSuggestions(false);
      return;
    }

    // Monotonically increment request ID for latest-request-wins
    requestIdCounterRef.current += 1;
    const currentRequestId = requestIdCounterRef.current;
    activeRequestIdRef.current = currentRequestId;

    // Save previous result to recent history if it had valid suggestions and is a different question
    if (suggestions.length > 0 && activeDetectedText && isDifferentQuestion(activeDetectedText, questionText)) {
      const historyItem: RecentResultItem = {
        id: `recent-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        requestId: currentRequestId - 1,
        question: activeDetectedText,
        appName: currentSimulatedApp.appName,
        understanding: understandingSummary,
        suggestions: [...suggestions],
        timestamp: Date.now(),
        historyTimestamp: Date.now(),
        style: replySettings.selectedStyle,
        intentType: activeIntentType,
        intentLabel: activeIntentLabel,
      };
      setRecentHistory(prev => [historyItem, ...prev.filter(h => h.question !== activeDetectedText)].slice(0, 20));
    }

    // Mark as processed in auto-gen manager
    autoGenManagerRef.current.markProcessed(questionText);
    autoGenManagerRef.current.markSnapshotProcessed(snapshot);

    // Abort any in-flight request
    if (activeAbortRef.current) {
      activeAbortRef.current.abort();
    }
    activeAbortRef.current = new AbortController();

    setIsLoadingSuggestions(true);
    const styleToUse = overrideStyle || replySettings.selectedStyle;

    try {
      const response = await generateRepliesWithAI(
        questionText,
        currentSimulatedApp.appName,
        styleToUse,
        replySettings.suggestionCount,
        replySettings.responseLength,
        activeProvider,
        replySettings.understanding?.enabled ?? true,
        replySettings.understanding?.summaryLength ?? '1-line',
        replySettings.customMaxCharLimit || 280,
        thread,
        'James'
      );

      // Latest-request-wins verification: only apply if this request is still active
      if (activeRequestIdRef.current !== currentRequestId) {
        console.log(`[ReplyFloat AI] Ignored outdated response for request #${currentRequestId} (Current: #${activeRequestIdRef.current})`);
        return;
      }

      if (response.success && response.replies.length > 0) {
        if (response.understanding) {
          setUnderstandingSummary(response.understanding);
        }
        if (response.intentType) {
          setActiveIntentType(response.intentType);
        }
        if (response.intentLabel) {
          setActiveIntentLabel(response.intentLabel);
        }

        if (replySettings.autoGenerate?.keepPreviousSuggestions) {
          setSuggestions(prev => [...response.replies, ...prev].slice(0, 10));
        } else {
          setSuggestions(response.replies);
        }

        // Record in transient storage manager
        tempStorageManager.recordContext(
          currentSimulatedApp.appName,
          questionText,
          response.understanding,
          response.replies.map(r => ({ id: r.id, text: r.text, style: r.style })),
          false,
          currentRequestId
        );
      } else {
        // AI failure or empty response -> mark error state
        tempStorageManager.markErrorState(true);
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        console.error('Failed to generate suggestions:', e);
        tempStorageManager.markErrorState(true);
      }
    } finally {
      if (activeRequestIdRef.current === currentRequestId) {
        setIsLoadingSuggestions(false);
        activeAbortRef.current = null;
      }
    }
  }, [
    activeDetectedText, 
    conversationThread, 
    currentSimulatedApp, 
    replySettings, 
    activeProvider, 
    suggestions, 
    understandingSummary, 
    activeIntentType, 
    activeIntentLabel
  ]);

  // Restore previous item from recent results back to active (pure UI inspection, no regeneration)
  const handleSelectRecentItem = useCallback((item: RecentResultItem) => {
    setActiveDetectedText(item.question);
    autoGenManagerRef.current.markProcessed(item.question);
    if (item.understanding) setUnderstandingSummary(item.understanding);
    if (item.intentType) setActiveIntentType(item.intentType);
    if (item.intentLabel) setActiveIntentLabel(item.intentLabel);
    setSuggestions(item.suggestions);
    setIsLoadingSuggestions(false);
  }, []);

  // Delete item from recent results
  const handleDeleteRecentItem = useCallback((id: string) => {
    setRecentHistory(prev => prev.filter(item => item.id !== id));
  }, []);

  // AUTOMATIC SCREEN ANALYSIS & CONVERSATION AWARE ENGINE EFFECT
  useEffect(() => {
    const autoGen = replySettings.autoGenerate;
    // Screen analysis check: must be active and screenAnalysisEnabled must not be false
    if (!isServiceActive || !autoGen?.enabled || overlaySettings.screenAnalysisEnabled === false) {
      return;
    }

    // Whitelist check: only operate if current simulated app is enabled
    if (!currentSimulatedApp.enabled) {
      return;
    }

    if (!activeDetectedText || !activeDetectedText.trim()) {
      return;
    }

    // 1. Analyze snapshot
    const snapshot = analyzeConversationThread(conversationThread, currentSimulatedApp.appName, 'James');

    // If conversation indicates no response is needed (e.g. "Never mind, I figured it out"), do not trigger generation
    if (!snapshot.needsResponse) {
      return;
    }

    // 2. Filter unrelated UI text & check conversation depth
    if (autoGen.filterUnrelatedUiText) {
      const validation = isMeaningfulConversation(
        activeDetectedText, 
        autoGen.conversationHeuristicStrictness || 'standard'
      );
      if (!validation.isValid) {
        return;
      }
    }

    // 3. New Question & Thread Snapshot Check: do not generate duplicate responses if the same thread state remains on screen
    if (!autoGenManagerRef.current.isNewSnapshot(snapshot) && !autoGenManagerRef.current.isNewQuestion(activeDetectedText)) {
      return;
    }

    // 4. Check rate limits & cooldown
    const rateCheck = autoGenManagerRef.current.canTriggerGeneration(
      autoGen.cooldownBetweenRequestsMs || 1500,
      autoGen.maxGenerationsPerMinute || 15
    );

    if (!rateCheck.allowed) {
      return;
    }

    // 5. Intelligent Debouncing (Minimum delay before generating)
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const delayMs = autoGen.minDelayBeforeGeneratingMs || overlaySettings.debounceMs || 400;

    debounceTimerRef.current = setTimeout(() => {
      autoGenManagerRef.current.recordGeneration();
      handleTriggerAnalysis(activeDetectedText, conversationThread);
    }, delayMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [
    activeDetectedText, 
    conversationThread,
    isServiceActive, 
    replySettings.autoGenerate, 
    overlaySettings.screenAnalysisEnabled,
    currentSimulatedApp.enabled, 
    overlaySettings.debounceMs, 
    handleTriggerAnalysis
  ]);

  // App whitelist toggle handlers
  const handleToggleApp = (packageName: string, enabled: boolean) => {
    setApps(prev =>
      prev.map(a => (a.packageName === packageName ? { ...a, enabled } : a))
    );
    if (currentSimulatedApp.packageName === packageName) {
      setCurrentSimulatedApp(prev => ({ ...prev, enabled }));
    }
  };

  const handleToggleAllApps = (enableAll: boolean) => {
    setApps(prev => prev.map(a => ({ ...a, enabled: enableAll })));
    setCurrentSimulatedApp(prev => ({ ...prev, enabled: enableAll }));
  };

  const handleAddCustomApp = (newApp: InstalledApp) => {
    setApps(prev => [newApp, ...prev]);
    setCurrentSimulatedApp(newApp);
  };

  // Provider Save & Delete
  const handleSaveProvider = (newConfig: AIProviderConfig) => {
    setProviders(prev => {
      const exists = prev.some(p => p.id === newConfig.id);
      if (exists) {
        return prev.map(p => (p.id === newConfig.id ? newConfig : p));
      }
      return [...prev, newConfig];
    });
  };

  const handleDeleteProvider = (id: string) => {
    if (providers.length <= 1) return;
    setProviders(prev => prev.filter(p => p.id !== id));
    if (activeProviderId === id) {
      const remaining = providers.filter(p => p.id !== id);
      setActiveProviderId(remaining[0].id);
    }
  };

  const handleSetDefaultProvider = (id: string) => {
    setActiveProviderId(id);
    setProviders(prev =>
      prev.map(p => ({
        ...p,
        isDefault: p.id === id,
        enabled: p.id === id ? true : p.enabled,
      }))
    );
  };

  // Export Android Studio Project ZIP
  const handleExportZip = async () => {
    try {
      setIsExporting(true);
      const zipBlob = await exportAndroidProjectZip();
      downloadBlob(zipBlob, 'ReplyFloatAI-Android-Project.zip');
    } catch (err) {
      console.error('Failed to export Android project zip:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e1e4e8] flex flex-col font-sans w-full max-w-full overflow-x-hidden">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isServiceActive={isServiceActive}
        setIsServiceActive={setIsServiceActive}
        onExportZip={handleExportZip}
        isExporting={isExporting}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 flex flex-col min-w-0 max-w-full overflow-x-hidden">
        {activeTab === 'simulator' && (
          <AndroidFrame
            currentApp={currentSimulatedApp}
            onSelectApp={setCurrentSimulatedApp}
            allApps={apps}
            activeDetectedText={activeDetectedText}
            setActiveDetectedText={setActiveDetectedText}
            understandingSummary={understandingSummary}
            intentType={activeIntentType}
            intentLabel={activeIntentLabel}
            conversationThread={conversationThread}
            onUpdateConversationThread={setConversationThread}
            conversationSnapshot={currentSnapshot}
            insertedChatText={insertedChatText}
            setInsertedChatText={setInsertedChatText}
            onInsertReplyToChat={(reply) => setInsertedChatText(reply)}
            onTriggerAnalysis={handleTriggerAnalysis}
            isServiceActive={isServiceActive}
            setIsServiceActive={setIsServiceActive}
            overlaySettings={overlaySettings}
            replySettings={replySettings}
            activeProvider={activeProvider}
            suggestions={suggestions}
            isLoadingSuggestions={isLoadingSuggestions}
            recentHistory={recentHistory}
            onSelectRecentItem={handleSelectRecentItem}
            onDeleteRecentItem={handleDeleteRecentItem}
            onOpenSettings={() => setActiveTab('overlay-settings')}
            onUpdateOverlaySettings={patch => setOverlaySettings(prev => ({ ...prev, ...patch }))}
            onUpdateReplySettings={patch => setReplySettings(prev => ({ ...prev, ...patch }))}
          />
        )}

        {activeTab === 'home' && (
          <HomeScreen
            isServiceActive={isServiceActive}
            setIsServiceActive={setIsServiceActive}
            overlaySettings={overlaySettings}
            replySettings={replySettings}
            activeProvider={activeProvider}
            currentApp={currentSimulatedApp}
            supportedAppsCount={apps.filter(a => a.enabled).length}
            permissions={permissions}
            onNavigateTab={setActiveTab}
            onTriggerTest={() => {
              setActiveTab('simulator');
              handleTriggerAnalysis();
            }}
          />
        )}

        {activeTab === 'apps' && (
          <SupportedAppsScreen
            apps={apps}
            onToggleApp={handleToggleApp}
            onToggleAll={handleToggleAllApps}
            onAddCustomApp={handleAddCustomApp}
          />
        )}

        {activeTab === 'providers' && (
          <AIProvidersScreen
            providers={providers}
            activeProviderId={activeProviderId}
            onSelectActiveProvider={handleSetDefaultProvider}
            onSaveProvider={handleSaveProvider}
            onDeleteProvider={handleDeleteProvider}
          />
        )}

        {activeTab === 'reply-settings' && (
          <ReplySettingsScreen
            settings={replySettings}
            onUpdateSettings={patch => setReplySettings(prev => ({ ...prev, ...patch }))}
          />
        )}

        {activeTab === 'overlay-settings' && (
          <OverlaySettingsScreen
            settings={overlaySettings}
            onUpdateSettings={patch => setOverlaySettings(prev => ({ ...prev, ...patch }))}
          />
        )}

        {activeTab === 'privacy' && <PrivacyScreen />}

        {activeTab === 'about' && <AboutScreen />}

        {activeTab === 'code' && (
          <CodeExplorerScreen onExportZip={handleExportZip} isExporting={isExporting} />
        )}
      </main>
    </div>
  );
}
