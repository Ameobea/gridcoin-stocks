"use strict";
/*
Gridcoin Stock Simulator
Created by Casey Primozic

See README.md for more information.
*/

var dbq   = require("./src/dbQuery");
var ircio = require("./src/ircio");

dbq.init();
ircio.init();
