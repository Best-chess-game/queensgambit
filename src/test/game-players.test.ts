import { describe, expect, it } from "vitest";
import { playerColor, playerNames } from "@/lib/game-players";

describe("Player colors", () => {
  it("assigns a human playing White and the computer playing Black", () => {
    expect(playerNames("Alex", "Computer", "w")).toEqual({ w: "Alex", b: "Computer" });
  });
  it("assigns a human playing Black and the computer playing White", () => {
    expect(playerNames("Alex", "Computer", "b")).toEqual({ w: "Computer", b: "Alex" });
  });
  it("assigns local players to opposite sides", () => {
    expect(playerNames("Alex", "Sam", "b")).toEqual({ w: "Sam", b: "Alex" });
  });
  it.each(["w", "b"])("accepts %s as an online seat", (color) => {
    expect(playerColor(color)).toBe(color);
  });
  it.each([undefined, "white", "x", null])("rejects invalid online colors", (color) => {
    expect(() => playerColor(color)).toThrow("Choose White or Black");
  });
});
