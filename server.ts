import express, { Express, NextFunction, Request, Response } from "express";
import {REST, Routes, Client, GatewayIntentBits, GuildChannel, GuildBasedChannel, TextChannel, ChannelType, GuildChannelManager, Collection, Snowflake, ThreadChannel, MessageCreateOptions, FetchMessagesOptions} from "discord.js"
import axios, { AxiosRequestConfig, all } from "axios";
import * as dotenv from "dotenv";
import chalk from "chalk";
import { MessageOptions } from "child_process";
dotenv.config({path:__dirname+'/.env'})

const app: Express = express();
const port = 500;
// const rest: REST = new REST({ version: '10'}).setToken(process.env["TOKEN"]!);
const client: Client = new Client({intents: ["Guilds",GatewayIntentBits.Guilds,GatewayIntentBits.MessageContent]});
const prettyJSON: boolean = true;

function IsAsyncFunction(fn: Function){
    const AsyncFunction = (async () => {}).constructor;

    return fn instanceof AsyncFunction;
}

function conditionJSONStringify(json: any): string{
    if(prettyJSON){
        return JSON.stringify(json,null,4)+"<style>body{white-space: break-spaces;}</style>";
    }
    return JSON.stringify(json);
}

function objToJSON(obj: any,allowedKeys: string[]){
    return Object.fromEntries(
        allowedKeys.map((key: string)=>
            [key,obj[key]]
        )
    )
}

function processChannelsList(channelsList: Collection<Snowflake, GuildBasedChannel>){
    return channelsList.filter((channel: GuildBasedChannel)=>
        channel.type == ChannelType.GuildText
    )
    .toJSON()
    .map((channel: GuildBasedChannel)=>{
        let allowedKeys = ["id","name"];
        return objToJSON(channel,allowedKeys);
    })
}

function errorWrapper(fn: (req:Request,res:Response) => any){
    if(IsAsyncFunction(fn)){
        return async function(req:Request,res:Response){
            try{
                await fn(req,res);
            }
            catch(e){
                console.log(chalk.red(e));
                res.send(e);
            }
        }
    }
    return function(req:Request,res:Response){
        try{
            fn(req,res);
        }
        catch(e){
            console.log(chalk.red(e));
            res.send(e);
        }
    }
}

app.get("/getGuilds",errorWrapper((req:Request,res:Response)=>{
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

// /getMessages/918464200530071553/706033295665790986

app.get("/getUserData/:guildId/:userId", errorWrapper(async (req:Request,res:Response)=>{
    let guild = client.guilds.cache.get(req.params.guildId)
    let memberManager = guild?.members;
    let member = await memberManager?.fetch(req.params.userId);
    let allowedKeys = ["displayName"];
    return res.send(conditionJSONStringify(objToJSON(member,allowedKeys)));
}));

// /getMessages/918464200530071553/918876540278833162/5

app.get("/getMessages/:guildId/:channelId/:limit/:beforeId?", errorWrapper(async (req:Request,res:Response)=>{
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

app.post("/postMessage/:guildId/:channelId/:message", errorWrapper(async (req:Request,res:Response)=>{
    let guild = client.guilds.cache.get(req.params.guildId)
    let channel = guild?.channels.cache.get(req.params.channelId) as TextChannel
    let result = await channel.send(req.params.message)
    return res.send(result);
}));

app.use("/",express.static(__dirname+"/public"));

client.on('ready',()=>{
    
    console.log("ready");
    
    // console.log(client.guilds.cache
    //     .toJSON()
    //     .map(guildJSON =>
    //         guildJSON.channels.cache
    //         .filter((channel: GuildBasedChannel)=>
    //             channel.type == ChannelType.GuildText
    //         )
    //         .toJSON()
    //         .map( (channel: GuildBasedChannel)=>{
    //             let allowedKeys = ["id","name"];
    //             return objToJSON(channel,allowedKeys);
    //         })
    //     ));

    // console.log(client.guilds.cache.get('918464200530071553')?.channels.cache.get("918876540278833162")
    // )
})



client.login(process.env["TOKEN"])
app.listen(port)