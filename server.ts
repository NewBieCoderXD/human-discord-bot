import express, { Express, NextFunction, Request, Response } from "express";
import {app,client,port} from "./constants"
import apiRouter from "./apiRoute"
import * as dotenv from "dotenv";
dotenv.config({path:__dirname+'/.env'})

app.use("/api",apiRouter)

app.use("/",express.static(__dirname+"/public"));

client.on('ready',()=>{
    app.listen(port)
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