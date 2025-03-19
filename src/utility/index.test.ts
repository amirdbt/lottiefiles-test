import { describe, expect, it } from "vitest";
import { formatFrame } from ".";

describe("formatFrame", () => {
  it("should return '00:00' when currentFrame is 0", () => {
    expect(formatFrame(0, 60)).toBe("00:00");
  });

  it("should return '00:00' when totalFrames is 0", () => {
    expect(formatFrame(30, 0)).toBe("00:00");
  });

  it("should format frames correctly", () => {
    expect(formatFrame(5, 60)).toBe("05:60");
    expect(formatFrame(45, 100)).toBe("45:100");
  });

  it("should handle large frame numbers", () => {
    expect(formatFrame(999, 1000)).toBe("999:1000");
  });

  it("should round the currentFrame correctly", () => {
    expect(formatFrame(4.6, 50)).toBe("05:50");
    expect(formatFrame(3.2, 30)).toBe("03:30");
  });
});
