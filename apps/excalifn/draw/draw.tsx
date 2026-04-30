import { http } from "@/components/endpoints";
import axios from "axios"
import { RefObject } from "react";

export type shapes = {
    id: number, type: "rect",
    x: number, y: number, width: number, height: number
} | {
    id: number, type: "circle",
    x: number, y: number, raidus: number, startangle: 0, endangle: 6.28
} | {
    id: number, type: "text",
    x: number, y: number, text: string, fontSize: number
} | {
    id: number, type: "arrow",
    startX: number, startY: number, endX: number, endY: number
}

type handles = {
    x: number, y: number, r: number,
    id: number, position: "topleft" | "topright" | "bottomleft" | "bottomright"
}

const DARK_BG    = "#0a0a0a";
const SHAPE_CLR  = "rgba(255,255,255,0.9)";
const SELECT_CLR = "#a855f7";

function genId() {
    return (Date.now() + Math.floor(Math.random() * 1000)) % 2147483647;
}

export default async function intindraw(
    canvas: HTMLCanvasElement,
    roomId: string,
    ws: WebSocket,
    tool: RefObject<string>
): Promise<{
    cleanup: () => void;
    addText: (x: number, y: number, text: string, fontSize: number) => void;
}> {
    // Set canvas pixel size = actual rendered CSS size (no coordinate scaling)
    const domRect = canvas.getBoundingClientRect();
    canvas.width  = domRect.width  || window.innerWidth;
    canvas.height = domRect.height || window.innerHeight;

    const existing: shapes[] = await getExistingshapes(roomId);
    let selectedShapeId: number | null = null;
    let circleshandles: handles[] = [];

    const ctx = canvas.getContext("2d")!;
    clearCanvas(existing, canvas, ctx, circleshandles);

    // ── addText — called from Canvas.tsx React overlay ──
    const addText = (x: number, y: number, text: string, fontSize: number) => {
        if (!text.trim()) return;
        const shape: shapes = { id: genId(), type: "text", x, y, text, fontSize };
        existing.push(shape);
        clearCanvas(existing, canvas, ctx, circleshandles, selectedShapeId);
        ws.send(JSON.stringify({ type: "chat", message: JSON.stringify({ shape }), roomId }));
    };

    // ── WebSocket ──
    ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === "chat") {
            const parsed = JSON.parse(msg.message);
            const dbId = Number(msg.id);
            const found = existing.find(e => e.id === parsed.shape.id);
            if (found) {
                // Replace the temporary local genId with the real DB id
                if (selectedShapeId === found.id) selectedShapeId = dbId;
                found.id = dbId;
            } else {
                // Shape from another client — use the DB id directly
                if (dbId) parsed.shape.id = dbId;
                existing.push(parsed.shape);
            }
        } else if (msg.type === "move_shape") {
            const parsed = JSON.parse(msg.message);
            const s = existing.find(e => e.id === parsed.shape.id);
            if (s) Object.assign(s, parsed.shape);
        } else if (msg.type === "delete_shape") {
            const id = Number(msg.id);
            const idx = existing.findIndex(e => e.id === id);
            if (idx !== -1) existing.splice(idx, 1);
            if (selectedShapeId === id) selectedShapeId = null;
        }
        clearCanvas(existing, canvas, ctx, circleshandles, selectedShapeId);
    };

    // ── Coords (1:1 — no scaling needed) ──
    const getCoords = (e: MouseEvent) => {
        const r = canvas.getBoundingClientRect();
        return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    // ── Drag state ──
    let clicked = false, sizing = false, isDragging = false;
    let startx = 0, starty = 0;
    let shapestartx = 0, shapestarty = 0;
    let arrowStartX = 0, arrowStartY = 0, arrowEndX = 0, arrowEndY = 0;
    let sizestartx = 0, sizestarty = 0;
    let initialwidth = 0, initialheight = 0;
    let initialFontSize = 20, sizeInitDist = 0;
    let activeHandle: handles["position"] | null = null;

    // ── MOUSEDOWN ──
    const onDown = (e: MouseEvent) => {
        const { x, y } = getCoords(e);
        startx = x; starty = y;

        // Text tool is handled entirely by Canvas.tsx React layer — skip here
        if (tool.current === "text") return;

        // ERASE — instant delete on click
        if (tool.current === "erase") {
            const hitId = checkSelection(existing, x, y, ctx);
            if (hitId !== null) {
                existing.splice(existing.findIndex(e => e.id === hitId), 1);
                if (selectedShapeId === hitId) selectedShapeId = null;
                clearCanvas(existing, canvas, ctx, circleshandles, selectedShapeId);
                ws.send(JSON.stringify({ type: "delete_shape", id: hitId, roomId }));
            }
            return;
        }

        clicked = true;

        if (tool.current === "select") {
            const handle = isHandleClicked(circleshandles, x, y);
            if (handle) {
                sizing = true;
                activeHandle = handle;
                const sel = existing.find(e => e.id === selectedShapeId);
                if (sel?.type === "rect") {
                    initialwidth = sel.width; initialheight = sel.height;
                    sizestartx = sel.x; sizestarty = sel.y;
                } else if (sel?.type === "circle") {
                    sizestartx = sel.x; sizestarty = sel.y;
                } else if (sel?.type === "text") {
                    ctx.font = `${sel.fontSize}px serif`;
                    const lines = sel.text.split("\n");
                    const w = Math.max(...lines.map(l => ctx.measureText(l).width));
                    const h = lines.length * sel.fontSize * 1.3;
                    sizeInitDist = Math.hypot(x - (sel.x + w/2), y - (sel.y + h/2)) || 1;
                    initialFontSize = sel.fontSize;
                } else if (sel?.type === "arrow") {
                    sizestartx = sel.startX; sizestarty = sel.startY;
                    arrowEndX = sel.endX; arrowEndY = sel.endY;
                }
                return;
            }
            const hit = checkSelection(existing, x, y, ctx);
            selectedShapeId = hit;
            circleshandles.length = 0;
            isDragging = false;
            if (hit !== null) {
                const sel = existing.find(e => e.id === hit)!;
                if (sel.type === "arrow") {
                    shapestartx = sel.startX; shapestarty = sel.startY;
                    arrowEndX = sel.endX; arrowEndY = sel.endY;
                }
                else { shapestartx = sel.x; shapestarty = sel.y; }
                isDragging = true;
                if (sel.type === "rect") { initialwidth = sel.width; initialheight = sel.height; sizestartx = sel.x; sizestarty = sel.y; }
                else if (sel.type === "circle") { sizestartx = sel.x; sizestarty = sel.y; }
                else if (sel.type === "text") { initialFontSize = sel.fontSize; }
                else if (sel.type === "arrow") { shapestartx = sel.startX; shapestarty = sel.startY; }
            }
            clearCanvas(existing, canvas, ctx, circleshandles, selectedShapeId);
        }
    };

    // ── MOUSEMOVE ──
    const onMove = (e: MouseEvent) => {
        if (!clicked) return;
        const { x: mx, y: my } = getCoords(e);
        clearCanvas(existing, canvas, ctx, circleshandles, selectedShapeId);
        ctx.strokeStyle = SHAPE_CLR; ctx.lineWidth = 2; ctx.setLineDash([]);

        if (tool.current === "rec") {
            ctx.strokeRect(startx, starty, mx - startx, my - starty);
        } else if (tool.current === "circle") {
            ctx.beginPath();
            ctx.arc(startx, starty, Math.abs((mx - startx) / 2), 0, Math.PI * 2);
            ctx.stroke();
        } else if (tool.current === "arrow") {
            drawArrow(ctx, startx, starty, mx, my);
        } else if (tool.current === "select") {
            if (sizing) {
                const sel = existing.find(e => e.id === selectedShapeId);
                if (sel) {
                    if (sel.type === "rect") {
                        const cx = sizestartx + initialwidth / 2, cy = sizestarty + initialheight / 2;
                        if (startx !== cx) {
                            sel.width  = initialwidth  * ((mx - cx) / (startx - cx));
                            sel.height = initialheight * ((my - cy) / (starty - cy));
                            sel.x = cx - sel.width / 2; sel.y = cy - sel.height / 2;
                        }
                    } else if (sel.type === "circle") {
                        sel.raidus = Math.hypot(mx - sel.x, my - sel.y);
                    } else if (sel.type === "text") {
                        ctx.font = `${sel.fontSize}px serif`;
                        const lines = sel.text.split("\n");
                        const w = Math.max(...lines.map(l => ctx.measureText(l).width));
                        const h = lines.length * sel.fontSize * 1.3;
                        const newDist = Math.hypot(mx - (sel.x + w/2), my - (sel.y + h/2));
                        sel.fontSize = Math.max(10, Math.round(initialFontSize * newDist / sizeInitDist));
                    } else if (sel.type === "arrow") {
                        const dx = mx - startx, dy = my - starty;
                        if (activeHandle === "topleft" || activeHandle === "bottomleft") {
                            sel.startX = sizestartx + dx;
                            sel.startY = sizestarty + dy;
                        }
                        else if (activeHandle === "topright" || activeHandle === "bottomright") {
                            sel.endX = arrowEndX + dx;
                            sel.endY = arrowEndY + dy;
                        }
                    }
                }
            } else {
                const sel = existing.find(e => e.id === selectedShapeId);
                if (sel && isDragging) {
                    if (sel.type === "arrow") {
                        const dx = mx - startx, dy = my - starty;
                        sel.startX = shapestartx + dx;
                        sel.startY = shapestarty + dy;
                        sel.endX = arrowEndX + dx;
                        sel.endY = arrowEndY + dy;
                    } else {
                        sel.x = shapestartx + (mx - startx);
                        sel.y = shapestarty + (my - starty);
                    }
                }
            }
        }
    };

    // ── MOUSEUP ──
    const onUp = (e: MouseEvent) => {
        if (!clicked) return;
        clicked = false;
        const { x: mx, y: my } = getCoords(e);

        if (tool.current === "rec") {
            const shape: shapes = { id: genId(), type: "rect", x: startx, y: starty, width: mx - startx, height: my - starty };
            existing.push(shape);
            ws.send(JSON.stringify({ type: "chat", message: JSON.stringify({ shape }), roomId }));
        } else if (tool.current === "circle") {
            const shape: shapes = { id: genId(), type: "circle", x: startx, y: starty, raidus: Math.abs((mx - startx)/2), startangle: 0, endangle: 6.28 };
            existing.push(shape);
            ws.send(JSON.stringify({ type: "chat", message: JSON.stringify({ shape }), roomId }));
        } else if (tool.current === "arrow") {
            const shape: shapes = { id: genId(), type: "arrow", startX: startx, startY: starty, endX: mx, endY: my };
            existing.push(shape);
            ws.send(JSON.stringify({ type: "chat", message: JSON.stringify({ shape }), roomId }));
        } else if (tool.current === "select") {
            if (sizing) { sizing = false; activeHandle = null; }
            else {
                isDragging = false;
            const sel = existing.find(e => e.id === selectedShapeId);
            if (sel) {
                if (sel.type === "arrow") {
                    sizestartx = sel.startX; sizestarty = sel.startY;
                    shapestartx = sel.startX; shapestarty = sel.startY;
                    arrowEndX = sel.endX; arrowEndY = sel.endY;
                }
                else { sizestartx = sel.x; sizestarty = sel.y; shapestartx = sel.x; shapestarty = sel.y; }
            }
            }
            const sel = existing.find(e => e.id === selectedShapeId);
            if (sel) ws.send(JSON.stringify({ type: "move_shape", message: JSON.stringify({ shape: sel }), roomId }));
        }
        clearCanvas(existing, canvas, ctx, circleshandles, selectedShapeId);
    };

    canvas.addEventListener("mousedown", onDown);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseup",   onUp);

    return {
        cleanup: () => {
            canvas.removeEventListener("mousedown", onDown);
            canvas.removeEventListener("mousemove", onMove);
            canvas.removeEventListener("mouseup",   onUp);
        },
        addText,
    };
}

// ── Redraw ──
function clearCanvas(
    existing: shapes[], canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D, circleshandles: handles[],
    selectedShapeId?: number | null
) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = DARK_BG;
    circleshandles.length = 0;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    existing.forEach(shape => {
        ctx.setLineDash([]); ctx.lineWidth = 2;
        if (shape.type === "rect") {
            ctx.strokeStyle = SHAPE_CLR;
            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        } else if (shape.type === "circle") {
            ctx.strokeStyle = SHAPE_CLR;
            ctx.beginPath(); ctx.arc(shape.x, shape.y, Math.abs(shape.raidus), 0, Math.PI * 2); ctx.stroke();
        } else if (shape.type === "text") {
            ctx.fillStyle = SHAPE_CLR;
            ctx.font = `${shape.fontSize}px 'Kalam', cursive`;
            ctx.textBaseline = "top";
            shape.text.split("\n").forEach((line, i) => ctx.fillText(line, shape.x, shape.y + i * shape.fontSize * 1.3));
        } else if (shape.type === "arrow") {
            ctx.strokeStyle = SHAPE_CLR;
            drawArrow(ctx, shape.startX, shape.startY, shape.endX, shape.endY);
        }
    });

    if (selectedShapeId === null || selectedShapeId === undefined) return;
    const sid: number = selectedShapeId;  // narrowed — safe to pass to drawHandle
    const sel = existing.find(e => e.id === sid);
    if (!sel) return;

    ctx.strokeStyle = SELECT_CLR; ctx.lineWidth = 2;

    if (sel.type === "rect") {
        const pad = 12;
        const bx = Math.min(sel.x, sel.x + sel.width)  - pad;
        const by = Math.min(sel.y, sel.y + sel.height) - pad;
        const bw = Math.abs(sel.width)  + pad * 2;
        const bh = Math.abs(sel.height) + pad * 2;
        ctx.setLineDash([6, 3]); ctx.strokeRect(bx, by, bw, bh); ctx.setLineDash([]);
        drawHandle(ctx, bx,      by,      circleshandles, sid, "topleft");
        drawHandle(ctx, bx + bw, by,      circleshandles, sid, "topright");
        drawHandle(ctx, bx,      by + bh, circleshandles, sid, "bottomleft");
        drawHandle(ctx, bx + bw, by + bh, circleshandles, sid, "bottomright");
    } else if (sel.type === "circle") {
        const pad = 12;
        const bx = sel.x - sel.raidus - pad;
        const by = sel.y - sel.raidus - pad;
        const bs = sel.raidus * 2 + pad * 2;
        ctx.setLineDash([6, 3]); ctx.strokeRect(bx, by, bs, bs); ctx.setLineDash([]);
        drawHandle(ctx, bx,      by,      circleshandles, sid, "topleft");
        drawHandle(ctx, bx + bs, by,      circleshandles, sid, "topright");
        drawHandle(ctx, bx,      by + bs, circleshandles, sid, "bottomleft");
        drawHandle(ctx, bx + bs, by + bs, circleshandles, sid, "bottomright");
    } else if (sel.type === "text") {
        ctx.font = `${sel.fontSize}px serif`;
        const lines = sel.text.split("\n");
        const w = Math.max(60, ...lines.map(l => ctx.measureText(l).width));
        const h = lines.length * sel.fontSize * 1.3;
        const pad = 12;
        const bx = sel.x - pad, by = sel.y - pad;
        const bw = w + pad * 2, bh = h + pad * 2;
        ctx.setLineDash([6, 3]); ctx.strokeRect(bx, by, bw, bh); ctx.setLineDash([]);
        drawHandle(ctx, bx,      by,      circleshandles, sid, "topleft");
        drawHandle(ctx, bx + bw, by,      circleshandles, sid, "topright");
        drawHandle(ctx, bx,      by + bh, circleshandles, sid, "bottomleft");
        drawHandle(ctx, bx + bw, by + bh, circleshandles, sid, "bottomright");
    } else if (sel.type === "arrow") {
        const pad = 12;
        const bx = Math.min(sel.startX, sel.endX) - pad;
        const by = Math.min(sel.startY, sel.endY) - pad;
        const bw = Math.abs(sel.endX - sel.startX) + pad * 2;
        const bh = Math.abs(sel.endY - sel.startY) + pad * 2;
        ctx.setLineDash([6, 3]); ctx.strokeRect(bx, by, bw, bh); ctx.setLineDash([]);
        drawHandle(ctx, bx,      by,      circleshandles, sid, "topleft");
        drawHandle(ctx, bx + bw, by,      circleshandles, sid, "topright");
        drawHandle(ctx, bx,      by + bh, circleshandles, sid, "bottomleft");
        drawHandle(ctx, bx + bw, by + bh, circleshandles, sid, "bottomright");
    }
}

async function getExistingshapes(roomId: string) {
    const res = await axios.get(`${http}/chats/${roomId}`);
    if (!res.data) return [];
    return res.data.map((e: { id: number; message: string }) => {
        try { const p = JSON.parse(e.message); p.shape.id = e.id; return p.shape; }
        catch { return null; }
    }).filter(Boolean);
}

function checkSelection(existing: shapes[], x: number, y: number, ctx: CanvasRenderingContext2D) {
    for (let i = existing.length - 1; i >= 0; i--) {
        if (isPointInShape(existing[i], x, y, ctx)) return existing[i].id;
    }
    return null;
}

function isPointInShape(shape: shapes, x: number, y: number, ctx: CanvasRenderingContext2D) {
    if (shape.type === "rect") {
        return x >= Math.min(shape.x, shape.x + shape.width) && x <= Math.max(shape.x, shape.x + shape.width)
            && y >= Math.min(shape.y, shape.y + shape.height) && y <= Math.max(shape.y, shape.y + shape.height);
    } else if (shape.type === "circle") {
        return Math.hypot(x - shape.x, y - shape.y) <= shape.raidus;
    } else if (shape.type === "text") {
        // Use a generous hit area (pad 20px per side) so text is easy to click
        ctx.font = `${shape.fontSize}px serif`;
        const lines = shape.text.split("\n");
        const w = Math.max(60, ...lines.map(l => ctx.measureText(l).width));
        const h = lines.length * shape.fontSize * 1.3;
        const pad = 20;
        return x >= shape.x - pad && x <= shape.x + w + pad
            && y >= shape.y - pad && y <= shape.y + h + pad;
    } else if (shape.type === "arrow") {
        const threshold = 10;
        const { startX, startY, endX, endY } = shape;
        const dist = pointToLineDistance(x, y, startX, startY, endX, endY);
        return dist <= threshold;
    }
    return false;
}

function pointToLineDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
    const A = px - x1, B = py - y1, C = x2 - x1, D = y2 - y1;
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = lenSq !== 0 ? dot / lenSq : -1;
    param = Math.max(0, Math.min(1, param));
    const nearX = x1 + param * C, nearY = y1 + param * D;
    return Math.hypot(px - nearX, py - nearY);
}

function drawHandle(ctx: CanvasRenderingContext2D, x: number, y: number, handles: handles[], id: number, pos: handles["position"]) {
    const R = 8;
    // White filled circle with purple border — clearly visible on dark canvas
    ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff"; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = SELECT_CLR; ctx.stroke();
    handles.push({ x, y, r: R, id, position: pos });
}

function isHandleClicked(handles: handles[], x: number, y: number) {
    // Use a slightly larger hit area than the visual radius
    for (const h of handles) {
        if (Math.hypot(x - h.x, y - h.y) <= h.r + 4) return h.position;
    }
    return null;
}

function drawArrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
    const headLen = 15;
    const angle = Math.atan2(y2 - y1, x2 - x1);
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
}