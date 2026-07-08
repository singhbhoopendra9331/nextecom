"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { updateGlobalHeaderSettings } from "@/actions/settings/update-header-settings";
import { MediaPicker, type MediaPickerValue } from "@/components/media-picker";
import { AppSelect } from "@/components/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DEFAULT_GLOBAL_HEADER_SETTINGS } from "@/lib/settings/constants";
import { toast } from "@/lib/toast";
import type { GlobalHeaderSettings, GlobalNavChildLink, GlobalNavLink } from "@/types/settings";

const NAV_MODE_OPTIONS = [
  { value: "auto", label: "Automatic (primary + CMS pages)" },
  { value: "custom", label: "Custom links" },
];

const LINK_TYPE_OPTIONS = [
  { value: "link", label: "Simple link" },
  { value: "dropdown", label: "Dropdown menu" },
];

type HeaderSettingsFormProps = {
  initialValues?: Partial<GlobalHeaderSettings>;
  initialLogo?: MediaPickerValue | null;
};

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

function createEmptyChildLink(): GlobalNavChildLink {
  return {
    id: crypto.randomUUID(),
    title: "",
    href: "",
    enabled: true,
  };
}

export default function HeaderSettingsForm({
  initialValues,
  initialLogo = null,
}: HeaderSettingsFormProps) {
  const [settings, setSettings] = useState<GlobalHeaderSettings>({
    ...DEFAULT_GLOBAL_HEADER_SETTINGS,
    ...initialValues,
    cta: {
      ...DEFAULT_GLOBAL_HEADER_SETTINGS.cta,
      ...initialValues?.cta,
    },
  });
  const [logo, setLogo] = useState<MediaPickerValue | null>(initialLogo);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setSettings({
      ...DEFAULT_GLOBAL_HEADER_SETTINGS,
      ...initialValues,
      cta: {
        ...DEFAULT_GLOBAL_HEADER_SETTINGS.cta,
        ...initialValues?.cta,
      },
    });
    setLogo(initialLogo);
  }, [initialValues, initialLogo]);

  function updateField<K extends keyof GlobalHeaderSettings>(
    key: K,
    value: GlobalHeaderSettings[K]
  ) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function updateCtaField<K extends keyof GlobalHeaderSettings["cta"]>(
    key: K,
    value: GlobalHeaderSettings["cta"][K]
  ) {
    setSettings((current) => ({
      ...current,
      cta: { ...current.cta, [key]: value },
    }));
  }

  function updateNavLink(id: string, patch: Partial<GlobalNavLink>) {
    setSettings((current) => ({
      ...current,
      customNavLinks: current.customNavLinks.map((link) =>
        link.id === id ? { ...link, ...patch } : link
      ),
    }));
  }

  function addNavLink() {
    setSettings((current) => ({
      ...current,
      customNavLinks: [...current.customNavLinks, createEmptyNavLink()],
    }));
  }

  function removeNavLink(id: string) {
    setSettings((current) => ({
      ...current,
      customNavLinks: current.customNavLinks.filter((link) => link.id !== id),
    }));
  }

  function updateChildLink(
    parentId: string,
    childId: string,
    patch: Partial<GlobalNavChildLink>
  ) {
    setSettings((current) => ({
      ...current,
      customNavLinks: current.customNavLinks.map((link) =>
        link.id === parentId
          ? {
              ...link,
              children: link.children.map((child) =>
                child.id === childId ? { ...child, ...patch } : child
              ),
            }
          : link
      ),
    }));
  }

  function addChildLink(parentId: string) {
    setSettings((current) => ({
      ...current,
      customNavLinks: current.customNavLinks.map((link) =>
        link.id === parentId
          ? { ...link, children: [...link.children, createEmptyChildLink()] }
          : link
      ),
    }));
  }

  function removeChildLink(parentId: string, childId: string) {
    setSettings((current) => ({
      ...current,
      customNavLinks: current.customNavLinks.map((link) =>
        link.id === parentId
          ? {
              ...link,
              children: link.children.filter((child) => child.id !== childId),
            }
          : link
      ),
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);

    const res = await updateGlobalHeaderSettings({
      ...settings,
      logoMediaId: logo?.id ?? null,
    });

    setIsSubmitting(false);

    if (res.success) {
      toast.success("Header settings saved successfully");
      return;
    }

    toast.error(res.error ?? "Failed to save header settings");
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-4">
      <section className="space-y-4 rounded-lg border p-4">
        <h3 className="text-sm font-medium">Branding</h3>

        <div className="space-y-2">
          <Label>Logo</Label>
          <MediaPicker value={logo} onChange={setLogo} />
          <p className="text-xs text-muted-foreground">
            Optional. Falls back to the default icon when no logo is selected.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Switch
            id="showSiteTitle"
            checked={settings.showSiteTitle}
            onCheckedChange={(checked) => updateField("showSiteTitle", checked)}
          />
          <Label htmlFor="showSiteTitle">Show site title next to logo</Label>
        </div>
      </section>

      <section className="space-y-4 rounded-lg border p-4">
        <h3 className="text-sm font-medium">Navigation</h3>

        <AppSelect
          label="Navigation mode"
          value={settings.navMode}
          onValueChange={(value) =>
            updateField("navMode", value === "custom" ? "custom" : "auto")
          }
          options={NAV_MODE_OPTIONS}
        />

        {settings.navMode === "auto" ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Switch
                id="includePrimaryNav"
                checked={settings.includePrimaryNav}
                onCheckedChange={(checked) =>
                  updateField("includePrimaryNav", checked)
                }
              />
              <Label htmlFor="includePrimaryNav">
                Include primary links (Home, Posts)
              </Label>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="includeCmsPages"
                checked={settings.includeCmsPages}
                onCheckedChange={(checked) =>
                  updateField("includeCmsPages", checked)
                }
              />
              <Label htmlFor="includeCmsPages">
                Include published CMS pages
              </Label>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {settings.customNavLinks.length === 0 ? (
              <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                No custom links yet. Add your first navigation link.
              </div>
            ) : (
              settings.customNavLinks.map((link, index) => (
                <div key={link.id} className="space-y-3 rounded-md border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">Link {index + 1}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Switch
                          id={`nav-enabled-${link.id}`}
                          checked={link.enabled}
                          onCheckedChange={(checked) =>
                            updateNavLink(link.id, { enabled: checked })
                          }
                        />
                        <Label
                          htmlFor={`nav-enabled-${link.id}`}
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
                        onClick={() => removeNavLink(link.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove link</span>
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`nav-title-${link.id}`}>Title</Label>
                      <Input
                        id={`nav-title-${link.id}`}
                        value={link.title}
                        onChange={(event) =>
                          updateNavLink(link.id, { title: event.target.value })
                        }
                        placeholder="Shop"
                        required
                      />
                    </div>

                    <AppSelect
                      label="Type"
                      value={link.type}
                      onValueChange={(value) =>
                        updateNavLink(link.id, {
                          type: value === "dropdown" ? "dropdown" : "link",
                          children:
                            value === "dropdown" ? link.children : [],
                        })
                      }
                      options={LINK_TYPE_OPTIONS}
                    />
                  </div>

                  {link.type === "link" ? (
                    <div className="space-y-2">
                      <Label htmlFor={`nav-href-${link.id}`}>URL</Label>
                      <Input
                        id={`nav-href-${link.id}`}
                        value={link.href}
                        onChange={(event) =>
                          updateNavLink(link.id, { href: event.target.value })
                        }
                        placeholder="/about"
                        required
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`nav-href-${link.id}`}>
                          Parent URL (optional)
                        </Label>
                        <Input
                          id={`nav-href-${link.id}`}
                          value={link.href}
                          onChange={(event) =>
                            updateNavLink(link.id, { href: event.target.value })
                          }
                          placeholder="/shop"
                        />
                        <p className="text-xs text-muted-foreground">
                          Optional link for the parent label in the sidebar/header.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <p className="text-sm font-medium">Dropdown links</p>

                        {link.children.length === 0 ? (
                          <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                            Add at least one dropdown link.
                          </div>
                        ) : (
                          link.children.map((child, childIndex) => (
                            <div
                              key={child.id}
                              className="space-y-3 rounded-md border border-dashed p-3"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-medium">
                                  Dropdown link {childIndex + 1}
                                </p>
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-2">
                                    <Switch
                                      id={`child-enabled-${child.id}`}
                                      checked={child.enabled}
                                      onCheckedChange={(checked) =>
                                        updateChildLink(link.id, child.id, {
                                          enabled: checked,
                                        })
                                      }
                                    />
                                    <Label
                                      htmlFor={`child-enabled-${child.id}`}
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
                                    onClick={() =>
                                      removeChildLink(link.id, child.id)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Remove dropdown link</span>
                                  </Button>
                                </div>
                              </div>

                              <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-2">
                                  <Label htmlFor={`child-title-${child.id}`}>
                                    Title
                                  </Label>
                                  <Input
                                    id={`child-title-${child.id}`}
                                    value={child.title}
                                    onChange={(event) =>
                                      updateChildLink(link.id, child.id, {
                                        title: event.target.value,
                                      })
                                    }
                                    placeholder="Men"
                                    required
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor={`child-href-${child.id}`}>
                                    URL
                                  </Label>
                                  <Input
                                    id={`child-href-${child.id}`}
                                    value={child.href}
                                    onChange={(event) =>
                                      updateChildLink(link.id, child.id, {
                                        href: event.target.value,
                                      })
                                    }
                                    placeholder="/shop/men"
                                    required
                                  />
                                </div>
                              </div>
                            </div>
                          ))
                        )}

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addChildLink(link.id)}
                        >
                          <Plus className="h-4 w-4" />
                          Add Dropdown Link
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}

            <Button type="button" variant="outline" onClick={addNavLink}>
              <Plus className="h-4 w-4" />
              Add Link
            </Button>
          </div>
        )}
      </section>

      <section className="space-y-4 rounded-lg border p-4">
        <h3 className="text-sm font-medium">Call to action</h3>

        <div className="flex items-center gap-3">
          <Switch
            id="ctaEnabled"
            checked={settings.cta.enabled}
            onCheckedChange={(checked) => updateCtaField("enabled", checked)}
          />
          <Label htmlFor="ctaEnabled">Show CTA button in header</Label>
        </div>

        {settings.cta.enabled ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ctaLabel">Button label</Label>
              <Input
                id="ctaLabel"
                value={settings.cta.label}
                onChange={(event) => updateCtaField("label", event.target.value)}
                placeholder="Shop Now"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ctaHref">Button URL</Label>
              <Input
                id="ctaHref"
                value={settings.cta.href}
                onChange={(event) => updateCtaField("href", event.target.value)}
                placeholder="/shop"
                required
              />
            </div>
          </div>
        ) : null}
      </section>

      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? "Saving..." : "Save Header Settings"}
      </Button>
    </form>
  );
}
