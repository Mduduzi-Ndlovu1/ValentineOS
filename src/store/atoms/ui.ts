import { atom } from "jotai";

export interface Notification {
  id: string;
  message: string;
  type: "info" | "success" | "error";
}

export const notificationAtom = atom<Notification | null>(null);

export const showNotificationAtom = atom(
  null,
  (get, set, message: string) => {
    const id = Date.now().toString();
    set(notificationAtom, { id, message, type: "info" });
    
    setTimeout(() => {
      set(notificationAtom, null);
    }, 3000);
  }
);
