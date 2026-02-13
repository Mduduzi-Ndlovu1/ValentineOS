import { atom } from "jotai";
import type {
  WindowInstance,
  AppID,
  WindowPosition,
  WindowSize,
  WindowAppProps,
} from "@/types/os";
import { getAppEntry } from "@/config/appRegistry";

// ─── Core State ───
export const openWindowsAtom = atom<WindowInstance[]>([]);
export const focusedWindowAtom = atom<string | null>(null);
const zIndexCounterAtom = atom<number>(100);

// ─── Actions ───

export const openWindowAtom = atom(
  null,
  (
    get,
    set,
    payload: AppID | { appId: AppID; title?: string; props?: WindowAppProps }
  ) => {
    const { appId, title, props } =
      typeof payload === "string"
        ? { appId: payload, title: undefined, props: undefined }
        : payload;

    const app = getAppEntry(appId);
    const zIndex = get(zIndexCounterAtom) + 1;
    set(zIndexCounterAtom, zIndex);

    const newWindow: WindowInstance = {
      id: `${appId}-${Date.now()}`,
      appId,
      title: title ?? app.name,
      position: { ...app.defaultPosition },
      size: { ...app.defaultSize },
      zIndex,
      isMinimized: false,
      isMaximized: false,
      props,
    };

    set(openWindowsAtom, [...get(openWindowsAtom), newWindow]);
    set(focusedWindowAtom, newWindow.id);
  }
);

export const closeWindowAtom = atom(null, (get, set, windowId: string) => {
  const windows = get(openWindowsAtom).filter((w) => w.id !== windowId);
  set(openWindowsAtom, windows);
  if (get(focusedWindowAtom) === windowId) {
    set(
      focusedWindowAtom,
      windows.length > 0 ? windows[windows.length - 1].id : null
    );
  }
});

export const focusWindowAtom = atom(null, (get, set, windowId: string) => {
  const zIndex = get(zIndexCounterAtom) + 1;
  set(zIndexCounterAtom, zIndex);
  set(
    openWindowsAtom,
    get(openWindowsAtom).map((w) =>
      w.id === windowId ? { ...w, zIndex } : w
    )
  );
  set(focusedWindowAtom, windowId);
});

export const minimizeWindowAtom = atom(null, (get, set, windowId: string) => {
  set(
    openWindowsAtom,
    get(openWindowsAtom).map((w) =>
      w.id === windowId ? { ...w, isMinimized: !w.isMinimized } : w
    )
  );
});

export const maximizeWindowAtom = atom(null, (get, set, windowId: string) => {
  set(
    openWindowsAtom,
    get(openWindowsAtom).map((w) => {
      if (w.id !== windowId) return w;
      if (w.isMaximized) {
        return {
          ...w,
          isMaximized: false,
          position: w.preMaximizeRect?.position ?? w.position,
          size: w.preMaximizeRect?.size ?? w.size,
          preMaximizeRect: undefined,
        };
      }
      return {
        ...w,
        isMaximized: true,
        preMaximizeRect: { position: w.position, size: w.size },
        position: { x: 0, y: 0 },
        size: {
          width: typeof window !== "undefined" ? window.innerWidth : 1280,
          height:
            (typeof window !== "undefined" ? window.innerHeight : 720) - 80,
        },
      };
    })
  );
});

export const moveWindowAtom = atom(
  null,
  (
    get,
    set,
    payload: { windowId: string; position: WindowPosition }
  ) => {
    set(
      openWindowsAtom,
      get(openWindowsAtom).map((w) =>
        w.id === payload.windowId ? { ...w, position: payload.position } : w
      )
    );
  }
);

export const resizeWindowAtom = atom(
  null,
  (
    get,
    set,
    payload: { windowId: string; size: WindowSize; position?: WindowPosition }
  ) => {
    set(
      openWindowsAtom,
      get(openWindowsAtom).map((w) =>
        w.id === payload.windowId
          ? {
              ...w,
              size: payload.size,
              position: payload.position ?? w.position,
            }
          : w
      )
    );
  }
);
