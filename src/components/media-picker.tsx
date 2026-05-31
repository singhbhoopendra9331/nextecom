"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { axios } from "@/lib/axios";
import { AppSheet } from "@/components/app-sheet";

type Media = {
  id: string;
  url: string;
  originalName: string;
};

export type MediaPickerValue = Media;

type MediaResponse = {
  docs: Media[];
};

type Props = {
  value?: Media | null;
  onChange?: (media: Media | null) => void;
};

export const MediaPicker = ({ value, onChange }: Props) => {
  const [data, setData] = useState<MediaResponse | null>(null);
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState<Media | null>(null);
  const [isPending, startTransition] = useTransition();

  const isControlled = value !== undefined;

  const selected = isControlled ? value : internalValue;

  const updateValue = (media: Media | null) => {
    if (!isControlled) {
      setInternalValue(media);
    }
    onChange?.(media);
  };

  const fetchMedia = () => {
    startTransition(async () => {
      const res = await axios.get("/api/media?page=1&limit=20");
      setData(res.data);
    });
  };

  useEffect(() => {
    if (open && !data) fetchMedia();
  }, [open]);

  const selectMedia = (media: Media) => {
    updateValue(media);
    setOpen(false);
  };

  const removeMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateValue(null);
  };

  return (
    <>
      {/* FIELD PREVIEW */}
      <div className="space-y-2">
        <div
          onClick={() => setOpen(true)}
          className="relative border rounded-md cursor-pointer overflow-hidden h-32 flex items-center justify-center bg-muted hover:border-primary transition"
        >
          {selected ? (
            <>
              <Image
                src={selected.url}
                alt={selected.originalName}
                width={200}
                height={200}
                className="object-cover w-full h-full"
              />

              <button
                type="button"
                onClick={removeMedia}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-black transition"
                aria-label="Remove selected media"
              >
                ✕
              </button>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">
              Select Media
            </span>
          )}
        </div>
      </div>

      {/* MEDIA LIBRARY */}
      <AppSheet
        open={open}
        onOpenChange={setOpen}
        title="Media Library"
        width="w-[640px]"
      >
        {isPending && (
          <p className="p-4 text-sm text-muted-foreground">
            Loading media...
          </p>
        )}

        {!isPending && data?.docs?.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">
            No media found.
          </p>
        )}

        {/* SELECTED PREVIEW */}
        {selected && (
          <div className="px-4 pb-4 border-b mb-4">
            <p className="text-sm font-medium mb-2">Selected</p>

            <div className="flex gap-3 items-center">
              <Image
                src={selected.url}
                alt={selected.originalName}
                width={80}
                height={80}
                className="rounded object-cover"
              />

              <div className="text-sm truncate">
                {selected.originalName}
              </div>
            </div>
          </div>
        )}

        {/* MEDIA GRID */}
        <div className="grid grid-cols-2 gap-4 px-4 pb-4">
          {data?.docs?.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => selectMedia(item)}
              className={`text-left border rounded-md overflow-hidden hover:shadow transition
              ${selected?.id === item.id ? "ring-2 ring-primary" : ""}`}
            >
              <Image
                src={item.url}
                alt={item.originalName}
                width={200}
                height={120}
                className="w-full h-28 object-cover"
              />

              <div className="text-xs p-2 truncate">
                {item.originalName}
              </div>
            </button>
          ))}
        </div>
      </AppSheet>
    </>
  );
};