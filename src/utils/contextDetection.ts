/**
 * Context & Conversation Detection Engine
 * Provides intelligent conversation thread snapshotting, message role analysis,
 * intent classification (Direct Answer vs Suggested Reply vs Conversation Suggestion vs No Response),
 * spam filtering, and generation rate-limiting.
 */

import { ConversationMessage, ConversationSnapshot, ResponseIntent } from '../types';

// Normalized comparison for questions and messages
export function normalizeQuestionText(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w\s\?]/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Checks whether two questions or text fragments are genuinely different.
 */
export function isDifferentQuestion(prevQuestion: string, newQuestion: string): boolean {
  const normPrev = normalizeQuestionText(prevQuestion);
  const normNew = normalizeQuestionText(newQuestion);
  if (!normNew) return false;
  if (!normPrev) return true;
  return normPrev !== normNew;
}

// Normalized fingerprint for text
export function computeTextHash(text: string): string {
  const normalized = normalizeQuestionText(text);

  let hash = 5381;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash * 33) ^ normalized.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}

// Known non-conversation system UI tokens to ignore
const SYSTEM_UI_TOKENS = new Set([
  'today',
  'yesterday',
  'online',
  'typing...',
  'type a message',
  'type a reply',
  'send',
  'search',
  'reply',
  'share',
  'upvote',
  'downvote',
  'comments',
  'unread messages',
  'photo',
  'audio',
  'video',
  'voice message',
  'missed call',
  'connected',
  'connecting...',
  '5g',
  'lte',
  'wifi',
  'battery',
]);

// Tokens that explicitly signal that a thread has concluded or does not require a response
const NO_RESPONSE_PHRASES = [
  'never mind',
  'nevermind',
  'i figured it out',
  'figured it out',
  'got it fixed',
  'all good now',
  'problem solved',
  'already done',
  'no worries',
  'dont worry about it',
  "don't worry about it",
  'found it myself',
  'ignore that',
  'false alarm',
];

/**
 * Checks if a message indicates the conversation is resolved or requires no response.
 */
export function isNoResponseRequired(text: string): boolean {
  if (!text) return false;
  const lower = text.trim().toLowerCase();
  
  // Check exact/substring matches for resolution phrases
  for (const phrase of NO_RESPONSE_PHRASES) {
    if (lower.includes(phrase)) {
      return true;
    }
  }

  // Pure self-contained acknowledgments with no questions
  const trivialAcks = ['k', 'ok', 'okay', 'cool', 'nice', 'np', 'yw', 'ty', 'thx', 'thanks', 'bye', 'cya', 'gg'];
  if (trivialAcks.includes(lower)) {
    return true;
  }

  return false;
}

/**
 * Validates whether the incoming accessibility text node is genuine conversation
 * rather than system chrome, timestamps, or transient button labels.
 */
export function isMeaningfulConversation(
  text: string,
  strictness: 'lenient' | 'standard' | 'strict' = 'standard'
): { isValid: boolean; reason?: string } {
  if (!text || typeof text !== 'string') {
    return { isValid: false, reason: 'Empty text node' };
  }

  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  // 1. Check minimum length
  const minLength = strictness === 'lenient' ? 3 : strictness === 'strict' ? 10 : 4;
  if (trimmed.length < minLength) {
    return { isValid: false, reason: `Text too short (${trimmed.length} chars)` };
  }

  // 2. Ignore known system UI tokens
  if (SYSTEM_UI_TOKENS.has(lower)) {
    return { isValid: false, reason: 'System UI token recognized' };
  }

  // 3. Ignore plain time stamps (e.g. "10:42 AM", "12:00", "4h ago")
  if (/^(\d{1,2}:\d{2}(\s?[apAP][mM])?|\d+[smhdw]\s?ago)$/.test(trimmed)) {
    return { isValid: false, reason: 'Timestamp pattern detected' };
  }

  // 4. Strictness checks
  if (strictness === 'strict') {
    const words = trimmed.split(/\s+/).filter(Boolean);
    if (words.length < 3 && !trimmed.includes('?')) {
      return { isValid: false, reason: 'Strict filter: insufficient depth' };
    }
  }

  return { isValid: true };
}

/**
 * Analyzes a thread of messages to determine user roles, intent, and whether a response is needed.
 */
export function analyzeConversationThread(
  messages: ConversationMessage[],
  appName: string,
  userName = 'James'
): ConversationSnapshot {
  if (!messages || messages.length === 0) {
    return {
      appName,
      messages: [],
      latestMessageText: '',
      latestSender: '',
      isDirectedAtUser: false,
      intentType: 'no_response_needed',
      needsResponse: false,
    };
  }

  // Keep rolling window of the last 6 messages
  const windowMessages = messages.slice(-6);
  const latestMessage = windowMessages[windowMessages.length - 1];
  const latestText = (latestMessage.text || '').trim();
  const latestSender = latestMessage.sender || 'Unknown';
  const lowerLatest = latestText.toLowerCase();
  const lowerUser = userName.toLowerCase();

  // 1. If the latest message was sent by the user themselves, no immediate AI reply needed unless user asks a query
  if (latestMessage.isMe) {
    return {
      appName,
      messages: windowMessages,
      latestMessageText: latestText,
      latestSender: latestMessage.sender,
      isDirectedAtUser: false,
      intentType: 'no_response_needed',
      needsResponse: false,
      contextSummary: 'User just sent a message; waiting for others to reply.',
    };
  }

  // 2. Check if the message indicates resolution ("Never mind, I figured it out")
  if (isNoResponseRequired(latestText)) {
    return {
      appName,
      messages: windowMessages,
      latestMessageText: latestText,
      latestSender: latestSender,
      isDirectedAtUser: false,
      intentType: 'no_response_needed',
      needsResponse: false,
      contextSummary: 'The topic has been resolved or ended by the sender.',
    };
  }

  // 3. Check if directed directly at the user
  // (e.g. mentions userName like "James, do you know?", "hey James", direct question after user spoke, or directedTo === userName)
  const mentionsUser = 
    lowerLatest.includes(lowerUser) || 
    lowerLatest.startsWith(`${lowerUser},`) || 
    lowerLatest.startsWith(`@${lowerUser}`) ||
    latestMessage.directedTo?.toLowerCase() === lowerUser;

  const previousMessage = windowMessages.length >= 2 ? windowMessages[windowMessages.length - 2] : null;
  const isFollowUpToUser = previousMessage?.isMe === true;

  const isDirectedAtUser = Boolean(mentionsUser || isFollowUpToUser || windowMessages.length === 1);

  // 4. Classify Intent
  let intentType: ResponseIntent = 'conversational_suggestion';
  let intentLabel = 'Suggested Response';

  const hasQuestionMark = latestText.includes('?');
  const isQuestion = hasQuestionMark || /^(what|how|why|when|where|who|which|can you|could you|do you|are you|is there)/i.test(latestText);

  if (isDirectedAtUser) {
    intentType = 'suggested_reply';
    intentLabel = 'Suggested Reply';
  } else if (isQuestion && appName.toLowerCase().includes('search') || latestSender.toLowerCase().includes('bot') || latestSender.toLowerCase().includes('history')) {
    intentType = 'direct_answer';
    intentLabel = 'Direct Answer';
  } else if (isQuestion) {
    intentType = 'suggested_reply';
    intentLabel = 'Suggested Reply';
  } else {
    intentType = 'conversational_suggestion';
    intentLabel = 'Suggested Response';
  }

  return {
    appName,
    messages: windowMessages,
    latestMessageText: latestText,
    latestSender,
    isDirectedAtUser,
    intentType,
    needsResponse: true,
    contextSummary: isDirectedAtUser 
      ? `Directed at ${userName}: ${latestSender} is asking or talking to you.` 
      : `Active conversation in ${appName}.`,
  };
}

/**
 * In-memory Tracker for Screen Analysis rate limits, conversation snapshots, and active thread detection
 */
export class AutoGenerationManager {
  private lastProcessedQuestion = '';
  private lastProcessedSnapshotHash = '';
  private processedMessageIds = new Set<string>();
  private requestHistory: number[] = []; // timestamps of actual AI generations
  private lastGenerationTimestamp = 0;

  /**
   * Checks if the question or message text is genuinely different
   */
  isNewQuestion(text: string): boolean {
    return isDifferentQuestion(this.lastProcessedQuestion, text);
  }

  /**
   * Checks if the full conversation thread has a new message that hasn't been processed yet
   */
  isNewSnapshot(snapshot: ConversationSnapshot): boolean {
    return this.isNewConversationState(snapshot);
  }

  /**
   * Checks if the full conversation thread has a new message that hasn't been processed yet
   */
  isNewConversationState(snapshot: ConversationSnapshot): boolean {
    if (!snapshot.needsResponse || !snapshot.latestMessageText) {
      return false;
    }

    // Check latest message ID if present
    const latestMsg = snapshot.messages[snapshot.messages.length - 1];
    if (latestMsg?.id && this.processedMessageIds.has(latestMsg.id)) {
      return false;
    }

    // Compute composite hash of the visible thread
    const threadFingerprint = snapshot.messages
      .map(m => `${m.sender}:${normalizeQuestionText(m.text)}`)
      .join('|');
    const compositeHash = computeTextHash(threadFingerprint);

    return compositeHash !== this.lastProcessedSnapshotHash;
  }

  /**
   * Gets the last processed question
   */
  getLastProcessedQuestion(): string {
    return this.lastProcessedQuestion;
  }

  /**
   * Marks a single text as processed
   */
  markProcessed(text: string): void {
    this.lastProcessedQuestion = text.trim();
  }

  /**
   * Marks a conversation snapshot and its messages as processed
   */
  markSnapshotProcessed(snapshot: ConversationSnapshot): void {
    this.lastProcessedQuestion = snapshot.latestMessageText.trim();
    
    const threadFingerprint = snapshot.messages
      .map(m => `${m.sender}:${normalizeQuestionText(m.text)}`)
      .join('|');
    this.lastProcessedSnapshotHash = computeTextHash(threadFingerprint);

    snapshot.messages.forEach(m => {
      if (m.id) {
        this.processedMessageIds.add(m.id);
      }
    });

    // Keep processed IDs set reasonably sized
    if (this.processedMessageIds.size > 100) {
      const arr = Array.from(this.processedMessageIds);
      this.processedMessageIds = new Set(arr.slice(-50));
    }
  }

  /**
   * Checks whether generation is currently allowed under cooldown and rate limits
   */
  canTriggerGeneration(cooldownMs = 1500, maxPerMinute = 15): { allowed: boolean; reason?: string } {
    const now = Date.now();

    // 1. Cooldown check
    const elapsedSinceLast = now - this.lastGenerationTimestamp;
    if (elapsedSinceLast < cooldownMs) {
      const waitRemaining = Math.ceil((cooldownMs - elapsedSinceLast) / 1000);
      return { allowed: false, reason: `Cooldown active (${waitRemaining}s remaining)` };
    }

    // 2. Generations per minute check
    const oneMinuteAgo = now - 60000;
    this.requestHistory = this.requestHistory.filter(t => t > oneMinuteAgo);

    if (this.requestHistory.length >= maxPerMinute) {
      return { allowed: false, reason: `Rate limit: ${maxPerMinute} requests/min reached` };
    }

    return { allowed: true };
  }

  /**
   * Records a successful trigger
   */
  recordGeneration(): void {
    const now = Date.now();
    this.lastGenerationTimestamp = now;
    this.requestHistory.push(now);
  }

  /**
   * Resets internal tracking
   */
  reset(): void {
    this.lastProcessedQuestion = '';
    this.lastProcessedSnapshotHash = '';
    this.processedMessageIds.clear();
    this.requestHistory = [];
    this.lastGenerationTimestamp = 0;
  }
}
