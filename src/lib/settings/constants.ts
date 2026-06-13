export const GLOBAL_SETTINGS_KEY = "global_settings";
export const SMTP_SETTINGS_KEY = "smtp";

export type GlobalSettings = {
  siteTitle: string;
  siteTagline: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  currency: string;
  timezone: string;
};

export type SmtpEncryption = "none" | "tls" | "ssl";

export type SmtpSettings = {
  enabled: boolean;
  host: string;
  port: number;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  encryption: SmtpEncryption;
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
