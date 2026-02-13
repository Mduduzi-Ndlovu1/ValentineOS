import { atom } from "jotai";
import { fileSystemAtom } from "@/store/atoms/filesystem";
import { openWindowAtom } from "@/store/atoms/windows";

export const openFileAtom = atom(null, (get, set, fileId: string) => {
  const fs = get(fileSystemAtom);
  const file = fs.items[fileId];
  if (!file) return;

  switch (file.type) {
    case "text":
    case "code":
      set(openWindowAtom, {
        appId: "text-editor",
        title: file.name,
        props: { content: file.content },
      });
      break;

    case "image":
      set(openWindowAtom, {
        appId: "image-viewer",
        title: file.name,
        props: { imageUrl: file.content },
      });
      break;

    case "folder":
      set(openWindowAtom, { appId: "finder" });
      break;

    case "music":
      // Placeholder — no music player yet
      break;
  }
});
