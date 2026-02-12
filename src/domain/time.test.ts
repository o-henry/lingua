import { describe, expect, it } from "vitest";
import { formatTime, parseTime } from "@/domain/time";

describe("parseTime", () => {
  it("parses seconds-only input", () => {
    expect(parseTime("75")).toBe(75);
  });

  it("parses mm:ss input", () => {
    expect(parseTime("14:00")).toBe(840);
    expect(parseTime("30:00")).toBe(1800);
    expect(parseTime("2:05")).toBe(125);
  });

  it("parses h:mm:ss input", () => {
    expect(parseTime("1:02:03")).toBe(3723);
  });

  it("ignores surrounding and inline spaces", () => {
    expect(parseTime(" 14 : 00 ")).toBe(840);
  });

  it("fails for invalid second ranges", () => {
    expect(parseTime("14:60")).toBeNull();
    expect(parseTime("1:02:60")).toBeNull();
  });

  it("fails for unsupported formats", () => {
    expect(parseTime("")).toBeNull();
    expect(parseTime("1:2:3")).toBeNull();
    expect(parseTime("abc")).toBeNull();
    expect(parseTime("-1")).toBeNull();
  });
});

describe("formatTime", () => {
  it("formats sub-hour values as mm:ss", () => {
    expect(formatTime(840)).toBe("14:00");
    expect(formatTime(5)).toBe("00:05");
  });

  it("formats hour values as h:mm:ss", () => {
    expect(formatTime(3723)).toBe("1:02:03");
  });
});
