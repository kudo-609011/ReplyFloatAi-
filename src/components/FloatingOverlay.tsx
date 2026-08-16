import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  Bot, 
  Sparkles, 
  X, 
  RefreshCw, 
  Copy, 
  Check, 
  Sliders, 
  ChevronDown, 
  ChevronUp, 
  SendHorizontal, 
  Minimize2, 
  Lock, 
  Unlock, 
  Edit3, 
  Brain, 
  MessageSquare, 
  Timer,
  History,
  Trash2
} from 'lucide-react';
import { 
  OverlaySettings, 
  ReplySettings, 
  ReplySuggestion, 
  ReplyStyle, 
  AIProviderConfig, 
  OverlayInteractionMode,
  RecentResultItem,
  ResponseIntent,
  ConversationSnapshot
} from '../types';
import { copyToClipboard } from '../utils/clipboard';

interface FloatingOverlayProps {
  settings: OverlaySettings;
  replySettings: ReplySettings;
  activeProvider: AIProviderConfig;
  detectedText: string;
  contextApp: string;
  understandingSummary?: string;
  intentType?: ResponseIntent;
  intentLabel?: string;
  conversationSnapshot?: ConversationSnapshot;
  suggestions: ReplySuggestion[];
  isLoadingSuggestions: boolean;
  recentHistory?: RecentResultItem[];
  onSelectRecentItem?: (item: RecentResultItem) => void;
  onDeleteRecentItem?: (id: string) => void;
  onRegenerate: (overrideStyle?: ReplyStyle) => void;
  onStopGeneration?: () => void;
  onClose: () => void;
  onOpenSettings: () => void;
  onInsertToApp: (replyText: string) => void;
  onUpdateOverlaySettings: (newSettings: Partial<OverlaySettings>) => void;
  onUpdateReplySettings: (newSettings: Partial<ReplySettings>) => void;
}

const STYLE_OPTIONS: ReplyStyle[] = [
  '1-Line',
  '2-Line',
  'Single-Word',
  'Debate',
  'Funny',
  'Arrogant',
  'Lord',
  'Passive',
  'Logical',
  'Respectful',
  'Counterargument',
  'Short',
  'Casual',
  'Formal',
  'Detailed',
];

// Touch-slop threshold in pixels (prevents drag/scroll from registering as taps)
const TOUCH_SLOP_PX = 8;
const MAX_TAP_DURATION_MS = 320;

// Resizing limits for Full Overlay
const MIN_OVERLAY_WIDTH = 240;
const MIN_OVERLAY_HEIGHT = 130;

// Resizing limits for Compact ReplyFloat Bar
const MIN_COMPACT_WIDTH = 130;
const MIN_COMPACT_HEIGHT = 38;

export const FloatingOverlay: React.FC<FloatingOverlayProps> = ({
  settings,
  replySettings,
  activeProvider,
  detectedText,
  contextApp,
  understandingSummary,
  intentType,
  intentLabel,
  conversationSnapshot,
  suggestions,
  isLoadingSuggestions,
  recentHistory,
  onSelectRecentItem,
  onDeleteRecentItem,
  onRegenerate,
  onStopGeneration,
  onClose,
  onOpenSettings,
  onInsertToApp,
  onUpdateOverlaySettings,
  onUpdateReplySettings,
}) => {
  // Interaction mode state (Interactive vs Pass-through vs Minimal)
  const currentMode: OverlayInteractionMode = 
    settings.interactionMode || (settings.passThroughMode ? 'passthrough' : 'interactive');

  const isCompactMode = currentMode === 'minimal';
  const showCompactBar = settings.showCompactBar !== false;

  // Copy feedback state
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copyToast, setCopyToast] = useState<string | null>(null);

  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');

  // Collapsible Understanding and Context sections with localStorage persistence
  const [isUnderstandingExpanded, setIsUnderstandingExpanded] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('replyfloat_understanding_expanded');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [isContextExpanded, setIsContextExpanded] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('replyfloat_context_expanded');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const toggleUnderstanding = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsUnderstandingExpanded(prev => {
      const next = !prev;
      try {
        localStorage.setItem('replyfloat_understanding_expanded', String(next));
      } catch {}
      return next;
    });
  };

  const toggleContext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsContextExpanded(prev => {
      const next = !prev;
      try {
        localStorage.setItem('replyfloat_context_expanded', String(next));
      } catch {}
      return next;
    });
  };

  // Collapsible Recent Results (2-minute retention) state
  const [isRecentResultsExpanded, setIsRecentResultsExpanded] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('replyfloat_recent_expanded');
      return saved !== null ? saved === 'true' : false;
    } catch {
      return false;
    }
  });

  const toggleRecentResults = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsRecentResultsExpanded(prev => {
      const next = !prev;
      try {
        localStorage.setItem('replyfloat_recent_expanded', String(next));
      } catch {}
      return next;
    });
  };

  // Screen Analysis active state helper
  const isScreenAnalysisActive = settings.screenAnalysisEnabled !== false;

  const toggleScreenAnalysis = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onUpdateOverlaySettings({ screenAnalysisEnabled: !isScreenAnalysisActive });
  };

  // Pure UI state: Expandable reply items state (Show More / Show Less)
  const [expandedReplyIds, setExpandedReplyIds] = useState<Record<string, boolean>>({});

  // Dedicated Click-to-Copy action for reply text: copies exact reply, displays feedback, no AI generation/timer reset
  const handleReplyClicked = (suggestion: ReplySuggestion, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (replySettings.editBeforeCopying) {
      setEditingId(suggestion.id);
      setEditText(suggestion.text);
    } else {
      executeCopy(suggestion.id, suggestion.text, 'Copied');
    }
  };

  // 1. Show More pure UI action: expands reply content without copy, generation, duplicate, or timer reset
  const handleShowMore = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setExpandedReplyIds(prev => ({
      ...prev,
      [id]: true,
    }));
  };

  // 1. Show Less pure UI action: collapses reply content without copy, generation, duplicate, or timer reset
  const handleShowLess = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setExpandedReplyIds(prev => ({
      ...prev,
      [id]: false,
    }));
  };

  // Toggle helper
  const toggleReplyExpanded = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setExpandedReplyIds(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // 2. View All pure UI action: opens full available reply list without generating new response, copying, or resetting timers
  const [isViewingAllReplies, setIsViewingAllReplies] = useState<boolean>(false);

  const handleViewAll = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (isBulletMode) {
      setInteractionMode('interactive');
    }
    setIsViewingAllReplies(prev => !prev);
  };

  // Auto-hide countdown state
  const autoHideConfig = settings.autoHide || {
    enabled: true,
    durationSeconds: 8,
    hideOnCopy: true,
    pauseOnHover: true,
  };
  const [autoHideTimeRemaining, setAutoHideTimeRemaining] = useState<number>(autoHideConfig.durationSeconds || 8);
  const [isHoveredOrInteracting, setIsHoveredOrInteracting] = useState(false);
  const autoHideIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 1. INDEPENDENT POSITION & SIZE: FULL OVERLAY
  const getInitialFullPosition = useCallback(() => {
    if (settings.appPositions && settings.appPositions[contextApp]) {
      return settings.appPositions[contextApp];
    }
    try {
      const savedX = localStorage.getItem('replyfloat_overlay_x');
      const savedY = localStorage.getItem('replyfloat_overlay_y');
      if (savedX && savedY) {
        return { x: parseInt(savedX, 10), y: parseInt(savedY, 10) };
      }
    } catch {}
    return { 
      x: settings.customX ?? 15, 
      y: settings.customY ?? 70 
    };
  }, [contextApp, settings.appPositions, settings.customX, settings.customY]);

  const [fullPosition, setFullPosition] = useState(getInitialFullPosition);
  const fullPositionRef = useRef(fullPosition);
  fullPositionRef.current = fullPosition;

  const [fullDimensions, setFullDimensions] = useState<{ width?: number; height?: number }>(() => {
    try {
      const savedW = localStorage.getItem('replyfloat_overlay_width');
      const savedH = localStorage.getItem('replyfloat_overlay_height');
      return {
        width: savedW ? parseInt(savedW, 10) : (settings.customWidth || 330),
        height: savedH ? parseInt(savedH, 10) : settings.customHeight,
      };
    } catch {
      return {
        width: settings.customWidth || 330,
        height: settings.customHeight,
      };
    }
  });
  const fullDimensionsRef = useRef(fullDimensions);
  fullDimensionsRef.current = fullDimensions;

  // 2. INDEPENDENT POSITION & SIZE: COMPACT BAR
  const getInitialCompactPosition = useCallback(() => {
    try {
      const savedX = localStorage.getItem('replyfloat_compact_x');
      const savedY = localStorage.getItem('replyfloat_compact_y');
      if (savedX && savedY) {
        return { x: parseInt(savedX, 10), y: parseInt(savedY, 10) };
      }
    } catch {}
    return { 
      x: settings.compactX ?? 15, 
      y: settings.compactY ?? 70 
    };
  }, [settings.compactX, settings.compactY]);

  const [compactPosition, setCompactPosition] = useState(getInitialCompactPosition);
  const compactPositionRef = useRef(compactPosition);
  compactPositionRef.current = compactPosition;

  const [compactDimensions, setCompactDimensions] = useState<{ width: number; height: number }>(() => {
    try {
      const savedW = localStorage.getItem('replyfloat_compact_width');
      const savedH = localStorage.getItem('replyfloat_compact_height');
      return {
        width: savedW ? parseInt(savedW, 10) : (settings.compactWidth || 165),
        height: savedH ? parseInt(savedH, 10) : (settings.compactHeight || 50),
      };
    } catch {
      return {
        width: settings.compactWidth || 165,
        height: settings.compactHeight || 50,
      };
    }
  });
  const compactDimensionsRef = useRef(compactDimensions);
  compactDimensionsRef.current = compactDimensions;

  // DOM Refs & Interaction State
  const overlayRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragTargetRef = useRef<'full' | 'compact'>('full');
  const dragStartRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({
    startX: 0,
    startY: 0,
    posX: 15,
    posY: 70,
  });

  // Resizing gesture tracking
  const isResizingRef = useRef(false);
  const resizeTargetRef = useRef<'full' | 'compact'>('full');
  const resizeCornerRef = useRef<'tl' | 'tr' | 'bl' | 'br' | null>(null);
  const resizeStartRef = useRef<{
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    startPosX: number;
    startPosY: number;
  }>({
    startX: 0,
    startY: 0,
    startWidth: 330,
    startHeight: 200,
    startPosX: 15,
    startPosY: 70,
  });

  const rafIdRef = useRef<number | null>(null);

  // Touch gesture tracking for Reply Card (Strict Tap vs Swipe/Scroll separation)
  const touchTrackingRef = useRef<{
    startX: number;
    startY: number;
    startTime: number;
    isMovedPastSlop: boolean;
    suggestionId: string | null;
  }>({
    startX: 0,
    startY: 0,
    startTime: 0,
    isMovedPastSlop: false,
    suggestionId: null,
  });

  // Touch gesture tracking for Compact Bar (Tap to open vs Drag)
  const compactTouchRef = useRef<{
    startX: number;
    startY: number;
    startTime: number;
    hasMovedPastSlop: boolean;
  }>({
    startX: 0,
    startY: 0,
    startTime: 0,
    hasMovedPastSlop: false,
  });

  // Update position when contextApp changes
  useEffect(() => {
    const pos = getInitialFullPosition();
    setFullPosition(pos);
    fullPositionRef.current = pos;
    if (overlayRef.current && !isCompactMode) {
      overlayRef.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) scale(${settings.scale || 1})`;
    }
  }, [contextApp, getInitialFullPosition, isCompactMode, settings.scale]);

  // Clean up RAF on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  // Switch mode helper
  const setInteractionMode = useCallback((mode: OverlayInteractionMode) => {
    onUpdateOverlaySettings({
      interactionMode: mode,
      passThroughMode: mode === 'passthrough',
    });
  }, [onUpdateOverlaySettings]);

  // Auto-Hide Countdown Engine (Bullet / Interactive mode auto-minimize)
  useEffect(() => {
    if (!autoHideConfig.enabled || isCompactMode || isLoadingSuggestions) {
      if (autoHideIntervalRef.current) clearInterval(autoHideIntervalRef.current);
      return;
    }

    setAutoHideTimeRemaining(autoHideConfig.durationSeconds || 8);
    if (autoHideIntervalRef.current) clearInterval(autoHideIntervalRef.current);

    autoHideIntervalRef.current = setInterval(() => {
      if (isHoveredOrInteracting && autoHideConfig.pauseOnHover) {
        return;
      }

      setAutoHideTimeRemaining(prev => {
        if (prev <= 1) {
          setTimeout(() => {
            setInteractionMode('minimal');
          }, 0);
          return autoHideConfig.durationSeconds || 8;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (autoHideIntervalRef.current) {
        clearInterval(autoHideIntervalRef.current);
      }
    };
  }, [
    autoHideConfig.enabled, 
    autoHideConfig.durationSeconds, 
    autoHideConfig.pauseOnHover,
    suggestions, 
    detectedText, 
    isCompactMode, 
    isHoveredOrInteracting, 
    isLoadingSuggestions,
    setInteractionMode
  ]);

  // RESIZE HANDLERS (Smooth 60fps RAF for Full Overlay and Compact Bar)
  const handleResizeStart = (target: 'full' | 'compact', corner: 'tl' | 'tr' | 'bl' | 'br', e: React.PointerEvent) => {
    if (currentMode === 'passthrough') return;
    e.stopPropagation();
    e.preventDefault();

    isResizingRef.current = true;
    resizeTargetRef.current = target;
    resizeCornerRef.current = corner;
    setIsHoveredOrInteracting(true);

    const isTargetFull = target === 'full';
    const currentW = isTargetFull 
      ? (overlayRef.current?.offsetWidth || fullDimensionsRef.current.width || 330)
      : (overlayRef.current?.offsetWidth || compactDimensionsRef.current.width || 165);
    const currentH = isTargetFull
      ? (overlayRef.current?.offsetHeight || fullDimensionsRef.current.height || 200)
      : (overlayRef.current?.offsetHeight || compactDimensionsRef.current.height || 50);
    const currentPos = isTargetFull ? fullPositionRef.current : compactPositionRef.current;

    resizeStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: currentW,
      startHeight: currentH,
      startPosX: currentPos.x,
      startPosY: currentPos.y,
    };

    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  const handleResizeMove = (e: React.PointerEvent) => {
    if (!isResizingRef.current || !resizeCornerRef.current) return;

    const target = resizeTargetRef.current;
    const isTargetFull = target === 'full';
    const corner = resizeCornerRef.current;
    const deltaX = e.clientX - resizeStartRef.current.startX;
    const deltaY = e.clientY - resizeStartRef.current.startY;

    const parentEl = overlayRef.current?.parentElement;
    const containerWidth = parentEl?.clientWidth || 380;
    const containerHeight = parentEl?.clientHeight || 680;

    const minW = isTargetFull ? MIN_OVERLAY_WIDTH : MIN_COMPACT_WIDTH;
    const minH = isTargetFull ? MIN_OVERLAY_HEIGHT : MIN_COMPACT_HEIGHT;
    const maxW = Math.floor(containerWidth * 0.95);
    const maxH = Math.floor(containerHeight * 0.95);

    let newWidth = resizeStartRef.current.startWidth;
    let newHeight = resizeStartRef.current.startHeight;
    let newPosX = resizeStartRef.current.startPosX;
    let newPosY = resizeStartRef.current.startPosY;

    if (corner === 'br') {
      newWidth = Math.max(minW, Math.min(maxW, resizeStartRef.current.startWidth + deltaX));
      newHeight = Math.max(minH, Math.min(maxH, resizeStartRef.current.startHeight + deltaY));
    } else if (corner === 'bl') {
      const proposedW = resizeStartRef.current.startWidth - deltaX;
      newWidth = Math.max(minW, Math.min(maxW, proposedW));
      newHeight = Math.max(minH, Math.min(maxH, resizeStartRef.current.startHeight + deltaY));
      newPosX = Math.max(5, resizeStartRef.current.startPosX + (resizeStartRef.current.startWidth - newWidth));
    } else if (corner === 'tr') {
      newWidth = Math.max(minW, Math.min(maxW, resizeStartRef.current.startWidth + deltaX));
      const proposedH = resizeStartRef.current.startHeight - deltaY;
      newHeight = Math.max(minH, Math.min(maxH, proposedH));
      newPosY = Math.max(5, resizeStartRef.current.startPosY + (resizeStartRef.current.startHeight - newHeight));
    } else if (corner === 'tl') {
      const proposedW = resizeStartRef.current.startWidth - deltaX;
      const proposedH = resizeStartRef.current.startHeight - deltaY;
      newWidth = Math.max(minW, Math.min(maxW, proposedW));
      newHeight = Math.max(minH, Math.min(maxH, proposedH));
      newPosX = Math.max(5, resizeStartRef.current.startPosX + (resizeStartRef.current.startWidth - newWidth));
      newPosY = Math.max(5, resizeStartRef.current.startPosY + (resizeStartRef.current.startHeight - newHeight));
    }

    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }

    rafIdRef.current = requestAnimationFrame(() => {
      if (overlayRef.current) {
        overlayRef.current.style.width = `${newWidth}px`;
        overlayRef.current.style.height = `${newHeight}px`;
        overlayRef.current.style.transform = `translate3d(${newPosX}px, ${newPosY}px, 0) scale(${settings.scale || 1})`;
      }
    });

    if (isTargetFull) {
      fullDimensionsRef.current = { width: newWidth, height: newHeight };
      fullPositionRef.current = { x: newPosX, y: newPosY };
    } else {
      compactDimensionsRef.current = { width: newWidth, height: newHeight };
      compactPositionRef.current = { x: newPosX, y: newPosY };
    }
  };

  const handleResizeEnd = (e: React.PointerEvent) => {
    if (!isResizingRef.current) return;
    const target = resizeTargetRef.current;
    const isTargetFull = target === 'full';

    isResizingRef.current = false;
    resizeCornerRef.current = null;
    setIsHoveredOrInteracting(false);

    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    if (isTargetFull) {
      const finalDims = fullDimensionsRef.current;
      const finalPos = fullPositionRef.current;
      setFullDimensions(finalDims);
      setFullPosition(finalPos);

      try {
        if (finalDims.width) localStorage.setItem('replyfloat_overlay_width', finalDims.width.toString());
        if (finalDims.height) localStorage.setItem('replyfloat_overlay_height', finalDims.height.toString());
        localStorage.setItem('replyfloat_overlay_x', finalPos.x.toString());
        localStorage.setItem('replyfloat_overlay_y', finalPos.y.toString());
      } catch {}

      const updatedAppPositions = {
        ...(settings.appPositions || {}),
        [contextApp]: { x: finalPos.x, y: finalPos.y },
      };

      onUpdateOverlaySettings({
        customWidth: finalDims.width,
        customHeight: finalDims.height,
        customX: finalPos.x,
        customY: finalPos.y,
        appPositions: updatedAppPositions,
      });
    } else {
      const finalDims = compactDimensionsRef.current;
      const finalPos = compactPositionRef.current;
      setCompactDimensions(finalDims);
      setCompactPosition(finalPos);

      try {
        localStorage.setItem('replyfloat_compact_width', finalDims.width.toString());
        localStorage.setItem('replyfloat_compact_height', finalDims.height.toString());
        localStorage.setItem('replyfloat_compact_x', finalPos.x.toString());
        localStorage.setItem('replyfloat_compact_y', finalPos.y.toString());
      } catch {}

      onUpdateOverlaySettings({
        compactWidth: finalDims.width,
        compactHeight: finalDims.height,
        compactX: finalPos.x,
        compactY: finalPos.y,
      });
    }
  };

  // DRAG HANDLERS (Independent for Full Overlay vs Compact Bar)
  const handlePointerDown = (target: 'full' | 'compact', e: React.PointerEvent) => {
    if (currentMode === 'passthrough' || isResizingRef.current) return;
    if ((e.target as HTMLElement).closest('button') || 
        (e.target as HTMLElement).closest('input') || 
        (e.target as HTMLElement).closest('textarea') ||
        (e.target as HTMLElement).closest('.resize-corner-handle') ||
        (e.target as HTMLElement).closest('.scrollable-reply-list')) {
      return;
    }

    isDraggingRef.current = true;
    dragTargetRef.current = target;
    setIsHoveredOrInteracting(true);

    const isTargetFull = target === 'full';
    const currentPos = isTargetFull ? fullPositionRef.current : compactPositionRef.current;

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: currentPos.x,
      posY: currentPos.y,
    };

    if (!isTargetFull) {
      compactTouchRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startTime: Date.now(),
        hasMovedPastSlop: false,
      };
    }

    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isResizingRef.current) {
      handleResizeMove(e);
      return;
    }

    if (!isDraggingRef.current) return;

    const target = dragTargetRef.current;
    const isTargetFull = target === 'full';

    const deltaX = e.clientX - dragStartRef.current.startX;
    const deltaY = e.clientY - dragStartRef.current.startY;

    if (!isTargetFull) {
      if (Math.hypot(deltaX, deltaY) > TOUCH_SLOP_PX) {
        compactTouchRef.current.hasMovedPastSlop = true;
      }
    }

    const parentEl = overlayRef.current?.parentElement;
    const containerWidth = parentEl?.clientWidth || 360;
    const containerHeight = parentEl?.clientHeight || 640;

    const overlayWidth = overlayRef.current?.offsetWidth || (isTargetFull ? (fullDimensionsRef.current.width || 300) : compactDimensionsRef.current.width);
    const overlayHeight = overlayRef.current?.offsetHeight || (isTargetFull ? (fullDimensionsRef.current.height || 150) : compactDimensionsRef.current.height);

    const maxX = Math.max(5, containerWidth - overlayWidth - 5);
    const maxY = Math.max(5, containerHeight - overlayHeight - 5);
    const newX = Math.max(5, Math.min(maxX, dragStartRef.current.posX + deltaX));
    const newY = Math.max(5, Math.min(maxY, dragStartRef.current.posY + deltaY));

    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }

    rafIdRef.current = requestAnimationFrame(() => {
      if (overlayRef.current) {
        overlayRef.current.style.transform = `translate3d(${newX}px, ${newY}px, 0) scale(${settings.scale || 1})`;
      }
    });

    if (isTargetFull) {
      fullPositionRef.current = { x: newX, y: newY };
    } else {
      compactPositionRef.current = { x: newX, y: newY };
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isResizingRef.current) {
      handleResizeEnd(e);
      return;
    }

    if (isDraggingRef.current) {
      const target = dragTargetRef.current;
      const isTargetFull = target === 'full';

      isDraggingRef.current = false;
      setIsHoveredOrInteracting(false);
      
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}

      if (!isTargetFull) {
        const touch = compactTouchRef.current;
        const duration = Date.now() - touch.startTime;
        // If it was a deliberate clean tap without dragging, open full overlay
        if (!touch.hasMovedPastSlop && duration < MAX_TAP_DURATION_MS) {
          setInteractionMode('interactive');
          return;
        }
      }

      if (isTargetFull) {
        const finalPos = fullPositionRef.current;
        setFullPosition(finalPos);

        try {
          localStorage.setItem('replyfloat_overlay_x', finalPos.x.toString());
          localStorage.setItem('replyfloat_overlay_y', finalPos.y.toString());
        } catch {}

        const updatedAppPositions = {
          ...(settings.appPositions || {}),
          [contextApp]: { x: finalPos.x, y: finalPos.y },
        };
        onUpdateOverlaySettings({ 
          customX: finalPos.x, 
          customY: finalPos.y,
          appPositions: updatedAppPositions,
        });
      } else {
        const finalPos = compactPositionRef.current;
        setCompactPosition(finalPos);

        try {
          localStorage.setItem('replyfloat_compact_x', finalPos.x.toString());
          localStorage.setItem('replyfloat_compact_y', finalPos.y.toString());
        } catch {}

        onUpdateOverlaySettings({ 
          compactX: finalPos.x, 
          compactY: finalPos.y,
        });
      }
    }
  };

  // Immediate Copy with Toast
  const executeCopy = async (id: string, text: string, feedbackMsg = 'Copied to Clipboard') => {
    await copyToClipboard(text);
    setCopiedId(id);
    setCopyToast(feedbackMsg);
    setTimeout(() => setCopiedId(null), 1800);
    setTimeout(() => setCopyToast(null), 2200);

    if (autoHideConfig.hideOnCopy) {
      setTimeout(() => {
        setInteractionMode('minimal');
      }, 600);
    }
  };

  // Touch-slop gesture handlers for replies (Strict Tap vs Scroll separation)
  const handleReplyTouchStart = (suggestion: ReplySuggestion, e: React.TouchEvent | React.MouseEvent) => {
    if (currentMode === 'passthrough' || isResizingRef.current) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    touchTrackingRef.current = {
      startX: clientX,
      startY: clientY,
      startTime: Date.now(),
      isMovedPastSlop: false,
      suggestionId: suggestion.id,
    };
  };

  const handleReplyTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!touchTrackingRef.current.suggestionId) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const dx = clientX - touchTrackingRef.current.startX;
    const dy = clientY - touchTrackingRef.current.startY;

    if (Math.hypot(dx, dy) > TOUCH_SLOP_PX) {
      touchTrackingRef.current.isMovedPastSlop = true;
    }
  };

  const handleReplyTouchEnd = (suggestion: ReplySuggestion) => {
    const tracking = touchTrackingRef.current;
    if (!tracking.suggestionId || tracking.suggestionId !== suggestion.id) {
      return;
    }

    const duration = Date.now() - tracking.startTime;
    const wasDeliberateTap = !tracking.isMovedPastSlop && duration < MAX_TAP_DURATION_MS;

    touchTrackingRef.current = {
      startX: 0,
      startY: 0,
      startTime: 0,
      isMovedPastSlop: false,
      suggestionId: null,
    };

    if (!wasDeliberateTap) {
      return;
    }

    if (replySettings.editBeforeCopying) {
      setEditingId(suggestion.id);
      setEditText(suggestion.text);
    } else {
      executeCopy(suggestion.id, suggestion.text, 'Copied');
    }
  };

  // Customization mappings
  const fontSizeClass = {
    small: 'text-[11px] leading-snug',
    medium: 'text-xs leading-relaxed',
    large: 'text-sm leading-relaxed',
    xlarge: 'text-base leading-relaxed',
  }[settings.fontSize || 'medium'];

  const cornerRadiusClass = {
    none: 'rounded-none',
    small: 'rounded-md',
    medium: 'rounded-xl',
    large: 'rounded-2xl',
    pill: 'rounded-3xl',
  }[settings.cornerRadius || 'medium'];

  const itemSpacingClass = {
    compact: 'space-y-1',
    standard: 'space-y-2',
    relaxed: 'space-y-2.5',
  }[settings.itemSpacing || 'standard'];

  const scaleTransform = settings.scale ? `scale(${settings.scale})` : 'scale(1)';
  const customWidthStyle = fullDimensions.width ? `${fullDimensions.width}px` : undefined;
  const customHeightStyle = fullDimensions.height ? `${fullDimensions.height}px` : undefined;

  const sizeWidthClass = {
    compact: 'w-[280px]',
    normal: 'w-[330px]',
    large: 'w-[380px]',
  }[settings.size || 'normal'];

  // Opacity
  const overallOpacity = Math.max(0.1, Math.min(1, settings.transparency ?? 0.95));
  const bgOpacity = Math.max(0.1, Math.min(1, settings.backgroundTransparency ?? 0.95));

  const isBulletMode = settings.overlayMode === 'bullet';
  const understandingEnabled = replySettings.understanding?.enabled !== false;
  const isExpandableRepliesEnabled = replySettings.expandableReplies !== false;

  // Max visible replies with pure UI View All support
  const maxReplies = settings.maxVisibleReplies || replySettings.suggestionCount || 3;
  const visibleSuggestions = isViewingAllReplies ? suggestions : suggestions.slice(0, maxReplies);

  // IF COMPACT BAR IS DISABLED AND IN MINIMAL MODE -> HIDE COMPLETELY
  if (isCompactMode && !showCompactBar) {
    return null;
  }

  return (
    <div
      ref={overlayRef}
      id="replyfloat-floating-container"
      onMouseEnter={() => setIsHoveredOrInteracting(true)}
      onMouseLeave={() => setIsHoveredOrInteracting(false)}
      style={{
        transform: isCompactMode
          ? `translate3d(${compactPosition.x}px, ${compactPosition.y}px, 0) ${scaleTransform}`
          : `translate3d(${fullPosition.x}px, ${fullPosition.y}px, 0) ${scaleTransform}`,
        opacity: overallOpacity,
        width: isCompactMode 
          ? (compactDimensions.width ? `${compactDimensions.width}px` : 'auto')
          : (isBulletMode ? 'auto' : customWidthStyle),
        height: isCompactMode
          ? (compactDimensions.height ? `${compactDimensions.height}px` : 'auto')
          : customHeightStyle,
        maxWidth: 'calc(100% - 10px)',
        minWidth: isCompactMode ? `${MIN_COMPACT_WIDTH}px` : `${MIN_OVERLAY_WIDTH}px`,
        willChange: 'transform, width, height',
      }}
      className={`absolute top-0 left-0 z-40 select-none origin-top-left max-w-[calc(100%-10px)] ${
        !isCompactMode && !isBulletMode && !customWidthStyle ? sizeWidthClass : ''
      } ${
        currentMode === 'passthrough' ? 'pointer-events-none' : 'pointer-events-auto'
      }`}
    >
      {/* 4 Invisible Corner Resize Handles for Full Overlay and Compact Bar */}
      {currentMode !== 'passthrough' && (
        <>
          {/* Top-Left Corner Resize Handle */}
          <div
            id="resize-handle-top-left"
            onPointerDown={(e) => handleResizeStart(isCompactMode ? 'compact' : 'full', 'tl', e)}
            onPointerMove={handleResizeMove}
            onPointerUp={handleResizeEnd}
            className="resize-corner-handle absolute -top-2 -left-2 w-7 h-7 z-50 cursor-nwse-resize touch-none select-none rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
            title="Drag to resize"
          >
            <div className="w-2 h-2 rounded-full bg-[#ef4444] shadow-sm ring-1 ring-white/50" />
          </div>

          {/* Top-Right Corner Resize Handle */}
          <div
            id="resize-handle-top-right"
            onPointerDown={(e) => handleResizeStart(isCompactMode ? 'compact' : 'full', 'tr', e)}
            onPointerMove={handleResizeMove}
            onPointerUp={handleResizeEnd}
            className="resize-corner-handle absolute -top-2 -right-2 w-7 h-7 z-50 cursor-nesw-resize touch-none select-none rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
            title="Drag to resize"
          >
            <div className="w-2 h-2 rounded-full bg-[#ef4444] shadow-sm ring-1 ring-white/50" />
          </div>

          {/* Bottom-Left Corner Resize Handle */}
          <div
            id="resize-handle-bottom-left"
            onPointerDown={(e) => handleResizeStart(isCompactMode ? 'compact' : 'full', 'bl', e)}
            onPointerMove={handleResizeMove}
            onPointerUp={handleResizeEnd}
            className="resize-corner-handle absolute -bottom-2 -left-2 w-7 h-7 z-50 cursor-nesw-resize touch-none select-none rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
            title="Drag to resize"
          >
            <div className="w-2 h-2 rounded-full bg-[#ef4444] shadow-sm ring-1 ring-white/50" />
          </div>

          {/* Bottom-Right Corner Resize Handle */}
          <div
            id="resize-handle-bottom-right"
            onPointerDown={(e) => handleResizeStart(isCompactMode ? 'compact' : 'full', 'br', e)}
            onPointerMove={handleResizeMove}
            onPointerUp={handleResizeEnd}
            className="resize-corner-handle absolute -bottom-2 -right-2 w-7 h-7 z-50 cursor-nwse-resize touch-none select-none rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
            title="Drag to resize"
          >
            <div className="w-2 h-2 rounded-full bg-[#ef4444] shadow-sm ring-1 ring-white/50" />
          </div>
        </>
      )}

      {/* Toast Notification for Copy Confirmation */}
      {copyToast && (
        <div className="absolute -top-9 left-1/2 -translate-x-1/2 z-50 bg-[#b91c1c] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg border border-[#ef4444] flex items-center space-x-1.5 whitespace-nowrap animate-fadeIn">
          <Check className="w-3.5 h-3.5 text-white" />
          <span>{copyToast}</span>
        </div>
      )}

      {/* MODE 1: COMPACT REPLYFLOAT BAR (Independently Resizable & Positioned Launcher) */}
      {isCompactMode ? (
        <div
          id="compact-replyfloat-bar"
          onPointerDown={(e) => handlePointerDown('compact', e)}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={{
            height: '100%',
            width: '100%',
          }}
          className="cursor-grab active:cursor-grabbing pointer-events-auto flex items-center justify-between space-x-2 bg-[#0d1117] hover:bg-[#161b22] border border-[#dc2626] text-[#e1e4e8] p-2 rounded-2xl shadow-xl transition-colors select-none overflow-hidden"
          title="Drag to move, drag corners to resize, tap to open full overlay"
        >
          <div className="flex items-center space-x-2 min-w-0">
            <div className="w-7 h-7 rounded-xl bg-[#dc2626] flex items-center justify-center text-white shadow-sm shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0 pr-1">
              <div className="flex items-center space-x-1.5 truncate">
                <span className="text-xs font-bold text-[#e1e4e8] truncate">ReplyFloat</span>
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isLoadingSuggestions ? 'bg-[#58a6ff] animate-ping' : replySettings.autoGenerate?.enabled ? 'bg-[#ef4444] animate-pulse' : 'bg-[#8b949e]'}`} />
              </div>
              <p className="text-[10px] text-[#8b949e] font-mono truncate">
                {isLoadingSuggestions ? 'Generating...' : suggestions.length > 0 ? `${suggestions.length} ready • Tap to open` : 'Active • Tap to open'}
              </p>
            </div>
          </div>
          {/* Subtle corner indicator icon showing it is resizable */}
          <div className="shrink-0 text-[#6e7681] opacity-40 hover:opacity-100 transition-opacity">
            <svg width="6" height="6" viewBox="0 0 6 6" fill="currentColor">
              <circle cx="5" cy="5" r="1" />
              <circle cx="1" cy="5" r="1" />
              <circle cx="5" cy="1" r="1" />
            </svg>
          </div>
        </div>
      ) : isBulletMode ? (
        /* MODE 2: REALME BULLET NOTIFICATION MODE (Compact Floating Pill / Card) */
        <div
          style={{
            backgroundColor: `rgba(13, 17, 23, ${bgOpacity})`,
            height: customHeightStyle ? '100%' : undefined,
          }}
          className={`rounded-2xl border shadow-xl overflow-hidden pointer-events-auto flex flex-col ${
            currentMode === 'passthrough' ? 'border-[#d29922] ring-1 ring-[#d2992255]' : 'border-[#30363d]'
          }`}
        >
          {/* Top Auto-Hide Progress Strip (Crimson Red) */}
          {autoHideConfig.enabled && (
            <div className="h-0.5 bg-[#21262d] w-full shrink-0">
              <div 
                style={{ 
                  width: `${(autoHideTimeRemaining / autoHideConfig.durationSeconds) * 100}%`,
                  transition: 'width 1s linear'
                }} 
                className="h-full bg-[#dc2626]"
              />
            </div>
          )}

          {/* Bullet Header Strip */}
          <div
            onPointerDown={(e) => handlePointerDown('full', e)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="px-3 py-1.5 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between cursor-grab active:cursor-grabbing text-xs shrink-0"
          >
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-[#dc2626] flex items-center justify-center text-white shrink-0">
                <Sparkles className="w-2.5 h-2.5" />
              </div>
              <span className="font-bold text-[11px] text-[#e1e4e8] tracking-tight">
                Bullet Notification
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#dc262622] text-[#f87171] font-mono border border-[#dc262633]">
                {contextApp}
              </span>
            </div>

            <div className="flex items-center space-x-1">
              {/* Screen Analysis ON/OFF Quick Toggle in Bullet Header */}
              <button
                type="button"
                onClick={toggleScreenAnalysis}
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold flex items-center space-x-1 transition-all ${
                  isScreenAnalysisActive
                    ? 'bg-[#23863622] text-[#3fb950] border border-[#23863655]'
                    : 'bg-[#21262d] text-[#8b949e] border border-[#30363d]'
                }`}
                title={isScreenAnalysisActive ? 'Screen Analysis: ON' : 'Screen Analysis: OFF'}
              >
                <Sparkles className="w-2.5 h-2.5" />
                <span>{isScreenAnalysisActive ? 'ON' : 'OFF'}</span>
              </button>

              {autoHideConfig.enabled && (
                <span className="text-[9px] text-[#8b949e] font-mono flex items-center space-x-0.5 mr-1">
                  <Timer className="w-2.5 h-2.5 text-[#8b949e]" />
                  <span>{autoHideTimeRemaining}s</span>
                </span>
              )}

              <button
                type="button"
                onClick={() => setInteractionMode('minimal')}
                className="p-1 rounded text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors"
                title="Minimize into compact bar"
              >
                <Minimize2 className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded text-[#8b949e] hover:text-[#f85149] hover:bg-[#21262d] transition-colors"
                title="Dismiss"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Understanding Section in Bullet Mode */}
          {understandingEnabled && (
            <div className="px-3 py-1.5 bg-[#0a0c10] border-b border-[#30363d] shrink-0 transition-all duration-200">
              <div 
                onClick={toggleUnderstanding}
                className="flex items-center justify-between text-[10px] cursor-pointer select-none group hover:text-white transition-colors"
                title={isUnderstandingExpanded ? 'Collapse Understanding' : 'Expand Understanding'}
              >
                <div className="flex items-center space-x-1.5 font-bold text-[#f87171] uppercase tracking-wider">
                  <Brain className="w-3.5 h-3.5 text-[#f87171]" />
                  <span>UNDERSTANDING</span>
                </div>
                <button
                  type="button"
                  onClick={toggleUnderstanding}
                  className="p-0.5 rounded text-[#8b949e] group-hover:text-white hover:bg-[#21262d] transition-colors"
                  title={isUnderstandingExpanded ? 'Collapse Understanding' : 'Expand Understanding'}
                  aria-label={isUnderstandingExpanded ? 'Collapse Understanding' : 'Expand Understanding'}
                >
                  {isUnderstandingExpanded ? (
                    <ChevronUp className="w-3 h-3 text-[#8b949e] group-hover:text-white" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-[#8b949e] group-hover:text-white" />
                  )}
                </button>
              </div>
              <div
                className={`transition-all duration-200 ease-in-out overflow-hidden ${
                  isUnderstandingExpanded ? 'max-h-36 opacity-100 mt-1' : 'max-h-0 opacity-0 mt-0 pointer-events-none'
                }`}
              >
                <p className="text-[11px] text-[#e1e4e8] font-medium leading-snug">
                  {understandingSummary || (
                    detectedText.toLowerCase().includes('gandhi')
                      ? 'Gandhi was a major leader of India\'s independence movement, known especially for nonviolent resistance.'
                      : `Context: "${detectedText.slice(0, 70)}..."`
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Detected Question / Context Section in Bullet Mode */}
          {detectedText && (
            <div className="px-3 py-1.5 bg-[#0a0c10] border-b border-[#30363d] shrink-0 transition-all duration-200">
              <div 
                onClick={toggleContext}
                className="flex items-center justify-between text-[10px] cursor-pointer select-none group hover:text-white transition-colors"
                title={isContextExpanded ? 'Collapse Context' : 'Expand Context'}
              >
                <div className="flex items-center space-x-1.5 font-bold text-[#58a6ff] uppercase tracking-wider">
                  <MessageSquare className="w-3.5 h-3.5 text-[#58a6ff]" />
                  <span>Context</span>
                </div>
                <button
                  type="button"
                  onClick={toggleContext}
                  className="p-0.5 rounded text-[#8b949e] group-hover:text-white hover:bg-[#21262d] transition-colors"
                  title={isContextExpanded ? 'Collapse Context' : 'Expand Context'}
                  aria-label={isContextExpanded ? 'Collapse Context' : 'Expand Context'}
                >
                  {isContextExpanded ? (
                    <ChevronUp className="w-3 h-3 text-[#8b949e] group-hover:text-white" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-[#8b949e] group-hover:text-white" />
                  )}
                </button>
              </div>
              <div
                className={`transition-all duration-200 ease-in-out overflow-hidden ${
                  isContextExpanded ? 'max-h-36 opacity-100 mt-1' : 'max-h-0 opacity-0 mt-0 pointer-events-none'
                }`}
              >
                <p className="text-[11px] text-[#c9d1d9] italic font-medium leading-snug">
                  "{detectedText}"
                </p>
              </div>
            </div>
          )}

          {/* Primary Quick Reply Item with Copy Button */}
          <div className="p-2.5 space-y-2">
            {isLoadingSuggestions ? (
              <div className="flex items-center space-x-2 text-xs text-[#8b949e] py-1">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#dc2626]" />
                <span>Generating intelligent response...</span>
              </div>
            ) : suggestions.length > 0 ? (
              <div className="space-y-2">
                <div 
                  onClick={(e) => handleReplyClicked(suggestions[0], e)}
                  className={`p-2 rounded-xl bg-[#161b22] hover:bg-[#21262d] border transition-colors space-y-1.5 cursor-pointer select-text group/card ${
                    copiedId === suggestions[0].id
                      ? 'border-[#dc2626] ring-1 ring-[#dc2626]'
                      : 'border-[#30363d] hover:border-[#dc262666]'
                  }`}
                  title="Click reply text to copy"
                >
                  <div className="flex items-center justify-between text-[10px]" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center space-x-1.5">
                      <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold uppercase tracking-wider ${
                        intentType === 'direct_answer'
                          ? 'bg-[#58a6ff22] text-[#58a6ff] border border-[#58a6ff44]'
                          : intentType === 'suggested_reply'
                          ? 'bg-[#3fb95022] text-[#3fb950] border border-[#3fb95044]'
                          : 'bg-[#dc262622] text-[#f87171] border border-[#dc262644]'
                      }`}>
                        {intentLabel || (intentType === 'direct_answer' ? 'Direct Answer' : 'Suggested Reply')}
                      </span>
                      <span className="font-bold text-[#f87171]">
                        {suggestions[0].style}
                      </span>
                    </div>
                    {suggestions[0].text.length > 70 && isExpandableRepliesEnabled && (
                      <button
                        type="button"
                        onClick={(e) => {
                          const isExp = !!expandedReplyIds[suggestions[0].id];
                          if (isExp) handleShowLess(suggestions[0].id, e);
                          else handleShowMore(suggestions[0].id, e);
                        }}
                        className="text-[#58a6ff] hover:text-[#79b8ff] font-semibold text-[9px] flex items-center space-x-0.5"
                        title={expandedReplyIds[suggestions[0].id] ? 'Show Less' : 'Show More'}
                      >
                        <span>{expandedReplyIds[suggestions[0].id] ? 'Show Less' : 'Show More'}</span>
                        {expandedReplyIds[suggestions[0].id] ? (
                          <ChevronUp className="w-2.5 h-2.5" />
                        ) : (
                          <ChevronDown className="w-2.5 h-2.5" />
                        )}
                      </button>
                    )}
                  </div>
                  <p className={`text-xs text-[#e1e4e8] leading-relaxed group-hover/card:text-white transition-colors ${
                    !expandedReplyIds[suggestions[0].id] && isExpandableRepliesEnabled ? 'line-clamp-2' : ''
                  }`}>
                    {suggestions[0].text}
                  </p>
                  <div className="flex items-center justify-between text-[9px] text-[#8b949e] pt-0.5" onClick={e => e.stopPropagation()}>
                    <span className="text-[#6e7681] flex items-center space-x-1">
                      <Copy className="w-2.5 h-2.5 text-[#f87171]" />
                      <span>Click text to copy</span>
                    </span>
                    {copiedId === suggestions[0].id && (
                      <span className="text-[#3fb950] font-bold text-[9px] animate-pulse">✓ Copied!</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-[#8b949e]">
                    {suggestions.length} options ready
                  </span>
                  <div className="flex items-center space-x-1.5">
                    {/* View All (Pure UI Toggle) */}
                    <button
                      type="button"
                      id="bullet-view-all-btn"
                      onClick={handleViewAll}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#21262d] hover:bg-[#30363d] text-[#58a6ff] hover:text-[#79b8ff] border border-[#30363d] transition-colors"
                      title="View all reply options"
                    >
                      View All
                    </button>
                    {/* Dedicated Copy Button (Explicit trigger only) */}
                    <button
                      type="button"
                      id="bullet-copy-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        executeCopy(suggestions[0].id, suggestions[0].text, 'Copied');
                      }}
                      className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#dc2626] hover:bg-[#b91c1c] text-white flex items-center space-x-1 transition-colors"
                      title="Copy response to clipboard"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#8b949e] py-1">No suggestions available</p>
            )}
          </div>
        </div>
      ) : (
        /* MODE 3: STANDARD FLOATING PANEL (Full Conversational Card) */
        <div
          style={{
            backgroundColor: `rgba(13, 17, 23, ${bgOpacity})`,
            height: customHeightStyle ? '100%' : undefined,
          }}
          className={`${cornerRadiusClass} border shadow-2xl overflow-hidden pointer-events-auto flex flex-col ${
            currentMode === 'passthrough'
              ? 'border-[#d29922] ring-1 ring-[#d29922]'
              : 'border-[#dc2626] ring-1 ring-[#dc262633]'
          }`}
        >
          {/* Top Auto-Hide Progress Strip */}
          {autoHideConfig.enabled && (
            <div className="h-0.5 bg-[#21262d] w-full shrink-0">
              <div 
                style={{ 
                  width: `${(autoHideTimeRemaining / autoHideConfig.durationSeconds) * 100}%`,
                  transition: 'width 1s linear'
                }} 
                className="h-full bg-[#dc2626]"
              />
            </div>
          )}

          {/* Drag Header Bar */}
          <div
            id="replyfloat-drag-header"
            onPointerDown={(e) => handlePointerDown('full', e)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="px-3 py-2 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between cursor-grab active:cursor-grabbing pointer-events-auto shrink-0 select-none"
          >
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-lg bg-[#dc2626] flex items-center justify-center text-white font-bold shadow-sm">
                <Bot className="w-3 h-3" />
              </div>
              <span className="text-xs font-bold text-[#e1e4e8] tracking-tight">
                ReplyFloat AI
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#dc262622] text-[#f87171] font-mono border border-[#dc262633]">
                {contextApp}
              </span>
            </div>

            <div className="flex items-center space-x-1">
              {/* Screen Analysis ON/OFF Quick Toggle */}
              <button
                type="button"
                id="header-toggle-screen-analysis"
                onClick={toggleScreenAnalysis}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold flex items-center space-x-1 transition-all ${
                  isScreenAnalysisActive
                    ? 'bg-[#23863622] text-[#3fb950] border border-[#23863655] hover:bg-[#23863633]'
                    : 'bg-[#21262d] text-[#8b949e] border border-[#30363d] hover:text-[#e1e4e8]'
                }`}
                title={isScreenAnalysisActive ? 'Continuous Screen Analysis: ON (Click to pause)' : 'Screen Analysis: OFF (Click to resume)'}
              >
                <Sparkles className="w-2.5 h-2.5" />
                <span>{isScreenAnalysisActive ? 'AUTO' : 'PAUSED'}</span>
              </button>

              {autoHideConfig.enabled && (
                <span className="text-[9px] text-[#8b949e] font-mono flex items-center space-x-0.5 mr-1">
                  <Timer className="w-2.5 h-2.5 text-[#8b949e]" />
                  <span>{autoHideTimeRemaining}s</span>
                </span>
              )}

              {/* Pass-through indicator */}
              {currentMode === 'passthrough' && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#d2992222] text-[#d29922] font-mono font-bold flex items-center space-x-1">
                  <Unlock className="w-2.5 h-2.5" />
                  <span>PASS-THROUGH</span>
                </span>
              )}

              {/* Regenerate AI Suggestions button */}
              <button
                type="button"
                onClick={() => onRegenerate()}
                disabled={isLoadingSuggestions}
                className="p-1 rounded text-[#8b949e] hover:text-[#e1e4e8] hover:bg-[#21262d] transition-colors"
                title="Regenerate responses"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSuggestions ? 'animate-spin text-[#dc2626]' : ''}`} />
              </button>

              {/* Minimal Mode toggle button */}
              <button
                type="button"
                onClick={() => setInteractionMode('minimal')}
                className="p-1 rounded text-[#8b949e] hover:text-[#e1e4e8] hover:bg-[#21262d] transition-colors"
                title="Minimize into compact bar"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>

              {/* Close / Dismiss button */}
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded text-[#8b949e] hover:text-[#f85149] hover:bg-[#21262d] transition-colors"
                title="Close floating overlay"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Tone Selector Horizontal Carousel Bar */}
          <div className="px-2 py-1.5 bg-[#0d1117] border-b border-[#30363d] flex items-center space-x-1 overflow-x-auto no-scrollbar pointer-events-auto shrink-0">
            {STYLE_OPTIONS.map(style => (
              <button
                type="button"
                key={style}
                onClick={() => {
                  onUpdateReplySettings({ selectedStyle: style });
                  onRegenerate(style);
                }}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-colors ${
                  replySettings.selectedStyle === style
                    ? 'bg-[#dc2626] text-white shadow-sm'
                    : 'bg-[#161b22] text-[#8b949e] hover:text-[#e1e4e8] hover:bg-[#21262d]'
                }`}
              >
                {style}
              </button>
            ))}
          </div>

          {/* 1. UNDERSTANDING SECTION */}
          {understandingEnabled && (
            <div className="px-3 py-1.5 bg-[#0a0c10] border-b border-[#30363d] pointer-events-auto shrink-0 transition-all duration-200">
              <div 
                onClick={toggleUnderstanding}
                className="flex items-center justify-between text-[10px] cursor-pointer select-none group hover:text-white transition-colors"
                title={isUnderstandingExpanded ? 'Collapse Understanding' : 'Expand Understanding'}
              >
                <div className="flex items-center space-x-1.5 font-bold text-[#f87171] uppercase tracking-wider">
                  <Brain className="w-3.5 h-3.5 text-[#f87171]" />
                  <span>UNDERSTANDING</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[9px] text-[#8b949e] font-mono">
                    {contextApp}
                  </span>
                  <button
                    type="button"
                    id="toggle-understanding-btn"
                    onClick={toggleUnderstanding}
                    className="p-0.5 rounded text-[#8b949e] group-hover:text-white hover:bg-[#21262d] transition-colors"
                    title={isUnderstandingExpanded ? 'Collapse Understanding' : 'Expand Understanding'}
                    aria-label={isUnderstandingExpanded ? 'Collapse Understanding' : 'Expand Understanding'}
                  >
                    {isUnderstandingExpanded ? (
                      <ChevronUp className="w-3 h-3 text-[#8b949e] group-hover:text-white" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-[#8b949e] group-hover:text-white" />
                    )}
                  </button>
                </div>
              </div>
              <div
                className={`transition-all duration-200 ease-in-out overflow-hidden ${
                  isUnderstandingExpanded ? 'max-h-48 opacity-100 mt-1.5' : 'max-h-0 opacity-0 mt-0 pointer-events-none'
                }`}
              >
                <p className="text-xs text-[#e1e4e8] font-sans leading-relaxed bg-[#161b22] p-2 rounded-lg border border-[#30363d]/80">
                  {understandingSummary || (
                    detectedText.toLowerCase().includes('gandhi')
                      ? 'Gandhi was a major leader of India\'s independence movement, known especially for nonviolent resistance.'
                      : `They're discussing: "${detectedText.slice(0, 90)}..."`
                  )}
                </p>
              </div>
            </div>
          )}

          {/* 2. DETECTED QUESTION / CONTEXT SECTION */}
          {detectedText && (
            <div className="px-3 py-1.5 bg-[#0a0c10] border-b border-[#30363d] pointer-events-auto shrink-0 transition-all duration-200">
              <div 
                onClick={toggleContext}
                className="flex items-center justify-between text-[10px] cursor-pointer select-none group hover:text-white transition-colors"
                title={isContextExpanded ? 'Collapse Context' : 'Expand Context'}
              >
                <div className="flex items-center space-x-1.5 font-bold text-[#58a6ff] uppercase tracking-wider">
                  <MessageSquare className="w-3.5 h-3.5 text-[#58a6ff]" />
                  <span>Context</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    id="toggle-context-btn"
                    onClick={toggleContext}
                    className="p-0.5 rounded text-[#8b949e] group-hover:text-white hover:bg-[#21262d] transition-colors"
                    title={isContextExpanded ? 'Collapse Context' : 'Expand Context'}
                    aria-label={isContextExpanded ? 'Collapse Context' : 'Expand Context'}
                  >
                    {isContextExpanded ? (
                      <ChevronUp className="w-3 h-3 text-[#8b949e] group-hover:text-white" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-[#8b949e] group-hover:text-white" />
                    )}
                  </button>
                </div>
              </div>
              <div
                className={`transition-all duration-200 ease-in-out overflow-hidden ${
                  isContextExpanded ? 'max-h-40 opacity-100 mt-1.5' : 'max-h-0 opacity-0 mt-0 pointer-events-none'
                }`}
              >
                <p className="text-xs text-[#c9d1d9] font-sans italic leading-relaxed bg-[#161b22] px-2.5 py-1.5 rounded-lg border border-[#30363d]/80">
                  "{detectedText}"
                </p>
              </div>
            </div>
          )}

          {/* 3. RECENT RESULTS (2-MIN RETENTION) SECTION */}
          {recentHistory && recentHistory.length > 0 && (
            <div className="px-3 py-1.5 bg-[#0a0c10] border-b border-[#30363d] pointer-events-auto shrink-0 transition-all duration-200">
              <div 
                onClick={toggleRecentResults}
                className="flex items-center justify-between text-[10px] cursor-pointer select-none group hover:text-white transition-colors"
                title={isRecentResultsExpanded ? 'Collapse Recent History' : 'Expand Recent History'}
              >
                <div className="flex items-center space-x-1.5 font-bold text-[#d29922] uppercase tracking-wider">
                  <History className="w-3.5 h-3.5 text-[#d29922]" />
                  <span>RECENT QUESTIONS ({recentHistory.length})</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[9px] text-[#8b949e] font-mono">2-min menu</span>
                  <button
                    type="button"
                    id="toggle-recent-results-btn"
                    onClick={toggleRecentResults}
                    className="p-0.5 rounded text-[#8b949e] group-hover:text-white hover:bg-[#21262d] transition-colors"
                    title={isRecentResultsExpanded ? 'Collapse Recent History' : 'Expand Recent History'}
                    aria-label={isRecentResultsExpanded ? 'Collapse Recent History' : 'Expand Recent History'}
                  >
                    {isRecentResultsExpanded ? (
                      <ChevronUp className="w-3 h-3 text-[#8b949e] group-hover:text-white" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-[#8b949e] group-hover:text-white" />
                    )}
                  </button>
                </div>
              </div>
              <div
                className={`transition-all duration-200 ease-in-out overflow-hidden ${
                  isRecentResultsExpanded ? 'max-h-52 opacity-100 mt-1.5 space-y-1.5 overflow-y-auto' : 'max-h-0 opacity-0 mt-0 pointer-events-none'
                }`}
              >
                {recentHistory.map((item) => {
                  const timeAgoSec = Math.max(0, Math.floor((Date.now() - item.timestamp) / 1000));
                  const timeAgoStr = timeAgoSec < 60 ? `${timeAgoSec}s ago` : `${Math.floor(timeAgoSec / 60)}m ago`;
                  return (
                    <div
                      key={item.id}
                      onClick={() => onSelectRecentItem && onSelectRecentItem(item)}
                      className="p-2 rounded-lg bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] cursor-pointer transition-colors space-y-1 text-left"
                    >
                      <div className="flex items-center justify-between text-[9px]">
                        <span className="font-bold text-[#f87171] truncate max-w-[170px]">{item.appName}</span>
                        <div className="flex items-center space-x-1.5 text-[#8b949e] font-mono">
                          <span>{timeAgoStr}</span>
                          {onDeleteRecentItem && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteRecentItem(item.id);
                              }}
                              className="text-[#8b949e] hover:text-[#f85149] p-0.5"
                              title="Dismiss from recent list"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-[11px] text-[#e1e4e8] font-medium line-clamp-1">
                        "{item.question}"
                      </p>
                      {item.suggestions && item.suggestions[0] && (
                        <p className="text-[10px] text-[#8b949e] line-clamp-1 italic">
                          ↳ {item.suggestions[0].text}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Generated Reply Suggestions List */}
          <div className={`p-3 ${itemSpacingClass} overflow-y-auto max-h-[360px] scrollable-reply-list pointer-events-auto flex-1`}>
            {/* List Header with Pure UI View All Toggle */}
            <div className="flex items-center justify-between pb-1.5 mb-1 border-b border-[#30363d]/60 text-[10px]">
              <div className="flex items-center space-x-1.5 text-[#8b949e]">
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider flex items-center space-x-1 ${
                  intentType === 'direct_answer'
                    ? 'bg-[#58a6ff22] text-[#58a6ff] border border-[#58a6ff44]'
                    : intentType === 'suggested_reply'
                    ? 'bg-[#3fb95022] text-[#3fb950] border border-[#3fb95044]'
                    : intentType === 'no_response_needed'
                    ? 'bg-[#8b949e22] text-[#8b949e] border border-[#30363d]'
                    : 'bg-[#dc262622] text-[#f87171] border border-[#dc262644]'
                }`}>
                  <span>{intentLabel || (intentType === 'direct_answer' ? 'Direct Answer' : 'Suggested Reply')}</span>
                </span>
                <span className="font-bold tracking-wider uppercase text-[#c9d1d9]">
                  {isViewingAllReplies ? `All (${suggestions.length})` : `(${visibleSuggestions.length}/${suggestions.length})`}
                </span>
              </div>
              {suggestions.length > 1 && (
                <button
                  type="button"
                  id="view-all-replies-toggle-btn"
                  onClick={handleViewAll}
                  className="px-2 py-0.5 rounded text-[9px] font-bold text-[#58a6ff] hover:text-[#79b8ff] bg-[#58a6ff1a] hover:bg-[#58a6ff2e] border border-[#58a6ff44] transition-colors"
                  title={isViewingAllReplies ? 'Show fewer replies' : 'View all generated reply options'}
                >
                  {isViewingAllReplies ? 'Show Fewer' : `View All (${suggestions.length})`}
                </button>
              )}
            </div>

            {isLoadingSuggestions ? (
              <div className="py-6 flex flex-col items-center justify-center space-y-2 text-[#8b949e]">
                <RefreshCw className="w-5 h-5 animate-spin text-[#dc2626]" />
                <span className="text-xs">Crafting intelligent responses...</span>
              </div>
            ) : visibleSuggestions.length === 0 ? (
              <div className="py-6 text-center text-[#8b949e] text-xs space-y-2">
                <p>No suggestions available for this context.</p>
                <button
                  type="button"
                  onClick={() => onRegenerate()}
                  className="px-3 py-1 bg-[#dc2626] text-white rounded-lg text-xs font-bold hover:bg-[#b91c1c]"
                >
                  Generate Replies
                </button>
              </div>
            ) : (
              visibleSuggestions.map((suggestion, index) => {
                const isCopied = copiedId === suggestion.id;
                const isEditing = editingId === suggestion.id;
                const isExpanded = !!expandedReplyIds[suggestion.id];
                const isLongText = suggestion.text.length > 85;

                return (
                  <div
                    key={suggestion.id || index}
                    onClick={(e) => {
                      if (!isEditing) {
                        handleReplyClicked(suggestion, e);
                      }
                    }}
                    className={`p-2.5 rounded-xl bg-[#161b22] hover:bg-[#21262d] border transition-colors relative group/card select-text cursor-pointer ${
                      isCopied
                        ? 'border-[#dc2626] ring-1 ring-[#dc2626]'
                        : 'border-[#30363d] hover:border-[#dc262666]'
                    }`}
                    title="Click reply text to copy"
                  >
                    {/* Header of suggestion card */}
                    <div className="flex items-center justify-between text-[10px] mb-1" onClick={e => e.stopPropagation()}>
                      <span className="font-semibold text-[#f87171] flex items-center space-x-1">
                        <span>Reply {index + 1}: {suggestion.style}</span>
                        {suggestion.tone && (
                          <span className="text-[#6e7681] font-normal">({suggestion.tone})</span>
                        )}
                      </span>

                      <div className="flex items-center space-x-1 text-[#8b949e]">
                        {/* Expandable replies toggle button on card header */}
                        {isExpandableRepliesEnabled && (
                          <button
                            type="button"
                            onClick={(e) => isExpanded ? handleShowLess(suggestion.id, e) : handleShowMore(suggestion.id, e)}
                            className="p-0.5 px-1.5 rounded text-[#58a6ff] hover:bg-[#58a6ff22] flex items-center space-x-0.5 text-[9px] font-semibold transition-colors"
                            title={isExpanded ? 'Show Less' : 'Show More'}
                          >
                            <span>{isExpanded ? 'Show Less' : 'Show More'}</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Body text / Inline Editor */}
                    {isEditing ? (
                      <div className="space-y-1.5 pt-1" onClick={e => e.stopPropagation()}>
                        <textarea
                          value={editText}
                          onChange={e => setEditText(e.target.value)}
                          rows={3}
                          className="w-full bg-[#0d1117] text-xs text-[#e1e4e8] p-2 rounded border border-[#dc2626] outline-none font-sans"
                          placeholder="Edit your response..."
                        />
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-[#8b949e]">{editText.length} characters</span>
                          <div className="flex items-center space-x-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="px-2 py-0.5 bg-[#21262d] text-[#8b949e] hover:text-[#e1e4e8] rounded border border-[#30363d]"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                suggestion.text = editText;
                                suggestion.isEdited = true;
                                setEditingId(null);
                                executeCopy(suggestion.id, editText, 'Edited & Copied');
                              }}
                              className="px-2.5 py-0.5 bg-[#dc2626] text-white font-bold rounded hover:bg-[#b91c1c]"
                            >
                              Save & Copy
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className={`${fontSizeClass} text-[#e1e4e8] font-normal leading-relaxed group-hover/card:text-white transition-colors ${
                          !isExpanded && isExpandableRepliesEnabled ? 'line-clamp-3' : ''
                        }`}>
                          {suggestion.text}
                        </p>
                        {isLongText && isExpandableRepliesEnabled && (
                          <div onClick={e => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={(e) => isExpanded ? handleShowLess(suggestion.id, e) : handleShowMore(suggestion.id, e)}
                              className="text-[10px] font-bold text-[#58a6ff] hover:text-[#79b8ff] hover:underline flex items-center space-x-0.5 pt-0.5"
                            >
                              <span>{isExpanded ? 'Show Less' : 'Show More'}</span>
                              {isExpanded ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action buttons strip on each reply */}
                    {!isEditing && (
                      <div className="flex items-center justify-between pt-1.5 mt-1.5 border-t border-[#30363d]/80 text-[10px]" onClick={e => e.stopPropagation()}>
                        <div className="text-[9px] text-[#6e7681] flex items-center space-x-1">
                          <span className="flex items-center space-x-1 text-[#8b949e]">
                            <Copy className="w-2.5 h-2.5 text-[#f87171]" />
                            <span>Click text to copy</span>
                          </span>
                          {isCopied && (
                            <span className="text-[#3fb950] font-bold ml-1.5 animate-pulse">✓ Copied!</span>
                          )}
                        </div>

                        <div className="flex items-center space-x-1.5" onClick={e => e.stopPropagation()}>
                          {/* Quick Show More / Show Less action button */}
                          {isLongText && isExpandableRepliesEnabled && (
                            <button
                              type="button"
                              onClick={(e) => isExpanded ? handleShowLess(suggestion.id, e) : handleShowMore(suggestion.id, e)}
                              className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#21262d] hover:bg-[#30363d] text-[#58a6ff] hover:text-[#79b8ff] border border-[#30363d] transition-colors"
                              title={isExpanded ? 'Show Less' : 'Show More'}
                            >
                              {isExpanded ? 'Show Less' : 'Show More'}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(suggestion.id);
                              setEditText(suggestion.text);
                            }}
                            className="flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-[#e1e4e8] border border-[#30363d] transition-colors"
                            title="Edit before copying"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>

                          {/* DEDICATED COPY BUTTON (Explicit trigger only) */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              executeCopy(suggestion.id, suggestion.text, 'Copied');
                            }}
                            className={`flex items-center space-x-1 px-2.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                              isCopied
                                ? 'bg-[#dc2626] text-white border-[#ef4444]'
                                : 'bg-[#21262d] hover:bg-[#dc2626] text-[#e1e4e8] hover:text-white border-[#30363d] hover:border-[#dc2626]'
                            }`}
                            title="Copy full reply text"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3 h-3 text-white" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => onInsertToApp(suggestion.text)}
                            className="flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#dc262622] hover:bg-[#dc262633] text-[#f87171] border border-[#dc262644] transition-colors"
                            title="Insert into chat"
                          >
                            <SendHorizontal className="w-3 h-3" />
                            <span>Insert</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Bar with Position Memory Indicator & Quick Config */}
          <div className="px-3 py-1.5 bg-[#161b22] border-t border-[#30363d] flex items-center justify-between text-[10px] text-[#8b949e] pointer-events-auto shrink-0">
            <div className="flex items-center space-x-2">
              <span>Opacity:</span>
              <input
                type="range"
                min="0.15"
                max="1.0"
                step="0.05"
                value={settings.transparency ?? 0.95}
                onChange={e => onUpdateOverlaySettings({ transparency: parseFloat(e.target.value) })}
                className="w-16 h-1.5 bg-[#21262d] rounded appearance-none cursor-pointer accent-[#dc2626]"
              />
              <span className="font-mono text-[#e1e4e8]">{Math.round((settings.transparency ?? 0.95) * 100)}%</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-[9px] text-[#6e7681]">Pos saved for {contextApp}</span>
              <button
                type="button"
                onClick={onOpenSettings}
                className="flex items-center space-x-1 text-[#8b949e] hover:text-[#f87171] transition-colors"
                title="Open settings"
              >
                <Sliders className="w-3 h-3" />
                <span>Customize</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
