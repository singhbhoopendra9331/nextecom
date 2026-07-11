import { z } from "zod";

const parentIdSchema = z
  .union([z.string().uuid("Invalid parent comment"), z.literal(""), z.null()])
  .optional()
  .transform((value) => value || null);

const authorUrlSchema = z
  .string()
  .trim()
  .max(500, "URL is too long")
  .refine(
    (value) => value === "" || z.string().url().safeParse(value).success,
    "Enter a valid URL"
  )
  .optional();

export const commentFieldsSchema = z.object({
  authorName: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name is too long"),
  authorEmail: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address")
    .max(255, "Email is too long"),
  authorUrl: authorUrlSchema,
  content: z
    .string()
    .trim()
    .min(1, "Comment is required")
    .max(5000, "Comment is too long"),
  website: z.string().max(0).optional(),
});

export const submitCommentSchema = commentFieldsSchema.extend({
  postId: z.string().uuid("Invalid post"),
  parentId: parentIdSchema,
});

export type CommentFieldsInput = z.infer<typeof commentFieldsSchema>;
export type SubmitCommentInput = z.infer<typeof submitCommentSchema>;
