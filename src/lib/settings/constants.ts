import {
  ADMIN_SITE_NAME,
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

export const DEFAULT_GLOBAL_SETTINGS: GlobalSettings = {
  siteTitle: ADMIN_SITE_NAME,
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

export const DEFAULT_REDIRECTS_SETTINGS: RedirectsSettings = {
  rules: [],
};

export const DEFAULT_READING_SETTINGS: ReadingSettings = {
  homepagePageId: null,
};

export const DEFAULT_GLOBAL_HEADER_SETTINGS: GlobalHeaderSettings = {
  showSiteTitle: true,
  logoMediaId: null,
  navMode: "auto",
  includePrimaryNav: true,
  includeCmsPages: true,
  customNavLinks: [],
  cta: {
    enabled: false,
    label: "Shop Now",
    href: "/",
  },
};

export const DEFAULT_GLOBAL_FOOTER_SETTINGS: GlobalFooterSettings = {
  showQuickLinks: true,
  showContact: true,
  copyrightText: "",
  taglineOverride: "",
  socialLinks: [],
  linkColumns: [],
};

export const GLOBALS_ITEMS = [
  {
    key: GLOBAL_HEADER_KEY,
    title: "Header",
    description: "Logo, navigation links, and call-to-action button.",
    href: "/admin/globals/global-header",
  },
  {
    key: GLOBAL_FOOTER_KEY,
    title: "Footer",
    description: "Footer columns, social links, and copyright text.",
    href: "/admin/globals/global-footer",
  },
] as const;

export const STRUCTURED_OPTION_KEYS = [
  GLOBAL_SETTINGS_KEY,
  GLOBAL_HEADER_KEY,
  GLOBAL_FOOTER_KEY,
  SMTP_SETTINGS_KEY,
  REDIRECTS_SETTINGS_KEY,
  READING_SETTINGS_KEY,
] as const;

export type StructuredOptionKey = (typeof STRUCTURED_OPTION_KEYS)[number];
