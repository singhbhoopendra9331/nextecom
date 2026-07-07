import { getOption, setOption } from "@/lib/options";

import {
  DEFAULT_GLOBAL_SETTINGS,
  DEFAULT_READING_SETTINGS,
  DEFAULT_REDIRECTS_SETTINGS,
  DEFAULT_SMTP_SETTINGS,
} from "@/lib/settings/constants";
import { GLOBAL_SETTINGS_KEY, READING_SETTINGS_KEY, REDIRECTS_SETTINGS_KEY, SMTP_SETTINGS_KEY } from "@/constants/index";
import { GlobalSettings, ReadingSettings, RedirectsSettings, SmtpSettings } from "@/types/settings";
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

export async function ensureDefaultOptions() {
  const [globalSettings, smtpSettings, redirectsSettings, readingSettings] =
    await Promise.all([
      getOption(GLOBAL_SETTINGS_KEY),
      getOption(SMTP_SETTINGS_KEY),
      getOption(REDIRECTS_SETTINGS_KEY),
      getOption(READING_SETTINGS_KEY),
    ]);

  await Promise.all([
    globalSettings
      ? Promise.resolve()
      : setOption(GLOBAL_SETTINGS_KEY, DEFAULT_GLOBAL_SETTINGS),
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
