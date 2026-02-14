"use client";

import { useEffect, useRef } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { supabase } from "@/lib/supabase";
import { isOurs, SESSION_ID } from "@/lib/session";
import { lettersAtom, loadLettersAtom } from "@/store/atoms/letters";
import { showNotificationAtom } from "@/store/atoms/ui";
import { currentUserAtom } from "@/store/atoms/user";
import type { LoveLetter } from "@/types/letters";

/**
 * Global realtime subscription — runs at the Desktop level so
 * notifications arrive whether or not the Love Letters app is open.
 */
export function useGlobalRealtime() {
  const loadLetters = useSetAtom(loadLettersAtom);
  const showNotification = useSetAtom(showNotificationAtom);
  const currentUser = useAtomValue(currentUserAtom);
  const letters = useAtomValue(lettersAtom);

  // Use refs so the realtime callbacks always see the latest values
  // without needing to tear down / recreate the channel
  const currentUserRef = useRef(currentUser);
  const knownIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  // Keep known IDs in sync with the letters array
  useEffect(() => {
    knownIdsRef.current = new Set(letters.map((l) => l.id));
  }, [letters]);

  useEffect(() => {
    const client = supabase;
    if (!client) return;

    let isCancelled = false;
    let realtimeConnected = false;

    // Seed known IDs from initial load
    loadLetters();

    const channelName = `global-${SESSION_ID.slice(0, 8)}`;
    console.log(`[Realtime] Subscribing on channel "${channelName}" (session: ${SESSION_ID})`);

    const channel = client
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "love_letters" },
        (payload) => {
          if (isCancelled) return;
          const newLetter = payload.new as LoveLetter;
          const user = currentUserRef.current;
          console.log(`[Realtime] INSERT — "${newLetter.title}" by ${newLetter.author}, currentUser: ${user}`);

          // Add to known set so polling doesn't double-notify
          knownIdsRef.current.add(newLetter.id);

          if (newLetter.author !== user && !isOurs(newLetter.id)) {
            showNotification({
              message: `New letter from ${newLetter.author}!`,
              type: "info",
              icon: "mail",
              source: "Love Letters",
              letterId: newLetter.id,
              duration: 6000,
            });
          }
          loadLetters();
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "love_letters" },
        (payload) => {
          if (isCancelled) return;
          const updated = payload.new as LoveLetter;
          const user = currentUserRef.current;
          console.log(`[Realtime] UPDATE — "${updated.title}" by ${updated.author}, sealed: ${updated.is_sealed}, currentUser: ${user}`);

          if (updated.author !== user && !isOurs(updated.id) && updated.is_sealed) {
            showNotification({
              message: `${updated.author} sealed "${updated.title}"`,
              type: "info",
              icon: "heart",
              source: "Love Letters",
              letterId: updated.id,
              duration: 6000,
            });
          }
          loadLetters();
        }
      )
      .subscribe((status) => {
        if (isCancelled) return;
        console.log(`[Realtime] Subscription status: ${status}`);
        if (status === "SUBSCRIBED") {
          realtimeConnected = true;
        }
      });

    // Polling fallback — also detects new letters when WebSocket is down
    const pollInterval = setInterval(async () => {
      if (isCancelled) return;

      const { data } = await client
        .from("love_letters")
        .select("*")
        .order("created_at", { ascending: false });

      if (!data) return;

      const user = currentUserRef.current;
      const knownIds = knownIdsRef.current;

      // Find letters we haven't seen yet
      for (const letter of data as LoveLetter[]) {
        if (!knownIds.has(letter.id) && letter.author !== user && !isOurs(letter.id)) {
          console.log(`[Poll] New letter detected — "${letter.title}" by ${letter.author}`);
          showNotification({
            message: `New letter from ${letter.author}!`,
            type: "info",
            icon: "mail",
            source: "Love Letters",
            letterId: letter.id,
            duration: 6000,
          });
        }
      }

      // Update known IDs
      knownIdsRef.current = new Set(data.map((l: LoveLetter) => l.id));
      loadLetters();
    }, 8000);

    return () => {
      isCancelled = true;
      client.removeChannel(channel);
      clearInterval(pollInterval);
    };
  // Only run once on mount — refs handle value changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadLetters, showNotification]);
}
