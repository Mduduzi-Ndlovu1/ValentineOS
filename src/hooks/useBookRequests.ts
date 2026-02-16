import { useEffect, useCallback } from "react";
import { useSetAtom, useAtomValue } from "jotai";
import { supabase } from "@/lib/supabase";
import { showNotificationAtom } from "@/store/atoms/ui";
import { currentUserAtom } from "@/store/atoms/user";

interface BookRequest {
  id: string;
  from_user: string;
  to_user: string;
  book_title: string;
  book_author: string;
  book_cover_url: string;
  is_read: boolean;
  created_at: string;
}

export function useBookRequests() {
  const showNotification = useSetAtom(showNotificationAtom);
  const currentUser = useAtomValue(currentUserAtom);

  const requestNotificationPermission = useCallback(async () => {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  }, []);

  const showOSNotification = useCallback((title: string, body: string, icon?: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: icon || "/favicon.ico",
      });
    }
  }, []);

  const fetchAndShowNotifications = useCallback(async () => {
    if (!currentUser || !supabase) return;
    
    const userAlias = currentUser === "Mduduzi" ? "admin" : "neo";
    
    try {
      const response = await fetch(`/api/books/request?userAlias=${userAlias}`);
      if (response.ok) {
        const data = await response.json();
        const requests: BookRequest[] = data.requests || [];
        
        // Filter unread requests
        const unreadRequests = requests.filter(r => !r.is_read);
        
        // Show notification for each unread request
        for (const req of unreadRequests) {
          showNotification({
            message: `📚 ${req.from_user === "neo" ? "Neo" : req.from_user} has requested: "${req.book_title}" by ${req.book_author}`,
            type: "info",
            icon: "heart",
            source: "Bookstore",
          });

          showOSNotification(
            "📚 New Book Request",
            `${req.from_user === "neo" ? "Neo" : req.from_user} has requested: "${req.book_title}"`,
            req.book_cover_url
          );

          // Mark as read
          await fetch("/api/books/request", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ requestId: req.id }),
          });
        }
      }
    } catch (error) {
      console.error("[BookRequests] Error fetching requests:", error);
    }
  }, [currentUser, showNotification, showOSNotification]);

  useEffect(() => {
    requestNotificationPermission();
  }, [requestNotificationPermission]);

  // Fetch existing requests on mount and when user changes
  useEffect(() => {
    if (currentUser) {
      fetchAndShowNotifications();
    }
  }, [currentUser, fetchAndShowNotifications]);

  // Set up realtime subscription for new requests
  useEffect(() => {
    if (!supabase) {
      console.log("[BookRequests] Supabase not initialized");
      return;
    }

    console.log("[BookRequests] Setting up realtime subscription...");

    const channel = supabase
      .channel("book_requests")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "book_requests",
        },
        (payload) => {
          console.log("[BookRequests] New request received:", payload);
          const newRequest = payload.new as BookRequest;
          
          const currentAlias = currentUser === "Mduduzi" ? "admin" : "neo";
          
          console.log("[BookRequests] Current user:", currentUser, "Alias:", currentAlias, "To user:", newRequest.to_user);
          
          if (newRequest.to_user === currentAlias) {
            console.log("[BookRequests] Showing notification for:", newRequest.to_user);
            
            showNotification({
              message: `📚 ${newRequest.from_user === "neo" ? "Neo" : newRequest.from_user} has requested: "${newRequest.book_title}" by ${newRequest.book_author}`,
              type: "info",
              icon: "heart",
              source: "Bookstore",
            });

            showOSNotification(
              "📚 New Book Request",
              `${newRequest.from_user === "neo" ? "Neo" : newRequest.from_user} has requested: "${newRequest.book_title}"`,
              newRequest.book_cover_url
            );
          }
        }
      )
      .subscribe((status) => {
        console.log("[BookRequests] Subscription status:", status);
      });

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [showNotification, showOSNotification, currentUser]);
}
