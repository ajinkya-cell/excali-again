export type Shape =
  | {
      id: number;
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      id: number;
      type: "circle";
      x: number;
      y: number;
      raidus: number;
      startangle: 0;
      endangle: 6.28;
    };

export type Handle = {
  x: number;
  y: number;
  r: number;
  id: number;
  position: "topleft" | "topright" | "bottomleft" | "bottomright";
};

export function ispointinshape(
  shape: Shape,
  startx: number,
  starty: number
): boolean {
  if (shape.type == "rect") {
    const left = Math.min(shape.x, shape.x + shape.width);
    const right = Math.max(shape.x, shape.x + shape.width);
    const top = Math.min(shape.y, shape.y + shape.height);
    const bottom = Math.max(shape.y, shape.y + shape.height);
    return startx >= left && startx <= right && starty >= top && starty <= bottom;
  } else if (shape.type == "circle") {
    const dx = startx - shape.x;
    const dy = starty - shape.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= shape.raidus;
  }
  return false;
}

export function checkselection(
  existing: Shape[],
  startx: number,
  starty: number
): number | null {
  let selectedshape: Shape | null = null;
  for (let i = existing.length - 1; i >= 0; i--) {
    const isSelected = ispointinshape(existing[i]!, startx, starty);
    if (isSelected) {
      selectedshape = existing[i]!;
      break;
    }
  }
  if (selectedshape) {
    return selectedshape.id;
  }
  return null;
}

export function insidehandle(
  shape: Handle,
  startx: number,
  starty: number
): boolean {
  if (shape) {
    const dx = startx - shape.x;
    const dy = starty - shape.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= shape.r;
  }
  return false;
}

export function ishandleclicked(
  circleshandles: Handle[],
  startx: number,
  starty: number
): Handle["position"] | null {
  for (const h of circleshandles) {
    if (insidehandle(h, startx, starty)) {
      return h.position;
    }
  }
  return null;
}

export function getCanvasCoords(
  canvas: { getBoundingClientRect: () => DOMRect },
  e: { clientX: number; clientY: number }
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

export function sizingcal(
  startx: number,
  starty: number,
  endx: number,
  endy: number
): { height: number; width: number } {
  const width = endx - startx;
  const height = endy - starty;
  return { height, width };
}
