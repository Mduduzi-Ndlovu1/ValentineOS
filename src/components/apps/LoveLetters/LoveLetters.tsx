"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { lettersAtom, loadLettersAtom } from "@/store/atoms/letters";
import { LetterSidebar } from "./LetterSidebar";
import { Stationery } from "./Stationery";
import { createLetter, sealLetter, updateLetter } from "@/services/letterService";
import type { LoveLetter } from "@/types/letters";

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

  useEffect(() => {
    loadLetters();
  }, [loadLetters]);

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
    if (selectedLetterId) {
      await sealLetter(selectedLetterId);
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
