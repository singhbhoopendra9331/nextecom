"use client";

import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";

export default function Editor({ onChange }: { onChange: (value: any) => void }) {
  const editor = useCreateBlockNote();

  return (
    <BlockNoteView
      editor={editor}
      theme="light"
      onChange={() => {
        onChange(editor.document);
      }}
      className="w-full min-h-32 border border-gray-300 rounded px-3 py-2"
    />
  );
}