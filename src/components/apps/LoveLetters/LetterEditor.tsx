"use client";

import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";

interface LetterEditorProps {
  content: string;
  editable: boolean;
  onUpdate: (html: string) => void;
}

export function LetterEditor({ content, editable, onUpdate }: LetterEditorProps) {
  const isUpdatingRef = useRef(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Typography,
      Placeholder.configure({
        placeholder: "My dearest...",
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor: e }) => {
      if (!isUpdatingRef.current) {
        onUpdate(e.getHTML());
      }
    },
    editorProps: {
      attributes: {
        class: "tiptap-editor",
      },
    },
  });

  // Sync content prop → editor when it changes externally
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      isUpdatingRef.current = true;
      editor.commands.setContent(content, { emitUpdate: false });
      isUpdatingRef.current = false;
    }
  }, [editor, content]);

  // Sync editable prop
  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editor, editable]);

  if (!editor) {
    return null;
  }

  return (
    <EditorContent
      editor={editor}
      className={`tiptap-container ${!editable ? "pointer-events-none" : ""}`}
    />
  );
}
