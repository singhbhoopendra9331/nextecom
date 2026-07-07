import { headers } from "next/headers";

export type SubmissionRequestMeta = {
  ip: string | null;
  source: string | null;
  userAgent: string | null;
};

export async function getSubmissionRequestMeta(
  sourceOverride?: string | null
): Promise<SubmissionRequestMeta> {
  const headerStore = await headers();

  const forwardedFor = headerStore.get("x-forwarded-for");
  const ip =
    forwardedFor?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    null;

  const referer = headerStore.get("referer");
  const source = sourceOverride?.trim() || referer || null;
  const userAgent = headerStore.get("user-agent");

  return {
    ip,
    source,
    userAgent,
  };
}
