"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { deleteTag } from "@/actions/tags/delete-tag";
import { AppSheet } from "@/components/app-sheet";
import { DataTable, DataTableColumn } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";

import TagForm, { type TagRow } from "./tag-form";

function TagRowActions({
  tag,
  onEdit,
  onDelete,
}: {
  tag: TagRow;
  onEdit: (tag: TagRow) => void;
  onDelete: (tag: TagRow) => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${tag.name}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);

    const res = await deleteTag(tag.id);

    setIsDeleting(false);

    if (res.success) {
      toast.success("Tag deleted successfully");
      onDelete(tag);
      return;
    }

    toast.error(res.error ?? "Failed to delete tag");
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => onEdit(tag)}>
        Edit
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={isDeleting}
        onClick={handleDelete}
      >
        {isDeleting ? "Deleting..." : "Delete"}
      </Button>
    </div>
  );
}

export default function TagsPageClient({
  initialTags,
}: {
  initialTags: TagRow[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("edit");
  const [selectedTag, setSelectedTag] = useState<TagRow | null>(null);

  function openCreateSheet() {
    setMode("create");
    setSelectedTag(null);
    setOpen(true);
  }

  function openEditSheet(tag: TagRow) {
    setMode("edit");
    setSelectedTag(tag);
    setOpen(true);
  }

  function handleSheetOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSelectedTag(null);
    }
  }

  function handleSuccess() {
    handleSheetOpenChange(false);
    router.refresh();
  }

  function handleDeleted() {
    router.refresh();
  }

  const columns: DataTableColumn<TagRow>[] = [
    {
      id: "name",
      header: "Name",
      accessorKey: "name",
      cell: (row) => (
        <button
          type="button"
          className="link text-left"
          onClick={() => openEditSheet(row)}
        >
          {row.name}
        </button>
      ),
    },
    {
      id: "postCount",
      header: "Posts",
      accessorKey: "postCount",
    },
    {
      id: "actions",
      header: "Actions",
      cell: (row) => (
        <TagRowActions
          tag={row}
          onEdit={openEditSheet}
          onDelete={handleDeleted}
        />
      ),
    },
  ];

  return (
    <>
      <div className="mb-6 flex items-start justify-end gap-4">
        <Button size="sm" variant="outline" onClick={openCreateSheet}>
          Add Tag
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={initialTags}
        getRowKey={(row) => row.id}
        emptyMessage="No tags yet. Create your first tag."
      />

      <AppSheet
        open={open}
        onOpenChange={handleSheetOpenChange}
        title={mode === "create" ? "Create Tag" : "Edit Tag"}
        width="w-[420px]"
      >
        {(mode === "create" || selectedTag) && (
          <TagForm
            mode={mode}
            tag={selectedTag ?? undefined}
            onSuccess={handleSuccess}
          />
        )}
      </AppSheet>
    </>
  );
}
