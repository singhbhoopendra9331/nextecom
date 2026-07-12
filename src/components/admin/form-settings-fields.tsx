"use client";

import { AppSelect } from "@/components/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type {
  FormEmailSettings,
  FormFieldDefinition,
  FormSubmitSettings,
} from "@/types/forms";

const SUBMIT_MODE_OPTIONS = [
  { value: "message", label: "Show success message" },
  { value: "redirect", label: "Redirect to URL" },
];

type FormSettingsFieldsProps = {
  fields: FormFieldDefinition[];
  email: FormEmailSettings;
  submit: FormSubmitSettings;
  onEmailChange: (email: FormEmailSettings) => void;
  onSubmitChange: (submit: FormSubmitSettings) => void;
};

export default function FormSettingsFields({
  fields,
  email,
  submit,
  onEmailChange,
  onSubmitChange,
}: FormSettingsFieldsProps) {
  const fieldPlaceholderHints = fields
    .map((field) => `{{${field.name}}}`)
    .join(", ");

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">After Submit</h3>

        <AppSelect
          label="Submit behavior"
          name="submitMode"
          value={submit.mode}
          onValueChange={(value) =>
            onSubmitChange({
              ...submit,
              mode: value as FormSubmitSettings["mode"],
            })
          }
          options={SUBMIT_MODE_OPTIONS}
        />

        {submit.mode === "redirect" ? (
          <div className="space-y-2">
            <Label htmlFor="submit-redirect-url">Redirect URL</Label>
            <Input
              id="submit-redirect-url"
              value={submit.redirectUrl ?? ""}
              onChange={(event) =>
                onSubmitChange({ ...submit, redirectUrl: event.target.value })
              }
              placeholder="https://example.com/thank-you"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="submit-success-message">Success message</Label>
            <Textarea
              id="submit-success-message"
              value={submit.successMessage ?? ""}
              onChange={(event) =>
                onSubmitChange({ ...submit, successMessage: event.target.value })
              }
              placeholder="Thank you for your submission."
              rows={3}
            />
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">Email Notification</h3>
          <div className="flex items-center gap-2">
            <Switch
              id="email-enabled"
              checked={email.enabled}
              onCheckedChange={(checked) =>
                onEmailChange({ ...email, enabled: checked })
              }
            />
            <Label htmlFor="email-enabled">Enabled</Label>
          </div>
        </div>

        {email.enabled ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email-to">To</Label>
                <Input
                  id="email-to"
                  type="email"
                  value={email.to}
                  onChange={(event) =>
                    onEmailChange({ ...email, to: event.target.value })
                  }
                  placeholder="admin@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-reply-to-field">Reply-To field</Label>
                <Input
                  id="email-reply-to-field"
                  value={email.replyToField ?? ""}
                  onChange={(event) =>
                    onEmailChange({ ...email, replyToField: event.target.value })
                  }
                  placeholder="email"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email-from">From email (optional)</Label>
                <Input
                  id="email-from"
                  type="email"
                  value={email.fromEmail ?? ""}
                  onChange={(event) =>
                    onEmailChange({ ...email, fromEmail: event.target.value })
                  }
                  placeholder="Uses SMTP default if empty"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-from-name">From name (optional)</Label>
                <Input
                  id="email-from-name"
                  value={email.fromName ?? ""}
                  onChange={(event) =>
                    onEmailChange({ ...email, fromName: event.target.value })
                  }
                  placeholder="Site notifications"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-subject">Subject</Label>
              <Input
                id="email-subject"
                value={email.subject}
                onChange={(event) =>
                  onEmailChange({ ...email, subject: event.target.value })
                }
                placeholder="New submission for {{formTitle}}"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-body">Body</Label>
              <Textarea
                id="email-body"
                value={email.body}
                onChange={(event) =>
                  onEmailChange({ ...email, body: event.target.value })
                }
                rows={8}
                placeholder="New submission received..."
              />
              <p className="text-xs text-muted-foreground">
                Placeholders: {fieldPlaceholderHints || "Add fields first"},{" "}
                {"{{formTitle}}"}, {"{{siteTitle}}"}, {"{{submittedAt}}"}
              </p>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
