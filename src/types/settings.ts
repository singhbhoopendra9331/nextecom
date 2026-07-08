
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

export type GlobalNavChildLink = {
  id: string;
  title: string;
  href: string;
  enabled: boolean;
};

export type GlobalNavLinkType = "link" | "dropdown";

export type GlobalNavLink = {
  id: string;
  type: GlobalNavLinkType;
  title: string;
  href: string;
  enabled: boolean;
  children: GlobalNavChildLink[];
};

export type HeaderCtaSettings = {
  enabled: boolean;
  label: string;
  href: string;
};

export type GlobalHeaderSettings = {
  showSiteTitle: boolean;
  logoMediaId: string | null;
  navMode: "auto" | "custom";
  includePrimaryNav: boolean;
  includeCmsPages: boolean;
  customNavLinks: GlobalNavLink[];
  cta: HeaderCtaSettings;
};

export type FooterSocialLink = {
  id: string;
  label: string;
  url: string;
  enabled: boolean;
};

export type FooterLinkColumn = {
  id: string;
  title: string;
  links: GlobalNavLink[];
};

export type GlobalFooterSettings = {
  showQuickLinks: boolean;
  showContact: boolean;
  copyrightText: string;
  taglineOverride: string;
  socialLinks: FooterSocialLink[];
  linkColumns: FooterLinkColumn[];
};