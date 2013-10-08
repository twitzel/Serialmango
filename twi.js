/**
 * Created by Steve on 9/30/13.
 */

MongoClient = require('mongodb').MongoClient;
var os = require('os');
var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');



exports.socketDataOut  = function(data)
{
   //console.log(data);

   try{
       var serialData = JSON.parse(data);
   }
   catch(err)
   {
       console.log("parse serial data error"+err)
   }
    if(serialData)
    {
        serialData.Time = new Date(serialData.Time);
        serialData.Time = "test"
    }
    else
    {
        console.log("serialData.time not defined");
        return;
    }
    //console.log(serialData.Time);
   if (global.collectionLog){
    //collectionLog.insert(serialData, {w:1}, function(err, result) {
       collectionLog.insert({"test":1}, {w:1}, function(err, result) {
        console.log(result);
    });
   }
    else
   {
       console.log("Serial data rec - no database connections yet;")
   }
 //  console.log("Sending ws");
    if (global.collectionLog){
    collectionLog.find({'UnitID':1}).sort( { _id : -1 } ).limit(1000).toArray(function(err,item)
    {
     if (err){
         console.log("Error in mongo find"+err);
         return;
     }
      //  console.log(item[0].Time);
        try
        {
            global.websocket.send(JSON.stringify(item));
        }
        catch(err)
        {

        }
      });
    }
}


exports.setup = function()
{
    MongoClient.connect("mongodb://localhost:27017/test", function(err, db)
    {
        if (err)
        {
            console.log("Connection to mongo failed:"+err)  ;
        }
        else
        {
            console.log("TWI: We are connected to mondo exampleDb database todd collection");
            global.collectionLog = db.collection('todd');
        }
    });


    //iterate through all of the system IPv4 addresses
    // we should connect to address[0] with the webserver
    //so lets grab it and make a global variable to
    //use elseware
    var interfaces = os.networkInterfaces();
    global.addresses = [];
    for (k in interfaces) {
        for (k2 in interfaces[k]) {
            var address = interfaces[k][k2];
            if (address.family == 'IPv4' && !address.internal) {
                addresses.push(address.address)
            }
        }
    }
    console.log('My IP Address is: ' + addresses[0]);

    //now lets find out if we are on a windows system
    // if we are open the required com port
    //if not open the pi port
    console.log("Host System Name: " + os.type());
    if(os.type() == 'Windows_NT')
    {
        comlib.openSerialPort('com8'); //windows
    }
    else
    {

        comlib.openSerialPort("/dev/ttyACM0"); //not windows
    }

    //set up all routes HERE


    app.get('/com', routes.com);
    app.get('/', routes.index);
    app.get('/users', user.list);
    app.get('/data', routes.data);
}

