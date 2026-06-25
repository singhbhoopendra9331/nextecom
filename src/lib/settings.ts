import { getOption, setOption } from "@/lib/options";

import {
  DEFAULT_GLOBAL_SETTINGS,
  DEFAULT_SMTP_SETTINGS, 
} from "@/lib/settings/constants";
import { GLOBAL_SETTINGS_KEY, SMTP_SETTINGS_KEY } from "@/constants/index";
import { GlobalSettings, SmtpSettings } from "@/types/settings";

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

export async function ensureDefaultOptions() {
  const [globalSettings, smtpSettings] = await Promise.all([
    getOption(GLOBAL_SETTINGS_KEY),
    getOption(SMTP_SETTINGS_KEY),
  ]);

  await Promise.all([
    globalSettings
      ? Promise.resolve()
      : setOption(GLOBAL_SETTINGS_KEY, DEFAULT_GLOBAL_SETTINGS),
    smtpSettings
      ? Promise.resolve()
      : setOption(SMTP_SETTINGS_KEY, DEFAULT_SMTP_SETTINGS),
  ]);
}
