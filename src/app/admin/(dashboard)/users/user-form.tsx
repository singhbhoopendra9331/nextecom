"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { createUser } from "@/actions/users/create-user";
import { updateUser } from "@/actions/users/update-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AppUserRole } from "@/lib/auth/roles";
import { USER_ROLE_LABELS } from "@/lib/auth/roles";
import { toast } from "@/lib/toast";

export type UserFormInitialValues = {
  name?: string | null;
  email?: string;
  role?: AppUserRole;
};

type UserFormProps = {
  mode: "create" | "edit";
  userId?: string;
  initialValues?: UserFormInitialValues;
  assignableRoles?: AppUserRole[];
  onSuccess?: () => void;
  showHeader?: boolean;
};

export default function UserForm({
  mode,
  userId,
  initialValues,
  assignableRoles = [],
  onSuccess,
  showHeader = true,
}: UserFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialValues?.name ?? "");
  const [email, setEmail] = useState(initialValues?.email ?? "");
  const [role, setRole] = useState<AppUserRole>(
    initialValues?.role ?? assignableRoles[0] ?? "EDITOR"
  );
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setName(initialValues?.name ?? "");
    setEmail(initialValues?.email ?? "");
    setRole(initialValues?.role ?? assignableRoles[0] ?? "EDITOR");
    setPassword("");
    setConfirmPassword("");
  }, [userId, initialValues?.name, initialValues?.email, initialValues?.role, assignableRoles]);

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
      ...(assignableRoles.length > 0 ? { role } : {}),
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
      if (onSuccess) {
        onSuccess();
        return;
      }
      router.push("/admin/users");
      return;
    }

    toast.error(res.error ?? `Failed to ${mode} user`);
  }

  return (
    <div className={showHeader ? "min-h-screen p-2 md:p-4" : undefined}>
      {showHeader && (
        <div className="mb-4 flex items-center gap-4">
          <h1 className="font-semibold text-2xl">
            {mode === "create" ? "Create User" : "Edit User"}
          </h1>
          <Button variant="outline" asChild>
            <Link href="/admin/users">Back to Users</Link>
          </Button>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className={showHeader ? "max-w-md space-y-4" : "space-y-4 px-4"}
      >
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

        {assignableRoles.length > 0 ? (
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(value) => setRole(value as AppUserRole)}>
              <SelectTrigger id="role" className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {assignableRoles.map((assignableRole) => (
                  <SelectItem key={assignableRole} value={assignableRole}>
                    {USER_ROLE_LABELS[assignableRole]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

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
