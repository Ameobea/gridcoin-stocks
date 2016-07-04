"use strict";
/*
Database Interface

Provides functions to communicate with the MySQL database backend
*/

var dbQuery = exports;

var mysql = require("mysql");
var conf  = require("./conf");
var ircio = require("./ircio");
var Promise = require("bluebird");
Promise.onPossiblyUnhandledRejection(function(error){
  throw error;
});

dbQuery.connection = null;

dbQuery.init = ()=>{
  if(dbQuery.connection === null){
    dbQuery.connection = mysql.createConnection({
      host     : conf.sqlIp,
      user     : conf.sqlUsername,
      password : conf.sqlPassword,
      database : conf.sqlDb
    });

    dbQuery.connection.connect(err=>{
      if(err){
        console.log("Database disconnected - killing bot.");
        setTimeout(()=>{
          process.exit(1); //bot will be restarted automatically after 5 seconds until db comes back
        }, 5000);
      }
    });
  }
};

/* The following functions return promises the fulfill the result data from the database. */

// Returns all stored data about a user from the database.
// If user doesn't exist, it is created.
dbQuery.getUser = nick=>{
  return new Promise((f,r)=>{
    dbQuery.connection.query("SELECT * FROM `users` WHERE `nick` = ?;", [nick], (err, res)=>{
      if(res && res.length > 0){
        f(res[0]);
      }else{
        dbQuery.connection.query("INSERT INTO `users` (`nick`, `balance`) VALUES(?, ?);",
            [nick, 0], (err, res)=>{
          dbQuery.getUser(nick).then(f);
        });
      }
    });
  });
};

// Returns all open positions for user with symbol.
// If symbols is not truthy, returns all open positions.
dbQuery.getPositions = (nick, symbol)=>{
  return new Promise((f,r)=>{
    var cb = (err, res)=>{
      f(res);
    };

    if(!symbol){
      let query = "SELECT * FROM `positions` WHERE `nick` = ?";
      dbQuery.connection.query(query, [nick], cb);
    }else{
      let query = "SELECT * FROM `positions` WHERE `nick` = ? AND `symbol` = ?";
      dbQuery.connection.query(query, [nick, symbol], cb);
    }
  });
};

dbQuery.adjustBalance = (userId, nick, amount, oldBalance)=>{
  return new Promise((f,r)=>{
    var query = "UPDATE `users` SET `balance` = ? WHERE `id` = ?;";
    dbQuery.connection.query(query, [oldBalance + amount, userId], (err, res)=>{
      if(res.affectedRows == 1){
        console.log(`User with Id ${userId} withdrew ${-amount} gridcoin.`);
        var tranType = (amount > 0) ? "Deposited" : "Withdrawn";
        res = [
          `${tranType} ${Math.abs(amount)} gridcoins.`,
          `Your current balance: ${oldBalance + amount}`
        ];
        if(tranType == "Withdrawn"){
          ircio.sendMessage(`!tip ${nick} ${-amount}`);
        }
        f(res);
      }else{ // For some reason the database didn't change.
        res = [
          "An error has occured!  This has been logged.",
          "If you believe you've lose gridcoin, please contact me using !stock contact."
        ];
        f(res);
      }
    });
  });
};

dbQuery.openPosition = (user, symbol, size, price)=>{
  return new Promise((f,r)=>{
    var query = "INSERT INTO `positions` (`user`, `symbol`, `size`, `openprice`), VALUES(?, ?, ?, ?);";
    dbQuery.connection.query(query, [user.id, symbol, size, price], (err, res)=>{
      f();
    });
  });
};
