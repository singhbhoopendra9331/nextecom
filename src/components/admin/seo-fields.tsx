"use client";

import { TextareaField } from "@/components/form";
import { TextField } from "@/components/form";
import type { SeoInput } from "@/lib/meta/seo";

type SeoFieldsProps = {
  value: SeoInput;
  onChange: (value: SeoInput) => void;
  titlePlaceholder?: string;
};

export function SeoFields({
  value,
  onChange,
  titlePlaceholder = "Leave blank to use the page title",
}: SeoFieldsProps) {
  return (
    <div className="space-y-3 rounded-lg border p-4">
      <h3 className="text-sm font-medium">SEO</h3>

      <TextField
        label="Meta title"
        value={value.title ?? ""}
        onChange={(event) =>
          onChange({ ...value, title: event.target.value })
        }
        placeholder={titlePlaceholder}
      />

      <TextareaField
        label="Meta description"
        value={value.description ?? ""}
        onChange={(event) =>
          onChange({ ...value, description: event.target.value })
        }
        placeholder="Short summary for search engines"
        rows={4}
      />
    </div>
  );
}
