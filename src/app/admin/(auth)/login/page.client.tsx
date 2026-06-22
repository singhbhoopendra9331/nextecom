"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginAction } from "@/actions/auth/login";
import { AuthShell } from "@/components/admin/auth-shell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginInput } from "@/lib/auth/schemas";

export default function LoginPageClient() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? undefined;
  const resetSuccess = searchParams.get("reset") === "success";
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: LoginInput) {
    setError(null);

    startTransition(async () => {
      const result = await loginAction(values, nextPath);

      if (result && !result.success) {
        setError(result.error);
      }
    });
  }

  return (
    <AuthShell
      title="Sign in"
      description="Enter your credentials to access the admin dashboard"
      footer={
        <div className="space-y-2 text-muted-foreground">
          <p>
            No account?{" "}
            <Link href="/admin/register" className="text-primary hover:underline">
              Create one
            </Link>
          </p>
          <p>
            <Link
              href="/admin/reset-password"
              className="text-primary hover:underline"
            >
              Forgot your password?
            </Link>
          </p>
        </div>
      }
    >
      {resetSuccess ? (
        <Alert>
          <AlertDescription>
            Your password has been reset. Sign in with your new password.
          </AlertDescription>
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

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            {...form.register("password")}
          />
          {form.formState.errors.password ? (
            <p className="text-sm text-destructive">
              {form.formState.errors.password.message}
            </p>
          ) : null}
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </AuthShell>
  );
}
