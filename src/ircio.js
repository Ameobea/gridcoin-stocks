"use strict";
/* Functions pertaining to the sending and receiving of messages over IRC. */

var ircio = exports;

var irc = require("irc");
var conf = require("./conf");
var commands = require("./commands");

ircio.client = null;

// If message is a string, sends it.  If array, sends all messages sequentially.
ircio.sendPM = (nick, message)=>{
  if(typeof(message) != "string"){
    message.forEach(mes=>{
      ircio.client.say(nick, mes);
    });
  }else{
    ircio.client.say(nick, message);
  }
};

// Same rules as ircio.sendPM but sends it on the public channel.
ircio.sendMessage = (message)=>{
  ircio.send(conf.ircChannel, message);
};

ircio.init = ()=>{
  ircio.connect().then(()=>{
    ircio.client.say("NickServ", `IDENTIFY ${conf.nickservPass}`);
    ircio.client.addListener("pm", commands.processPM);
    ircio.client.addListener(`message#${conf.ircChannel}`, commands.processMessage);
  });
};

ircio.connect = ()=>{
  return new Promise((f,r)=>{
    if(ifcio.client == null){
      ircio.client = new irc.Client(conf.ircServer, conf.ircUsername, {
        channels: [conf.ircChannel],
        floodProtection: true,
        floodProtectionDelay: 232
      });

      ircio.client.addListener("motd", (motd)=>{
        f(); // Fulfill after MOTD is sent
      });
    }else{
      r(); // Reject if already connected
    }
  });
};
