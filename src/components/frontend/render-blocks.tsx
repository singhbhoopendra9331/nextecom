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

function RenderBlocksInner({ content }: { content: unknown }) {
  const blocks =
    Array.isArray(content) && content.length > 0 ? content : undefined;
  const editor = useCreateBlockNote(
    blocks ? { initialContent: blocks as never } : undefined
  );

  return <BlockNoteView editor={editor} editable={false} theme="light" />;
}

export default function RenderBlocks({ content }: { content: unknown }) {
  const isClient = useIsClient();

  if (!isClient) {
    return null;
  }

  return <RenderBlocksInner content={content} />;
}
