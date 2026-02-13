import type { FileSystemState } from "@/types/fs";

const now = Date.now();

export const INITIAL_FILE_SYSTEM: FileSystemState = {
  rootId: "root",
  items: {
    // ─── Root ───
    root: {
      id: "root",
      parentId: null,
      name: "/",
      type: "folder",
      children: ["home"],
      createdAt: now,
    },

    // ─── Home ───
    home: {
      id: "home",
      parentId: "root",
      name: "Home",
      type: "folder",
      children: ["desktop", "documents", "downloads", "pictures"],
      createdAt: now,
    },

    // ─── Desktop ───
    desktop: {
      id: "desktop",
      parentId: "home",
      name: "Desktop",
      type: "folder",
      children: ["welcome-txt", "roadmap-md"],
      createdAt: now,
    },
    "welcome-txt": {
      id: "welcome-txt",
      parentId: "desktop",
      name: "Welcome.txt",
      type: "text",
      content:
        "Welcome to ValentineOS!\n\nThis is your new macOS-inspired Web Operating System.\nBuilt with Next.js, Jotai, Tailwind CSS, and Framer Motion.\n\nHappy Valentine's Day! 💕",
      createdAt: now,
    },
    "roadmap-md": {
      id: "roadmap-md",
      parentId: "desktop",
      name: "Project_Nebula_Roadmap.md",
      type: "code",
      content:
        "# Project Nebula Roadmap\n\n## Completed\n- [x] Desktop & Wallpaper Engine\n- [x] Dock with magnification\n- [x] Draggable desktop icons\n- [x] Window system (drag, resize, z-index)\n- [x] App integration\n- [x] File system & Finder\n\n## Upcoming\n- [ ] Text editor app\n- [ ] Image viewer app\n- [ ] System preferences\n- [ ] Context menus\n- [ ] Notifications",
      createdAt: now,
    },

    // ─── Documents ───
    documents: {
      id: "documents",
      parentId: "home",
      name: "Documents",
      type: "folder",
      children: ["resume-pdf", "notes-txt"],
      createdAt: now,
    },
    "resume-pdf": {
      id: "resume-pdf",
      parentId: "documents",
      name: "Resume.pdf",
      type: "text",
      content: "[Mock PDF] Mduduzi Ndlovu — Software Developer\nSkills: TypeScript, React, Next.js, Node.js\nExperience: Building beautiful web applications.",
      createdAt: now,
    },
    "notes-txt": {
      id: "notes-txt",
      parentId: "documents",
      name: "Notes.txt",
      type: "text",
      content:
        "Meeting Notes — Feb 14\n\n- Finalize ValentineOS UI\n- Add file system navigation\n- Test window drag & resize\n- Deploy to production",
      createdAt: now,
    },

    // ─── Downloads ───
    downloads: {
      id: "downloads",
      parentId: "home",
      name: "Downloads",
      type: "folder",
      children: [],
      createdAt: now,
    },

    // ─── Pictures ───
    pictures: {
      id: "pictures",
      parentId: "home",
      name: "Pictures",
      type: "folder",
      children: ["pic-roses", "pic-hearts", "pic-sunset"],
      createdAt: now,
    },
    "pic-roses": {
      id: "pic-roses",
      parentId: "pictures",
      name: "Roses.jpg",
      type: "image",
      content: "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=800&q=80",
      createdAt: now,
    },
    "pic-hearts": {
      id: "pic-hearts",
      parentId: "pictures",
      name: "Hearts.jpg",
      type: "image",
      content: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&q=80",
      createdAt: now,
    },
    "pic-sunset": {
      id: "pic-sunset",
      parentId: "pictures",
      name: "Valentine_Sunset.jpg",
      type: "image",
      content: "https://images.unsplash.com/photo-1494548162494-384bba4ab999?w=800&q=80",
      createdAt: now,
    },
  },
};
