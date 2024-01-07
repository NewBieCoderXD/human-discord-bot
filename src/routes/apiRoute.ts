import {client} from "../config/constants";
import {errorWrapper,objToJSON,processChannelsList,conditionJSONStringify, processMessage} from "../utils/functions"
import express, { Express, NextFunction, Request, Response } from "express";
import {REST, Routes, Client, GatewayIntentBits, GuildChannel, GuildBasedChannel, TextChannel, ChannelType, GuildChannelManager, Collection, Snowflake, ThreadChannel, MessageCreateOptions, FetchMessagesOptions} from "discord.js"
import * as path from "path";
import ws from "ws"
import {globalWSCollection,webSocketCollection} from "../utils/websockets"

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
    return res.send(conditionJSONStringify(messages
        .toJSON()
        .map((message)=>
            processMessage(message)
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

// /api/websocket/918464200530071553/918876540278833162

apiRouter.ws("/websocket/:guildId/:channelId",(webSocket: ws,req:Request)=>{
    // console.log(req.params.guildId,req.params.channelId)
    globalWSCollection.push(req.params.guildId,req.params.channelId,webSocket);
    // console.log(globalWSCollection)
    webSocket.on("message",(message: string)=>{
        let messageJSON = JSON.parse(message);
        let channelId = messageJSON.channelId;
        // console.log(message)
        try{
            let channel = client.channels.cache.get(channelId) as TextChannel;
            channel.send(messageJSON.content);
            webSocket.send(JSON.stringify({
                type: "response",
                success: true
            }));
        }
        catch(e: unknown){
            if(e instanceof Error){
                webSocket.send(JSON.stringify({
                    type: "response",
                    success: false,
                    error: e.stack
                }));
                return;
            }
            console.error(e)
            webSocket.send(JSON.stringify({
                type: "response",
                success: false,
                error: e
            }));
        }
    })
})

export default apiRouter

/*
gg <ref *1> Message {
  channelId: '918876540278833162',
  guildId: '918464200530071553',
  id: '1192371763795988581',
  createdTimestamp: 1704353981685,
  type: 0,
  system: false,
  content: 'ggg',
  author: User {
    id: '525168110966407182',
    bot: false,
    system: false,
    flags: UserFlagsBitField { bitfield: 0 },
    username: 'ggfrook',
    globalName: 'ggFROOK',
    discriminator: '0',
    avatar: '202fc3e317559aefe01cf0bc55262135',
    banner: undefined,
    accentColor: undefined,
    avatarDecoration: null
  },
  pinned: false,
  tts: false,
  nonce: '1192371768203935744',
  embeds: [],
  components: [],
  attachments: Collection(0) [Map] {},
  stickers: Collection(0) [Map] {},
  position: null,
  roleSubscriptionData: null,
  resolved: null,
  editedTimestamp: null,
  reactions: ReactionManager { message: [Circular *1] },
  mentions: MessageMentions {
    everyone: false,
    users: Collection(0) [Map] {},
    roles: Collection(0) [Map] {},
    _members: null,
    _channels: null,
    _parsedUsers: null,
    crosspostedChannels: Collection(0) [Map] {},
    repliedUser: null
  },
  webhookId: null,
  groupActivityApplication: null,
  applicationId: null,
  activity: null,
  flags: MessageFlagsBitField { bitfield: 0 },
  reference: null,
  interaction: null
}
*/