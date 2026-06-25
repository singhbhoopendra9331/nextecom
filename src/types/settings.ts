
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