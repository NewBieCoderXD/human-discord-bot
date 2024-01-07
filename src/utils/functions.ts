import { Request, Response } from "express";
import {GuildBasedChannel, ChannelType, Collection, Snowflake, Message} from "discord.js"
import chalk from "chalk";
import {prettyJSON} from "../config/constants"

export function IsAsyncFunction(fn: Function){
    const AsyncFunction = (async () => {}).constructor;

    return fn instanceof AsyncFunction;
}

export function conditionJSONStringify(json: any): string{
    if(prettyJSON){
        return JSON.stringify(json,null,4)+"<style>body{white-space: break-spaces;}</style>";
    }
    return JSON.stringify(json);
}

export function objToJSON(obj: any,allowedKeys: string[]){
    return Object.fromEntries(
        allowedKeys.map((key: string)=>
            [key,obj[key]]
        )
    )
}

export function processChannelsList(channelsList: Collection<Snowflake, GuildBasedChannel>){
    return channelsList.filter((channel: GuildBasedChannel)=>
        channel.type == ChannelType.GuildText
    )
    .toJSON()
    .map((channel: GuildBasedChannel)=>{
        let allowedKeys = ["id","name"];
        return objToJSON(channel,allowedKeys);
    })
}

export function errorWrapper(fn: (req:Request,res:Response) => any){
    
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

export function processMessage(message: Message){
    let allowedKeys = ["id","createdTimestamp","author","content","mentions","channelId"];
    return objToJSON(message,allowedKeys)
}