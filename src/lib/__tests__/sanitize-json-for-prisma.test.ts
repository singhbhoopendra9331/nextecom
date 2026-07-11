import { describe, expect, it } from "vitest";

import {
  sanitizeBlockContent,
  sanitizeJsonForPrisma,
} from "@/lib/sanitize-json-for-prisma";

describe("sanitizeJsonForPrisma", () => {
  it("replaces undefined array items with null", () => {
    expect(sanitizeJsonForPrisma({ columnWidths: [100, undefined, 200] })).toEqual(
      { columnWidths: [100, null, 200] }
    );
  });

  it("sanitizes nested BlockNote table content", () => {
    const content = [
      {
        type: "table",
        content: {
          columnWidths: [undefined, 120],
          rows: [{ cells: ["a", "b"] }],
        },
      },
    ];

    expect(sanitizeBlockContent(content)).toEqual([
      {
        type: "table",
        content: {
          columnWidths: [null, 120],
          rows: [{ cells: ["a", "b"] }],
        },
      },
    ]);
  });

  it("returns an empty array for non-array content", () => {
    expect(sanitizeBlockContent(null)).toEqual([]);
    expect(sanitizeBlockContent(undefined)).toEqual([]);
  });
});
