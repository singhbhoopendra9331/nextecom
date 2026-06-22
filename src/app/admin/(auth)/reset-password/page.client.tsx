"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { requestPasswordResetAction } from "@/actions/auth/request-password-reset";
import { AuthShell } from "@/components/admin/auth-shell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  requestPasswordResetSchema,
  type RequestPasswordResetInput,
} from "@/lib/auth/schemas";

export default function ResetPasswordPageClient() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<RequestPasswordResetInput>({
    resolver: zodResolver(requestPasswordResetSchema),
    defaultValues: {
      email: "",
    },
  });

  function onSubmit(values: RequestPasswordResetInput) {
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const result = await requestPasswordResetAction(values);

      if (!result.success) {
        setError(result.error);
        return;
      }

      setMessage(result.message);
      form.reset();
    });
  }

  return (
    <AuthShell
      title="Reset password"
      description="Enter your email and we will send you a reset link"
      footer={
        <Link href="/admin/login" className="text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      {message ? (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...form.register("email")}
          />
          {form.formState.errors.email ? (
            <p className="text-sm text-destructive">
              {form.formState.errors.email.message}
            </p>
          ) : null}
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Sending..." : "Send reset link"}
        </Button>
      </form>
    </AuthShell>
  );
}
