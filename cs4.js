/**
 * Created by Steve on 9/30/13.
 */


MongoClient = require('mongodb').MongoClient;
var os = require('os');
var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var timedOutInterval = 200;  //time to wait between serial transmitts
var timedOut = true; // set to false will delay transmission;
var comlib = require('./comlib');



sendOutput = function (dataToSend)
{
    if (timedOut)
    {
        timedOut = false;
        comlib.write(dataToSend);

    }
    else
    {
    /*    setTimeout(function () {
            sendOutput(dataToSend);
        }, timedOutInterval);*/
    }
    setTimeout(function(){timedOut = true;}, timedOutInterval);
};


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
        comlib.openSerialPort('com19'); //windows
    }
    else
    {
        comlib.openSerialPort("/dev/ttyAMC0"); //not windows
    }

    //set up all routes HERE
                    //set up all routes HERE
                                    //set up all routes HERE
                                                    //set up all routes HERE
    app.get('/com', routes.com);
    app.get('/', routes.index);
    app.get('/users', user.list);
    app.get('/data', routes.data);
    app.get('/data2', routes.data2);
    app.get('/data3', routes.data3);


}

exports.socketDataOut  = function(data)
{
    var type = "";
    var indata;
    var source;
    var serialData;


    // put the time string into proper form
    // then save it to the log collection
    serialData = JSON.parse(data);
    serialData.Time = new Date(serialData.Time);


    //make sure this is incoming cue data
    //if it is, then search for matching cue
    //
    //If matching cue found then iterate through
    //OutData and send the stuff out
    if(serialData.InData !=null)
    {
        collectionLog.find({'InData' : serialData.InData}).toArray(function(err,item){
            console.log(item);
        });

        collectionLog.update({'InData': "F9 7F 05 02 01 01 30 F7 "},{$push: {OutData: [{"Delay":"001", "Port":"Zig1", "Showname":"MamaMia", "Dir":"English", "Dout":"GO slide1.jpg"}]}},function(err,res){

            console.log('changes it')});

        sendOutput('this is a test');
        setTimeout(function(){sendOutput('this is test 2')},2000);

    }

    //put the data into the collection
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

       global.websocket.send(serialData.Time + " " + type +" ---    "+ indata) ;

    }
    else // just send data
    {
        global.websocket.send(serialData.Time + " " +indata) ;
    }


}