"use client";

import { useEffect, useState } from "react";

import { SeoFields } from "@/components/admin/seo-fields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { SeoInput } from "@/lib/meta/seo";
import { toast } from "@/lib/toast";

type SeoEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentTitle: string;
  initialSeo: SeoInput;
  titlePlaceholder?: string;
  onSave: (seo: SeoInput) => Promise<{ success: boolean; error?: string }>;
  onSaved?: () => void;
};

export function SeoEditDialog({
  open,
  onOpenChange,
  contentTitle,
  initialSeo,
  titlePlaceholder,
  onSave,
  onSaved,
}: SeoEditDialogProps) {
  const [seo, setSeo] = useState<SeoInput>(initialSeo);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setSeo(initialSeo);
    }
  }, [open, initialSeo]);

  async function handleSave() {
    setIsSaving(true);

    const res = await onSave(seo);

    setIsSaving(false);

    if (res.success) {
      toast.success("SEO updated successfully");
      onOpenChange(false);
      onSaved?.();
      return;
    }

    toast.error(res.error ?? "Failed to update SEO");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit SEO</DialogTitle>
          <DialogDescription>{contentTitle}</DialogDescription>
        </DialogHeader>

        <SeoFields
          value={seo}
          onChange={setSeo}
          titlePlaceholder={titlePlaceholder}
        />

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save SEO"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
