import React from "react";
import {
  Bot,
  ChevronDown,
  ChevronRight,
  Code2,
  Copy,
  Eraser,
  FileCode2,
  FolderOpen,
  History,
  Loader2,
  MessageSquare,
  MoveDiagonal2,
  PanelRight,
  PanelRightClose,
  PanelRightOpen,
  PictureInPicture2,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings2,
  Square,
  TextCursorInput,
  Trash2,
  User,
  Wand2,
  X,
} from "lucide-react";
import { cx } from "../components/ui";
import "../styles/chat-editor-page.css";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  streaming?: boolean;
};

export type ChatSession = {
  id: string;
  title: string;
  messages: ChatMessage[];
  model: string;
  createdAt: number;
  cwd?: string;
};

export type ChatHistorySession = {
  id: string;
  title: string;
  model?: string | null;
  cwd?: string | null;
  updatedAtMs?: number | null;
  archived?: boolean;
};

/** How the code editor is placed relative to the chat. */
export type EditorLayout = "dock" | "inline" | "floating";

type FloatingRect = { x: number; y: number; w: number; h: number };

export type ChatEditorPageProps = {
  lang: "zh" | "en";
  active?: boolean;
  providerModels?: string[];
  historySessions?: ChatHistorySession[];
  gatewayRunning?: boolean;
  gatewayPort?: number;
  onGatewayRequest?: (method: string, path: string, body: unknown) => Promise<unknown>;
};

/* ------------------------------------------------------------------ */
/*  i18n                                                               */
/* ------------------------------------------------------------------ */

function getCopy(lang: "zh" | "en") {
  return lang === "zh"
    ? {
        eyebrow: "AI 对话操作台",
        title: "对话 & 编辑器",
        desc: "参考 OpenAI Harness 风格的对话编辑工作台",
        newChat: "新对话",
        send: "发送",
        stop: "停止",
        placeholder: "输入消息… Shift+Enter 换行",
        editorTitle: "代码编辑器",
        editorPlaceholder: "// 在此粘贴或编辑代码…",
        copyCode: "复制代码",
        clearChat: "清空对话",
        deleteSession: "删除",
        model: "模型",
        noModel: "未配置",
        sessions: "对话记录",
        noSessions: "暂无对话",
        showEditor: "显示编辑器",
        hideEditor: "隐藏编辑器",
        thinking: "思考中…",
        regenerate: "重新生成",
        you: "你",
        assistant: "助手",
        system: "系统",
        insertCode: "插入代码",
        applyToEditor: "应用到编辑器",
        gatewayOffline: "网关未运行，请先启动本地网关",
        todayLabel: "今天",
        yesterdayLabel: "昨天",
        olderLabel: "更早",
        emptyState: "开始一段新的对话",
        emptyHint: "在下方输入消息，或从编辑器中粘贴代码进行讨论",
        langLabel: "语言",
        layoutDock: "停靠到右侧",
        layoutInline: "合并到输入区",
        layoutFloating: "悬浮窗口",
        editorLayout: "编辑器布局",
        dragToMove: "拖动移动",
        resizeHandle: "拖拽右下角调整大小",
        closeEditor: "关闭编辑器",
        sendWithEditor: "附带编辑器代码发送",
        resizeDock: "拖动调整宽度",
        searchHistory: "搜索项目、会话或模型",
        workspace: "工作区",
        projectHistory: "项目历史",
        today: "今天",
        yesterday: "昨天",
        older: "更早",
        project: "项目",
        openFile: "打开文件",
        noFile: "未打开文件",
        fileReadError: "文件读取失败",
        currentChats: "当前对话",
        noHistory: "暂无项目会话",
        historyContext: "历史上下文（未加载消息正文）",
      }
    : {
        eyebrow: "AI CONVERSATION CONSOLE",
        title: "Chat & Editor",
        desc: "OpenAI Harness–inspired conversation and editing workspace",
        newChat: "New chat",
        send: "Send",
        stop: "Stop",
        placeholder: "Type a message… Shift+Enter for new line",
        editorTitle: "Code Editor",
        editorPlaceholder: "// Paste or edit code here…",
        copyCode: "Copy code",
        clearChat: "Clear chat",
        deleteSession: "Delete",
        model: "Model",
        noModel: "Not configured",
        sessions: "Chat history",
        noSessions: "No conversations yet",
        showEditor: "Show editor",
        hideEditor: "Hide editor",
        thinking: "Thinking…",
        regenerate: "Regenerate",
        you: "You",
        assistant: "Assistant",
        system: "System",
        insertCode: "Insert code",
        applyToEditor: "Apply to editor",
        gatewayOffline: "Gateway is offline — start the local gateway first",
        todayLabel: "Today",
        yesterdayLabel: "Yesterday",
        olderLabel: "Older",
        emptyState: "Start a new conversation",
        emptyHint: "Type a message below, or paste code from the editor to discuss",
        langLabel: "Language",
        layoutDock: "Dock to right",
        layoutInline: "Merge into composer",
        layoutFloating: "Floating window",
        editorLayout: "Editor layout",
        dragToMove: "Drag to move",
        resizeHandle: "Drag corner to resize",
        closeEditor: "Close editor",
        sendWithEditor: "Send with editor code",
        resizeDock: "Drag to resize width",
        searchHistory: "Search projects, chats or models",
        workspace: "Workspace",
        projectHistory: "Project history",
        today: "Today",
        yesterday: "Yesterday",
        older: "Older",
        project: "Project",
        openFile: "Open file",
        noFile: "No file open",
        fileReadError: "Could not read file",
        currentChats: "Current chats",
        noHistory: "No project sessions",
        historyContext: "History context (messages not loaded)",
      };
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

let _msgId = 0;
function nextId() {
  return `msg-${Date.now()}-${++_msgId}`;
}

let _sessId = 0;
function nextSessId() {
  return `sess-${Date.now()}-${++_sessId}`;
}

function formatTime(ts: number) {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const EDITOR_LANGUAGES = [
  "plaintext",
  "javascript",
  "typescript",
  "python",
  "rust",
  "html",
  "css",
  "json",
  "markdown",
  "sql",
  "shell",
  "toml",
  "yaml",
] as const;

type EditorLanguage = (typeof EDITOR_LANGUAGES)[number];

/* ---- lightweight localStorage persistence ---- */

function loadLS<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveLS<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / privacy mode – ignore */
  }
}

const LS_LAYOUT = "cx.chat.editorLayout";
const LS_VISIBLE = "cx.chat.editorVisible";
const LS_DOCK_W = "cx.chat.dockWidth";
const LS_FLOAT = "cx.chat.floatingRect";

const DEFAULT_DOCK_WIDTH = 380;
const MIN_DOCK_WIDTH = 260;
const MAX_DOCK_WIDTH = 720;
const MIN_FLOAT_W = 320;
const MIN_FLOAT_H = 240;
const DEFAULT_FLOAT: FloatingRect = { x: 60, y: 60, w: 520, h: 400 };

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function clampRect(rect: FloatingRect, vw: number, vh: number): FloatingRect {
  const w = clamp(rect.w, MIN_FLOAT_W, Math.max(MIN_FLOAT_W, vw - 40));
  const h = clamp(rect.h, MIN_FLOAT_H, Math.max(MIN_FLOAT_H, vh - 40));
  const x = clamp(rect.x, 0, Math.max(0, vw - w));
  const y = clamp(rect.y, 0, Math.max(0, vh - h));
  return { x, y, w, h };
}

function languageFromFilename(name: string): EditorLanguage {
  const ext = name.toLowerCase().split(".").pop() || "";
  const map: Record<string, EditorLanguage> = {
    js: "javascript", jsx: "javascript", mjs: "javascript", cjs: "javascript",
    ts: "typescript", tsx: "typescript", py: "python", rs: "rust", html: "html",
    htm: "html", css: "css", json: "json", md: "markdown", sql: "sql", sh: "shell",
    bash: "shell", toml: "toml", yaml: "yaml", yml: "yaml",
  };
  return map[ext] || "plaintext";
}

function compactPath(value: string | null | undefined, max = 34) {
  if (!value) return "未记录工作目录";
  const normalized = value.replace(/\\/g, "/");
  if (normalized.length <= max) return normalized;
  const parts = normalized.split("/").filter(Boolean);
  return parts.length > 2 ? `…/${parts.slice(-2).join("/")}` : `…${normalized.slice(-max + 1)}`;
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function ChatBubble({
  message,
  copy,
  onApplyToEditor,
}: {
  message: ChatMessage;
  copy: ReturnType<typeof getCopy>;
  onApplyToEditor?: (code: string) => void;
}) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";
  const [copied, setCopied] = React.useState(false);

  const codeBlocks = React.useMemo(() => {
    const blocks: { lang: string; code: string }[] = [];
    const re = /```(\w*)\n([\s\S]*?)```/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(message.content))) {
      blocks.push({ lang: m[1] || "plaintext", code: m[2].trimEnd() });
    }
    return blocks;
  }, [message.content]);

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* noop */ }
  }, [message.content]);

  return (
    <div
      className={cx(
        "cx-chat-bubble",
        isUser && "cx-chat-bubble--user",
        isSystem && "cx-chat-bubble--system",
        !isUser && !isSystem && "cx-chat-bubble--assistant",
        message.streaming && "cx-chat-bubble--streaming",
      )}
    >
      <div className="cx-chat-bubble-avatar">
        {isUser ? <User size={16} /> : isSystem ? <Settings2 size={16} /> : <Bot size={16} />}
      </div>
      <div className="cx-chat-bubble-body">
        <div className="cx-chat-bubble-header">
          <span className="cx-chat-bubble-role">
            {isUser ? copy.you : isSystem ? copy.system : copy.assistant}
          </span>
          <span className="cx-chat-bubble-time">{formatTime(message.timestamp)}</span>
        </div>
        <div className="cx-chat-bubble-content">
          {renderMarkdown(message.content)}
          {message.streaming && (
            <span className="cx-chat-cursor" aria-hidden="true" />
          )}
        </div>
        {!message.streaming && (
          <div className="cx-chat-bubble-actions">
            <button type="button" className="cx-chat-action" onClick={handleCopy} title={copy.copyCode}>
              <Copy size={13} />
              {copied ? "✓" : ""}
            </button>
            {codeBlocks.length > 0 && onApplyToEditor && (
              <button
                type="button"
                className="cx-chat-action"
                onClick={() => onApplyToEditor(codeBlocks[0].code)}
                title={copy.applyToEditor}
              >
                <Code2 size={13} /> {copy.applyToEditor}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function renderMarkdown(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const codeRe = /```(\w*)\n([\s\S]*?)```/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;

  while ((m = codeRe.exec(text))) {
    if (m.index > last) {
      parts.push(
        <span key={key++} className="cx-chat-text">
          {renderInlineMarkdown(text.slice(last, m.index))}
        </span>,
      );
    }
    parts.push(
      <pre key={key++} className="cx-chat-code-block" data-lang={m[1] || "plaintext"}>
        <div className="cx-chat-code-lang">{m[1] || "plaintext"}</div>
        <code>{m[2].trimEnd()}</code>
      </pre>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) {
    parts.push(
      <span key={key++} className="cx-chat-text">
        {renderInlineMarkdown(text.slice(last))}
      </span>,
    );
  }
  return parts;
}

function renderInlineMarkdown(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const inlineRe = /`([^`]+)`/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;

  while ((m = inlineRe.exec(text))) {
    if (m.index > last) {
      parts.push(<React.Fragment key={key++}>{text.slice(last, m.index)}</React.Fragment>);
    }
    parts.push(<code key={key++} className="cx-chat-inline-code">{m[1]}</code>);
    last = m.index + m[0].length;
  }
  if (last < text.length) {
    parts.push(<React.Fragment key={key++}>{text.slice(last)}</React.Fragment>);
  }
  return parts;
}

function EmptyState({ copy }: { copy: ReturnType<typeof getCopy> }) {
  return (
    <div className="cx-chat-empty">
      <div className="cx-chat-empty-icon">
        <Wand2 size={40} strokeWidth={1.4} />
      </div>
      <h3>{copy.emptyState}</h3>
      <p>{copy.emptyHint}</p>
    </div>
  );
}

/* ---- editor toolbar (shared across layouts) ---- */

function EditorToolbar({
  copy,
  editorLang,
  fileName,
  onOpenFile,
  onLangChange,
  onCopy,
  onInsertToChat,
  onClose,
  compact,
}: {
  copy: ReturnType<typeof getCopy>;
  editorLang: EditorLanguage;
  fileName: string;
  onOpenFile: () => void;
  onLangChange: (l: EditorLanguage) => void;
  onCopy: () => void;
  onInsertToChat: () => void;
  onClose?: () => void;
  compact?: boolean;
}) {
  return (
    <div className="cx-chat-editor-toolbar">
      <FileCode2 size={15} />
      <span className="cx-chat-editor-title" title={fileName || copy.noFile}>{fileName || copy.editorTitle}</span>
      <button type="button" className="cx-chat-action-btn" onClick={onOpenFile} title={copy.openFile}>
        <FolderOpen size={14} />
      </button>
      <select
        className="cx-chat-lang-select"
        value={editorLang}
        onChange={(e) => onLangChange(e.target.value as EditorLanguage)}
        aria-label={copy.langLabel}
      >
        {EDITOR_LANGUAGES.map((l) => (
          <option key={l} value={l}>{l}</option>
        ))}
      </select>
      <button type="button" className="cx-chat-action-btn" onClick={onCopy} title={copy.copyCode}>
        <Copy size={14} />
      </button>
      <button
        type="button"
        className="cx-chat-action-btn"
        onClick={onInsertToChat}
        title={copy.sendWithEditor}
      >
        <Send size={14} />
      </button>
      {onClose && (
        <button type="button" className="cx-chat-action-btn" onClick={onClose} title={copy.closeEditor}>
          <X size={14} />
        </button>
      )}
      {compact && <span className="cx-chat-editor-layout-tag" />}
    </div>
  );
}

/* ---- editor body: textarea view ---- */

function EditorTextarea({
  value,
  onChange,
  placeholder,
  lang,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  lang: EditorLanguage;
}) {
  return (
    <textarea
      className="cx-chat-editor-textarea"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      spellCheck={false}
      data-lang={lang}
    />
  );
}

/* ---- floating editor window ---- */

function FloatingEditor({
  copy,
  rect,
  onRectChange,
  content,
  onContentChange,
  editorLang,
  onLangChange,
  fileName,
  onOpenFile,
  onCopy,
  onInsertToChat,
  onClose,
}: {
  copy: ReturnType<typeof getCopy>;
  rect: FloatingRect;
  onRectChange: (r: FloatingRect) => void;
  content: string;
  onContentChange: (v: string) => void;
  editorLang: EditorLanguage;
  onLangChange: (l: EditorLanguage) => void;
  fileName: string;
  onOpenFile: () => void;
  onCopy: () => void;
  onInsertToChat: () => void;
  onClose: () => void;
}) {
  const dragState = React.useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);
  const resizeState = React.useRef<{ sx: number; sy: number; ow: number; oh: number } | null>(null);

  React.useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (dragState.current) {
        const { sx, sy, ox, oy } = dragState.current;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        onRectChange(
          clampRect(
            { ...rect, x: clamp(ox + (e.clientX - sx), 0, Math.max(0, vw - rect.w)), y: clamp(oy + (e.clientY - sy), 0, Math.max(0, vh - rect.h)) },
            vw,
            vh,
          ),
        );
      } else if (resizeState.current) {
        const { sx, sy, ow, oh } = resizeState.current;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        onRectChange(
          clampRect(
            { ...rect, w: ow + (e.clientX - sx), h: oh + (e.clientY - sy) },
            vw,
            vh,
          ),
        );
      }
    };
    const onUp = () => {
      dragState.current = null;
      resizeState.current = null;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [rect, onRectChange]);

  return (
    <div className="cx-chat-floating" style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}>
      <div
        className="cx-chat-floating-titlebar"
        title={copy.dragToMove}
        onPointerDown={(e) => {
          e.preventDefault();
          dragState.current = { sx: e.clientX, sy: e.clientY, ox: rect.x, oy: rect.y };
        }}
      >
        <FileCode2 size={14} />
        <span className="cx-chat-floating-title" title={fileName || copy.noFile}>{fileName || copy.editorTitle}</span>
        <button type="button" className="cx-chat-action-btn" onClick={onOpenFile} title={copy.openFile}>
          <FolderOpen size={14} />
        </button>
        <div className="cx-chat-floating-actions">
          <button type="button" className="cx-chat-action-btn" onClick={onCopy} title={copy.copyCode}>
            <Copy size={14} />
          </button>
          <button type="button" className="cx-chat-action-btn" onClick={onInsertToChat} title={copy.sendWithEditor}>
            <Send size={14} />
          </button>
          <button type="button" className="cx-chat-action-btn" onClick={onClose} title={copy.closeEditor}>
            <X size={14} />
          </button>
        </div>
      </div>
      <div className="cx-chat-floating-toolbar">
        <select
          className="cx-chat-lang-select"
          value={editorLang}
          onChange={(e) => onLangChange(e.target.value as EditorLanguage)}
          aria-label={copy.langLabel}
        >
          {EDITOR_LANGUAGES.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>
      <div className="cx-chat-floating-body">
        <EditorTextarea
          value={content}
          onChange={onContentChange}
          placeholder={copy.editorPlaceholder}
          lang={editorLang}
        />
      </div>
      <div
        className="cx-chat-floating-resize"
        title={copy.resizeHandle}
        onPointerDown={(e) => {
          e.preventDefault();
          resizeState.current = { sx: e.clientX, sy: e.clientY, ow: rect.w, oh: rect.h };
        }}
      >
        <MoveDiagonal2 size={16} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export function ChatEditorPage({
  lang,
  active,
  providerModels = [],
  historySessions = [],
  gatewayRunning = false,
  gatewayPort,
  onGatewayRequest,
}: ChatEditorPageProps) {
  const copy = getCopy(lang);

  /* ---- persistent layout preferences ---- */
  const [editorLayout, setEditorLayoutState] = React.useState<EditorLayout>(() =>
    loadLS<EditorLayout>(LS_LAYOUT, "dock"),
  );
  const [editorVisible, setEditorVisibleState] = React.useState<boolean>(() =>
    loadLS<boolean>(LS_VISIBLE, true),
  );
  const [dockWidth, setDockWidth] = React.useState<number>(() =>
    clamp(loadLS<number>(LS_DOCK_W, DEFAULT_DOCK_WIDTH), MIN_DOCK_WIDTH, MAX_DOCK_WIDTH),
  );
  const [floatingRect, setFloatingRectState] = React.useState<FloatingRect>(() => {
    const saved = loadLS<FloatingRect>(LS_FLOAT, DEFAULT_FLOAT);
    return clampRect(saved, window.innerWidth, window.innerHeight);
  });

  const setEditorLayout = React.useCallback((l: EditorLayout) => {
    setEditorLayoutState(l);
    saveLS(LS_LAYOUT, l);
  }, []);

  const setEditorVisible = React.useCallback((v: boolean) => {
    setEditorVisibleState(v);
    saveLS(LS_VISIBLE, v);
  }, []);

  const updateDockWidth = React.useCallback((w: number) => {
    const next = clamp(w, MIN_DOCK_WIDTH, MAX_DOCK_WIDTH);
    setDockWidth(next);
    saveLS(LS_DOCK_W, next);
  }, []);

  const setFloatingRect = React.useCallback((r: FloatingRect) => {
    const next = clampRect(r, window.innerWidth, window.innerHeight);
    setFloatingRectState(next);
    saveLS(LS_FLOAT, next);
  }, []);

  /* ---- chat / composer state (runtime only) ---- */
  const [sessions, setSessions] = React.useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState("");
  const [editorContent, setEditorContent] = React.useState("");
  const [editorFileName, setEditorFileName] = React.useState("");
  const [editorFileError, setEditorFileError] = React.useState("");
  const [editorLang, setEditorLang] = React.useState<EditorLanguage>("javascript");
  const [streaming, setStreaming] = React.useState(false);
  const [selectedModel, setSelectedModel] = React.useState(providerModels[0] || "");
  const [modelDropdownOpen, setModelDropdownOpen] = React.useState(false);
  const [historyQuery, setHistoryQuery] = React.useState("");
  const [expandedProjects, setExpandedProjects] = React.useState<Record<string, boolean>>(() =>
    loadLS<Record<string, boolean>>("cx.chat.expandedProjects", {}),
  );

  const abortRef = React.useRef<AbortController | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  const session = sessions.find((s) => s.id === activeSessionId) ?? null;

  const groupedHistory = React.useMemo(() => {
    const query = historyQuery.trim().toLowerCase();
    const groups = new Map<string, ChatHistorySession[]>();
    for (const item of historySessions) {
      const haystack = [item.title, item.cwd, item.model, item.id].filter(Boolean).join(" ").toLowerCase();
      if (query && !haystack.includes(query)) continue;
      const key = item.cwd || (lang === "zh" ? "未记录工作目录" : "No workspace recorded");
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(item);
    }
    return Array.from(groups.entries())
      .map(([cwd, items]) => [cwd, items.slice().sort((a, b) => (b.updatedAtMs || 0) - (a.updatedAtMs || 0))] as const)
      .sort((a, b) => a[0].localeCompare(b[0]));
  }, [historyQuery, historySessions, lang]);

  const toggleProject = React.useCallback((cwd: string) => {
    setExpandedProjects((previous) => {
      const next = { ...previous, [cwd]: previous[cwd] === false };
      saveLS("cx.chat.expandedProjects", next);
      return next;
    });
  }, []);

  const recencyBucket = React.useCallback((ts?: number | null) => {
    const age = Date.now() - (ts || 0);
    const day = 24 * 60 * 60 * 1000;
    return age < day ? "today" : age < day * 2 ? "yesterday" : "older";
  }, []);

  const openEditorFile = React.useCallback(async (file?: File) => {
    const selected = file || fileInputRef.current?.files?.[0];
    if (!selected) return;
    try {
      const text = await selected.text();
      setEditorContent(text);
      setEditorFileName(selected.name);
      setEditorFileError("");
      setEditorLang(languageFromFilename(selected.name));
      setEditorVisible(true);
    } catch {
      setEditorFileError(copy.fileReadError);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [copy.fileReadError, setEditorVisible]);

  const handleHistorySession = React.useCallback((item: ChatHistorySession) => {
    const existing = sessions.find((candidate) => candidate.id === `history:${item.id}`);
    if (existing) {
      setActiveSessionId(existing.id);
      return;
    }
    const historySession: ChatSession = {
      id: `history:${item.id}`,
      title: item.title || (lang === "zh" ? "未命名会话" : "Untitled session"),
      messages: [{
        id: `history-context:${item.id}`,
        role: "system",
        content: copy.historyContext,
        timestamp: item.updatedAtMs || Date.now(),
      }],
      model: item.model || "",
      createdAt: item.updatedAtMs || Date.now(),
      cwd: item.cwd || undefined,
    };
    setSessions((prev) => [historySession, ...prev]);
    setActiveSessionId(historySession.id);
  }, [copy.historyContext, lang, sessions]);

  React.useEffect(() => {
    if (providerModels.length > 0 && !selectedModel) {
      setSelectedModel(providerModels[0]);
    }
  }, [providerModels, selectedModel]);

  /* ---- auto-scroll ---- */
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session?.messages.length, session?.messages[session.messages.length - 1]?.content]);

  /* ---- session management ---- */
  const createSession = React.useCallback(() => {
    const sess: ChatSession = {
      id: nextSessId(),
      title: `${copy.newChat} ${sessions.length + 1}`,
      messages: [],
      model: selectedModel,
      createdAt: Date.now(),
    };
    setSessions((prev) => [sess, ...prev]);
    setActiveSessionId(sess.id);
    setDraft("");
  }, [sessions.length, selectedModel, copy.newChat]);

  const deleteSession = React.useCallback((id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSessionId === id) {
      setActiveSessionId(null);
    }
  }, [activeSessionId]);

  const clearChat = React.useCallback(() => {
    if (!activeSessionId) return;
    setSessions((prev) =>
      prev.map((s) => (s.id === activeSessionId ? { ...s, messages: [] } : s)),
    );
  }, [activeSessionId]);

  /* ---- build the outgoing message from draft + inline editor ---- */
  const buildMessageText = React.useCallback(() => {
    const hasEditorCode = editorLayout === "inline" && editorContent.trim().length > 0;
    const parts: string[] = [];
    if (hasEditorCode) {
      parts.push(`\`\`\`${editorLang}\n${editorContent.trim()}\n\`\`\``);
    }
    const text = draft.trim();
    if (text) parts.push(text);
    return parts.join("\n\n");
  }, [draft, editorLayout, editorContent, editorLang]);

  /* ---- send message (single pipeline for all layouts) ---- */
  const sendMessage = React.useCallback(async () => {
    const text = buildMessageText();
    if (!text || streaming) return;

    let sid = activeSessionId;
    if (!sid) {
      const sess: ChatSession = {
        id: nextSessId(),
        title: text.slice(0, 40) || `${copy.newChat}`,
        messages: [],
        model: selectedModel,
        createdAt: Date.now(),
      };
      setSessions((prev) => [sess, ...prev]);
      sid = sess.id;
      setActiveSessionId(sid);
    }

    const userMsg: ChatMessage = {
      id: nextId(),
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === sid ? { ...s, messages: [...s.messages, userMsg], title: s.messages.length === 0 ? text.slice(0, 40) : s.title } : s,
      ),
    );
    setDraft("");

    // In inline mode the editor code is consumed by the message.
    if (editorLayout === "inline" && editorContent.trim()) {
      setEditorContent("");
    }

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const assistantMsg: ChatMessage = {
      id: nextId(),
      role: "assistant",
      content: "",
      timestamp: Date.now(),
      streaming: true,
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === sid ? { ...s, messages: [...s.messages, assistantMsg] } : s,
      ),
    );

    setStreaming(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      if (gatewayRunning && onGatewayRequest && gatewayPort) {
        const res = await onGatewayRequest("POST", "/v1/chat/completions", {
          model: selectedModel || "gpt-4",
          messages: [
            ...(sessions.find((s) => s.id === sid)?.messages.map((m) => ({
              role: m.role,
              content: m.content,
            })) ?? []),
            { role: "user", content: text },
          ],
          stream: false,
        });

        const reply =
          (res as { choices?: { message?: { content?: string } }[] })?.choices?.[0]?.message
            ?.content ?? "[No response]";

        setSessions((prev) =>
          prev.map((s) =>
            s.id === sid
              ? {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === assistantMsg.id
                      ? { ...m, content: reply, streaming: false }
                      : m,
                  ),
                }
              : s,
          ),
        );
      } else {
        const simulated = lang === "zh"
          ? `收到你的消息："${text.slice(0, 60)}"\n\n这是一条模拟回复。请启动本地网关并配置供应商以使用真实的 AI 对话。\n\n\`\`\`javascript\nconsole.log("Hello from Codex-X-Pro!");\n\`\`\``
          : `Received your message: "${text.slice(0, 60)}"\n\nThis is a simulated reply. Start the local gateway and configure a provider for real AI conversation.\n\n\`\`\`javascript\nconsole.log("Hello from Codex-X-Pro!");\n\`\`\``;

        let progress = 0;
        const words = simulated.split("");
        const tick = () => {
          if (ctrl.signal.aborted) return;
          progress += Math.floor(Math.random() * 3) + 1;
          if (progress > words.length) progress = words.length;
          const partial = words.slice(0, progress).join("");
          setSessions((prev) =>
            prev.map((s) =>
              s.id === sid
                ? {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === assistantMsg.id
                        ? { ...m, content: partial, streaming: progress < words.length }
                        : m,
                    ),
                  }
                : s,
            ),
          );
          if (progress < words.length) {
            setTimeout(tick, 18);
          }
        };
        setTimeout(tick, 300);
      }
    } catch {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sid
            ? {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === assistantMsg.id
                    ? { ...m, content: "[Error]", streaming: false }
                    : m,
                ),
              }
            : s,
        ),
      );
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [
    buildMessageText,
    streaming,
    activeSessionId,
    sessions,
    selectedModel,
    gatewayRunning,
    onGatewayRequest,
    gatewayPort,
    lang,
    copy.newChat,
    editorLayout,
    editorContent,
  ]);

  const stopStreaming = React.useCallback(() => {
    abortRef.current?.abort();
    setStreaming(false);
  }, []);

  /* ---- editor actions (shared across layouts) ---- */
  const applyToEditor = React.useCallback((code: string) => {
    setEditorContent(code);
    setEditorVisible(true);
  }, []);

  const insertCodeToChat = React.useCallback(() => {
    if (!editorContent.trim()) return;
    setDraft((d) => `${d}\n\`\`\`${editorLang}\n${editorContent}\n\`\`\`\n`);
    textareaRef.current?.focus();
  }, [editorContent, editorLang]);

  const copyEditor = React.useCallback(() => {
    if (editorContent) navigator.clipboard.writeText(editorContent);
  }, [editorContent]);

  const toggleEditorLayout = React.useCallback(() => {
    setEditorLayout(editorLayout === "dock" ? "inline" : editorLayout === "inline" ? "floating" : "dock");
  }, [editorLayout, setEditorLayout]);

  /* ---- keyboard ---- */
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage],
  );

  /* ---- auto-resize textarea ---- */
  const handleInput = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, []);

  /* ---- close model dropdown on outside click ---- */
  const modelRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    if (!modelDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (modelRef.current && !modelRef.current.contains(e.target as Node)) {
        setModelDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [modelDropdownOpen]);

  /* ---- dock width resize ---- */
  const dockDragState = React.useRef<{ startX: number; startW: number } | null>(null);
  React.useEffect(() => {
    if (!dockDragState.current) return;
    const onMove = (e: PointerEvent) => {
      const state = dockDragState.current;
      if (!state) return;
      updateDockWidth(state.startW - (e.clientX - state.startX));
    };
    const onUp = () => {
      dockDragState.current = null;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [updateDockWidth]);

  /* ---- render ---- */
  if (active === false) return null;

  const editorShown = editorVisible && (editorLayout === "dock" || editorLayout === "floating");

  return (
    <section className="cx-chat-editor cx-page">
      <input
        ref={fileInputRef}
        className="cx-chat-file-input"
        type="file"
        accept=".js,.jsx,.mjs,.cjs,.ts,.tsx,.py,.rs,.html,.htm,.css,.json,.md,.sql,.sh,.bash,.toml,.yaml,.yml,.txt"
        onChange={(e) => void openEditorFile(e.target.files?.[0])}
      />
      {editorFileError && (
        <div className="cx-chat-file-error" role="alert">{editorFileError}</div>
      )}
        {/* ---- page header (compact) ---- */}
      <header className="cx-page-header cx-chat-editor-header">
        <div className="cx-page-header-copy">
          <div className="cx-page-eyebrow">{copy.eyebrow}</div>
          <h2>{copy.title}</h2>
        </div>
        <div className="cx-chat-header-actions">
          {/* model selector */}
          <div className="cx-chat-model-select" ref={modelRef}>
            <button
              type="button"
              className="cx-chat-model-btn"
              onClick={() => setModelDropdownOpen((o) => !o)}
            >
              <Bot size={14} />
              <span>{selectedModel || copy.noModel}</span>
              <ChevronDown size={13} />
            </button>
            {modelDropdownOpen && (
              <div className="cx-chat-model-dropdown">
                {providerModels.length === 0 && (
                  <div className="cx-chat-model-empty">{copy.noModel}</div>
                )}
                {providerModels.map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={cx("cx-chat-model-option", m === selectedModel && "cx-chat-model-option--active")}
                    onClick={() => {
                      setSelectedModel(m);
                      setModelDropdownOpen(false);
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* layout switch */}
          <div className="cx-chat-layout-switch" role="group" aria-label={copy.editorLayout}>
            <button
              type="button"
              className={cx("cx-chat-layout-btn", editorLayout === "dock" && "cx-chat-layout-btn--active")}
              onClick={() => setEditorLayout("dock")}
              title={copy.layoutDock}
            >
              <PanelRight size={15} />
            </button>
            <button
              type="button"
              className={cx("cx-chat-layout-btn", editorLayout === "inline" && "cx-chat-layout-btn--active")}
              onClick={() => setEditorLayout("inline")}
              title={copy.layoutInline}
            >
              <TextCursorInput size={15} />
            </button>
            <button
              type="button"
              className={cx("cx-chat-layout-btn", editorLayout === "floating" && "cx-chat-layout-btn--active")}
              onClick={() => setEditorLayout("floating")}
              title={copy.layoutFloating}
            >
              <PictureInPicture2 size={15} />
            </button>
          </div>

          <button type="button" className="cx-chat-header-btn" onClick={createSession} title={copy.newChat}>
            <Plus size={15} /> {copy.newChat}
          </button>

          {editorLayout !== "inline" && (
            <button
              type="button"
              className="cx-chat-header-btn"
              onClick={() => setEditorVisible(!editorVisible)}
              title={editorVisible ? copy.hideEditor : copy.showEditor}
            >
              {editorVisible ? <PanelRightClose size={15} /> : <PanelRightOpen size={15} />}
            </button>
          )}
        </div>
      </header>

      <div className="cx-chat-context-bar">
        <div className="cx-chat-context-breadcrumb">
          <FolderOpen size={14} />
          <span>{compactPath(session?.cwd || historySessions[0]?.cwd, 44)}</span>
          {editorFileName && <><ChevronRight size={13} /><span>{editorFileName}</span></>}
        </div>
        <span className={cx("cx-chat-gateway-state", gatewayRunning && "cx-chat-gateway-state--online")}>
          <span />{gatewayRunning ? "Gateway online" : "Gateway offline"}
        </span>
      </div>

        {/* ---- main workspace ---- */}
      <div
        className={cx(
          "cx-chat-workspace",
          !editorShown && "cx-chat-workspace--full",
          editorLayout === "inline" && "cx-chat-workspace--inline",
        )}
        style={editorLayout === "dock" && editorShown ? { gridTemplateColumns: `200px 1fr ${dockWidth}px` } : undefined}
      >
        {/* ---- session sidebar ---- */}
        <aside className="cx-chat-sessions">
          <div className="cx-chat-workspace-label"><FolderOpen size={14} />{copy.workspace}</div>
          <div className="cx-chat-project-context" title={session?.cwd || historySessions[0]?.cwd || undefined}>
            <span className="cx-chat-project-dot" />
            <span>{compactPath(session?.cwd || historySessions[0]?.cwd, 26)}</span>
          </div>
          <label className="cx-chat-history-search">
            <Search size={14} />
            <input value={historyQuery} onChange={(e) => setHistoryQuery(e.target.value)} placeholder={copy.searchHistory} />
          </label>
          <div className="cx-chat-session-section-title">{copy.currentChats}</div>
          {sessions.length === 0 && (
            <div className="cx-chat-sessions-empty">{copy.noSessions}</div>
          )}
          {sessions.map((s) => (
            <button
              key={s.id}
              type="button"
              className={cx("cx-chat-session-item", s.id === activeSessionId && "cx-chat-session-item--active")}
              onClick={() => setActiveSessionId(s.id)}
            >
              <MessageSquare size={14} />
              <span className="cx-chat-session-title">{s.title}</span>
              <span
                className="cx-chat-session-delete"
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSession(s.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.stopPropagation();
                    deleteSession(s.id);
                  }
                }}
                title={copy.deleteSession}
              >
                <Trash2 size={12} />
              </span>
            </button>
          ))}
          <div className="cx-chat-session-section-title">{copy.projectHistory}</div>
          {groupedHistory.length === 0 && (
            <div className="cx-chat-sessions-empty">{copy.noHistory}</div>
          )}
          {groupedHistory.map(([cwd, items]) => (
            <div className="cx-chat-history-group" key={cwd}>
              <div className="cx-chat-history-heading" title={cwd}>
                <button type="button" className="cx-chat-history-toggle" onClick={() => toggleProject(cwd)} aria-label={cwd}>
                  {expandedProjects[cwd] === false ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                  <span>{compactPath(cwd)}</span>
                </button>
                <em>{items.length}</em>
              </div>
              {expandedProjects[cwd] !== false && items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={cx("cx-chat-session-item", activeSessionId === `history:${item.id}` && "cx-chat-session-item--active")}
                  onClick={() => handleHistorySession(item)}
                  title={item.cwd || undefined}
                >
                  <History size={14} />
                  <span className="cx-chat-session-title">{item.title || (lang === "zh" ? "未命名会话" : "Untitled session")}</span>
                  <small>{recencyBucket(item.updatedAtMs) === "today" ? copy.today : recencyBucket(item.updatedAtMs) === "yesterday" ? copy.yesterday : copy.older}</small>
                </button>
              ))}
            </div>
          ))}
        </aside>

        {/* ---- chat panel ---- */}
        <div className="cx-chat-panel">
          {!gatewayRunning && (
            <div className="cx-chat-gateway-warn">{copy.gatewayOffline}</div>
          )}

          <div className="cx-chat-messages">
            {(!session || session.messages.length === 0) && <EmptyState copy={copy} />}
            {session?.messages.map((msg) => (
              <ChatBubble
                key={msg.id}
                message={msg}
                copy={copy}
                onApplyToEditor={applyToEditor}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* ---- inline editor (part of the composer) ---- */}
          {editorLayout === "inline" && editorVisible && (
            <div className="cx-chat-inline-editor">
              <EditorToolbar
                copy={copy}
                editorLang={editorLang}
                fileName={editorFileName}
                onOpenFile={() => fileInputRef.current?.click()}
                onLangChange={setEditorLang}
                onCopy={copyEditor}
                onInsertToChat={insertCodeToChat}
                onClose={() => setEditorVisible(false)}
                compact
              />
              <EditorTextarea
                value={editorContent}
                onChange={setEditorContent}
                placeholder={copy.editorPlaceholder}
                lang={editorLang}
              />
            </div>
          )}

          {/* ---- composer bar ---- */}
          <div className="cx-chat-composer">
            <div className="cx-chat-composer-inner">
              <div className="cx-chat-composer-context">
                {editorFileName && <span><FileCode2 size={12} />{editorFileName}</span>}
                {session?.cwd && <span><FolderOpen size={12} />{compactPath(session.cwd, 28)}</span>}
              </div>
              <textarea
                ref={textareaRef}
                className="cx-chat-input"
                value={draft}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder={copy.placeholder}
                rows={1}
                disabled={streaming}
              />
              <div className="cx-chat-composer-actions">
                {editorContent.trim() && editorLayout !== "inline" && (
                  <button type="button" className="cx-chat-action-btn" onClick={insertCodeToChat} title={copy.insertCode}>
                    <Code2 size={15} />
                  </button>
                )}
                {session && session.messages.length > 0 && !streaming && (
                  <button type="button" className="cx-chat-action-btn cx-chat-action-btn--danger" onClick={clearChat} title={copy.clearChat}>
                    <Eraser size={15} />
                  </button>
                )}
                {streaming ? (
                  <button type="button" className="cx-chat-send-btn cx-chat-send-btn--stop" onClick={stopStreaming} title={copy.stop}>
                    <Square size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="cx-chat-send-btn"
                    onClick={sendMessage}
                    disabled={!buildMessageText()}
                    title={copy.send}
                  >
                    <Send size={15} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ---- dock editor ---- */}
        {editorLayout === "dock" && editorVisible && (
          <>
            <div
              className="cx-chat-dock-resize"
              onPointerDown={(e) => {
                e.preventDefault();
                dockDragState.current = { startX: e.clientX, startW: dockWidth };
              }}
              title={copy.resizeDock}
            />
            <div className="cx-chat-editor-panel" style={{ width: dockWidth }}>
              <EditorToolbar
                copy={copy}
                editorLang={editorLang}
                fileName={editorFileName}
                onOpenFile={() => fileInputRef.current?.click()}
                onLangChange={setEditorLang}
                onCopy={copyEditor}
                onInsertToChat={insertCodeToChat}
                onClose={() => setEditorVisible(false)}
              />
              <EditorTextarea
                value={editorContent}
                onChange={setEditorContent}
                placeholder={copy.editorPlaceholder}
                lang={editorLang}
              />
            </div>
          </>
        )}
      </div>

      {/* ---- floating editor overlay ---- */}
      {editorLayout === "floating" && editorVisible && (
        <FloatingEditor
          copy={copy}
          rect={floatingRect}
          onRectChange={setFloatingRect}
          content={editorContent}
          onContentChange={setEditorContent}
          editorLang={editorLang}
          onLangChange={setEditorLang}
          fileName={editorFileName}
          onOpenFile={() => fileInputRef.current?.click()}
          onCopy={copyEditor}
          onInsertToChat={insertCodeToChat}
          onClose={() => setEditorVisible(false)}
        />
      )}
    </section>
  );
}