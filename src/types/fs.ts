// ─── File System Types ───

export type ItemType = "folder" | "image" | "text" | "music" | "code";

export interface FileSystemItem {
  id: string;
  parentId: string | null;
  name: string;
  type: ItemType;
  content?: string;
  children?: string[];
  createdAt: number;
}

export interface FileSystemState {
  items: Record<string, FileSystemItem>;
  rootId: string;
}
