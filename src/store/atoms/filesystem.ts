import { atom } from "jotai";
import type { FileSystemState, FileSystemItem } from "@/types/fs";
import { INITIAL_FILE_SYSTEM } from "@/config/initialFileSystem";

export const fileSystemAtom = atom<FileSystemState>(INITIAL_FILE_SYSTEM);

// Derived read-only atom: get children of a folder by ID
export const folderContentsAtom = atom((get) => {
  const fs = get(fileSystemAtom);
  return (folderId: string): FileSystemItem[] => {
    const folder = fs.items[folderId];
    if (!folder || folder.type !== "folder" || !folder.children) return [];
    return folder.children
      .map((childId) => fs.items[childId])
      .filter(Boolean);
  };
});

// Derived read-only atom: get a single item by ID
export const fileSystemItemAtom = atom((get) => {
  const fs = get(fileSystemAtom);
  return (itemId: string): FileSystemItem | undefined => fs.items[itemId];
});

// Derived read-only atom: build breadcrumb path from root to a given item
export const breadcrumbAtom = atom((get) => {
  const fs = get(fileSystemAtom);
  return (itemId: string): FileSystemItem[] => {
    const path: FileSystemItem[] = [];
    let current = fs.items[itemId];
    while (current) {
      path.unshift(current);
      current = current.parentId ? fs.items[current.parentId] : undefined!;
    }
    return path;
  };
});
