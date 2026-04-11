import { Roomcanvas } from "@/components/Room";

type param= Promise<{ roomid: string }>

export default async function Canvas({
    params
}:{
    params:param
}){
    const {roomid} = await params;
    console.log(roomid);
    console.log("hello")
    return <Roomcanvas roomid={roomid} />
}
