"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { deleteCategory } from "@/actions/categories/delete-category";
import { AppSheet } from "@/components/app-sheet";
import { DataTable, DataTableColumn } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";

import CategoryForm, { type CategoryRow } from "./category-form";

function CategoryRowActions({
  category,
  onEdit,
  onDelete,
}: {
  category: CategoryRow;
  onEdit: (category: CategoryRow) => void;
  onDelete: (category: CategoryRow) => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (
      !confirm(`Delete "${category.name}"? This action cannot be undone.`)
    ) {
      return;
    }

    setIsDeleting(true);

    const res = await deleteCategory(category.id);

    setIsDeleting(false);

    if (res.success) {
      toast.success("Category deleted successfully");
      onDelete(category);
      return;
    }

    toast.error(res.error ?? "Failed to delete category");
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => onEdit(category)}>
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

export default function CategoriesPageClient({
  initialCategories,
}: {
  initialCategories: CategoryRow[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("edit");
  const [selectedCategory, setSelectedCategory] = useState<CategoryRow | null>(
    null
  );

  function openCreateSheet() {
    setMode("create");
    setSelectedCategory(null);
    setOpen(true);
  }

  function openEditSheet(category: CategoryRow) {
    setMode("edit");
    setSelectedCategory(category);
    setOpen(true);
  }

  function handleSheetOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSelectedCategory(null);
    }
  }

  function handleSuccess() {
    handleSheetOpenChange(false);
    router.refresh();
  }

  function handleDeleted() {
    router.refresh();
  }

  const columns: DataTableColumn<CategoryRow>[] = [
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
        <CategoryRowActions
          category={row}
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
          Add Category
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={initialCategories}
        getRowKey={(row) => row.id}
        emptyMessage="No categories yet. Create your first category."
      />

      <AppSheet
        open={open}
        onOpenChange={handleSheetOpenChange}
        title={mode === "create" ? "Create Category" : "Edit Category"}
        width="w-[420px]"
      >
        {(mode === "create" || selectedCategory) && (
          <CategoryForm
            mode={mode}
            category={selectedCategory ?? undefined}
            onSuccess={handleSuccess}
          />
        )}
      </AppSheet>
    </>
  );
}
