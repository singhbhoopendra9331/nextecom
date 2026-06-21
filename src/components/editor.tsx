"use client";

import { useSyncExternalStore } from "react";
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

function normalizeInitialContent(content: unknown): unknown[] | undefined {
  if (!Array.isArray(content) || content.length === 0) {
    return undefined;
  }

  return content;
}

function EditorInner({
  onChange,
  initialContent,
}: {
  onChange: (value: unknown) => void;
  initialContent?: unknown;
}) {
  const blocks = normalizeInitialContent(initialContent);
  const editor = useCreateBlockNote(
    blocks ? { initialContent: blocks as never } : undefined
  );

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

export default function Editor({
  onChange,
  initialContent,
}: {
  onChange: (value: unknown) => void;
  initialContent?: unknown;
}) {
  const isClient = useIsClient();

  if (!isClient) {
    return (
      <div className="w-full min-h-32 border border-gray-300 rounded px-3 py-2 bg-muted/30" />
    );
  }

  return <EditorInner onChange={onChange} initialContent={initialContent} />;
}
