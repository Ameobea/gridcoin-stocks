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

// Holds the Ids of users that are locked due to ongoing commands.
// Users are locked during commands that impact their balances and are
// only unlocked after they complete to avoid double-withdrawls etc.
commands.locks = [];

// Removes a user from the lock list
commands.unlock = nick=>{
  var ix = commands.locks.indexOf(nick);
  if(ix != -1){
    commands.locks.splice(ix, 1);
  }
};

// Returns a promise that fulfills with an array of responses to send the user or False
commands.doCommand = (nick, command, args)=>{
  return new Promise((f,r)=>{
    switch(command){
      case "balance":
        commands.balance(nick).then(f);
        break;
      case "!stock":
      case "stock":
        f("`!stock` preamble not necessary via PM.  See `help`.");
        break;
      case "withdraw":
        commands.withdraw(nick, args[0]).then(f);
        break;
      case "commands":
      case "faq":
      case "help":
        f("See https://github.com/Ameobea/gridcoin-stocks#readme for usage and commands.");
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
  if(text.trim().indexOf("!stock") === 0){ // if message is a command for the bot
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

commands.withdraw = (nick, amount)=>{
  commands.locks.push(nick);
  return new Promise((f,r)=>{
    // Unlocks user and then fulfills with given response
    var u_f = res=>{
      commands.unlock(nick);
      f(res);
    };

    dbq.getUser(nick).then(user=>{
      var parsed = parseInt(amount);
      if(isNaN(parsed)){
        u_f("Incomprehensible withdraw amount.");
      }else if(parsed <= 0 || user.balance <= 0){
        u_f("If only it were that easy.");
      }else if(parsed <= user.balance){
        dbq.adjustBalance(user.id, user.nick, -parsed, user.balance).then(u_f);
      }else{
        dbq.adjustBalance(user.id, user.nick, -user.balance, user.balance).then(u_f);
      }
    });
  });
};

commands.openPosition = (nick, symbol, amount, direction)=>{
  return new Promise((f,r)=>{
    //TODO
  });
};

commands.closePosition = (nick, symbol, amount)=>{
  return new Promise((f,r)=>{
    //TODO
  });
};
