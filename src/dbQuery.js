"use strict";
/*
Database Interface

Provides functions to communicate with the MySQL database backend
*/

var dbQuery = exports;

var mysql = require("mysql");
var conf  = require("conf");

dbQuery.connection = null;

dbQuery.init = ()=>{
  if(dbQuery.connection === null){
    dbQuery.connection = mysql.createConnection({
      host     : conf.sqlIp,
      user     : conf.sqlUsername,
      password : conf.sqlPassword,
      database : conf.sqlUserDb
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
dbQuery.getUser = nick=>{
  return new Promise((f,r)=>{
    dbQuery.connection.query("SELECT * FROM `users` WHERE `nick` = ?;", [nick], (err, res)=>{
      f(res);
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

    if(!symbols){
      let query = "SELECT * FROM `positions` WHERE `nick` = ?";
      dbQuery.connection.query(query, [nick], cb);
    }else{
      let query = "SELECT * FROM `positions` WHERE `nick` = ? AND `symbol` = ?";
      dbQuery.connection.query(query, [nick, symbol], cb);
    }
  });
};
