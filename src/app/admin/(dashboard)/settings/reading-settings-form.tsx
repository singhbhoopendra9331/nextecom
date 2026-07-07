"use client";

import { useEffect, useMemo, useState } from "react";

import { updateReadingSettings } from "@/actions/settings/update-reading-settings";
import { AppSelect } from "@/components/select";
import { Button } from "@/components/ui/button";
import { DEFAULT_READING_SETTINGS } from "@/lib/settings/constants";
import { toast } from "@/lib/toast";
import type { ReadingSettings } from "@/types/settings";

export type PublishedPageOption = {
  id: string;
  title: string;
  slug: string;
};

type ReadingSettingsFormProps = {
  initialValues?: Partial<ReadingSettings>;
  pages: PublishedPageOption[];
  onSuccess?: () => void;
};

const DEFAULT_HOMEPAGE_VALUE = "__default_home__";

export default function ReadingSettingsForm({
  initialValues,
  pages,
  onSuccess,
}: ReadingSettingsFormProps) {
  const [homepagePageId, setHomepagePageId] = useState<string | null>(
    initialValues?.homepagePageId ?? DEFAULT_READING_SETTINGS.homepagePageId
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setHomepagePageId(
      initialValues?.homepagePageId ?? DEFAULT_READING_SETTINGS.homepagePageId
    );
  }, [initialValues?.homepagePageId]);

  const pageOptions = useMemo(
    () => [
      {
        value: DEFAULT_HOMEPAGE_VALUE,
        label: 'Default (page with slug "home")',
      },
      ...pages.map((page) => ({
        value: page.id,
        label: `${page.title} (/${page.slug})`,
      })),
    ],
    [pages]
  );

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);

    const res = await updateReadingSettings({
      homepagePageId,
    });

    setIsSubmitting(false);

    if (res.success) {
      toast.success("Reading settings saved successfully");
      onSuccess?.();
      return;
    }

    toast.error(res.error ?? "Failed to save reading settings");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 px-4">
      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-medium">Homepage</h3>
          <p className="text-sm text-muted-foreground">
            Choose which published page visitors see at the site root (/).
          </p>
        </div>

        <AppSelect
          label="Homepage"
          value={homepagePageId ?? DEFAULT_HOMEPAGE_VALUE}
          onValueChange={(value) =>
            setHomepagePageId(
              value === DEFAULT_HOMEPAGE_VALUE ? null : value
            )
          }
          options={pageOptions}
          placeholder="Select a homepage"
        />

        {pages.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No published pages yet. Publish a page first, then select it here.
          </p>
        ) : null}
      </section>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Saving..." : "Save Reading Settings"}
      </Button>
    </form>
  );
}
