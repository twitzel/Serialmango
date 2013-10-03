/**
 * Created by Steve on 9/30/13.
 */

MongoClient = require('mongodb').MongoClient;
var os = require('os');
var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');

exports.socketDataOut  = function(serialData, source)
{
   // console.log(serialData);
}
exports.setup = function()
{
    MongoClient.connect("mongodb://localhost:27017/exampleDb", function(err, db)
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
        comlib.openSerialPort("/dev/ttyAMC0"); //not windows
    }

    //set up all routes HERE


    app.get('/com', routes.com);
    app.get('/', routes.index);
    app.get('/users', user.list);
    app.get('/data', routes.data);
}

