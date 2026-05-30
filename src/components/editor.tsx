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

function EditorInner({ onChange }: { onChange: (value: unknown) => void }) {
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

export default function Editor({
  onChange,
}: {
  onChange: (value: unknown) => void;
}) {
  const isClient = useIsClient();

  if (!isClient) {
    return (
      <div className="w-full min-h-32 border border-gray-300 rounded px-3 py-2 bg-muted/30" />
    );
  }

  return <EditorInner onChange={onChange} />;
}
