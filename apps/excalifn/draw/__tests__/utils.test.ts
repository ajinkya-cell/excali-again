import { describe, it, expect } from "vitest";
import {
  ispointinshape,
  checkselection,
  insidehandle,
  ishandleclicked,
  getCanvasCoords,
  sizingcal,
  Shape,
  Handle,
} from "../utils";

// ---------------------------------------------------------------------------
// ispointinshape
// ---------------------------------------------------------------------------
describe("ispointinshape", () => {
  const rect: Shape = {
    id: 1,
    type: "rect",
    x: 10,
    y: 10,
    width: 100,
    height: 50,
  };

  const circle: Shape = {
    id: 2,
    type: "circle",
    x: 50,
    y: 50,
    raidus: 30,
    startangle: 0,
    endangle: 6.28,
  };

  it("returns true for a point inside a rectangle", () => {
    expect(ispointinshape(rect, 50, 30)).toBe(true);
  });

  it("returns true for a point on the rectangle edge", () => {
    expect(ispointinshape(rect, 10, 10)).toBe(true);
    expect(ispointinshape(rect, 110, 60)).toBe(true);
  });

  it("returns false for a point outside a rectangle", () => {
    expect(ispointinshape(rect, 5, 5)).toBe(false);
    expect(ispointinshape(rect, 200, 200)).toBe(false);
  });

  it("handles rectangles with negative width/height", () => {
    const negRect: Shape = {
      id: 3,
      type: "rect",
      x: 100,
      y: 100,
      width: -50,
      height: -30,
    };
    // Bounding box: x 50-100, y 70-100
    expect(ispointinshape(negRect, 75, 85)).toBe(true);
    expect(ispointinshape(negRect, 40, 85)).toBe(false);
  });

  it("returns true for a point inside a circle", () => {
    expect(ispointinshape(circle, 50, 50)).toBe(true);
    expect(ispointinshape(circle, 60, 50)).toBe(true);
  });

  it("returns true for a point on the circle boundary", () => {
    expect(ispointinshape(circle, 80, 50)).toBe(true);
  });

  it("returns false for a point outside a circle", () => {
    expect(ispointinshape(circle, 100, 100)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// checkselection
// ---------------------------------------------------------------------------
describe("checkselection", () => {
  const shapes: Shape[] = [
    { id: 1, type: "rect", x: 0, y: 0, width: 50, height: 50 },
    { id: 2, type: "rect", x: 25, y: 25, width: 50, height: 50 },
  ];

  it("returns the topmost (last) overlapping shape id", () => {
    // Point (30, 30) is inside both shapes — should return shape 2 (higher index)
    expect(checkselection(shapes, 30, 30)).toBe(2);
  });

  it("returns the only matching shape id", () => {
    // Point (10, 10) is only inside shape 1
    expect(checkselection(shapes, 10, 10)).toBe(1);
  });

  it("returns null when no shape is hit", () => {
    expect(checkselection(shapes, 200, 200)).toBeNull();
  });

  it("returns null for an empty shapes array", () => {
    expect(checkselection([], 10, 10)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// insidehandle
// ---------------------------------------------------------------------------
describe("insidehandle", () => {
  const handle: Handle = {
    x: 100,
    y: 100,
    r: 10,
    id: 1,
    position: "topleft",
  };

  it("returns true when the point is inside the handle", () => {
    expect(insidehandle(handle, 100, 100)).toBe(true);
    expect(insidehandle(handle, 105, 100)).toBe(true);
  });

  it("returns true when the point is on the handle boundary", () => {
    expect(insidehandle(handle, 110, 100)).toBe(true);
  });

  it("returns false when the point is outside the handle", () => {
    expect(insidehandle(handle, 120, 120)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// ishandleclicked
// ---------------------------------------------------------------------------
describe("ishandleclicked", () => {
  const handles: Handle[] = [
    { x: 0, y: 0, r: 5, id: 1, position: "topleft" },
    { x: 100, y: 0, r: 5, id: 1, position: "topright" },
    { x: 0, y: 100, r: 5, id: 1, position: "bottomleft" },
    { x: 100, y: 100, r: 5, id: 1, position: "bottomright" },
  ];

  it("returns the position of the clicked handle", () => {
    expect(ishandleclicked(handles, 0, 0)).toBe("topleft");
    expect(ishandleclicked(handles, 100, 0)).toBe("topright");
    expect(ishandleclicked(handles, 0, 100)).toBe("bottomleft");
    expect(ishandleclicked(handles, 100, 100)).toBe("bottomright");
  });

  it("returns null when no handle is clicked", () => {
    expect(ishandleclicked(handles, 50, 50)).toBeNull();
  });

  it("returns null for an empty handles array", () => {
    expect(ishandleclicked([], 0, 0)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// getCanvasCoords
// ---------------------------------------------------------------------------
describe("getCanvasCoords", () => {
  it("returns coordinates relative to the canvas", () => {
    const canvas = {
      getBoundingClientRect: () =>
        ({ left: 10, top: 20 }) as DOMRect,
    };
    const event = { clientX: 50, clientY: 70 };

    const coords = getCanvasCoords(canvas, event);
    expect(coords).toEqual({ x: 40, y: 50 });
  });

  it("handles canvas at origin", () => {
    const canvas = {
      getBoundingClientRect: () =>
        ({ left: 0, top: 0 }) as DOMRect,
    };
    const event = { clientX: 100, clientY: 200 };

    const coords = getCanvasCoords(canvas, event);
    expect(coords).toEqual({ x: 100, y: 200 });
  });
});

// ---------------------------------------------------------------------------
// sizingcal
// ---------------------------------------------------------------------------
describe("sizingcal", () => {
  it("calculates positive width and height", () => {
    expect(sizingcal(10, 20, 110, 70)).toEqual({ width: 100, height: 50 });
  });

  it("returns negative values when end is before start", () => {
    expect(sizingcal(100, 100, 50, 60)).toEqual({ width: -50, height: -40 });
  });

  it("returns zero when start equals end", () => {
    expect(sizingcal(10, 10, 10, 10)).toEqual({ width: 0, height: 0 });
  });
});
