// Client-side Temporary Context & Cache Storage Manager
// Enforces independent per-item timers:
// 1. Recent-results floating menu visibility timer (Default: 2 minutes / 120s)
// 2. Application history storage deletion timer (Default: 5 minutes / 300s)

export interface TempContextItem {
  id: string;
  requestId?: number;
  timestamp: number;
  historyTimestamp: number;
  appName: string;
  detectedText: string;
  understandingSummary?: string;
  replies: Array<{ id: string; text: string; style: string }>;
  byteSize: number;
  isError?: boolean;
}

export interface StorageStats {
  totalBytes: number;
  itemCount: number;
  lastCleanedTimestamp: number;
  nextAutoCleanupTimestamp: number;
  formattedSize: string;
  isErrorState?: boolean;
  cleanupIntervalMinutes: number;
  recentRetentionSeconds: number;
  historyRetentionSeconds: number;
}

const STORAGE_KEY = 'replyfloat_temp_context_history_v2';
const LAST_CLEANUP_KEY = 'replyfloat_last_cleanup_timestamp_v2';
const SETTINGS_KEY = 'replyfloat_purge_timer_settings_v2';

class StorageCleanupManager {
  private items: TempContextItem[] = [];
  private lastCleaned: number = Date.now();
  private isErrorState: boolean = false;
  private listeners: Array<(stats: StorageStats) => void> = [];
  private cleanupTimer: NodeJS.Timeout | null = null;
  private recentRetentionSeconds: number = 120; // 2 minutes default
  private historyRetentionSeconds: number = 300; // 5 minutes default

  constructor() {
    this.loadFromStorage();
    this.scheduleAutoCleanup();
  }

  public setRetentionSettings(recentSec: number = 120, historySec: number = 300) {
    this.recentRetentionSeconds = Math.max(10, recentSec);
    this.historyRetentionSeconds = Math.max(30, historySec);
    try {
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({
          recentRetentionSeconds: this.recentRetentionSeconds,
          historyRetentionSeconds: this.historyRetentionSeconds,
        })
      );
    } catch {}
    this.purgeExpiredData();
    this.notify();
  }

  private loadFromStorage() {
    try {
      const storedSettings = localStorage.getItem(SETTINGS_KEY);
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        if (parsed.recentRetentionSeconds) this.recentRetentionSeconds = parsed.recentRetentionSeconds;
        if (parsed.historyRetentionSeconds) this.historyRetentionSeconds = parsed.historyRetentionSeconds;
      }

      const storedLast = localStorage.getItem(LAST_CLEANUP_KEY);
      if (storedLast) {
        this.lastCleaned = parseInt(storedLast, 10);
      } else {
        this.lastCleaned = Date.now();
        localStorage.setItem(LAST_CLEANUP_KEY, this.lastCleaned.toString());
      }

      const storedItems = localStorage.getItem(STORAGE_KEY);
      if (storedItems) {
        this.items = JSON.parse(storedItems);
      } else {
        // Initial sample temporary cache items for demonstration
        const now = Date.now();
        this.items = [
          {
            id: 'temp-1',
            timestamp: now - 30 * 1000, // 30s ago (still visible in recent)
            historyTimestamp: now - 30 * 1000,
            appName: 'WhatsApp',
            detectedText: 'What did Gandhi do for India\'s freedom?',
            understandingSummary: 'Gandhi was a major leader of India\'s independence movement, known especially for nonviolent resistance.',
            replies: [
              { id: 'r1', text: 'He led the independence movement through nonviolent civil disobedience like the Salt March.', style: 'Logical' },
              { id: 'r2', text: 'Gandhi pioneered Satyagraha, uniting millions for freedom through nonviolence.', style: 'Debate' }
            ],
            byteSize: 1420
          }
        ];
        this.saveToStorage();
      }

      this.purgeExpiredData();
    } catch (e) {
      console.warn('Could not initialize storage cleanup manager:', e);
      this.items = [];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
      localStorage.setItem(LAST_CLEANUP_KEY, this.lastCleaned.toString());
    } catch (e) {
      console.warn('Failed to persist temporary context cache:', e);
    }
    this.notify();
  }

  private scheduleAutoCleanup() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    // Check every 5 seconds for cleanup expiration in background
    this.cleanupTimer = setInterval(() => {
      this.purgeExpiredData();
    }, 5000);
  }

  public recordContext(
    appName: string,
    detectedText: string,
    understandingSummary?: string,
    replies: Array<{ id: string; text: string; style: string }> = [],
    isError: boolean = false,
    requestId?: number
  ) {
    const rawString = JSON.stringify({ appName, detectedText, understandingSummary, replies });
    const byteSize = new Blob([rawString]).size;

    const newItem: TempContextItem = {
      id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      requestId,
      timestamp: Date.now(),
      historyTimestamp: Date.now(),
      appName,
      detectedText,
      understandingSummary,
      replies,
      byteSize,
      isError,
    };

    if (isError) {
      this.isErrorState = true;
    }

    // Keep at most 40 recent items in transient memory
    this.items = [newItem, ...this.items].slice(0, 40);
    this.saveToStorage();
  }

  public markErrorState(hasError: boolean = true) {
    this.isErrorState = hasError;
    if (hasError) {
      this.purgeExpiredData();
    }
    this.notify();
  }

  // Purge temporary context and conversation history older than configured retention
  public purgeExpiredData() {
    const now = Date.now();
    const historyCutoff = now - (this.historyRetentionSeconds * 1000);
    const beforeCount = this.items.length;

    // Remove items older than history retention
    this.items = this.items.filter(item => (item.historyTimestamp || item.timestamp) > historyCutoff);
    this.lastCleaned = Date.now();

    if (this.items.length !== beforeCount) {
      this.saveToStorage();
    } else {
      this.notify();
    }
  }

  // Get items that are still within recent-results visibility window (2 mins)
  public getRecentVisibleItems(customRetentionSec?: number): TempContextItem[] {
    const retentionMs = (customRetentionSec || this.recentRetentionSeconds) * 1000;
    const cutoff = Date.now() - retentionMs;
    return this.items.filter(item => item.timestamp > cutoff);
  }

  // Manual "Clear Now" action requested by user
  public clearAllNow(): StorageStats {
    this.items = [];
    this.lastCleaned = Date.now();
    this.isErrorState = false;
    this.saveToStorage();
    return this.getStats();
  }

  public getStats(): StorageStats {
    const totalBytes = this.items.reduce((acc, item) => acc + (item.byteSize || 800), 0);
    const nextAutoCleanupTimestamp = this.lastCleaned + (this.historyRetentionSeconds * 1000);
    const cleanupIntervalMinutes = Math.round(this.historyRetentionSeconds / 60);

    let formattedSize = '0.00 KB';
    if (totalBytes > 1024 * 1024) {
      formattedSize = `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`;
    } else {
      formattedSize = `${Math.max(0.4, totalBytes / 1024).toFixed(2)} KB`;
    }

    return {
      totalBytes,
      itemCount: this.items.length,
      lastCleanedTimestamp: this.lastCleaned,
      nextAutoCleanupTimestamp,
      formattedSize,
      isErrorState: this.isErrorState,
      cleanupIntervalMinutes,
      recentRetentionSeconds: this.recentRetentionSeconds,
      historyRetentionSeconds: this.historyRetentionSeconds,
    };
  }

  public getItems(): TempContextItem[] {
    return [...this.items];
  }

  public subscribe(listener: (stats: StorageStats) => void): () => void {
    this.listeners.push(listener);
    listener(this.getStats());
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    const stats = this.getStats();
    this.listeners.forEach(l => l(stats));
  }
}

export const tempStorageManager = new StorageCleanupManager();
