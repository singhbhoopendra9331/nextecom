import { getOption, setOption } from "@/lib/options";

export const GLOBAL_SETTINGS_KEY = "global_settings";

export type GlobalSettings = {
  siteTitle: string;
  siteTagline: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  currency: string;
  timezone: string;
};

export const DEFAULT_GLOBAL_SETTINGS: GlobalSettings = {
  siteTitle: "NextEcom",
  siteTagline: "",
  contactEmail: "",
  contactPhone: "",
  address: "",
  currency: "INR",
  timezone: "UTC",
};

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
