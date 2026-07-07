
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

export type RedirectType = 301 | 302;

export type RedirectRule = {
  id: string;
  from: string;
  to: string;
  type: RedirectType;
  enabled: boolean;
};

export type RedirectsSettings = {
  rules: RedirectRule[];
};

export type ReadingSettings = {
  /** Published page id to show at /. Null uses the page with slug "home". */
  homepagePageId: string | null;
};