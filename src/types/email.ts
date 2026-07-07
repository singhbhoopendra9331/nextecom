import { SmtpSettings } from "./settings";

export interface SendMailInput {
  to: string;
  subject: string;
  text: string;
  html?: string;
  from?: string;
  replyTo?: string;
  smtp?: SmtpSettings;
}