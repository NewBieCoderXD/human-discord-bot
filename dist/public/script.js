import $ from "../_snowpack/pkg/jquery.js";
import "../_snowpack/pkg/jquery-ui.js";
function getChannelElementId(id) {
  return "channels_" + id;
}
let guilds;
let currectChannel = void 0;
async function getAndUpdateGuilds() {
  guilds = await fetch("/api/getGuilds");
  guilds = await guilds.json();
  guilds.forEach((guild) => {
    let p = document.createElement("p");
    p.classList.add("guildName", "nameList");
    p.innerHTML = guild.name;
    p.dataset.id = guild.id;
    $("#guilds").append(p);
    p.onclick = (e) => {
      let target = e.target;
      let guildId = target.dataset.id;
      if (currectChannel != void 0) {
        $("#" + getChannelElementId(currectChannel)).toggleClass("hidden");
      }
      $("#" + getChannelElementId(guildId)).toggleClass("hidden");
      target.classList.toggle("active");
    };
    let channelDIV = document.createElement("div");
    channelDIV.id = getChannelElementId(guild.id);
    guild.channels.forEach((channel) => {
      let channelName = document.createElement("div");
      channelName.innerHTML = channel.name;
      channelName.dataset.id = channel.id;
      channelName.classList.add("channelName", "nameList");
      channelDIV.append(channelName);
    });
    channelDIV.classList.add("hidden", "channels");
    $("#channels").append(channelDIV);
  });
}
getAndUpdateGuilds();
