"use strict"

function getChannelElementId(id){
    return "channels_"+id;
}

let currectChannel = undefined;
let guilds = await fetch("/api/getGuilds");
guilds = await guilds.json()
guilds.forEach(guild => {
    let p = document.createElement("p");
    p.classList.add("guildName","nameList")
    p.innerHTML=guild.name;
    p.dataset.id=guild.id;
    $("#guilds").append(p);
    p.onclick=(e)=>{
        let guildId = e.target.dataset.id;
        if(typeof currectChannel != "undefined"){
            $("#"+getChannelElementId(currectChannel)).toggleClass("hidden");
        }
        $("#"+getChannelElementId(guildId)).toggleClass("hidden");
        e.target.classList.toggle("active");
    }
    let channelDIV = document.createElement("div");
    channelDIV.id=getChannelElementId(guild.id);
    guild.channels.forEach(channel => {
        let channelName = document.createElement("div");
        channelName.innerHTML=channel.name;
        channelName.dataset.id=channel.id;
        channelName.classList.add("channelName","nameList");
        channelDIV.append(channelName)
    })
    channelDIV.classList.add("hidden","channels");
    $("#channels").append(channelDIV);
});

