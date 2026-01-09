import { describe, expect, test } from "bun:test";
import { cn } from "./utils";

describe("cn utility", () => {
  test("merges multiple class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  test("handles conditional classes", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
  });

  test("handles undefined values", () => {
    expect(cn("foo", undefined, "bar")).toBe("foo bar");
  });

  test("handles null values", () => {
    expect(cn("foo", null, "bar")).toBe("foo bar");
  });

  test("handles empty strings", () => {
    expect(cn("foo", "", "bar")).toBe("foo bar");
  });

  test("handles arrays", () => {
    expect(cn(["foo", "bar"])).toBe("foo bar");
  });

  test("handles objects with truthy values", () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe("foo baz");
  });

  test("merges conflicting Tailwind classes (last wins)", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  test("merges complex Tailwind class conflicts", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  test("preserves non-conflicting Tailwind classes", () => {
    expect(cn("px-2", "py-4")).toBe("px-2 py-4");
  });

  test("handles mixed input types", () => {
    expect(cn("foo", ["bar", "baz"], { qux: true, quux: false })).toBe("foo bar baz qux");
  });

  test("returns empty string for no arguments", () => {
    expect(cn()).toBe("");
  });

  test("returns empty string for all falsy arguments", () => {
    expect(cn(false, null, undefined, "")).toBe("");
  });

  test("handles Tailwind responsive prefixes correctly", () => {
    expect(cn("md:px-2", "md:px-4")).toBe("md:px-4");
  });

  test("handles Tailwind state variants correctly", () => {
    expect(cn("hover:bg-red-500", "hover:bg-blue-500")).toBe("hover:bg-blue-500");
  });
});
