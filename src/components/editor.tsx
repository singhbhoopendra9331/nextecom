"use client";

import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";

export default function Editor() {
  const editor = useCreateBlockNote();

  return (
    <BlockNoteView 
      editor={editor}
      theme="light"
      className="w-full h-full min-h-32 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
    />
  );
}
