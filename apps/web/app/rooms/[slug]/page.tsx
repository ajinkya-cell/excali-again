import axios from "axios";
import { BACKEND_URL } from "@/app/config"; 
import { ChatRoom } from "@/components/ChatRoom";

async function getRoomId(slug: string) {
    try {
        const response = await axios.get(`${BACKEND_URL}/room/${slug}`);
        return response.data.room?.id || response.data.id;
    } catch(e) {
        return null;
    }
}

export default async function({
    params
}: {
    params: {
        slug: string
    }
}) {
    const slug = (await params).slug;
    const roomId = await getRoomId(slug);

    if (!roomId) {
        return <div>
            Room not found
        </div>
    }
    
    return <ChatRoom id={roomId}></ChatRoom>

}