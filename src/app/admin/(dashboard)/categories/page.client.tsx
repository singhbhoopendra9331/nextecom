"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import { deleteCategory } from "@/actions/categories/delete-category";
import { AppSheet } from "@/components/app-sheet";
import { DataTable, DataTableColumn } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { axios } from "@/lib/axios";
import { toast } from "@/lib/toast";

import CategoryForm, { type CategoryRow } from "./category-form";

function CategoryRowActions({
  category,
  onEdit,
  onChanged,
}: {
  category: CategoryRow;
  onEdit: (category: CategoryRow) => void;
  onChanged: () => void;
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
      onChanged();
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
  initialData,
}: {
  initialData: {
    docs: CategoryRow[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}) {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("edit");
  const [selectedCategory, setSelectedCategory] = useState<CategoryRow | null>(
    null
  );
  const skipSearchEffect = useRef(true);

  const fetchCategories = useCallback(
    (page: number, searchTerm: string) => {
      startTransition(async () => {
        const response = await axios.get("/api/categories", {
          params: {
            page,
            limit: data.pagination.limit,
            search: searchTerm.trim(),
          },
        });

        setData(response.data);
      });
    },
    [data.pagination.limit]
  );

  useEffect(() => {
    if (skipSearchEffect.current) {
      skipSearchEffect.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      fetchCategories(1, search);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search, fetchCategories]);

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
    fetchCategories(data.pagination.page, search);
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
          onChanged={() => fetchCategories(data.pagination.page, search)}
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
        showHeader={false}
        columns={columns}
        data={data.docs}
        getRowKey={(row) => row.id}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search categories..."
        isLoading={isPending}
        pagination={data.pagination}
        onPageChange={(page) => fetchCategories(page, search)}
        emptyMessage={
          search.trim()
            ? "No categories match your search."
            : "No categories yet. Create your first category."
        }
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
