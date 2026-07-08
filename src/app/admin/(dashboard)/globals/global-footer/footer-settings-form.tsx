"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { updateGlobalFooterSettings } from "@/actions/settings/update-footer-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_GLOBAL_FOOTER_SETTINGS } from "@/lib/settings/constants";
import { toast } from "@/lib/toast";
import type {
  FooterLinkColumn,
  FooterSocialLink,
  GlobalFooterSettings,
  GlobalNavLink,
} from "@/types/settings";

type FooterSettingsFormProps = {
  initialValues?: Partial<GlobalFooterSettings>;
};

function createEmptySocialLink(): FooterSocialLink {
  return {
    id: crypto.randomUUID(),
    label: "",
    url: "",
    enabled: true,
  };
}

function createEmptyNavLink(): GlobalNavLink {
  return {
    id: crypto.randomUUID(),
    type: "link",
    title: "",
    href: "",
    enabled: true,
    children: [],
  };
}

function createEmptyColumn(): FooterLinkColumn {
  return {
    id: crypto.randomUUID(),
    title: "",
    links: [],
  };
}

export default function FooterSettingsForm({
  initialValues,
}: FooterSettingsFormProps) {
  const [settings, setSettings] = useState<GlobalFooterSettings>({
    ...DEFAULT_GLOBAL_FOOTER_SETTINGS,
    ...initialValues,
    socialLinks: initialValues?.socialLinks ?? DEFAULT_GLOBAL_FOOTER_SETTINGS.socialLinks,
    linkColumns: initialValues?.linkColumns ?? DEFAULT_GLOBAL_FOOTER_SETTINGS.linkColumns,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setSettings({
      ...DEFAULT_GLOBAL_FOOTER_SETTINGS,
      ...initialValues,
      socialLinks: initialValues?.socialLinks ?? DEFAULT_GLOBAL_FOOTER_SETTINGS.socialLinks,
      linkColumns: initialValues?.linkColumns ?? DEFAULT_GLOBAL_FOOTER_SETTINGS.linkColumns,
    });
  }, [initialValues]);

  function updateField<K extends keyof GlobalFooterSettings>(
    key: K,
    value: GlobalFooterSettings[K]
  ) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function updateSocialLink(id: string, patch: Partial<FooterSocialLink>) {
    setSettings((current) => ({
      ...current,
      socialLinks: current.socialLinks.map((link) =>
        link.id === id ? { ...link, ...patch } : link
      ),
    }));
  }

  function addSocialLink() {
    setSettings((current) => ({
      ...current,
      socialLinks: [...current.socialLinks, createEmptySocialLink()],
    }));
  }

  function removeSocialLink(id: string) {
    setSettings((current) => ({
      ...current,
      socialLinks: current.socialLinks.filter((link) => link.id !== id),
    }));
  }

  function updateColumn(id: string, patch: Partial<FooterLinkColumn>) {
    setSettings((current) => ({
      ...current,
      linkColumns: current.linkColumns.map((column) =>
        column.id === id ? { ...column, ...patch } : column
      ),
    }));
  }

  function addColumn() {
    setSettings((current) => ({
      ...current,
      linkColumns: [...current.linkColumns, createEmptyColumn()],
    }));
  }

  function removeColumn(id: string) {
    setSettings((current) => ({
      ...current,
      linkColumns: current.linkColumns.filter((column) => column.id !== id),
    }));
  }

  function updateColumnLink(
    columnId: string,
    linkId: string,
    patch: Partial<GlobalNavLink>
  ) {
    setSettings((current) => ({
      ...current,
      linkColumns: current.linkColumns.map((column) =>
        column.id === columnId
          ? {
              ...column,
              links: column.links.map((link) =>
                link.id === linkId ? { ...link, ...patch } : link
              ),
            }
          : column
      ),
    }));
  }

  function addColumnLink(columnId: string) {
    setSettings((current) => ({
      ...current,
      linkColumns: current.linkColumns.map((column) =>
        column.id === columnId
          ? { ...column, links: [...column.links, createEmptyNavLink()] }
          : column
      ),
    }));
  }

  function removeColumnLink(columnId: string, linkId: string) {
    setSettings((current) => ({
      ...current,
      linkColumns: current.linkColumns.map((column) =>
        column.id === columnId
          ? {
              ...column,
              links: column.links.filter((link) => link.id !== linkId),
            }
          : column
      ),
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);

    const res = await updateGlobalFooterSettings(settings);

    setIsSubmitting(false);

    if (res.success) {
      toast.success("Footer settings saved successfully");
      return;
    }

    toast.error(res.error ?? "Failed to save footer settings");
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-4">
      <section className="space-y-4 rounded-lg border p-4">
        <h3 className="text-sm font-medium">Content</h3>

        <div className="flex items-center gap-3">
          <Switch
            id="showQuickLinks"
            checked={settings.showQuickLinks}
            onCheckedChange={(checked) => updateField("showQuickLinks", checked)}
          />
          <Label htmlFor="showQuickLinks">Show quick links column</Label>
        </div>

        <div className="flex items-center gap-3">
          <Switch
            id="showContact"
            checked={settings.showContact}
            onCheckedChange={(checked) => updateField("showContact", checked)}
          />
          <Label htmlFor="showContact">Show contact column</Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="taglineOverride">Tagline override</Label>
          <Textarea
            id="taglineOverride"
            value={settings.taglineOverride}
            onChange={(event) => updateField("taglineOverride", event.target.value)}
            placeholder="Optional footer-specific tagline"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="copyrightText">Copyright text</Label>
          <Input
            id="copyrightText"
            value={settings.copyrightText}
            onChange={(event) => updateField("copyrightText", event.target.value)}
            placeholder="Leave empty for default: © {year} {site title}"
          />
        </div>
      </section>

      <section className="space-y-4 rounded-lg border p-4">
        <h3 className="text-sm font-medium">Social links</h3>

        {settings.socialLinks.length === 0 ? (
          <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            No social links yet.
          </div>
        ) : (
          settings.socialLinks.map((link, index) => (
            <div key={link.id} className="space-y-3 rounded-md border p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">Social link {index + 1}</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`social-enabled-${link.id}`}
                      checked={link.enabled}
                      onCheckedChange={(checked) =>
                        updateSocialLink(link.id, { enabled: checked })
                      }
                    />
                    <Label
                      htmlFor={`social-enabled-${link.id}`}
                      className="text-xs text-muted-foreground"
                    >
                      Enabled
                    </Label>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => removeSocialLink(link.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove social link</span>
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`social-label-${link.id}`}>Label</Label>
                  <Input
                    id={`social-label-${link.id}`}
                    value={link.label}
                    onChange={(event) =>
                      updateSocialLink(link.id, { label: event.target.value })
                    }
                    placeholder="Instagram"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`social-url-${link.id}`}>URL</Label>
                  <Input
                    id={`social-url-${link.id}`}
                    value={link.url}
                    onChange={(event) =>
                      updateSocialLink(link.id, { url: event.target.value })
                    }
                    placeholder="https://instagram.com/yourstore"
                    required
                  />
                </div>
              </div>
            </div>
          ))
        )}

        <Button type="button" variant="outline" onClick={addSocialLink}>
          <Plus className="h-4 w-4" />
          Add Social Link
        </Button>
      </section>

      <section className="space-y-4 rounded-lg border p-4">
        <h3 className="text-sm font-medium">Extra link columns</h3>
        <p className="text-sm text-muted-foreground">
          Add optional footer columns with custom link groups.
        </p>

        {settings.linkColumns.length === 0 ? (
          <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            No extra columns yet.
          </div>
        ) : (
          settings.linkColumns.map((column, columnIndex) => (
            <div key={column.id} className="space-y-3 rounded-md border p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">Column {columnIndex + 1}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeColumn(column.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove column</span>
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`column-title-${column.id}`}>Column title</Label>
                <Input
                  id={`column-title-${column.id}`}
                  value={column.title}
                  onChange={(event) =>
                    updateColumn(column.id, { title: event.target.value })
                  }
                  placeholder="Support"
                  required
                />
              </div>

              <div className="space-y-3">
                {column.links.map((link, linkIndex) => (
                  <div
                    key={link.id}
                    className="grid gap-3 rounded-md border border-dashed p-3 sm:grid-cols-[1fr_1fr_auto]"
                  >
                    <div className="space-y-2">
                      <Label htmlFor={`column-${column.id}-title-${link.id}`}>
                        Link {linkIndex + 1} title
                      </Label>
                      <Input
                        id={`column-${column.id}-title-${link.id}`}
                        value={link.title}
                        onChange={(event) =>
                          updateColumnLink(column.id, link.id, {
                            title: event.target.value,
                          })
                        }
                        placeholder="FAQ"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`column-${column.id}-href-${link.id}`}>
                        URL
                      </Label>
                      <Input
                        id={`column-${column.id}-href-${link.id}`}
                        value={link.href}
                        onChange={(event) =>
                          updateColumnLink(column.id, link.id, {
                            href: event.target.value,
                          })
                        }
                        placeholder="/faq"
                        required
                      />
                    </div>

                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeColumnLink(column.id, link.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove link</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addColumnLink(column.id)}
              >
                <Plus className="h-4 w-4" />
                Add Link
              </Button>
            </div>
          ))
        )}

        <Button type="button" variant="outline" onClick={addColumn}>
          <Plus className="h-4 w-4" />
          Add Column
        </Button>
      </section>

      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? "Saving..." : "Save Footer Settings"}
      </Button>
    </form>
  );
}
