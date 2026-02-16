import { useEffect, useState } from "react";
import { WS_URL } from "../app/config";

export function useSocket() {
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<WebSocket>();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setLoading(false); // No token, not loading
            return;
        }

        const ws = new WebSocket(`${WS_URL}?token=${token}`);
        
        ws.onopen = () => {
            setLoading(false);
            setSocket(ws);
        }

        ws.onclose = () => {
             setLoading(false);
             setSocket(undefined);
        }

        ws.onerror = (e) => {
            console.error("WebSocket error:", e);
            setLoading(false);
        }

        return () => {
            ws.close();
        }

    }, []);

    return {
        socket,
        loading
    }
}