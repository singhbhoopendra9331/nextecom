import { REDIRECTS_SETTINGS_KEY } from "@/constants/index";
import { getOption } from "@/lib/options";
import { DEFAULT_REDIRECTS_SETTINGS } from "@/lib/settings/constants";
import type { RedirectRule, RedirectsSettings } from "@/types/settings";

const CACHE_TTL_MS = 30_000;

let cachedRedirects: {
  rules: RedirectRule[];
  fetchedAt: number;
} | null = null;

export function normalizeRedirectPath(path: string): string {
  const trimmed = path.trim();

  if (!trimmed.startsWith("/")) {
    throw new Error(`Path must start with /: ${path}`);
  }

  if (trimmed.length > 1 && trimmed.endsWith("/")) {
    return trimmed.slice(0, -1);
  }

  return trimmed;
}

export function normalizeRedirectTarget(target: string): string {
  const trimmed = target.trim();

  if (!trimmed) {
    throw new Error("Redirect target is required");
  }

  if (trimmed.startsWith("/")) {
    return normalizeRedirectPath(trimmed);
  }

  try {
    const url = new URL(trimmed);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("Redirect target must use http or https");
    }

    return url.toString();
  } catch (error) {
    if (error instanceof Error && error.message.includes("Redirect target")) {
      throw error;
    }

    throw new Error(`Invalid redirect target: ${target}`);
  }
}

export function parseRedirectsSettings(
  stored: Partial<RedirectsSettings> | undefined
): RedirectsSettings {
  if (!Array.isArray(stored?.rules)) {
    return DEFAULT_REDIRECTS_SETTINGS;
  }

  return {
    rules: stored.rules.map((rule) => ({
      id: String(rule.id ?? crypto.randomUUID()),
      from: String(rule.from ?? ""),
      to: String(rule.to ?? ""),
      type: rule.type === 302 ? 302 : 301,
      enabled: rule.enabled !== false,
    })),
  };
}

export function sanitizeRedirectsSettings(
  settings: RedirectsSettings
): RedirectsSettings {
  const seenFromPaths = new Set<string>();
  const rules: RedirectRule[] = [];

  for (const rule of settings.rules) {
    if (!rule.from?.trim() || !rule.to?.trim()) {
      throw new Error("Each redirect needs both a source and destination");
    }

    const from = normalizeRedirectPath(rule.from);
    const to = normalizeRedirectTarget(rule.to);

    if (from === to) {
      throw new Error(`Redirect source and destination cannot match: ${from}`);
    }

    if (seenFromPaths.has(from)) {
      throw new Error(`Duplicate redirect source path: ${from}`);
    }

    seenFromPaths.add(from);

    rules.push({
      id: rule.id?.trim() || crypto.randomUUID(),
      from,
      to,
      type: rule.type === 302 ? 302 : 301,
      enabled: rule.enabled !== false,
    });
  }

  return { rules };
}

export function invalidateRedirectsCache() {
  cachedRedirects = null;
}

async function loadRedirectsSettings(): Promise<RedirectsSettings> {
  const stored = await getOption<Partial<RedirectsSettings>>(REDIRECTS_SETTINGS_KEY);
  return parseRedirectsSettings(stored);
}

export async function getActiveRedirectRules(): Promise<RedirectRule[]> {
  if (
    cachedRedirects &&
    Date.now() - cachedRedirects.fetchedAt < CACHE_TTL_MS
  ) {
    return cachedRedirects.rules;
  }

  const settings = await loadRedirectsSettings();
  const rules = settings.rules.filter((rule) => rule.enabled);

  cachedRedirects = {
    rules,
    fetchedAt: Date.now(),
  };

  return rules;
}

export function findRedirectRule(
  pathname: string,
  rules: RedirectRule[]
): RedirectRule | null {
  let normalizedPath: string;

  try {
    normalizedPath = normalizeRedirectPath(pathname);
  } catch {
    return null;
  }

  return rules.find((rule) => rule.from === normalizedPath) ?? null;
}
