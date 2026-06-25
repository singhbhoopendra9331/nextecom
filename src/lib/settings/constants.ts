import { GLOBAL_SETTINGS_KEY, SMTP_SETTINGS_KEY } from "@/constants/index";
import { GlobalSettings, SmtpSettings } from "@/types/settings";

export const DEFAULT_GLOBAL_SETTINGS: GlobalSettings = {
  siteTitle: "NextEcom",
  siteTagline: "",
  contactEmail: "",
  contactPhone: "",
  address: "",
  currency: "INR",
  timezone: "UTC",
};

export const DEFAULT_SMTP_SETTINGS: SmtpSettings = {
  enabled: false,
  host: "",
  port: 587,
  username: "",
  password: "",
  fromEmail: "",
  fromName: "",
  encryption: "tls",
};

export const STRUCTURED_OPTION_KEYS = [
  GLOBAL_SETTINGS_KEY,
  SMTP_SETTINGS_KEY,
] as const;

export type StructuredOptionKey = (typeof STRUCTURED_OPTION_KEYS)[number];
