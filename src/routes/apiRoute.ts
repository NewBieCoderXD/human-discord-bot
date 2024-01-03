import {client} from "../config/constants";
import {errorWrapper,objToJSON,processChannelsList,conditionJSONStringify} from "../utils/functions"
import express, { Express, NextFunction, Request, Response } from "express";
import {REST, Routes, Client, GatewayIntentBits, GuildChannel, GuildBasedChannel, TextChannel, ChannelType, GuildChannelManager, Collection, Snowflake, ThreadChannel, MessageCreateOptions, FetchMessagesOptions} from "discord.js"
import * as path from "path";

const apiRouter = express.Router();

apiRouter.get("/getGuilds",errorWrapper((req:Request,res:Response)=>{
    let allowedKeys = ["id","name"];
    let guildsList = 
        client.guilds.cache
        .toJSON()
        .map((guildObj)=>{
            return {
                ...objToJSON(guildObj,allowedKeys),
                channels:processChannelsList(guildObj.channels.cache)
            }
        })
    res.send(conditionJSONStringify(guildsList));
}));

// app.get("/getGuildChannels/:guildId",(req:Request,res:Response)=>{
//     let guild = client.guilds.cache.get(req.params.guildId);
//     if(guild!=undefined){
//         let channelsList = processChannelsList(guild.channels.cache);
//         return res.send(conditionJSONStringify(channelsList));
//     }
//     else{
//         return res.send("{}");
//     }
// })

// /getUserData/918464200530071553/706033295665790986

apiRouter.get("/getUserData/:guildId/:userId", errorWrapper(async (req:Request,res:Response)=>{
    let guild = client.guilds.cache.get(req.params.guildId)
    let memberManager = guild?.members;
    let member = await memberManager?.fetch(req.params.userId);
    let allowedKeys = ["displayName"];
    return res.send(conditionJSONStringify(objToJSON(member,allowedKeys)));
}));

// /getMessages/918464200530071553/918876540278833162/5

apiRouter.get("/getMessages/:guildId/:channelId/:limit/:beforeId?", errorWrapper(async (req:Request,res:Response)=>{
    let guild = client.guilds.cache.get(req.params.guildId)
    let channel = guild?.channels.cache.get(req.params.channelId) as TextChannel
    if(channel==undefined){
        return res.send("{}");
    }
    let messagesManager = channel.messages;
    let messageOptions: FetchMessagesOptions = {
        limit: parseInt(req.params.limit),
        cache: false
    }
    if(typeof req.params.beforeId !== 'undefined'){
        messageOptions.before=req.params.beforeId;
    }
    let messages = await messagesManager.fetch(messageOptions)
    let allowedKeys = ["id","createdTimestamp","author","content","mentions"]
    return res.send(conditionJSONStringify(messages
        .toJSON()
        .map((message)=>
            objToJSON(message,allowedKeys)
        )
    ))
}))

apiRouter.post("/postMessage/:guildId/:channelId/:message", errorWrapper(async (req:Request,res:Response)=>{
    let guild = client.guilds.cache.get(req.params.guildId)
    let channel = guild?.channels.cache.get(req.params.channelId) as TextChannel
    let result = await channel.send(req.params.message)
    return res.send(result);
}));

apiRouter.get("/prettyPrint/(*)",(req:Request,res:Response)=>{
    return res.sendFile(path.join(__dirname,"/../../public/prettyPrint.html"))
})

export default apiRouter