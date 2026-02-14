import { atom } from "jotai";

export type NotificationIcon = "mail" | "heart" | "check" | "alert" | "trash";

export interface Notification {
  id: string;
  message: string;
  type: "info" | "success" | "error";
  icon?: NotificationIcon;
  source?: string;
  timestamp: number;
  letterId?: string;
}

export type NotificationPayload = {
  message: string;
  type?: Notification["type"];
  icon?: NotificationIcon;
  source?: string;
  duration?: number;
  letterId?: string;
};

// ─── Active toasts (max 3 visible) ───
export const notificationsAtom = atom<Notification[]>([]);

// ─── History for notification center (capped at 50) ───
export const notificationHistoryAtom = atom<Notification[]>([]);

// ─── Notification center panel state ───
export const notificationCenterOpenAtom = atom<boolean>(false);

// ─── Actions ───

export const showNotificationAtom = atom(
  null,
  (get, set, payload: string | NotificationPayload) => {
    const config = typeof payload === "string"
      ? { message: payload }
      : payload;

    const notification: Notification = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
      message: config.message,
      type: config.type ?? "info",
      icon: config.icon,
      source: config.source,
      timestamp: Date.now(),
      letterId: config.letterId,
    };

    // Add to active toasts (keep max 3)
    const current = get(notificationsAtom);
    set(notificationsAtom, [...current, notification].slice(-3));

    // Add to history (keep max 50)
    const history = get(notificationHistoryAtom);
    set(notificationHistoryAtom, [notification, ...history].slice(0, 50));

    // Auto-dismiss after duration
    const duration = config.duration ?? 3000;
    setTimeout(() => {
      set(
        notificationsAtom,
        get(notificationsAtom).filter((n) => n.id !== notification.id)
      );
    }, duration);
  }
);

export const dismissNotificationAtom = atom(
  null,
  (get, set, id: string) => {
    set(
      notificationsAtom,
      get(notificationsAtom).filter((n) => n.id !== id)
    );
  }
);

export const clearNotificationHistoryAtom = atom(null, (get, set) => {
  set(notificationHistoryAtom, []);
});

export const toggleNotificationCenterAtom = atom(null, (get, set) => {
  set(notificationCenterOpenAtom, !get(notificationCenterOpenAtom));
});
