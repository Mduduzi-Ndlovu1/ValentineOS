"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { lettersAtom, loadLettersAtom } from "@/store/atoms/letters";
import { showNotificationAtom } from "@/store/atoms/ui";
import { LetterSidebar } from "./LetterSidebar";
import { Stationery } from "./Stationery";
import { createLetter, sealLetter, updateLetter } from "@/services/letterService";
import { supabase } from "@/lib/supabase";
import type { LoveLetter } from "@/types/letters";

const CURRENT_AUTHOR = "Me";

export function LoveLetters() {
  const [selectedLetterId, setSelectedLetterId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<string>("");
  const [editedTitle, setEditedTitle] = useState<string>("");
  const [editedAuthor, setEditedAuthor] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);
  const contentSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const titleSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const authorSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const letters = useAtomValue(lettersAtom);
  const loadLetters = useSetAtom(loadLettersAtom);
  const showNotification = useSetAtom(showNotificationAtom);

  useEffect(() => {
    loadLetters();
  }, [loadLetters]);

  // Real-time subscription for Supabase changes
  useEffect(() => {
    const client = supabase;
    if (!client) return;

    console.log("[LoveLetters] Setting up realtime subscription...");

    const channel = client
      .channel("realtime:letters")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "love_letters" },
        (payload) => {
          const newLetter = payload.new as LoveLetter;
          console.log("[LoveLetters] INSERT received:", newLetter);
          if (newLetter.author !== CURRENT_AUTHOR) {
            console.log("[LoveLetters] Showing notification for new letter from:", newLetter.author);
            showNotification(`💌 New letter from ${newLetter.author}!`);
          }
          loadLetters();
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "love_letters" },
        (payload) => {
          console.log("[LoveLetters] UPDATE received:", payload);
          loadLetters();
        }
      )
      .subscribe((status) => {
        console.log("[LoveLetters] Realtime subscription status:", status);
        if (status === "SUBSCRIBED") {
          console.log("[LoveLetters] Successfully subscribed to realtime");
        }
      });

    // Fallback: poll every 5 seconds if realtime fails
    const pollInterval = setInterval(() => {
      console.log("[LoveLetters] Polling for updates (fallback)...");
      loadLetters();
    }, 5000);

    return () => {
      client.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [loadLetters, showNotification]);

  const selectedLetter = letters.find((l) => l.id === selectedLetterId) ?? null;

  useEffect(() => {
    if (selectedLetter) {
      setEditedContent(selectedLetter.content);
      setEditedTitle(selectedLetter.title);
      setEditedAuthor(selectedLetter.author);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLetter?.id]);

  const handleContentUpdate = useCallback((newContent: string) => {
    setEditedContent(newContent);
    setShowSavedIndicator(false);

    if (contentSaveTimeoutRef.current) {
      clearTimeout(contentSaveTimeoutRef.current);
    }

    setIsSaving(true);

    contentSaveTimeoutRef.current = setTimeout(async () => {
      if (selectedLetterId) {
        await updateLetter(selectedLetterId, { content: newContent });
        setIsSaving(false);
        setShowSavedIndicator(true);
        
        setTimeout(() => setShowSavedIndicator(false), 2000);
      }
    }, 2000);
  }, [selectedLetterId]);

  const handleTitleUpdate = useCallback((newTitle: string) => {
    setEditedTitle(newTitle);

    if (titleSaveTimeoutRef.current) {
      clearTimeout(titleSaveTimeoutRef.current);
    }

    titleSaveTimeoutRef.current = setTimeout(async () => {
      if (selectedLetterId) {
        await updateLetter(selectedLetterId, { title: newTitle });
      }
    }, 500);
  }, [selectedLetterId]);

  const handleAuthorUpdate = useCallback((newAuthor: string) => {
    setEditedAuthor(newAuthor);

    if (authorSaveTimeoutRef.current) {
      clearTimeout(authorSaveTimeoutRef.current);
    }

    authorSaveTimeoutRef.current = setTimeout(async () => {
      if (selectedLetterId) {
        await updateLetter(selectedLetterId, { author: newAuthor });
      }
    }, 500);
  }, [selectedLetterId]);

  const isEditable = selectedLetter ? !selectedLetter.is_sealed : false;

  const handleCreateLetter = useCallback(async () => {
    const newLetter = await createLetter({
      title: "Untitled",
      author: "Me",
      content: "<p></p>",
      is_sealed: false,
      theme: "valentine",
    });
    if (newLetter) {
      await loadLetters();
      setSelectedLetterId(newLetter.id);
    }
  }, [loadLetters]);

  const handleSealLetter = useCallback(async () => {
    console.log("[LoveLetters] handleSealLetter called for:", selectedLetterId);
    if (selectedLetterId) {
      console.log("[LoveLetters] Calling sealLetter in service...");
      await sealLetter(selectedLetterId);
      console.log("[LoveLetters] sealLetter completed, reloading letters...");
      await loadLetters();
    }
  }, [selectedLetterId, loadLetters]);

  const handleSaveLetter = useCallback(async () => {
    if (selectedLetterId && contentSaveTimeoutRef.current) {
      clearTimeout(contentSaveTimeoutRef.current);
    }
    if (selectedLetterId) {
      await updateLetter(selectedLetterId, { content: editedContent, title: editedTitle, author: editedAuthor });
      await sealLetter(selectedLetterId);
      await loadLetters();
    }
  }, [selectedLetterId, editedContent, editedTitle, editedAuthor, loadLetters]);

  return (
    <div className="flex h-full bg-[#f3e5dc]">
      {/* Sidebar */}
      <LetterSidebar
        letters={letters}
        selectedLetterId={selectedLetterId}
        onSelectLetter={setSelectedLetterId}
        onCreateLetter={handleCreateLetter}
      />

      {/* Main Stage - Desk/Wood background */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[#8b5a2b] to-[#5c3a1e]">
        {selectedLetter ? (
          <>
            {/* Save Indicator */}
            <div className="mb-2 h-6">
              {isSaving && (
                <span className="text-xs text-white/60 animate-pulse">
                  Saving...
                </span>
              )}
              {showSavedIndicator && !isSaving && (
                <span className="text-xs text-green-300 font-medium">
                  Draft saved
                </span>
              )}
            </div>
            <Stationery 
              letter={{ 
                ...selectedLetter, 
                content: editedContent,
                title: editedTitle,
                author: editedAuthor
              }}
              editable={isEditable}
              onUpdateContent={handleContentUpdate}
              onUpdateTitle={handleTitleUpdate}
              onUpdateAuthor={handleAuthorUpdate}
              onSeal={handleSealLetter}
              onSave={handleSaveLetter}
            />
          </>
        ) : (
          <div className="text-center text-white/60">
            <p 
              className="text-3xl mb-2"
              style={{ fontFamily: "var(--font-dancing-script)" }}
            >
              Select a letter to read
            </p>
            <p className="text-sm text-white/40">
              Or create a new one to pour your heart out
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
