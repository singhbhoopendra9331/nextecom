import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    name: z.string().trim().optional(),
    email: z.email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const requestPasswordResetSchema = z.object({
  email: z.email("Enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type RequestPasswordResetInput = z.infer<
  typeof requestPasswordResetSchema
>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const updateAccountSchema = z
  .object({
    name: z.string().trim().optional(),
    email: z.email("Enter a valid email address"),
    currentPassword: z.string().optional(),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const wantsPasswordChange = Boolean(data.password?.trim());

    if (wantsPasswordChange) {
      if (!data.currentPassword?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Current password is required to set a new password",
          path: ["currentPassword"],
        });
      }

      if ((data.password?.length ?? 0) < 8) {
        ctx.addIssue({
          code: "custom",
          message: "Password must be at least 8 characters",
          path: ["password"],
        });
      }

      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: "custom",
          message: "Passwords do not match",
          path: ["confirmPassword"],
        });
      }
    }
  });

export const deleteAccountSchema = z
  .object({
    password: z.string().min(1, "Enter your password to confirm deletion"),
    confirmation: z.string().min(1, 'Type "DELETE" to confirm'),
  })
  .refine((data) => data.confirmation === "DELETE", {
    message: 'Type "DELETE" to confirm',
    path: ["confirmation"],
  });

export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
