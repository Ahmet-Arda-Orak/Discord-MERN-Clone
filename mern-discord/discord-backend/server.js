import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import mongoData from "./mongoData.js";
import Pusher from "pusher";

//app config
const port = process.env.PORT || 8080
const app = express();

const pusher = new Pusher({
    appId: "1179867",
    key: "30f8021c7e7e62d200da",
    secret: "e8a618fbc750842da666",
    cluster: "eu",
    useTLS: true
  });

//middlewares
app.use(express.json());
app.use(cors());

//backend setup
const mongoURI ="mongodb+srv://ahmet:semra123@cluster0.2poff.mongodb.net/discordDB?retryWrites=true&w=majority"

mongoose.connect(mongoURI,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify:false,
    useCreateIndex:true    
})

mongoose.connection.once("open",()=>{
    console.log("Db Connected")

    const changeStream = mongoose.connection.collection("conversations").watch()

    changeStream.on("change",(change,err)=>{
        if(change.operationType === "insert"){
            pusher.trigger("channels", "newChannel",{
                "change":change
            });
        }else if(change.operationType === "update") {
            pusher.trigger("conversation", "newMessage", {
                "change": change
              });
        }else{
            console.log("error trigering Pusher",err)
        }
    })
})

//api routes
app.get("/",(req,res)=>{
    res.status(200).send("Hello World")
})

app.post("/new/channel",(req,res)=>{
    const dbData = req.body;

    mongoData.create(dbData,(err,data)=>{
        if(err){
            res.status(500).send(err)
        }else{
            res.status(201).send(data)    
        }
    })
})

app.get("/get/channelList",(req,res)=>{
    mongoData.find((err,data)=>{
        if(err){
            res.status(500).send(err)
        }else{
            let channels = []

            data.map((channelData)=>{
                const channelInfo = {
                    id: channelData._id,
                    name: channelData.channelName
                }
                channels.push(channelInfo)
            })

            res.status(200).send(channels)  
        }
    })
})

app.post("/new/message",(req,res)=>{
    const newMessage = req.body

    mongoData.updateOne(
        {_id: req.query.id},
        {$push:{ conversation: req.body }},
        (err, data)=>{
            if(err){
                console.log("Error while saving message...")
                console.log(err)
                res.status(500).send(err)
            }else{
                res.status(201).send(data)    
            }
        }
    )
})

app.get("/get/data",(req,res)=>{
    mongoData.find((err,data)=>{
        if(err){
            res.status(500).send(err)
        }else{
            res.status(200).send(data)
        }
    })
})

app.get("/get/conversation",(req,res)=>{
    const id = req.query.id

    mongoData.find({_id:id},(err,data)=>{
        if(err){
            res.status(500).send(err)
        }else{
            res.status(200).send(data)
        }
    })
})

//listen
app.listen(port,()=>{
    console.log(`Waiting on port ${port}`)
})