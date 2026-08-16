export type ReplyStyle = 
  | '1-Line'
  | '2-Line'
  | 'Single-Word'
  | 'Debate'
  | 'Funny'
  | 'Arrogant'
  | 'Lord'
  | 'Passive'
  | 'Logical'
  | 'Respectful'
  | 'Casual'
  | 'Formal'
  | 'Short'
  | 'Detailed'
  | 'Counterargument';

export type ResponseLength = 'very-short' | 'short' | 'normal' | 'long' | 'balanced' | 'detailed';

export type SummaryLength = '1-line' | '2-line' | 'detailed';

export type OverlayPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center' | 'custom';

export type OverlaySize = 'compact' | 'normal' | 'large';

export type OverlayInteractionMode = 'interactive' | 'passthrough' | 'minimal';

export type OverlayFontSize = 'small' | 'medium' | 'large' | 'xlarge';

export type OverlayCornerRadius = 'none' | 'small' | 'medium' | 'large' | 'pill';

export type OverlaySpacing = 'compact' | 'standard' | 'relaxed';

export type OverlayDisplayMode = 'bullet' | 'standard';

export interface UnderstandingSettings {
  enabled: boolean; // Understanding Mode: ON/OFF
  summaryLength: SummaryLength; // 1-line | 2-line | detailed
  autoGenerateWithUnderstanding: boolean;
}

export interface AutoGenerationSettings {
  enabled: boolean; // Auto Generate: ON/OFF
  generateOnlyOnNewText: boolean; // Generate only when new text appears: ON/OFF
  minDelayBeforeGeneratingMs: number; // Minimum delay before generating: adjustable (e.g. 400ms)
  cooldownBetweenRequestsMs: number; // Cooldown between AI requests (e.g. 2500ms)
  maxGenerationsPerMinute: number; // Maximum automatic generations per minute (e.g. 12)
  replaceOldSuggestions: boolean; // Automatically replace old suggestions: ON/OFF
  keepPreviousSuggestions: boolean; // Keep previous suggestions: ON/OFF
  filterUnrelatedUiText: boolean; // Avoid triggering on UI buttons / stamps
  conversationHeuristicStrictness: 'lenient' | 'standard' | 'strict'; // Detect genuine discussions
}

export interface AutoHideSettings {
  enabled: boolean; // Auto-Hide: ON/OFF
  durationSeconds: number; // Time visible on screen (e.g. 3, 5, 8, 12, 15s)
  hideOnCopy: boolean; // Auto-minimize/hide immediately when user taps copy
  pauseOnHover: boolean; // Pause countdown while mouse/touch is over overlay
}

export type ResponseIntent = 'suggested_reply' | 'direct_answer' | 'conversational_suggestion' | 'no_response_needed';

export interface ConversationMessage {
  id: string;
  sender: string;
  text: string;
  time?: string;
  isMe?: boolean;
  directedTo?: string;
}

export interface ConversationSnapshot {
  threadId?: string;
  appName: string;
  messages: ConversationMessage[];
  latestMessageText: string;
  latestSender: string;
  isDirectedAtUser: boolean;
  intentType: ResponseIntent;
  needsResponse: boolean;
  contextSummary?: string;
}

export interface ReplySuggestion {
  id: string;
  style: ReplyStyle | string;
  text: string;
  tone?: string;
  confidence?: number;
  timestamp?: number;
  isEdited?: boolean;
  intentType?: ResponseIntent;
  intentLabel?: string;
}

export interface AIProviderConfig {
  id: string;
  name: string;
  type: 'gemini' | 'openai' | 'custom';
  endpoint: string;
  model: string;
  apiKey: string;
  enabled: boolean;
  isDefault: boolean;
}

export interface InstalledApp {
  packageName: string;
  appName: string;
  category: 'Messaging' | 'Social' | 'Browser' | 'Gaming' | 'Work' | 'VirtualMachine' | 'Other';
  icon: string;
  enabled: boolean;
  isVirtualEnvironment?: boolean;
  vmCompatibilityNotes?: string;
  sampleConversations?: {
    sender: string;
    text: string;
    timestamp: string;
  }[];
}

export interface RecentResultItem {
  id: string;
  requestId: number;
  question: string;
  appName: string;
  understanding?: string;
  suggestions: ReplySuggestion[];
  timestamp: number; // per-item 2-minute visible recent-result menu retention
  historyTimestamp: number; // per-item 5-minute storage retention
  style: string;
  isExpanded?: boolean;
  isLoading?: boolean;
  error?: string;
  intentType?: ResponseIntent;
  intentLabel?: string;
  isDirectedAtUser?: boolean;
  conversationThread?: ConversationMessage[];
}

export interface OverlaySettings {
  enabled: boolean;
  screenAnalysisEnabled?: boolean; // Screen Analysis: ON / OFF
  interactionMode: OverlayInteractionMode; // 'interactive' | 'passthrough' | 'minimal'
  overlayMode: OverlayDisplayMode; // 'bullet' (Realme Bullet Notification style) | 'standard'
  transparency: number; // 0.1 to 1.0 (overall window opacity)
  backgroundTransparency: number; // 0.1 to 1.0 (surface opacity)
  size: OverlaySize;
  position: OverlayPosition;
  customX?: number;
  customY?: number;
  customWidth?: number; // px
  customHeight?: number; // px
  showCompactBar?: boolean; // Show or hide the compact launcher bar when overlay is minimized
  compactX?: number; // Independent X position for compact bar
  compactY?: number; // Independent Y position for compact bar
  compactWidth?: number; // Independent width for compact bar
  compactHeight?: number; // Independent height for compact bar
  appPositions?: Record<string, { x: number; y: number }>; // Per-app saved positions
  passThroughMode: boolean; // backward compatibility, syncs with interactionMode === 'passthrough'
  fontSize: OverlayFontSize;
  cornerRadius: OverlayCornerRadius;
  itemSpacing: OverlaySpacing;
  scale: number; // 0.75 to 1.25
  maxHeight?: number; // px
  maxVisibleReplies: 1 | 2 | 3 | 5;
  autoDetect: boolean;
  debounceMs: number;
  showTriggerBubble: boolean;
  bubbleSize: 'small' | 'medium' | 'large';
  dockToEdge: boolean;
  animationSpeed: 'fast' | 'normal' | 'smooth';
  autoHide: AutoHideSettings;
}

export interface ReplySettings {
  selectedStyle: ReplyStyle;
  suggestionCount: 1 | 2 | 3 | 5;
  responseLength: ResponseLength; // 'very-short' | 'short' | 'normal' | 'long'
  customMaxCharLimit: number; // Custom character limit (e.g. 50 to 500)
  expandableReplies?: boolean; // Expandable Replies: ON / OFF toggle (default: true)
  recentRetentionSeconds?: number; // Recent-result visibility retention (default: 120s = 2 min)
  historyRetentionSeconds?: number; // Application history storage retention (default: 300s = 5 min)
  understanding: UnderstandingSettings; // Understanding Mode: ON/OFF + summary length
  autoCopyOnSelect: boolean;
  tapToCopy: boolean;
  longPressToCopy: boolean;
  editBeforeCopying: boolean;
  showCopyToast: boolean;
  toneModifiers: string[];
  enableHistory: boolean;
  autoGenerate: AutoGenerationSettings;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  appName: string;
  detectedText: string;
  understandingSummary?: string;
  selectedReply?: string;
  style: string;
  provider: string;
}

export interface PermissionStatus {
  accessibility: boolean;
  overlay: boolean;
  notifications: boolean;
  virtualMachineBridge?: boolean;
}

export interface ReplyRequest {
  conversationText: string;
  contextApp?: string;
  replyStyle?: ReplyStyle | string;
  count?: number;
  length?: ResponseLength;
  customMaxCharLimit?: number;
  understandingMode?: boolean;
  summaryLength?: SummaryLength;
  provider?: string;
  providerConfig?: Partial<AIProviderConfig>;
  messages?: ConversationMessage[];
  userName?: string;
}

export interface ReplyResponse {
  success: boolean;
  understanding?: string;
  replies: ReplySuggestion[];
  provider: string;
  latencyMs?: number;
  error?: string;
  intentType?: ResponseIntent;
  intentLabel?: string;
  isDirectedAtUser?: boolean;
  needsResponse?: boolean;
}

export interface AndroidCodeFile {
  path: string;
  language: 'kotlin' | 'xml' | 'groovy' | 'properties' | 'json';
  content: string;
  description: string;
}
