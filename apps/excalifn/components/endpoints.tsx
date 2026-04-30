const isProd = process.env.NODE_ENV === "production";
export const http = isProd ? "https://excali-http.onrender.com" : "http://localhost:3001";
export const wslink = isProd ? "wss://excali-ws-25w3.onrender.com" : "ws://localhost:8080";