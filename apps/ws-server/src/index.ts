import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { prismaClient } from "@repo/db/clients";
import dotenv from "dotenv";

dotenv.config();

/* -------------------- TYPES -------------------- */

interface User {
  ws: WebSocket;
  userId: number;
  rooms: string[];
}

/* -------------------- SERVER -------------------- */

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080;
const wss = new WebSocketServer({ port: PORT });
const users: User[] = [];

console.log(`✅ WebSocket server running on port ${PORT}`);

/* -------------------- AUTH -------------------- */

function verifyUser(token: string | null): number | null {
  if (!token) {
    console.log("❌ Missing token");
    return null;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    console.log("✅ JWT decoded:", decoded);

    if (!decoded || typeof decoded !== "object" || !decoded.id) {
      console.log("❌ Token missing id");
      return null;
    }

    return Number(decoded.id);
  } catch (err) {
    console.log("❌ JWT verification failed:", err);
    return null;
  }
}

/* -------------------- CONNECTION -------------------- */

wss.on("connection", (ws, request) => {
  console.log("🔌 Incoming connection");

  ws.on("close", (code, reason) => {
    console.log("❌ Socket closed", code, reason.toString());
    const index = users.findIndex(u => u.ws === ws);
    if (index !== -1) {
      users.splice(index, 1);
    }
  });

  /* SAFE URL PARSING */
  const url = new URL(request.url!, "http://localhost");
  const token = url.searchParams.get("token");

  const userId = verifyUser(token);

  if (!userId) {
    ws.close(1008, "Authentication failed");
    return;
  }

  console.log("✅ User connected:", userId);

  const user: User = {
    ws,
    userId,
    rooms: [],
  };

  users.push(user);

  /* -------------------- MESSAGE HANDLER -------------------- */

  ws.on("message", async (data) => {
    let payload: any;

    try {
      payload = JSON.parse(data.toString());
    } catch {
      ws.send(JSON.stringify({ error: "Invalid JSON" }));
      return;
    }

    console.log("📩 Received:", payload);

    /* JOIN ROOM */
    if (payload.type === "join_room") {
      if (!user.rooms.includes(payload.roomId)) {
        user.rooms.push(payload.roomId);
      }
      return;
    }

    /* LEAVE ROOM */
    if (payload.type === "leave_room") {
      user.rooms = user.rooms.filter(r => r !== payload.roomId);
      return;
    }

    /* CHAT — add new shape */
    if (payload.type === "chat") {
      const { roomId, message } = payload;
      if (!roomId || !message) return;

      let dbId: number | undefined;
      try {
        const created = await prismaClient.chat.create({
          data: { roomid: Number(roomId), message, userId },
        });
        dbId = created.id;
      } catch (err) {
        console.error("❌ Prisma error (create):", err);
      }

      users.forEach(u => {
        if (u.rooms.includes(roomId)) {
          u.ws.send(JSON.stringify({ type: "chat", roomId, message, userId, id: dbId }));
        }
      });
    }

    /* DELETE SHAPE — erase from DB permanently */
    if (payload.type === "delete_shape") {
      const { id, roomId } = payload;
      if (!id || !roomId) return;

      try {
        await prismaClient.chat.delete({
          where: { id: Number(id) },
        });
        console.log(`🗑️ Deleted shape/chat id=${id}`);
      } catch (err) {
        console.error("❌ Prisma error (delete):", err);
      }

      /* Broadcast so other connected clients remove it too */
      users.forEach(u => {
        if (u.rooms.includes(roomId)) {
          u.ws.send(JSON.stringify({ type: "delete_shape", id: Number(id), roomId }));
        }
      });
    }

    /* MOVE / RESIZE SHAPE — update serialised JSON in DB */
    if (payload.type === "move_shape") {
      const { roomId, message } = payload;
      if (!roomId || !message) return;

      try {
        const parsed = JSON.parse(message);
        const shapeId = Number(parsed?.shape?.id);
        if (!shapeId) return;

        await prismaClient.chat.update({
          where: { id: shapeId },
          data:  { message },
        });
        console.log(`✏️ Updated shape id=${shapeId}`);
      } catch (err) {
        console.error("❌ Prisma error (update):", err);
      }

      /* Broadcast to other clients in the room */
      users.forEach(u => {
        if (u.rooms.includes(roomId)) {
          u.ws.send(JSON.stringify({ type: "move_shape", roomId, message }));
        }
      });
    }
  });
});
