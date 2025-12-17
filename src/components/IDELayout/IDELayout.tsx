import { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";

interface IDELayoutProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
}

interface TabPanelProps {
  tabs: {
    id: string;
    label: string;
    icon?: ReactNode;
    content: ReactNode;
    badge?: string | number;
  }[];
  defaultTab?: string;
}

interface ResizablePanelProps {
  topContent: ReactNode;
  bottomContent: ReactNode;
  defaultBottomHeight?: number;
  minBottomHeight?: number;
  maxBottomHeight?: number;
}

// Tab Panel Component for the left side
export function TabPanel({ tabs, defaultTab }: TabPanelProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  return (
    <div className="flex flex-col h-full">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200
              ${activeTab === tab.id
                ? "text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700/50"
              }
            `}
          >
            {tab.icon && <span className="text-lg">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className={`
                px-1.5 py-0.5 text-xs font-bold rounded-full
                ${activeTab === tab.id
                  ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400"
                  : "bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-400"
                }
              `}>
                {tab.badge}
              </span>
            )}
            {/* Active indicator */}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`h-full overflow-y-auto ${activeTab === tab.id ? "block" : "hidden"}`}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
}

// Resizable Panel for Editor + Console
export function ResizablePanel({
  topContent,
  bottomContent,
  defaultBottomHeight = 200,
  minBottomHeight = 100,
  maxBottomHeight = 400,
}: ResizablePanelProps) {
  const [bottomHeight, setBottomHeight] = useState(defaultBottomHeight);
  const [isResizing, setIsResizing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);

    const startY = e.clientY;
    const startHeight = bottomHeight;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = startY - moveEvent.clientY;
      const newHeight = Math.min(
        Math.max(startHeight + delta, minBottomHeight),
        maxBottomHeight
      );
      setBottomHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top Content (Editor) */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {topContent}
      </div>

      {/* Resize Handle */}
      <div
        className={`
          relative h-1.5 cursor-row-resize group flex items-center justify-center
          bg-gray-100 dark:bg-slate-800 border-y border-gray-200 dark:border-slate-700
          hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors
          ${isResizing ? "bg-indigo-200 dark:bg-indigo-900/50" : ""}
        `}
        onMouseDown={handleMouseDown}
      >
        <div className="absolute inset-x-0 flex justify-center">
          <div className={`
            w-10 h-1 rounded-full transition-colors
            ${isResizing
              ? "bg-indigo-500 dark:bg-indigo-400"
              : "bg-gray-300 dark:bg-slate-600 group-hover:bg-indigo-400 dark:group-hover:bg-indigo-500"
            }
          `} />
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-700"
        >
          <svg
            className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${isCollapsed ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Bottom Content (Console) */}
      <div
        className={`overflow-hidden transition-all duration-200 ${isCollapsed ? "h-0" : ""}`}
        style={{ height: isCollapsed ? 0 : bottomHeight }}
      >
        {bottomContent}
      </div>
    </div>
  );
}

// Main IDE Layout
export function IDELayout({ leftPanel, rightPanel }: IDELayoutProps) {
  return (
    <div className="h-[calc(100vh-120px)] flex overflow-hidden">
      {/* Left Panel - Context Zone (40%) */}
      <div className="w-[40%] min-w-[300px] max-w-[500px] border-r border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col">
        {leftPanel}
      </div>

      {/* Right Panel - Action Zone (60%) */}
      <div className="flex-1 bg-gray-50 dark:bg-slate-950 flex flex-col overflow-hidden">
        {rightPanel}
      </div>
    </div>
  );
}

// Mobile Layout - Stacked
export function MobileIDELayout({ tabs, editor, console: consoleOutput, actions }: {
  tabs: TabPanelProps["tabs"];
  editor: ReactNode;
  console: ReactNode;
  actions: ReactNode;
}) {
  const [activeView, setActiveView] = useState<"context" | "editor">("editor");

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* View Toggle */}
      <div className="flex border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <button
          onClick={() => setActiveView("context")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${activeView === "context"
              ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
              : "text-gray-600 dark:text-gray-400"
            }`}
        >
          📋 Context
        </button>
        <button
          onClick={() => setActiveView("editor")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${activeView === "editor"
              ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
              : "text-gray-600 dark:text-gray-400"
            }`}
        >
          💻 Editor
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeView === "context" ? (
          <TabPanel tabs={tabs} />
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-hidden p-4">
              {editor}
            </div>
            <div className="h-48 border-t border-gray-200 dark:border-slate-700 overflow-hidden">
              {consoleOutput}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Actions Bar */}
      <div className="border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3">
        {actions}
      </div>
    </div>
  );
}
