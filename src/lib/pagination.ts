import {
  PAGINATION_DEFAULT_LIMIT,
  PAGINATION_MAX_LIMIT,
  PAGINATION_MAX_PAGE,
} from "@/constants";

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.floor(parsed);
}

export function parsePaginationParams(
  pageParam: string | null,
  limitParam: string | null,
  defaultLimit = PAGINATION_DEFAULT_LIMIT
) {
  const page = Math.min(
    PAGINATION_MAX_PAGE,
    parsePositiveInt(pageParam, 1)
  );
  const limit = Math.min(
    PAGINATION_MAX_LIMIT,
    parsePositiveInt(limitParam, defaultLimit)
  );

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}
