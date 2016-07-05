"use strict";
/* Functions to process and respond to commands sent to the bot */
var commands = exports;

var ircio = require("./ircio");
var dbq   = require("./dbQuery");
var conf  = require("./conf");
var stocks= require("./stocks");
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
      case "buy":
        commands.openPosition(nick, args).then(f);
        break;
      case "sell":
        commands.closePosition(nick, args).then(f);
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
  var lowerUsername = conf.ircUsername.toLowerCase();
  if(text.trim().indexOf("!stock ") === 0){ // if message is a command for the bot
    let splitStr = text.split("!stock ")[1].split(" ");
    commands.doCommand(sender, splitStr[0].toLowerCase(), splitStr.slice(1)).then(response=>{
      if(response){
        ircio.sendMessage(response);
      }
    });
  // Tip received
  }else if(sender == conf.tipBotNick && text.toLowerCase().indexOf(`tipped ${lowerUsername}`) != -1){
    text = text.toLowerCase();
    // Ameo tipped Ameobot 0.1 GRC! Type "/msg GRCtip2 help" for info.
    let splitStr = text.split(lowerUsername + " ");
    var amount = splitStr[1].split(" grc")[0];
    var nick = splitStr[0].split(" tipped")[0];
    commands.deposit(nick, parseFloat(amount)).then(ircio.sendMessage);
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
      if(!user.balance){
        user.balance = 0;
      }
      f(`Current balance: ${user.balance} GRC`);
    });
  });
};

commands.withdraw = (nick, amount)=>{
  return new Promise((f,r)=>{
    // Unlocks user and then fulfills with given response
    var u_f = res=>{
      commands.unlock(nick);
      f(res);
    };

    dbq.getUser(nick).then(user=>{
      var parsed = parseFloat(amount);
      if(commands.locks.indexOf(nick) != -1){
        u_f("Ongoing transaction for this username!  This has been logged; please report it!");
      }else if(isNaN(parsed)){
        u_f("Incomprehensible withdraw amount.");
      }else if(parsed <= 0 || user.balance <= 0){
        u_f("If only it were that easy.");
      }else if(parsed <= user.balance){
        commands.locks.push(nick);
        dbq.adjustBalance(user.id, user.nick, -parsed, user.balance).then(u_f);
      }else{
        commands.locks.push(nick);
        dbq.adjustBalance(user.id, user.nick, -user.balance, user.balance).then(u_f);
      }
    });
  });
};

commands.deposit = (nick, amount)=>{
  return new Promise((f,r)=>{
    var u_f = res=>{
      commands.unlock(nick);
      f(res);
    };
    dbq.getUser(nick).then(user=>{
      if(commands.locks.indexOf(nick) != -1){
        u_f("Ongoing transaction for this username!  This has been logged.");
      }else if(isNaN(amount)){
        u_f("Couldn't get deposit amount!  This has been logged; please report it!");
      }else if(amount <= 0){
        u_f("GRCTip gave an invalid deposit amount; this has been recorded!");
      }else{
        commands.locks.push(nick);
        dbq.adjustBalance(user.id, user.nick, amount, user.balance).then(u_f);
      }
    });
  });
};

commands.openPosition = (nick, args)=>{
  return new Promise((f,r)=>{
    var symbol = args[0];
    var amount = parseFloat(args[1]);
    stocks.getAsset(symbol).then(data=>{
      dbq.getUser(nick).then(user=>{
        if(user.balance >= amount){
          var lastDate = new Date(data.lt_dts);
          var diff = Date.now() - lastDate;
          // Only trade if activity in the last 30 seconds
          if(diff < 403855386){
            var direction = "long";
            if(args.length > 2 && args[2].toLowerCase() == "short"){
              direction = "short";
            }
            dbq.openPosition(user, data.t, amount, parseFloat(data.l), direction).then(()=>{
              f(`Position of size ${amount} GRC in ${data.t} at price ${data.l} opened!`);
            });
          }else{
            f("No trades in " + symbol + " in the last 30 seconds; not opening position.");
          }
        }else if(isNaN(amount) || amount == undefined){
          f("You must supply a size position size!  See !stock help (just help via PM) for more info!");
        }else{
          f("Not enough funds to open a position of that size!");
        }
      });
    }, ()=>{ // finance API returned error
      f("No asset found with symbol " + symbol);
    });
  });
};

commands.closePosition = (nick, args)=>{
  return new Promise((f,r)=>{
    //TODO
  });
};
