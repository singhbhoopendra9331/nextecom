"use client";

import { format } from "date-fns";
import { Eye, RefreshCw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  clearLogsAction,
  deleteLogAction,
} from "@/actions/logs/clear-logs";
import { AppSheet } from "@/components/app-sheet";
import { DataTable, DataTableColumn } from "@/components/data-table";
import { Pagination } from "@/components/pagination";
import { AppSelect } from "@/components/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AppLogLevel } from "@/lib/logs/constants";
import { LOG_LEVELS, LOG_LEVEL_LABELS } from "@/lib/logs/constants";
import { axios } from "@/lib/axios";
import { toast } from "@/lib/toast";

export type LogRow = {
  id: string;
  level: AppLogLevel;
  message: string;
  context: unknown;
  stack: string | null;
  source: string | null;
  createdAt: string;
};

type LogsResponse = {
  docs: LogRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

const LEVEL_OPTIONS = [
  { value: "all", label: "All levels" },
  ...LOG_LEVELS.map((level) => ({
    value: level,
    label: LOG_LEVEL_LABELS[level],
  })),
];

function levelVariant(level: AppLogLevel) {
  switch (level) {
    case "ERROR":
      return "destructive" as const;
    case "WARN":
      return "secondary" as const;
    case "DEBUG":
      return "outline" as const;
    default:
      return "default" as const;
  }
}

function truncateMessage(message: string, max = 100) {
  return message.length > max ? `${message.slice(0, max)}…` : message;
}

function formatJson(value: unknown) {
  if (value === null || value === undefined) {
    return "—";
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export default function LogsPageClient({
  initialData,
}: {
  initialData: LogsResponse;
}) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [isPending, startTransition] = useTransition();
  const [isClearing, setIsClearing] = useState(false);

  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("all");
  const [source, setSource] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [selectedLog, setSelectedLog] = useState<LogRow | null>(null);
  const [open, setOpen] = useState(false);

  function buildQuery(page: number) {
    const params = new URLSearchParams({
      page: String(page),
      limit: "20",
    });

    if (search.trim()) params.set("q", search.trim());
    if (level !== "all") params.set("level", level);
    if (source.trim()) params.set("source", source.trim());
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);

    return params.toString();
  }

  function fetchLogs(page = 1) {
    startTransition(async () => {
      const res = await axios.get(`/api/logs?${buildQuery(page)}`);
      setData(res.data);
    });
  }

  function handleApplyFilters() {
    fetchLogs(1);
  }

  function handleResetFilters() {
    setSearch("");
    setLevel("all");
    setSource("");
    setDateFrom("");
    setDateTo("");

    startTransition(async () => {
      const res = await axios.get("/api/logs?page=1&limit=20");
      setData(res.data);
    });
  }

  function openLogDetail(log: LogRow) {
    setSelectedLog(log);
    setOpen(true);
  }

  async function handleDeleteLog(log: LogRow) {
    if (!confirm("Delete this log entry?")) {
      return;
    }

    const res = await deleteLogAction(log.id);

    if (res.success) {
      toast.success("Log deleted");
      setOpen(false);
      fetchLogs(data.pagination.page);
      router.refresh();
      return;
    }

    toast.error(res.error ?? "Failed to delete log");
  }

  async function handleClearLogs(options: {
    all?: boolean;
    level?: AppLogLevel;
    olderThanDays?: number;
  }) {
    const message = options.all
      ? "Delete all application logs?"
      : options.level
        ? `Delete all ${LOG_LEVEL_LABELS[options.level]} logs?`
        : `Delete logs older than ${options.olderThanDays} days?`;

    if (!confirm(message)) {
      return;
    }

    setIsClearing(true);

    const res = await clearLogsAction(options);

    setIsClearing(false);

    if (res.success) {
      toast.success(`Cleared ${res.count} log${res.count === 1 ? "" : "s"}`);
      fetchLogs(1);
      router.refresh();
      return;
    }

    toast.error(res.error ?? "Failed to clear logs");
  }

  const columns: DataTableColumn<LogRow>[] = [
    {
      id: "level",
      header: "Level",
      cell: (row) => (
        <Badge variant={levelVariant(row.level)}>
          {LOG_LEVEL_LABELS[row.level]}
        </Badge>
      ),
    },
    {
      id: "message",
      header: "Message",
      cell: (row) => (
        <button
          type="button"
          className="text-left hover:underline"
          onClick={() => openLogDetail(row)}
        >
          {truncateMessage(row.message)}
        </button>
      ),
    },
    {
      id: "source",
      header: "Source",
      cell: (row) => row.source ?? "—",
    },
    {
      id: "createdAt",
      header: "Time",
      cell: (row) => format(new Date(row.createdAt), "MMM d, yyyy HH:mm:ss"),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (row) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openLogDetail(row)}
          >
            <Eye className="h-4 w-4" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteLog(row)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-semibold text-2xl">Application Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage logs persisted from the application logger.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => fetchLogs(data.pagination.page)}
            disabled={isPending}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            disabled={isClearing}
            onClick={() => handleClearLogs({ olderThanDays: 30 })}
          >
            Clear 30+ days
          </Button>
          <Button
            variant="destructive"
            disabled={isClearing}
            onClick={() => handleClearLogs({ all: true })}
          >
            Clear all
          </Button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 rounded-md border p-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="space-y-2 xl:col-span-2">
          <Label htmlFor="logSearch">Search</Label>
          <Input
            id="logSearch"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Message, source, or stack"
          />
        </div>

        <AppSelect
          label="Level"
          name="level"
          value={level}
          onValueChange={setLevel}
          options={LEVEL_OPTIONS}
        />

        <div className="space-y-2">
          <Label htmlFor="logSource">Source</Label>
          <Input
            id="logSource"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="auth, api, checkout"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="logDateFrom">From date</Label>
          <Input
            id="logDateFrom"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="logDateTo">To date</Label>
          <Input
            id="logDateTo"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>

        <div className="flex items-end gap-2 md:col-span-2 xl:col-span-5">
          <Button onClick={handleApplyFilters} disabled={isPending}>
            Apply filters
          </Button>
          <Button variant="outline" onClick={handleResetFilters} disabled={isPending}>
            Reset
          </Button>
        </div>
      </div>

      <div className="mb-2 text-sm text-muted-foreground">
        {data.pagination.total} log{data.pagination.total === 1 ? "" : "s"} found
      </div>

      <DataTable
        columns={columns}
        data={data.docs}
        getRowKey={(row) => row.id}
        emptyMessage="No logs found."
      />

      <Pagination
        pagination={data.pagination}
        onPageChange={(page) => fetchLogs(page)}
      />

      <AppSheet
        open={open}
        onOpenChange={setOpen}
        title="Log Details"
        width="w-[560px]"
      >
        {selectedLog && (
          <div className="space-y-4 px-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={levelVariant(selectedLog.level)}>
                {LOG_LEVEL_LABELS[selectedLog.level]}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {format(new Date(selectedLog.createdAt), "PPpp")}
              </span>
            </div>

            <div className="space-y-1">
              <Label>Message</Label>
              <pre className="overflow-x-auto rounded-md border bg-muted/40 p-3 text-sm whitespace-pre-wrap">
                {selectedLog.message}
              </pre>
            </div>

            <div className="space-y-1">
              <Label>Source</Label>
              <p className="text-sm">{selectedLog.source ?? "—"}</p>
            </div>

            <div className="space-y-1">
              <Label>Context</Label>
              <pre className="max-h-48 overflow-auto rounded-md border bg-muted/40 p-3 text-xs whitespace-pre-wrap">
                {formatJson(selectedLog.context)}
              </pre>
            </div>

            {selectedLog.stack && (
              <div className="space-y-1">
                <Label>Stack trace</Label>
                <pre className="max-h-48 overflow-auto rounded-md border bg-muted/40 p-3 text-xs whitespace-pre-wrap">
                  {selectedLog.stack}
                </pre>
              </div>
            )}

            <Button
              variant="destructive"
              className="w-full"
              onClick={() => handleDeleteLog(selectedLog)}
            >
              Delete log
            </Button>
          </div>
        )}
      </AppSheet>
    </>
  );
}
