import express, { Express, Request, Response } from "express";
import {REST, Routes, Client, GatewayIntentBits, GuildChannel, GuildBasedChannel, TextChannel, ChannelType} from "discord.js"
import axios, { AxiosRequestConfig, all } from "axios";
import * as dotenv from "dotenv";
dotenv.config({path:__dirname+'/.env'})

const app: Express = express();
const port = 500;
// const rest: REST = new REST({ version: '10'}).setToken(process.env["TOKEN"]!);
const client: Client = new Client({intents: ["Guilds",GatewayIntentBits.Guilds]});

function objToJSON(obj: any,allowedKeys: string[]){
    return Object.fromEntries(
        allowedKeys.map((key: string)=>
            [key,obj[key]]
        )
    )
}

app.get("/getGuilds",(req:Request,res:Response)=>{
    let allowedKeys = ["id","name"];
    let guildsList = 
        client.guilds.cache
        .toJSON()
        .map((guildObj)=>
            objToJSON(guildObj,allowedKeys)
        )
    res.send(JSON.stringify(guildsList));
})

app.get("/getGuildChannels/:guildId",(req:Request,res:Response)=>{
    let guild = client.guilds.cache.get(req.params.guildId);
    if(guild!=undefined){
        let channelsList = guild.channels.cache
        .filter((channel: GuildBasedChannel)=>
            channel.type == ChannelType.GuildText
        )
        .toJSON()
        .map( (channel: GuildBasedChannel)=>{
            let allowedKeys = ["id","name"];
            return objToJSON(channel,allowedKeys);
        })
        return res.send(JSON.stringify(channelsList));
    }
    else{
        return res.send("{}");
    }
})



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

    console.log(client.guilds.cache.get('918464200530071553')?.channels.cache.get("918876540278833162")
    )
})



client.login(process.env["TOKEN"])
app.listen(port)