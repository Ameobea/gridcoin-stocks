"use strict";
/* Functions to process and respond to commands sent to the bot */
var commands = exports;

var ircio = require("./ircio");
var dbq   = require("./dbQuery");
var conf  = require("./conf");
var Promise = require("bluebird");
Promise.onPossiblyUnhandledRejection(function(error){
  throw error;
});

// Returns a promise that fulfills with an array of responses to send the user or False
commands.doCommand = (nick, command, args)=>{
  return new Promise((f,r)=>{
    switch(command){
      case "balance":
        f(commands.balance(nick));
        break;
      case "!stock":
      case "stock":
        f("`!stock` preamble not necessary via PM.  See `help`.");
        break;
      default:
        f("Command not found.  Try !stock help (just the word `help` via PM).");
    }
  });
};

// Processes a public message sent in the channel
commands.processMessage = (sender, channel, text, message)=>{
  console.log("Message received in " + conf.ircChannel + ":");
  console.log(`${sender}: ${text}`);
  if(text.trim().indexOf("!stock") == 0){ // if message is a command for the bot
    var split = text.split("!stock ")[1].split(" ");
    commands.doCommand(sender, split[0].toLowerCase(), split.slice(1)).then(response=>{
      if(response){
        ircio.sendMessage(response);
      }
    });
  }
};

// Processes a private message sent to the bot
commands.processPM = (nick, message)=>{
  console.log("Received message from " + nick + ":");
  console.log(message);
  var split = message.split(" ");
  commands.doCommand(nick, split[0].toLowerCase(), split.slice(1)).then(response=>{
    if(response){
      ircio.sendPM(nick, response);
    }
  });
};

// Returns a promise that fulfills with a user's balance
commands.balance = nick=>{
  return new Promise((f,r)=>{
    dbq.getUser(nick).then(user=>{
      f(`Current balance: ${user.balance}`);
    });
  });
};
