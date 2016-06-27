"use strict";
/* Functions to process and respond to commands sent to the bot */
var commands = exports;

var ircio = require("./ircio");

// Returns a promise that fulfills with an array of responses to send the user or False
commands.doCommand = (nick, command, args)=>{
  return new Promise((f,r)=>{
    switch(command){
      case "balance":
        f(commands.balance(nick));
      case "!stock":
      case "stock":
        f("`!stock` preamble not necessary via PM.  See `help`.");
      default:
        f("Command not found.  Try !stock help (just the word `help` via PM).");
    }
  });
};

// Processes a public message sent in the channel
commands.processMessage = (sender, message)=>{
  if(message.trim().indexOf("!stock") == 1){ // if message is a command for the bot
    var split = message.split("!stock ")[1].split(" ");
    commands.doCommand(sender, split[0].toLowerCase(), split.slice(1)).then(response=>{
      if(response){
        ircio.sendMessage(response);
      }
    })
  }
};

// Processes a private message sent to the bot
commands.processPM = (nick, message)=>{
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
