import $ from "jquery"
import "jquery-ui"

let guilds;
let currentGuild: string | undefined = undefined;
let currentChannel: string | undefined = undefined;
let webSocket: WebSocket | undefined = undefined;
interface eventHandlers{
    [Event: string]: (...args: any[]) => void;
}
let webSocketEventHandlers:eventHandlers = {
    "message": (e:MessageEvent)=>{
        let message = JSON.parse(e.data);
        console.log(message);
        // createMessage(message);
    },
};

function getChannelListEleId(id:string){
    return "channelList_"+id;
}

function getChannelNameEleId(id:string){
    return "channelName_"+id;
}

function getChannelEleId(id:string){
    return "channel_"+id;
}

function createChannel(channelId: string){
    let channel=document.createElement("div");
    let channelInputs=document.createElement("div");
    let channelInputText=document.createElement("input");
    let channelButton=document.createElement("button");
    let channelMessages=document.createElement("div");
    channel.id=getChannelEleId(channelId);
    channel.classList.add("channel","hidden");

    channelInputs.classList.add("channelInputs");
    channelInputText.name=channelId;
    channelInputText.classList.add("channelInputText");
    channelButton.classList.add("channelInputButton");
    channelButton.classList.add("bi","bi-search");
    channelMessages.classList.add("channelMessages");

    channelInputs.append(channelInputText,channelButton);
    channel.append(channelMessages,channelInputs);                    
    document.getElementById("openedChannels").append(channel);
}

function startWebSocket(){
    let location = window.location
    let webSocketProtocol = location.protocol=="https"?"wss":"ws"
    webSocket = new WebSocket(`${webSocketProtocol}://${location.host}/api/webSocket/${currentGuild}/${currentChannel}`);
    for(let event in webSocketEventHandlers){
        webSocket.addEventListener(event,webSocketEventHandlers[event])
    }
}

function channelNameOnClick(e:Event){
    let target: HTMLElement = e.target as HTMLElement;
    let channelId: string = target.dataset.id as string;
    if(document.getElementById(getChannelEleId(channelId))==undefined){
        createChannel(channelId);
    }

    if(currentChannel!=undefined){
        document.getElementById(getChannelNameEleId(currentChannel)).classList.remove("active");
        document.getElementById(getChannelEleId(currentChannel)).classList.add("hidden");
        webSocket.close();
    }
    document.getElementById(getChannelNameEleId(channelId)).classList.add("active");
    document.getElementById(getChannelEleId(channelId)).classList.remove("hidden");
    currentChannel=channelId;

    startWebSocket();
}

function guildNameOnClick(e:Event){
    let target: HTMLElement = e.target as HTMLElement;
    let guildId: string = target.dataset.id as string;
    if(currentGuild != undefined){
        $("#"+getChannelListEleId(currentGuild)).toggleClass("hidden");
    }
    $("#"+getChannelListEleId(guildId)).toggleClass("hidden");
    currentGuild=guildId;
    target.classList.toggle("active");
}

async function getAndUpdateGuilds(){
    guilds = await fetch("/api/getGuilds");
    guilds = await guilds.json()
    guilds.forEach((guild: any) => {
        let guildName = document.createElement("p");
        guildName.classList.add("guildName","nameList")
        guildName.innerHTML=guild.name;
        guildName.dataset.id=guild.id;
        document.getElementById("guildsList").append(guildName);
        guildName.onclick=guildNameOnClick;
        let channelListDIV = document.createElement("div");
        channelListDIV.id=getChannelListEleId(guild.id);
        guild.channels.forEach((channel: any) => {
            let channelName = document.createElement("div");
            channelName.innerHTML=channel.name;
            channelName.id=getChannelNameEleId(channel.id);
            channelName.dataset.id=channel.id;
            channelName.classList.add("channelName","nameList");
            channelName.addEventListener("click",channelNameOnClick);
            channelListDIV.append(channelName);
        })
        channelListDIV.classList.add("hidden","channelList");
        $("#channelList").append(channelListDIV);
    });
}

getAndUpdateGuilds();