"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";

import { deleteAccountAction } from "@/actions/account/delete-account";
import { updateAccountAction } from "@/actions/account/update-account";
import { EmailField, TextField } from "@/components/form";
import { Button } from "@/components/ui/button";
import type { AppUserRole } from "@/lib/auth/roles";
import { USER_ROLE_LABELS } from "@/lib/auth/roles";
import {
  deleteAccountSchema,
  updateAccountSchema,
  type DeleteAccountInput,
  type UpdateAccountInput,
} from "@/lib/auth/schemas";
import { toast } from "@/lib/toast";

type AccountPageClientProps = {
  initialValues: {
    name: string;
    email: string;
    role: AppUserRole;
  };
};

export default function AccountPageClient({
  initialValues,
}: AccountPageClientProps) {
  const router = useRouter();
  const [isSaving, startSaveTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const profileForm = useForm<UpdateAccountInput>({
    resolver: zodResolver(updateAccountSchema),
    defaultValues: {
      name: initialValues.name,
      email: initialValues.email,
      currentPassword: "",
      password: "",
      confirmPassword: "",
    },
  });

  const deleteForm = useForm<DeleteAccountInput>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      password: "",
      confirmation: "",
    },
  });

  useEffect(() => {
    profileForm.reset({
      name: initialValues.name,
      email: initialValues.email,
      currentPassword: "",
      password: "",
      confirmPassword: "",
    });
  }, [initialValues.name, initialValues.email, profileForm.reset]);

  function onProfileSubmit(values: UpdateAccountInput) {
    startSaveTransition(async () => {
      const result = await updateAccountAction(values);

      if (result.success) {
        toast.success("Account updated successfully");
        profileForm.reset({
          name: values.name,
          email: values.email,
          currentPassword: "",
          password: "",
          confirmPassword: "",
        });
        router.refresh();
        return;
      }

      toast.error(result.error ?? "Failed to update account");
    });
  }

  function onDeleteSubmit(values: DeleteAccountInput) {
    startDeleteTransition(async () => {
      const result = await deleteAccountAction(values);

      if (result && !result.success) {
        toast.error(result.error ?? "Failed to delete account");
      }
    });
  }

  return (
    <>
      <form
        onSubmit={profileForm.handleSubmit(onProfileSubmit)}
        className="max-w-md space-y-4"
      >
        <TextField
          id="role"
          name="role"
          label="Role"
          value={USER_ROLE_LABELS[initialValues.role]}
          disabled
          readOnly
        />

        <TextField
          name="name"
          control={profileForm.control}
          label="Name"
          placeholder="Enter full name"
          autoComplete="name"
        />

        <EmailField
          name="email"
          control={profileForm.control}
          label="Email"
          placeholder="user@example.com"
          required
        />

        <TextField
          name="currentPassword"
          control={profileForm.control}
          label="Current Password"
          type="password"
          placeholder="Required when changing email or password"
          autoComplete="current-password"
        />

        <TextField
          name="password"
          control={profileForm.control}
          label="New Password"
          type="password"
          placeholder="Leave blank to keep current password"
          autoComplete="new-password"
        />

        <TextField
          name="confirmPassword"
          control={profileForm.control}
          label="Confirm Password"
          type="password"
          placeholder="Confirm new password"
          autoComplete="new-password"
        />

        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Updating..." : "Update Account"}
        </Button>
      </form>

      <form
        onSubmit={deleteForm.handleSubmit(onDeleteSubmit)}
        className="mt-10 max-w-md space-y-4"
      >
        <h2 className="font-semibold text-lg">Delete Account</h2>

        <TextField
          name="confirmation"
          control={deleteForm.control}
          label="Confirmation"
          placeholder='Type "DELETE" to confirm'
        />

        <TextField
          name="password"
          control={deleteForm.control}
          label="Password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
        />

        <Button type="submit" variant="destructive" disabled={isDeleting}>
          {isDeleting ? "Deleting..." : "Delete Account"}
        </Button>
      </form>
    </>
  );
}
