const isProd = process.env.NODE_ENV === "production";
export const BACKEND_URL = isProd ? "https://excali-again-http-server.onrender.com" : "http://localhost:3001";
export const WS_URL = isProd ? "wss://excali-http-server.onrender.com" : "ws://localhost:8080";