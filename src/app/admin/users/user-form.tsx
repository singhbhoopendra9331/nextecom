"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createUser } from "@/actions/users/create-user";
import { updateUser } from "@/actions/users/update-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";

export type UserFormInitialValues = {
  name?: string | null;
  email?: string;
};

type UserFormProps = {
  mode: "create" | "edit";
  userId?: string;
  initialValues?: UserFormInitialValues;
};

export default function UserForm({
  mode,
  userId,
  initialValues,
}: UserFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialValues?.name ?? "");
  const [email, setEmail] = useState(initialValues?.email ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (mode === "create" && !password) {
      toast.error("Password is required");
      return;
    }

    if (password && password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (password && password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name: name.trim() || undefined,
      email: email.trim(),
      ...(password ? { password } : {}),
    };

    const res =
      mode === "edit" && userId
        ? await updateUser(userId, payload)
        : await createUser({
            ...payload,
            password: password,
          });

    setIsSubmitting(false);

    if (res.success) {
      toast.success(
        mode === "create"
          ? "User created successfully"
          : "User updated successfully"
      );
      router.push("/admin/users");
      return;
    }

    toast.error(res.error ?? `Failed to ${mode} user`);
  }

  return (
    <div className="min-h-screen p-2 md:p-4">
      <div className="mb-4 flex items-center gap-4">
        <h1 className="font-semibold text-2xl">
          {mode === "create" ? "Create User" : "Edit User"}
        </h1>
        <Button variant="outline" asChild>
          <Link href="/admin/users">Back to Users</Link>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter full name"
            autoComplete="name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            autoComplete="email"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">
            {mode === "create" ? "Password" : "New Password"}
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={
              mode === "create"
                ? "At least 8 characters"
                : "Leave blank to keep current password"
            }
            autoComplete="new-password"
            required={mode === "create"}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={
              mode === "create" ? "Re-enter password" : "Confirm new password"
            }
            autoComplete="new-password"
            required={mode === "create"}
          />
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? mode === "create"
              ? "Creating..."
              : "Updating..."
            : mode === "create"
              ? "Create User"
              : "Update User"}
        </Button>
      </form>
    </div>
  );
}
