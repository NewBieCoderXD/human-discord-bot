import ws from "ws";

export class webSocketCollection{
    guilds: {
        [guild: string]: {
            [channel: string]: ws[];
        }
    } = {};

    push(guildId: string,channelId: string, webSocket:ws){
        if(this.guilds[guildId] == undefined){
            this.guilds[guildId]={
                [channelId]: []
            };
        }
        else if(this.guilds[guildId][channelId] == undefined){
            this.guilds[guildId][channelId]=[];
        }
        this.guilds[guildId][channelId].push(webSocket);
    }

    get(guildId: string,channelId: string){
        if(this.guilds[guildId] == undefined || this.guilds[guildId][channelId] == undefined){
            return undefined;
        };
        return this.guilds[guildId][channelId];
    }
}

export let globalWSCollection = new webSocketCollection();

// module.exports = {
//     ,
//     webSocketCollection: webSocketCollection
// };