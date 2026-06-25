export const EMAIL_TEMPLATES = {
  welcome: {
    subject: "Welcome to {{siteTitle}}",
    html: "welcome.ejs",
    text: "welcome.text.ejs",
    placeholders: ["name", "loginUrl", "siteTitle", "siteTagline", "contactEmail"],
  },
  "reset-password": {
    subject: "Reset your {{siteTitle}} password",
    html: "reset-password.ejs",
    text: "reset-password.text.ejs",
    placeholders: ["resetUrl", "expiresIn", "siteTitle", "siteTagline", "contactEmail"],
  },
} as const;

export type EmailTemplateName = keyof typeof EMAIL_TEMPLATES;
