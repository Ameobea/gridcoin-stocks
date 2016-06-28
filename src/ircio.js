"use strict";
/* Functions pertaining to the sending and receiving of messages over IRC. */

var ircio = exports;

var irc = require("irc");
var conf = require("./conf");
var commands = require("./commands");
var Promise = require("bluebird");
Promise.onPossiblyUnhandledRejection(function(error){
  throw error;
});

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
  ircio.client.say(conf.ircChannel, message);
};

ircio.init = ()=>{
  ircio.connect().then(()=>{
    console.log("Connected to IRC server.")
    ircio.client.say("NickServ", `IDENTIFY ${conf.nickservPass}`);
    console.log("Sending authentication request to Nickserv.")
    ircio.client.addListener("pm", commands.processPM);

    var joinListener = (channel, nick, message)=>{
      console.log("Joined " + channel);
      ircio.client.addListener(`message#`, commands.processMessage);
      ircio.client.removeListener("join", joinListener); // no longer need to listen for joins
    }
    ircio.client.addListener("join", joinListener);
    setTimeout(()=>{
      ircio.client.join(conf.ircChannel);
      console.log("Joining " + conf.ircChannel);
    }, 1834);
  });
};

ircio.connect = ()=>{
  return new Promise((f,r)=>{
    if(ircio.client === null){
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
