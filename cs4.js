/**
 * Created by Steve on 9/30/13.
 */


MongoClient = require('mongodb').MongoClient;
var os = require('os');
var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');

exports.setup = function()
{
    MongoClient.connect("mongodb://localhost:27017/WizDb", function(err, db)
    {
        if (err)
        {
            console.log("Connection to mongo failed:"+err)  ;
        }
        else
        {
            console.log("CS4: We are now connected to MongoDb, Wiz database, log collection");
            global.collectionLog = db.collection('log');
            global.collectionCue = db.collection('cue');
            global.collectionStartup = db.collection('startup');
        }
    });

    //now lets find out if we are on a windows system
    // if we are open the required com port
    //if not open the pi port
    console.log("Host System Name: " + os.type());
    if(os.type() == 'Windows_NT')
    {
        comlib.openSerialPort('com19'); //windows
    }
    else
    {
        comlib.openSerialPort("/dev/ttyAMC0"); //not windows
    }

    //set up all routes HERE
    app.get('/com', routes.com);
    app.get('/', routes.index);
    app.get('/users', user.list);

}

exports.socketDataOut  = function(data)
{
    var type = "";
    var indata;
    var source;
    var serialData;

    serialData = JSON.parse(data);
    serialData.Time = new Date(serialData.Time);
    //console.log(serialData.Time);
    collectionLog.insert(serialData, {w:1}, function(err, result) {
        console.log(result);
    });


    indata = serialData.InData;
    source = serialData.Source;

   // if cue is MIDI then get light cue number from hex string
    if(source.substr(0,4) == "Midi")
    {
       if(indata.substr(0,2) == "F0") // this is a light cue
           {
            var space = "                                    "
            var hex ="";

            for(i = 18; i < indata.length -3; i+=3) // extra space added to data at end of string
            {
                hex +=   String.fromCharCode(parseInt(indata.substr(i,2),16));
            }
            type = 'Cue: ' + hex;
           }

       else if(indata.substr(0,1) == "8")
       {
           type = "Note Off";
       }

       else if(indata.substr(0,1) == "9")
       {
           type = "Note On";
       }

       else if(indata.substr(0,1) == "A")
       {
           type = "Polyphonic Aftertouch";
       }

       else if(indata.substr(0,1) == "B")
       {
           type = "Control/Mode Change";
       }

       else if(indata.substr(0,1) == "C")
       {
           type = "Program Change";
       }

       else if(indata.substr(0,1) == "D")
       {
           type = "Channel Aftertouch";
       }

       else if(indata.substr(0,1) == "E")
       {
           type = "Pitch Wheel Control";
       }

       global.websocket.send(type +" ---    "+ indata) ;

    }
    else // just send data
    {
        global.websocket.send(indata) ;
    }


}