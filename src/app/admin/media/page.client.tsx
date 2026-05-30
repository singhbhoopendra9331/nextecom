"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { axios } from "@/lib/axios";
import { toast } from "@/lib/toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Copy, Trash, RefreshCcw } from "lucide-react";

import { AppSheet } from "@/components/app-sheet";
import { Pagination } from "@/components/pagination";

export default function MediaPageClient({ initialData }: any) {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");

  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [open, setOpen] = useState(false);

  const fetchMedia = (page: number, searchTerm: string) => {
    startTransition(async () => {
      const res = await axios.get(
        `/api/media?page=${page}&limit=20&search=${searchTerm}`
      );

      setData(res.data);
    });
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    fetchMedia(1, value);
  };

  const changePage = (page: number) => {
    fetchMedia(page, search);
  };

  const openMedia = (item: any) => {
    setSelectedMedia(item);
    setOpen(true);
  }; const copyUrl = async () => {
    await navigator.clipboard.writeText(selectedMedia.url);
    toast.success("URL copied to clipboard");
  };

  const downloadMedia = () => {
    const link = document.createElement("a");
    link.href = selectedMedia.url;
    link.download = selectedMedia.originalName;
    link.click();
  };

  const deleteMedia = async () => {
    if (!confirm("Delete this media?")) return;

    try {
      await axios.delete(`/api/media/${selectedMedia.id}`);
      toast.success("Media deleted successfully");
      setOpen(false);
      fetchMedia(data.pagination.page, search);
    } catch {
      toast.error("Failed to delete media");
    }
  };

  const replaceMedia = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.put(`/api/media/${selectedMedia.id}/replace`, formData);
      toast.success("Media replaced successfully");
      fetchMedia(data.pagination.page, search);
    } catch {
      toast.error("Failed to replace media");
    }
  };

  const saveMetadata = async () => {
    try {
      await axios.patch(`/api/media/${selectedMedia.id}`, {
        alt: altText,
        caption,
      });
      toast.success("Media details saved");
      fetchMedia(data.pagination.page, search);
    } catch {
      toast.error("Failed to save media details");
    }
  };

  return (
    <div className="space-y-6">
      <input
        placeholder="Search media..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        className="border rounded px-3 py-2 w-full max-w-sm"
      />

      {isPending && <p>Loading...</p>}

      {/* MEDIA GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.docs.map((item: any) => (
          <div
            key={item.id}
            onClick={() => openMedia(item)}
            className="border rounded-lg overflow-hidden bg-white cursor-pointer hover:shadow"
          >
            <Image
              src={item.url}
              alt={item.originalName}
              width={300}
              height={200}
              className="w-full h-48 object-cover"
            />

            <div className="p-2 text-xs truncate">
              {item.originalName}
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      <Pagination
        pagination={data.pagination}
        onPageChange={changePage}
      />

      {/* RIGHT SIDE SHEET */}
      <AppSheet
        open={open}
        onOpenChange={setOpen}
        title="Media Details"
        width="w-[520px]"
      >
        {selectedMedia && (
          <div className="space-y-6 px-4">

            <Image
              src={selectedMedia.url}
              alt={selectedMedia.originalName}
              width={400}
              height={300}
              className="rounded-md w-full"
            />

            {/* ACTION BUTTONS */}
            <div className="flex gap-2 flex-wrap">

              <Button size="sm" variant="outline" onClick={copyUrl}>
                <Copy className="w-4 h-4 mr-2" />
                Copy URL
              </Button>

              <Button size="sm" variant="outline" onClick={downloadMedia}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>

              <Button size="sm" variant="outline" asChild>
                <label className="cursor-pointer">
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Replace
                  <input
                    type="file"
                    hidden
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        replaceMedia(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </Button>

              <Button
                size="sm"
                variant="destructive"
                onClick={deleteMedia}
              >
                <Trash className="w-4 h-4 mr-2" />
                Delete
              </Button>

            </div>

            {/* FILE INFO */}
            <div className="space-y-1 text-sm">
              <p><strong>Name:</strong> {selectedMedia.originalName}</p>
              <p><strong>Type:</strong> {selectedMedia.mimeType}</p>
              <p><strong>Size:</strong> {selectedMedia.size}</p>
              <p><strong>ID:</strong> {selectedMedia.id}</p>
            </div>

            {/* ALT */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Alt Text</label>
              <Input
                value={altText || selectedMedia.alt || ""}
                onChange={(e) => setAltText(e.target.value)}
              />
            </div>

            {/* CAPTION */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Caption</label>
              <Input
                value={caption || selectedMedia.caption || ""}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>

            <Button onClick={saveMetadata} className="w-full">
              Save Changes
            </Button>

          </div>
        )}
      </AppSheet>
    </div>
  );
}