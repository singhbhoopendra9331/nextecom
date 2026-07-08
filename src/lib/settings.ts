import { getOption, setOption } from "@/lib/options";
import { normalizeGlobalNavLink } from "@/lib/navigation/nav-link-utils";

import {
  DEFAULT_GLOBAL_FOOTER_SETTINGS,
  DEFAULT_GLOBAL_HEADER_SETTINGS,
  DEFAULT_GLOBAL_SETTINGS,
  DEFAULT_READING_SETTINGS,
  DEFAULT_REDIRECTS_SETTINGS,
  DEFAULT_SMTP_SETTINGS,
} from "@/lib/settings/constants";
import {
  GLOBAL_FOOTER_KEY,
  GLOBAL_HEADER_KEY,
  GLOBAL_SETTINGS_KEY,
  READING_SETTINGS_KEY,
  REDIRECTS_SETTINGS_KEY,
  SMTP_SETTINGS_KEY,
} from "@/constants/index";
import {
  GlobalFooterSettings,
  GlobalHeaderSettings,
  GlobalSettings,
  ReadingSettings,
  RedirectsSettings,
  SmtpSettings,
} from "@/types/settings";
import { invalidateRedirectsCache, parseRedirectsSettings } from "@/lib/redirects";

export async function getGlobalSettings(): Promise<GlobalSettings> {
  const stored = await getOption<Partial<GlobalSettings>>(GLOBAL_SETTINGS_KEY);

  return {
    ...DEFAULT_GLOBAL_SETTINGS,
    ...stored,
  };
}

export async function saveGlobalSettings(settings: GlobalSettings) {
  await setOption(GLOBAL_SETTINGS_KEY, settings);
}

export async function getSmtpSettings(): Promise<SmtpSettings> {
  const stored = await getOption<Partial<SmtpSettings>>(SMTP_SETTINGS_KEY);

  return {
    ...DEFAULT_SMTP_SETTINGS,
    ...stored,
  };
}

export async function saveSmtpSettings(settings: SmtpSettings) {
  await setOption(SMTP_SETTINGS_KEY, settings);
}

export async function getRedirectsSettings(): Promise<RedirectsSettings> {
  const stored = await getOption<Partial<RedirectsSettings>>(REDIRECTS_SETTINGS_KEY);
  return parseRedirectsSettings(stored);
}

export async function saveRedirectsSettings(settings: RedirectsSettings) {
  await setOption(REDIRECTS_SETTINGS_KEY, settings);
  invalidateRedirectsCache();
}

export async function getReadingSettings(): Promise<ReadingSettings> {
  const stored = await getOption<Partial<ReadingSettings>>(READING_SETTINGS_KEY);

  return {
    ...DEFAULT_READING_SETTINGS,
    ...stored,
    homepagePageId: stored?.homepagePageId ?? null,
  };
}

export async function saveReadingSettings(settings: ReadingSettings) {
  await setOption(READING_SETTINGS_KEY, {
    homepagePageId: settings.homepagePageId || null,
  });
}

export async function getGlobalHeaderSettings(): Promise<GlobalHeaderSettings> {
  const stored = await getOption<Partial<GlobalHeaderSettings>>(GLOBAL_HEADER_KEY);

  return {
    ...DEFAULT_GLOBAL_HEADER_SETTINGS,
    ...stored,
    logoMediaId: stored?.logoMediaId ?? null,
    customNavLinks: (
      stored?.customNavLinks ?? DEFAULT_GLOBAL_HEADER_SETTINGS.customNavLinks
    ).map((link, index) =>
      normalizeGlobalNavLink({
        ...link,
        id: link.id ?? `legacy-nav-${index}`,
      })
    ),
    cta: {
      ...DEFAULT_GLOBAL_HEADER_SETTINGS.cta,
      ...stored?.cta,
    },
  };
}

export async function saveGlobalHeaderSettings(settings: GlobalHeaderSettings) {
  await setOption(GLOBAL_HEADER_KEY, settings);
}

export async function getGlobalFooterSettings(): Promise<GlobalFooterSettings> {
  const stored = await getOption<Partial<GlobalFooterSettings>>(GLOBAL_FOOTER_KEY);

  return {
    ...DEFAULT_GLOBAL_FOOTER_SETTINGS,
    ...stored,
    socialLinks: stored?.socialLinks ?? DEFAULT_GLOBAL_FOOTER_SETTINGS.socialLinks,
    linkColumns: stored?.linkColumns ?? DEFAULT_GLOBAL_FOOTER_SETTINGS.linkColumns,
  };
}

export async function saveGlobalFooterSettings(settings: GlobalFooterSettings) {
  await setOption(GLOBAL_FOOTER_KEY, settings);
}

export async function ensureDefaultOptions() {
  const [
    globalSettings,
    globalHeaderSettings,
    globalFooterSettings,
    smtpSettings,
    redirectsSettings,
    readingSettings,
  ] = await Promise.all([
    getOption(GLOBAL_SETTINGS_KEY),
    getOption(GLOBAL_HEADER_KEY),
    getOption(GLOBAL_FOOTER_KEY),
    getOption(SMTP_SETTINGS_KEY),
    getOption(REDIRECTS_SETTINGS_KEY),
    getOption(READING_SETTINGS_KEY),
  ]);

  await Promise.all([
    globalSettings
      ? Promise.resolve()
      : setOption(GLOBAL_SETTINGS_KEY, DEFAULT_GLOBAL_SETTINGS),
    globalHeaderSettings
      ? Promise.resolve()
      : setOption(GLOBAL_HEADER_KEY, DEFAULT_GLOBAL_HEADER_SETTINGS),
    globalFooterSettings
      ? Promise.resolve()
      : setOption(GLOBAL_FOOTER_KEY, DEFAULT_GLOBAL_FOOTER_SETTINGS),
    smtpSettings
      ? Promise.resolve()
      : setOption(SMTP_SETTINGS_KEY, DEFAULT_SMTP_SETTINGS),
    redirectsSettings
      ? Promise.resolve()
      : setOption(REDIRECTS_SETTINGS_KEY, DEFAULT_REDIRECTS_SETTINGS),
    readingSettings
      ? Promise.resolve()
      : setOption(READING_SETTINGS_KEY, DEFAULT_READING_SETTINGS),
  ]);
}
