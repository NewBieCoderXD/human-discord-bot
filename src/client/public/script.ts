import $ from "jquery"
import "jquery-ui"

function getChannelElementId(id:string){
    return "channels_"+id;
}

let guilds;

let currectChannel: string | undefined = undefined;

async function getAndUpdateGuilds(){
    guilds = await fetch("/api/getGuilds");
    guilds = await guilds.json()
    guilds.forEach((guild: any) => {
        let p = document.createElement("p");
        p.classList.add("guildName","nameList")
        p.innerHTML=guild.name;
        p.dataset.id=guild.id;
        $("#guilds").append(p);
        p.onclick=(e)=>{
            let target: HTMLElement = e.target as HTMLElement;
            let guildId: string = target.dataset.id as string;
            if(currectChannel != undefined){
                $("#"+getChannelElementId(currectChannel)).toggleClass("hidden");
            }
            $("#"+getChannelElementId(guildId)).toggleClass("hidden");
            target.classList.toggle("active");
        }
        let channelDIV = document.createElement("div");
        channelDIV.id=getChannelElementId(guild.id);
        guild.channels.forEach((channel: any) => {
            let channelName = document.createElement("div");
            channelName.innerHTML=channel.name;
            channelName.dataset.id=channel.id;
            channelName.classList.add("channelName","nameList");
            channelDIV.append(channelName)
        })
        channelDIV.classList.add("hidden","channels");
        $("#channels").append(channelDIV);
    });
}

getAndUpdateGuilds();