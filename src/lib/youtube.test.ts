import { describe, expect, it } from "vitest";
import { extractVideoId } from "@/lib/youtube";

describe("extractVideoId", () => {
  it("parses watch URLs", () => {
    expect(extractVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("parses youtu.be URLs", () => {
    expect(extractVideoId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("parses raw 11-char id", () => {
    expect(extractVideoId("dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("returns null for invalid input", () => {
    expect(extractVideoId("https://example.com/video")).toBeNull();
  });
});
