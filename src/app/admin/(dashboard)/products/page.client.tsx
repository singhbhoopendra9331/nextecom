"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { format } from "date-fns";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { deleteProduct } from "@/actions/products/delete-product";
import { DataTable, DataTableColumn } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ProductStatus,
  ProductType,
} from "@/generated/prisma/browser";
import { axios } from "@/lib/axios";
import { toast } from "@/lib/toast";

type ProductRow = {
  id: string;
  title: string;
  slug: string;
  type: ProductType;
  status: ProductStatus;
  sku: string | null;
  regularPrice: { toString(): string } | null;
  stockStatus: string;
  updatedAt: string | Date;
  featuredImage?: { url: string } | null;
  brand?: { name: string } | null;
  categories?: { name: string }[];
};

function statusVariant(status: ProductStatus) {
  switch (status) {
    case "PUBLISHED":
      return "default";
    case "PRIVATE":
      return "secondary";
    case "PENDING":
      return "outline";
    default:
      return "outline";
  }
}

function formatPrice(value: { toString(): string } | null | undefined) {
  if (!value) {
    return "—";
  }

  return value.toString();
}

function ProductRowActions({
  product,
  onChanged,
}: {
  product: ProductRow;
  onChanged: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (
      !confirm(`Delete "${product.title}"? This action cannot be undone.`)
    ) {
      return;
    }

    setIsDeleting(true);

    const res = await deleteProduct(product.id);

    setIsDeleting(false);

    if (res.success) {
      toast.success("Product deleted successfully");
      onChanged();
      return;
    }

    toast.error(res.error ?? "Failed to delete product");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem asChild>
          <Link href={`/admin/products/${product.id}`}>
            <Pencil className="text-muted-foreground" />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={isDeleting}
          onClick={handleDelete}
        >
          <Trash2 />
          {isDeleting ? "Deleting..." : "Delete"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function ProductPageClient({
  initialData,
}: {
  initialData: {
    docs: ProductRow[];
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
  const skipSearchEffect = useRef(true);

  const fetchProducts = useCallback(
    (page: number, searchTerm: string) => {
      startTransition(async () => {
        const response = await axios.get("/api/products", {
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
      fetchProducts(1, search);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search, fetchProducts]);

  const columns: DataTableColumn<ProductRow>[] = [
    {
      id: "title",
      header: "Title",
      accessorKey: "title",
      cell: (row) => (
        <Link className="link" href={`/admin/products/${row.id}`}>
          {row.title}
        </Link>
      ),
    },
    {
      id: "image",
      header: "Image",
      cell: (row) =>
        row.featuredImage?.url ? (
          <Image
            src={row.featuredImage.url}
            alt={row.title}
            width={48}
            height={48}
            className="rounded object-cover"
          />
        ) : (
          "—"
        ),
    },
    { id: "slug", header: "Slug", accessorKey: "slug" },
    {
      id: "type",
      header: "Type",
      cell: (row) => (
        <Badge variant="outline" className="capitalize">
          {row.type.toLowerCase()}
        </Badge>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => (
        <Badge variant={statusVariant(row.status)} className="capitalize">
          {row.status.toLowerCase()}
        </Badge>
      ),
    },
    {
      id: "price",
      header: "Price",
      cell: (row) => formatPrice(row.regularPrice),
    },
    {
      id: "sku",
      header: "SKU",
      cell: (row) => row.sku || "—",
    },
    {
      id: "brand",
      header: "Brand",
      cell: (row) => row.brand?.name ?? "—",
    },
    {
      id: "categories",
      header: "Categories",
      cell: (row) =>
        row.categories?.map((category) => category.name).join(", ") || "—",
    },
    {
      id: "updatedAt",
      header: "Updated",
      cell: (row) => format(new Date(row.updatedAt), "MMM d, yyyy"),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (row) => (
        <ProductRowActions
          product={row}
          onChanged={() => fetchProducts(data.pagination.page, search)}
        />
      ),
    },
  ];

  return (
    <DataTable
      showHeader={false}
      columns={columns}
      data={data.docs}
      getRowKey={(row) => row.id}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search products..."
      isLoading={isPending}
      pagination={data.pagination}
      onPageChange={(page) => fetchProducts(page, search)}
      emptyMessage={
        search.trim()
          ? "No products match your search."
          : "No products yet. Create your first product."
      }
    />
  );
}
