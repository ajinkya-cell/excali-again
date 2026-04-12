import express  from "express";
import jwt from "jsonwebtoken";
import { Middleware } from "./middleware";
import {CreateRoomSchema, CreateUserSchema, SiginSchema} from "@repo/common-package/types"
import {prismaClient} from "@repo/db/clients"
import * as bcrypt from "bcrypt";
import cors from "cors"
require('dotenv').config();
const app = express();
const saltRounds = 10;

app.use(express.json())

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : ["http://localhost:3000", "http://localhost:3002"];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.post("/signUp", async (req, res) => {
    // 1. Validate input
    const zodvalidation = CreateUserSchema.safeParse(req.body);
    
    if(!zodvalidation.success){
        const error = zodvalidation.error;
        if(error.issues[0]){
            return res.status(400).send(error.issues[0].message)
        }
        return res.status(400).send("Invalid input")
    }
    const {username , password , email} = req.body;
    try {
        const hash = await bcrypt.hash(password , saltRounds);
        const response = await prismaClient.users.create({
            data : {
                name : username ,
                password:hash,
                email : email
            }
        })
        console.log("User created : " , response.id);
        return res.json({msg: "signed up "})
    } catch (e : any) {
        console.error("Signup error:", e); // Log full error for debugging
        
        if (e.code === "P2002") {
            return res.status(409).json({
                error: 'user already exists',
                field: e.meta?.target
            });
        }
        
        return res.status(500).json({
            error: "Something went wrong, please try again later"
        });
    }
    }
);

app.post("/signIn",async (req,res)=>{
    const zodvalidation = SiginSchema.safeParse(req.body);
    if(!zodvalidation.success){
        res.status(403).json({
            msg:"Invalid inputs",
            error: zodvalidation.error
        })
        return 
    }else{
        const {email , password} = req.body;
        const response = await prismaClient.users.findFirst({
            where:{
                email : email
            },
            select:{
                password : true ,
                id:true

            }
        })
        if(!response){
            res.status(403).json({
                msg:"username or db error"
            })
            return
        }
        const hash = response.password;
        const isUser = await bcrypt.compare(password , hash)
        if(isUser === false){
            res.status(403).json({
                msg : "wrong password"
            })
            return

        }
        const id = response.id
        const secret = process.env.JWT_SECRET as string;
        const token = jwt.sign({id} , secret);
        res.json({
            msg : "logged in ",
            token
        })
    } 
    
})

app.post("/create-room",Middleware,async (req,res)=>{
    const data = CreateRoomSchema.safeParse(req.body);
    if(!data.success){
        res.status(400).json({
            msg:"wrong inputs"
        })
        return 
    }
    const userid = req.userid
    if(!userid){
        res.status(403).json({
            msg:"the userid is undefined"
        })
        return 
    }
    try {
        const resposne = await prismaClient.rooms.create({
        data:{
            slug:data.data.name,
            adminId:userid
        }
    })
    res.send(resposne.id)
    console.log("room created successfully");
    
    } catch (error) {
        res.status(409).json({
            msg:"room already exists"
        })
    }

    
})

app.get("/chats/:roomId",Middleware,async (req,res)=>{
    const roomid = Number(req.params.roomId);
    const message = await prismaClient.chat.findMany({
        where:{
            roomid:roomid
        },
        orderBy:{
            id:"desc"
        },
        take:50
    })
    res.json(message);

    return 
})

app.get("/room-by-slug/:slug",Middleware,async (req,res)=>{
    const slug = req.params.slug
    const roomid =await prismaClient.rooms.findFirst({
        where:{
            slug
        },
        select:{
            id:true
        }
    })
    if(!roomid){
        return res.status(404).json({
            msg:"no room"
        })
    }
    res.json({
        roomid
    })
    return 
})

app.get("/room/:slug",async(req,res)=>{
    const slug = req.params.slug;
    try{
        const response = await prismaClient.rooms.findFirst({
        where:{
            slug:slug
        },
        select:{
            id:true
        }
    })
    if(!response){
        return res.status(404).json({
            msg:"no room of this name"
        })
    }
    return res.json({
        msg:"room found",
        id:response?.id
    })
    }catch(e){
        console.log(e)
    }
    

})

app.get("/slug/:id",async(req,res)=>{
    const id = req.params.id;
    try{
    const response = await prismaClient.rooms.findFirst({
        where:{
            id:Number(id)
        },
        select:{
            slug:true
        }
    })
    if(!response){
        return res.status(404).json({
            msg:"no slug of this id"
        })
    }
    res.json({
        msg:"slug found",
        slug:response?.slug
    })
    }catch (err) {
    console.error(err);
    res.status(500).json({ msg: "server error" });
  }

})

app.get("/verify-token", Middleware, (req, res) => {
  res.json({ valid: true, userId: req.userid });
});
// show rooms created by user in frontend
app.get("/userRooms",Middleware,async (req, res) => {
    const id = req.userid;
    if(!id){
        return res.status(403).json({ msg: "unauthorized" });
    }
    const rooms = await prismaClient.rooms.findMany({
    where:{
        adminId:id
    },
    select:{
        slug:true
    },
    orderBy:{slug: 'asc'}
    })
    res.json({
        data:rooms
    });
});

app.delete("/closeroom/:slug",Middleware,async (req,res)=>{
    const id = req.userid;
    if(!id){
        return res.status(403).json({ msg: "unauthorized" });
    }
    const slug = req.params.slug
    try{
       const result = await prismaClient.rooms.deleteMany({
            where:{
                adminId:id,
                slug:slug
            }
        })
        if(result.count === 0){
            return res.status(404).json({ msg: "room not found or not owned by you" });
        }
        res.json({
            msg:"deleted the room"
        })
    }catch(e){
        res.status(500).json({
            msg:"error deleting room"
        })
    }
})

app.listen(3001);
console.log("listening");
