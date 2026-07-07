"use client";

import { useCallback, useState, useTransition } from "react";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";

import { deleteSubmission } from "@/actions/forms/delete-submission";
import { AppSheet } from "@/components/app-sheet";
import { DataTable, DataTableColumn } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { FormSubmission } from "@/generated/prisma/browser";
import { axios } from "@/lib/axios";
import { toast } from "@/lib/toast";

type SubmissionRow = FormSubmission;

function formatSubmissionPreview(data: unknown) {
  if (!data || typeof data !== "object") {
    return "—";
  }

  const entries = Object.entries(data as Record<string, unknown>);
  if (entries.length === 0) {
    return "—";
  }

  const [key, value] = entries[0];
  const preview = String(value);
  return `${key}: ${preview.length > 40 ? `${preview.slice(0, 40)}…` : preview}`;
}

function SubmissionDetail({
  submission,
  onDelete,
}: {
  submission: SubmissionRow;
  onDelete: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const data =
    submission.data && typeof submission.data === "object"
      ? (submission.data as Record<string, unknown>)
      : {};

  async function handleDelete() {
    if (!confirm("Delete this submission?")) {
      return;
    }

    setIsDeleting(true);

    const res = await deleteSubmission(submission.id, submission.formId);

    setIsDeleting(false);

    if (res.success) {
      toast.success("Submission deleted successfully");
      onDelete();
      return;
    }

    toast.error(res.error ?? "Failed to delete submission");
  }

  return (
    <div className="space-y-4 px-4 pb-4">
      <dl className="space-y-3 text-sm">
        <div>
          <dt className="font-medium text-muted-foreground">Submitted</dt>
          <dd>{format(new Date(submission.createdAt), "PPpp")}</dd>
        </div>
        <div>
          <dt className="font-medium text-muted-foreground">IP</dt>
          <dd>{submission.ip ?? "—"}</dd>
        </div>
        <div>
          <dt className="font-medium text-muted-foreground">Source</dt>
          <dd className="break-all">{submission.source ?? "—"}</dd>
        </div>
        <div>
          <dt className="font-medium text-muted-foreground">User Agent</dt>
          <dd className="break-all">{submission.userAgent ?? "—"}</dd>
        </div>
      </dl>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Field values</h3>
        {Object.keys(data).length === 0 ? (
          <p className="text-sm text-muted-foreground">No data recorded.</p>
        ) : (
          <dl className="space-y-2 rounded-md border p-3">
            {Object.entries(data).map(([key, value]) => (
              <div key={key}>
                <dt className="text-xs font-medium uppercase text-muted-foreground">
                  {key}
                </dt>
                <dd className="text-sm break-words">
                  {typeof value === "boolean" ? (value ? "Yes" : "No") : String(value)}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      <Button
        variant="destructive"
        disabled={isDeleting}
        onClick={handleDelete}
      >
        <Trash2 className="h-4 w-4" />
        {isDeleting ? "Deleting..." : "Delete Submission"}
      </Button>
    </div>
  );
}

export default function FormSubmissionsPageClient({
  formId,
  initialData,
}: {
  formId: string;
  initialData: {
    docs: SubmissionRow[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}) {
  const [data, setData] = useState(initialData);
  const [isPending, startTransition] = useTransition();
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionRow | null>(
    null
  );

  const fetchSubmissions = useCallback(
    (page: number) => {
      startTransition(async () => {
        const response = await axios.get(`/api/forms/submissions/${formId}`, {
          params: {
            page,
            limit: data.pagination.limit,
          },
        });

        setData(response.data);
      });
    },
    [formId, data.pagination.limit]
  );

  const columns: DataTableColumn<SubmissionRow>[] = [
    {
      id: "createdAt",
      header: "Submitted",
      cell: (row) => format(new Date(row.createdAt), "MMM d, yyyy HH:mm"),
    },
    {
      id: "preview",
      header: "Preview",
      cell: (row) => formatSubmissionPreview(row.data),
    },
    {
      id: "ip",
      header: "IP",
      cell: (row) => row.ip ?? "—",
    },
    {
      id: "source",
      header: "Source",
      cell: (row) => (
        <span className="line-clamp-1 max-w-[240px]">{row.source ?? "—"}</span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (row) => (
        <Button variant="outline" size="sm" onClick={() => setSelectedSubmission(row)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <>
      <DataTable
        showHeader={false}
        columns={columns}
        data={data.docs}
        getRowKey={(row) => row.id}
        isLoading={isPending}
        pagination={data.pagination}
        onPageChange={fetchSubmissions}
        emptyMessage="No submissions yet."
      />

      <AppSheet
        open={Boolean(selectedSubmission)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedSubmission(null);
          }
        }}
        title="Submission Details"
        width="w-[560px]"
      >
        {selectedSubmission ? (
          <SubmissionDetail
            submission={selectedSubmission}
            onDelete={() => {
              setSelectedSubmission(null);
              fetchSubmissions(data.pagination.page);
            }}
          />
        ) : null}
      </AppSheet>
    </>
  );
}
