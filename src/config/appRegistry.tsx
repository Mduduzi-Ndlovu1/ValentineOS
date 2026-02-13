import { FolderOpen, Settings, Globe, FileText, Eye } from "lucide-react";
import type { AppRegistryEntry, AppID } from "@/types/os";
import { Finder } from "@/components/apps/finder/Finder";
import { TextEditor } from "@/components/apps/TextEditor";
import { ImageViewer } from "@/components/apps/ImageViewer";

// Placeholder app components (Settings & Browser — to be replaced later)

function SettingsApp() {
  return <div className="p-4 text-sm text-neutral">Settings — System Preferences</div>;
}

function BrowserApp() {
  return <div className="p-4 text-sm text-neutral">Browser — Web Browser</div>;
}

export const APP_REGISTRY: AppRegistryEntry[] = [
  {
    id: "finder",
    name: "Finder",
    icon: FolderOpen,
    defaultSize: { width: 800, height: 500 },
    defaultPosition: { x: 100, y: 100 },
    component: Finder,
  },
  {
    id: "settings",
    name: "Settings",
    icon: Settings,
    defaultSize: { width: 600, height: 450 },
    defaultPosition: { x: 150, y: 120 },
    component: SettingsApp,
  },
  {
    id: "browser",
    name: "Browser",
    icon: Globe,
    defaultSize: { width: 900, height: 600 },
    defaultPosition: { x: 200, y: 80 },
    component: BrowserApp,
  },
  {
    id: "text-editor",
    name: "Text Editor",
    icon: FileText,
    defaultSize: { width: 500, height: 600 },
    defaultPosition: { x: 180, y: 60 },
    component: TextEditor,
  },
  {
    id: "image-viewer",
    name: "Preview",
    icon: Eye,
    defaultSize: { width: 600, height: 500 },
    defaultPosition: { x: 200, y: 80 },
    component: ImageViewer,
  },
];

export const APP_REGISTRY_MAP = new Map<AppID, AppRegistryEntry>(
  APP_REGISTRY.map((entry) => [entry.id, entry])
);

export function getAppEntry(id: AppID): AppRegistryEntry {
  const entry = APP_REGISTRY_MAP.get(id);
  if (!entry) throw new Error(`App not found: ${id}`);
  return entry;
}
