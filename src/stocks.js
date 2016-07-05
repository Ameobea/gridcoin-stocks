"use strict";
/* Interfaces with Finance API to get live prices of assets */
const https = require("https");

var stocks = exports;

stocks.apiURL = "https://www.google.com/finance/info?q=";

stocks.getAsset = symbol=>{
  return new Promise((f,r)=>{
    https.get(stocks.apiURL + symbol, res=>{
      res.on("data", data=>{
        if(data.indexOf("httpserver.cc") == -1){
          f(JSON.parse(data.toString().replace("//", ""))[0]);
        }else{
          r();
        }
      });
    });
  });
};
