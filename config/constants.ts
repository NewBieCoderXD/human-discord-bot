import express, { Express} from "express";
import {Client, GatewayIntentBits} from "discord.js"

// export const app: Express = express();
export const port = 500;
// const rest: REST = new REST({ version: '10'}).setToken(process.env["TOKEN"]!);
export const client: Client = new Client({intents: ["Guilds",GatewayIntentBits.Guilds,GatewayIntentBits.MessageContent]});
export const prettyJSON: boolean = true;

