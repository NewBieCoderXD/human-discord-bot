import express, { Express} from "express";
import {Client, GatewayIntentBits} from "discord.js"

export const port = 500;
// const rest: REST = new REST({ version: '10'}).setToken(process.env["TOKEN"]!);
export const client: Client = new Client({intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
]});
export const prettyJSON: boolean = false;
