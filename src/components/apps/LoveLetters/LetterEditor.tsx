"use client";

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
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "tiptap-editor",
      },
    },
  });

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
