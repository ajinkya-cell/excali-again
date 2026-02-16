import axios from "axios"
import { BACKEND_URL } from "../app/config"
import { ChatRoomClient } from "./ChatRoomClient";

async function getChats(roomId: string | number) {
    const response = await axios.get(`${BACKEND_URL}/chats/${roomId}`);
    return response.data;
}

export async function ChatRoom({id}: {
    id: string | number
}) {
    const messages = await getChats(id);
    return <ChatRoomClient id={id} messages={messages} />
}