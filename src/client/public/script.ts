import $ from "jquery"
import "jquery-ui"
import escape from "escape-html"

let guilds;
let currentGuild: string | undefined = undefined;
let currentChannel: string | undefined = undefined;
let webSocket: WebSocket | undefined = undefined;
const botAuthorObject={
    avatarURL: "https://cdn.discordapp.com/app-icons/1189173169618165921/209f0c42c7cd1de550e8eb2cc2fb4205.png?size=512",
    username: "FROOK bot v2.0"
};
let limit = 25;
interface eventHandlers{
    [Event: string]: (...args: any[]) => void;
}
let timer: Date;
interface Message{
    channelId:string,
    content:string,
    author: {
        id: string,
        avatarURL: string,
        username: string
    },
    mentions: string,
}

function createMessage(messageJSON:Message, IsFetching: boolean, channelMessages: HTMLElement = null){
    // console.log("#"+getChannelEleId(messageJSON.channelId)+" .channelMessages");
    channelMessages=channelMessages || document.querySelector("#"+getChannelEleId(messageJSON.channelId)+" .channelMessages");
    // console.log(messageJSON.mentions)
    let messageDIV = document.createElement("div");
    let content = document.createElement("div");
    let author = document.createElement("div");
    messageDIV.classList.add("message");
    content.classList.add("content")
    content.innerHTML=escape(messageJSON.content);
    author.innerHTML=escape(messageJSON.author.username)+"/"+escape(messageJSON.author.id);
    author.classList.add("author");
    messageDIV.append(author,content);
    channelMessages.append(messageDIV);

    // less than 10%
    if(!IsFetching&&(channelMessages.scrollHeight-channelMessages.scrollTop-channelMessages.offsetHeight)/channelMessages.scrollHeight*100<10){
        $(channelMessages).animate({scrollTop: channelMessages.scrollHeight},"fast")
    }
}

let webSocketEventHandlers:eventHandlers = {
    "message": (e:MessageEvent)=>{
        let messageJSON = JSON.parse(e.data);
        // console.log(messageJSON);
        if(messageJSON.type=="response"){
            if(!messageJSON.success){
                alert("messageJSON.error")
            }
        }
        else{
            createMessage(messageJSON,false);
        }
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

    let sendHandler  = async (e:Event)=>{
        if(e.type=="keyup"){
            if((e as KeyboardEvent).key !== 'Enter'){
                return;
            }
        }
        if(!webSocket.OPEN){
            return;
        }
        let messageJSON = {
            channelId: channelId,
            content: channelInputText.value
        }
        // sendedMessage = messageJSON as Message;
        // console.log(sendedMessage)
        // sendedMessage.author = botAuthorObject;
        // console.log(sendedMessage)
        channelInputText.value="";
        webSocket.send(JSON.stringify(messageJSON));
    }

    channelInputs.classList.add("channelInputs");
    channelInputText.name=channelId;
    channelInputText.classList.add("channelInputText");
    channelButton.classList.add("channelInputButton");
    channelButton.classList.add("bi","bi-send");
    channelButton.addEventListener("click",sendHandler)
    channelInputs.addEventListener("keyup",sendHandler)
    channelMessages.classList.add("channelMessages");

    channelInputs.append(channelInputText,channelButton);
    channel.append(channelMessages,channelInputs);
    document.getElementById("openedChannels")!.append(channel);
}

function startWebSocket(){
    let location = window.location
    let webSocketProtocol = location.protocol=="https"?"wss":"ws"
    webSocket = new WebSocket(`${webSocketProtocol}://${location.host}/api/webSocket/${currentGuild}/${currentChannel}`);
    for(let event in webSocketEventHandlers){
        webSocket.addEventListener(event,webSocketEventHandlers[event])
    }
}

async function channelNameOnClick(e:Event){
    let target: HTMLElement = e.target as HTMLElement;
    let guildId: string = target.parentElement.dataset.id as string;
    let channelId: string = target.dataset.id as string;
    if(document.getElementById(getChannelEleId(channelId))==undefined){
        createChannel(channelId);
    }

    if(currentChannel!=undefined){
        document.getElementById(getChannelNameEleId(currentChannel))!.classList.remove("active");
        document.getElementById(getChannelEleId(currentChannel))!.classList.add("hidden");
        webSocket?.close();
    }
    document.getElementById(getChannelNameEleId(channelId))!.classList.add("active");
    document.getElementById(getChannelEleId(channelId))!.classList.remove("hidden");
    currentChannel=channelId;
    timer = new Date();
    let messages = await fetch(`/api/getMessages/${guildId}/${channelId}/${limit}/`).then((m)=>{
        console.log(new Date().getTime()-timer.getTime())
        timer = new Date();
        return m
    })
    let messagesJSON = await messages.json()
    
    // console.log(messagesJSON)
    let channelMessages=document.querySelector("#"+getChannelEleId(channelId)+" .channelMessages") as HTMLElement;
    messagesJSON.findLast((message: any)=>{
        createMessage({
            ...message,
            channel: channelId
        },true,channelMessages);
    })
    console.log(new Date().getTime()-timer.getTime())
    let jChannelMessages = $(channelMessages);
    jChannelMessages.animate({ scrollTop: jChannelMessages.prop("scrollHeight") }, "fast");

    //debug
    // createMessage({
    //     channel: channelId,
    //     content: "gg"
    // });

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
        document.getElementById("guildsList")!.append(guildName);
        guildName.onclick=guildNameOnClick;
        let channelListDIV = document.createElement("div");
        channelListDIV.id=getChannelListEleId(guild.id);
        channelListDIV.dataset.id=guild.id;
        guild.channels.forEach((channel: any) => {
            let channelName = document.createElement("div");
            channelName.innerHTML=channel.name;
            channelName.id=getChannelNameEleId(channel.id);
            channelName.dataset.id=channel.id;
            channelName.classList.add("channelName","nameList");
            channelName.addEventListener("click",channelNameOnClick);
            channelName.dataset.id=channel.id;
            channelListDIV.append(channelName);
        })
        channelListDIV.classList.add("hidden","channelList");
        $("#channelList").append(channelListDIV);
    });
}

getAndUpdateGuilds();