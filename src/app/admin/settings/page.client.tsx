"use client";

import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AppSheet } from "@/components/app-sheet";
import { DataTable, DataTableColumn } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GLOBAL_SETTINGS_KEY,
  SMTP_SETTINGS_KEY,
} from "@/lib/settings/constants";
import {
  detectOptionValueType,
  formatOptionValueLabel,
  formatOptionValuePreview,
} from "@/lib/settings/option-value";

import OptionForm, { type OptionRow } from "./option-form";

const OPTION_LABELS: Record<string, string> = {
  [GLOBAL_SETTINGS_KEY]: "Global Settings",
  [SMTP_SETTINGS_KEY]: "SMTP",
};

function getSheetTitle(
  mode: "create" | "edit",
  option: OptionRow | null
): string {
  if (mode === "create") {
    return "Create Option";
  }

  if (option?.key === GLOBAL_SETTINGS_KEY) {
    return "Edit Global Settings";
  }

  if (option?.key === SMTP_SETTINGS_KEY) {
    return "Edit SMTP Settings";
  }

  return "Edit Option";
}

function formatValuePreview(value: unknown): string {
  return formatOptionValuePreview(value);
}

function OptionRowActions({
  option,
  onEdit,
}: {
  option: OptionRow;
  onEdit: (option: OptionRow) => void;
}) {
  return (
    <Button variant="outline" size="sm" onClick={() => onEdit(option)}>
      Edit
    </Button>
  );
}

export default function SettingsPageClient({
  initialOptions,
}: {
  initialOptions: OptionRow[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("edit");
  const [selectedOption, setSelectedOption] = useState<OptionRow | null>(null);

  function openCreateSheet() {
    setMode("create");
    setSelectedOption(null);
    setOpen(true);
  }

  function openEditSheet(option: OptionRow) {
    setMode("edit");
    setSelectedOption(option);
    setOpen(true);
  }

  function handleSheetOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSelectedOption(null);
    }
  }

  function handleSuccess() {
    handleSheetOpenChange(false);
    router.refresh();
  }

  const columns: DataTableColumn<OptionRow>[] = [
    {
      id: "key",
      header: "Key",
      cell: (row) => (
        <div>
          <p className="font-medium">{row.key}</p>
          {OPTION_LABELS[row.key] && (
            <p className="text-xs text-muted-foreground">
              {OPTION_LABELS[row.key]}
            </p>
          )}
        </div>
      ),
    },
    {
      id: "type",
      header: "Type",
      cell: (row) => (
        <Badge variant="outline">
          {formatOptionValueLabel(detectOptionValueType(row.value))}
        </Badge>
      ),
    },
    {
      id: "value",
      header: "Value",
      cell: (row) => (
        <code className="text-xs text-muted-foreground">
          {formatValuePreview(row.value)}
        </code>
      ),
    },
    {
      id: "autoload",
      header: "Autoload",
      cell: (row) => (
        <Badge variant={row.autoload ? "default" : "secondary"}>
          {row.autoload ? "Yes" : "No"}
        </Badge>
      ),
    },
    {
      id: "updatedAt",
      header: "Updated",
      cell: (row) => format(new Date(row.updatedAt), "MMM d, yyyy"),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (row) => <OptionRowActions option={row} onEdit={openEditSheet} />,
    },
  ];

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
         
        <Button onClick={openCreateSheet}>Add Option</Button>
      </div>

      <DataTable
        columns={columns}
        data={initialOptions}
        getRowKey={(row) => row.id}
        emptyMessage="No options yet. Create your first option."
      />

      <AppSheet
        open={open}
        onOpenChange={handleSheetOpenChange}
        title={getSheetTitle(mode, selectedOption)}
        width="w-[520px]"
      >
        {(mode === "create" || selectedOption) && (
          <OptionForm
            mode={mode}
            option={selectedOption ?? undefined}
            onSuccess={handleSuccess}
          />
        )}
      </AppSheet>
    </>
  );
}
