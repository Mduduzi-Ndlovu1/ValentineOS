"use client";

import { useState, useCallback, useMemo } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  Folder,
  FileText,
  Image,
  Music,
  Code,
  ChevronLeft,
  ChevronRight,
  Monitor,
  FileDown,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { folderContentsAtom, breadcrumbAtom } from "@/store/atoms/filesystem";
import { openFileAtom } from "@/store/actions/fileActions";
import type { FileSystemItem, ItemType } from "@/types/fs";

// ─── Icon map by file type ───
const TYPE_ICONS: Record<ItemType, LucideIcon> = {
  folder: Folder,
  text: FileText,
  image: Image,
  music: Music,
  code: Code,
};

// ─── Sidebar quick-access items ───
const SIDEBAR_ITEMS = [
  { id: "desktop", label: "Desktop", icon: Monitor },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "downloads", label: "Downloads", icon: FileDown },
  { id: "pictures", label: "Pictures", icon: Image },
] as const;

export function Finder() {
  // Navigation state
  const [currentFolderId, setCurrentFolderId] = useState("home");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [historyStack, setHistoryStack] = useState<string[]>(["home"]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Atom-derived data
  const getFolderContents = useAtomValue(folderContentsAtom);
  const getBreadcrumb = useAtomValue(breadcrumbAtom);
  const openFile = useSetAtom(openFileAtom);

  const contents = useMemo(
    () => getFolderContents(currentFolderId),
    [getFolderContents, currentFolderId]
  );

  const breadcrumbs = useMemo(
    () => getBreadcrumb(currentFolderId),
    [getBreadcrumb, currentFolderId]
  );

  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < historyStack.length - 1;

  // ─── Navigation helpers ───
  const navigateTo = useCallback(
    (folderId: string) => {
      setCurrentFolderId(folderId);
      setSelectedItemId(null);

      // Truncate forward history and push new entry
      const newStack = [...historyStack.slice(0, historyIndex + 1), folderId];
      setHistoryStack(newStack);
      setHistoryIndex(newStack.length - 1);
    },
    [historyStack, historyIndex]
  );

  const goBack = useCallback(() => {
    if (!canGoBack) return;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    setCurrentFolderId(historyStack[newIndex]);
    setSelectedItemId(null);
  }, [canGoBack, historyIndex, historyStack]);

  const goForward = useCallback(() => {
    if (!canGoForward) return;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    setCurrentFolderId(historyStack[newIndex]);
    setSelectedItemId(null);
  }, [canGoForward, historyIndex, historyStack]);

  // ─── Item interactions ───
  const handleItemClick = useCallback((item: FileSystemItem) => {
    setSelectedItemId(item.id);
  }, []);

  const handleItemDoubleClick = useCallback(
    (item: FileSystemItem) => {
      if (item.type === "folder") {
        navigateTo(item.id);
      } else {
        openFile(item.id);
      }
    },
    [navigateTo, openFile]
  );

  // Clear selection when clicking empty area
  const handleMainAreaClick = useCallback(() => {
    setSelectedItemId(null);
  }, []);

  return (
    <div className="flex h-full overflow-hidden">
      {/* ─── Sidebar ─── */}
      <div className="w-48 bg-base-200/50 backdrop-blur-md border-r border-base-300 flex flex-col p-2 gap-1 shrink-0">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 px-2 pt-1 pb-1">
          Favorites
        </span>
        {SIDEBAR_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => navigateTo(id)}
            className={`btn btn-ghost btn-sm justify-start font-normal text-gray-700 gap-2 ${
              currentFolderId === id ? "bg-black/10" : ""
            }`}
          >
            <Icon className="w-4 h-4 opacity-60" />
            {label}
          </button>
        ))}
        <div className="border-t border-base-300 my-1" />
        <button
          className="btn btn-ghost btn-sm justify-start font-normal text-gray-400 gap-2 cursor-not-allowed"
          disabled
        >
          <Trash2 className="w-4 h-4 opacity-40" />
          Trash
        </button>
      </div>

      {/* ─── Main Content Area ─── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ─── Top Bar ─── */}
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-base-300 bg-base-100/50 shrink-0">
          {/* Back / Forward */}
          <button
            onClick={goBack}
            disabled={!canGoBack}
            className="btn btn-ghost btn-xs btn-circle"
          >
            <ChevronLeft
              className={`w-4 h-4 ${canGoBack ? "text-gray-700" : "text-gray-300"}`}
            />
          </button>
          <button
            onClick={goForward}
            disabled={!canGoForward}
            className="btn btn-ghost btn-xs btn-circle"
          >
            <ChevronRight
              className={`w-4 h-4 ${canGoForward ? "text-gray-700" : "text-gray-300"}`}
            />
          </button>

          {/* Breadcrumbs */}
          <div className="flex items-center gap-1 text-xs text-gray-500 overflow-hidden ml-1">
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb.id} className="flex items-center gap-1 shrink-0">
                {i > 0 && <span className="text-gray-300">/</span>}
                <button
                  onClick={() => navigateTo(crumb.id)}
                  className={`hover:text-gray-800 transition-colors truncate ${
                    i === breadcrumbs.length - 1
                      ? "text-gray-800 font-medium"
                      : ""
                  }`}
                >
                  {crumb.name}
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* ─── Grid View ─── */}
        <div
          className="flex-1 bg-white/90 p-4 overflow-y-auto"
          onClick={handleMainAreaClick}
        >
          {contents.length === 0 ? (
            <div className="flex items-center justify-center h-full text-sm text-gray-400">
              This folder is empty
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-4">
              {contents.map((item) => (
                <FileIcon
                  key={item.id}
                  item={item}
                  isSelected={selectedItemId === item.id}
                  onClick={handleItemClick}
                  onDoubleClick={handleItemDoubleClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── File Icon Component ───
interface FileIconProps {
  item: FileSystemItem;
  isSelected: boolean;
  onClick: (item: FileSystemItem) => void;
  onDoubleClick: (item: FileSystemItem) => void;
}

function FileIcon({ item, isSelected, onClick, onDoubleClick }: FileIconProps) {
  const Icon = TYPE_ICONS[item.type];

  return (
    <div
      className={`flex flex-col items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
        isSelected
          ? "bg-blue-500/20 ring-1 ring-blue-500"
          : "hover:bg-blue-500/10"
      }`}
      onClick={(e) => {
        e.stopPropagation();
        onClick(item);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick(item);
      }}
    >
      <Icon
        className={`w-12 h-12 ${
          item.type === "folder" ? "text-blue-400" : "text-gray-400"
        }`}
        strokeWidth={1.2}
      />
      <span className="text-xs text-center truncate w-full px-1">
        {item.name}
      </span>
    </div>
  );
}
