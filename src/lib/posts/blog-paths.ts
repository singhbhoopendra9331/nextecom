export const BLOGS_PER_PAGE = 9;

export function getBlogPagePath(page: number, search = "") {
  const params = new URLSearchParams();

  if (search.trim()) {
    params.set("search", search.trim());
  }

  const query = params.toString();
  const suffix = query ? `?${query}` : "";

  if (page <= 1) {
    return `/blogs${suffix}`;
  }

  return `/blogs/page/${page}${suffix}`;
}
