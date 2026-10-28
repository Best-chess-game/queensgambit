import { describe, expect, it } from "vitest";
import { cleanComment, hasSwearing } from "./profanity";

describe("comment filter", () => {
  it("blocks English swearing, even disguised", () => {
    expect(hasSwearing("what the FUCK")).toBe(true);
    expect(hasSwearing("sh1t move")).toBe(true);
  });
  it("blocks German swearing", () => {
    expect(hasSwearing("Du Arschloch")).toBe(true);
    expect(cleanComment("Scheiße!")).toBeNull();
  });
  it("allows friendly comments", () => {
    expect(cleanComment("Nice move!")).toBe("Nice move!");
    expect(cleanComment("Guter Zug!")).toBe("Guter Zug!");
  });
});
