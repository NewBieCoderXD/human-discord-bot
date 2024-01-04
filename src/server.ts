import express, { Express, NextFunction, Request, Response } from "express";
import {client,port} from "./config/constants"
import app from "./app";
import apiRouter from "./routes/apiRoute"
import frontendRouter from "./routes/frontendRouter"
import * as dotenv from "dotenv";
import { ClientEvents, Message } from "discord.js";
import {globalWSCollection,webSocketCollection} from "./utils/websockets"
import { processMessage } from "./utils/functions";
dotenv.config({path:__dirname+'/../.env'})

app.use("/api",apiRouter)

app.use(frontendRouter);

client.on('ready',()=>{
    app.listen(port)
    console.log("ready");
})

client.on("messageCreate",(message)=>{
    globalWSCollection.get(message.guildId!,message.channelId)?.forEach((webSocket)=>{
        let messageJSON=processMessage(message);
        webSocket.send(JSON.stringify(messageJSON));
    });
})

client.login(process.env["TOKEN"])