"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { ChevronLeft } from "lucide-react";
import { lettersAtom, loadLettersAtom } from "@/store/atoms/letters";
import { showNotificationAtom } from "@/store/atoms/ui";
import { currentUserAtom } from "@/store/atoms/user";
import { markAsOurs } from "@/lib/session";
import { useIsMobile } from "@/hooks/useIsMobile";
import { LetterSidebar } from "./LetterSidebar";
import { Stationery } from "./Stationery";
import { createLetter, sealLetter, updateLetter, deleteLetter } from "@/services/letterService";

import type { WindowAppProps } from "@/types/os";

export function LoveLetters({ content: initialLetterId }: WindowAppProps) {
  const isMobile = useIsMobile();
  const [selectedLetterId, setSelectedLetterId] = useState<string | null>(initialLetterId ?? null);
  const [editedContent, setEditedContent] = useState<string>("");
  const [editedTitle, setEditedTitle] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);
  const contentSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const titleSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const letters = useAtomValue(lettersAtom);
  const loadLetters = useSetAtom(loadLettersAtom);
  const showNotification = useSetAtom(showNotificationAtom);
  const currentUser = useAtomValue(currentUserAtom);

  useEffect(() => {
    loadLetters();
  }, [loadLetters]);

  const selectedLetter = letters.find((l) => l.id === selectedLetterId) ?? null;

  useEffect(() => {
    if (selectedLetter) {
      setEditedContent(selectedLetter.content);
      setEditedTitle(selectedLetter.title);
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
        markAsOurs(selectedLetterId);
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
        markAsOurs(selectedLetterId);
        await updateLetter(selectedLetterId, { title: newTitle });
      }
    }, 500);
  }, [selectedLetterId]);

  const isEditable = selectedLetter ? !selectedLetter.is_sealed : false;

  const handleCreateLetter = useCallback(async () => {
    const newLetter = await createLetter({
      title: "Untitled",
      author: currentUser ?? "Anonymous",
      content: "<p></p>",
      is_sealed: false,
      theme: "valentine",
    });
    if (newLetter) {
      markAsOurs(newLetter.id);
      await loadLetters();
      setSelectedLetterId(newLetter.id);
    }
  }, [loadLetters, currentUser]);

  const handleSealLetter = useCallback(async () => {
    if (selectedLetterId) {
      markAsOurs(selectedLetterId);
      await sealLetter(selectedLetterId);
      await loadLetters();
      showNotification({
        message: "Letter sealed with love",
        type: "success",
        icon: "heart",
        source: "Love Letters",
      });
    }
  }, [selectedLetterId, loadLetters, showNotification]);

  const handleSaveLetter = useCallback(async () => {
    if (selectedLetterId && contentSaveTimeoutRef.current) {
      clearTimeout(contentSaveTimeoutRef.current);
    }
    if (selectedLetterId) {
      markAsOurs(selectedLetterId);
      await updateLetter(selectedLetterId, { content: editedContent, title: editedTitle });
      await loadLetters();
      showNotification({
        message: "Letter saved",
        type: "success",
        icon: "check",
        source: "Love Letters",
      });
    }
  }, [selectedLetterId, editedContent, editedTitle, loadLetters, showNotification]);

  const handleDeleteLetter = useCallback(async (letterId: string) => {
    if (confirm("Are you sure you want to delete this letter? This cannot be undone.")) {
      await deleteLetter(letterId);
      if (selectedLetterId === letterId) {
        setSelectedLetterId(null);
      }
      await loadLetters();
      showNotification({
        message: "Letter deleted",
        type: "success",
        icon: "trash",
        source: "Love Letters",
      });
    }
  }, [selectedLetterId, loadLetters, showNotification]);

  const handleBackToList = useCallback(() => {
    setSelectedLetterId(null);
  }, []);

  if (isMobile) {
    return (
      <div className="flex flex-col h-full bg-[#f3e5dc]">
        {selectedLetter ? (
          <>
            {/* Mobile: Back bar + editor */}
            <div className="flex items-center gap-2 p-2 bg-white/40 backdrop-blur-md border-b border-white/30 shrink-0">
              <button
                onClick={handleBackToList}
                className="btn btn-ghost btn-sm text-[#5c1a1a]"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <span
                className="flex-1 text-center text-sm font-medium text-[#5c1a1a] truncate"
                style={{ fontFamily: "var(--font-dancing-script)" }}
              >
                {editedTitle || "Untitled"}
              </span>
              <div className="w-[60px]" />
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-2 bg-gradient-to-br from-[#8b5a2b] to-[#5c3a1e] overflow-auto">
              <div className="mb-2 h-6">
                {isSaving && (
                  <span className="text-xs text-white/60 animate-pulse">Saving...</span>
                )}
                {showSavedIndicator && !isSaving && (
                  <span className="text-xs text-green-300 font-medium">Draft saved</span>
                )}
              </div>
              <Stationery
                letter={{
                  ...selectedLetter,
                  content: editedContent,
                  title: editedTitle,
                }}
                editable={isEditable}
                onUpdateContent={handleContentUpdate}
                onUpdateTitle={handleTitleUpdate}
                onSeal={handleSealLetter}
                onSave={handleSaveLetter}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-hidden">
            <LetterSidebar
              letters={letters}
              selectedLetterId={selectedLetterId}
              onSelectLetter={setSelectedLetterId}
              onCreateLetter={handleCreateLetter}
              onDeleteLetter={handleDeleteLetter}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-full bg-[#f3e5dc]">
      {/* Sidebar */}
      <div className="w-full md:w-64 h-48 md:h-full bg-white/40 backdrop-blur-md border-b md:border-b-0 md:border-r border-white/30 flex-shrink-0">
        <LetterSidebar
          letters={letters}
          selectedLetterId={selectedLetterId}
          onSelectLetter={setSelectedLetterId}
          onCreateLetter={handleCreateLetter}
          onDeleteLetter={handleDeleteLetter}
        />
      </div>

      {/* Main Stage - Desk/Wood background */}
      <div className="flex-1 flex flex-col items-center justify-center p-2 md:p-8 bg-gradient-to-br from-[#8b5a2b] to-[#5c3a1e] overflow-auto">
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
              }}
              editable={isEditable}
              onUpdateContent={handleContentUpdate}
              onUpdateTitle={handleTitleUpdate}
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
