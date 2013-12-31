/**
 * Created by Steve on 10/10/13.
 */
/**
 * Created by Steve on 9/30/13.
 */


MongoClient = require('mongodb').MongoClient;
var fs = require('fs');
var os = require('os');
var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var time = require('time');
var usbdetect =require('usb-detection');
var timedOutInterval = 200; //time to wait between serial transmitts
var timedOut = true; // set to false will delay transmission;
var comlib = require('./comlib');
var lastCueReceived = {"Time" : "10/09/13 15:20:04.20", "Source" : "Midi1", "InData" : "F0 7F 05 02 01 01 31 2E 30 30 F7 "};
var serialDataSocket;
var lastCueReceivedInternalTime= new Date();
var lastCueReceivedExternalTime = new Date();
var usbstickPath;


//routine to ensure that serial data is not sent more than
// every timedOutInterval
//
// adds time stamp to Outgoing data and puts it in Log collection

sendOutput = function (dataToSend)
{
   var addTime = "{\"Time\":";
   var timerStartTime;
   var lastconverted;

    if (timedOut)
    {
        timedOut = false;
        comlib.write("         " + dataToSend + "\n\r"); // add spaces at beginning for R4 zigbee stuff and terminate\n\r
        setTimeout(function(){timedOut = true;}, timedOutInterval);
        timerStartTime = new Date();
        console.log(dataToSend);
        //


    //change the time of data sent to corolate with CS-4 I/O clock
    lastconverted   = new Date(lastCueReceived.Time);
    addTime = addTime + "\""+  (new Date( lastconverted.setMilliseconds(lastconverted.getMilliseconds() + (timerStartTime -lastCueReceivedInternalTime)))).toISOString() +"\", \"Dout\" : \"" + dataToSend + "\"}";

    //send it out the socket
    comlib.websocketsend("  Sent: " + addTime) ;

    //Log the data into the collection
    addTime = JSON.parse(addTime);
    collectionLog.insert(addTime, {w: 1}, function (err, result) {
        console.log(result);
    });
       //log the time difference for testing
    console.log("Time difference & New data stored  -->> "+ (timerStartTime -lastCueReceivedInternalTime)+ "---" + addTime);

    }
    else
    {
        //since we are not ready for this to go out (or we wouldn't be here) -- reset a timer with actual time left.
        setTimeout(function(){sendOutput(dataToSend);}, ( timedOutInterval -(timerStartTime - Date())))
    }

};

exports.setup = function()
{
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
    global.myuri = addresses[0];
    console.log('My IP Address is: ' + addresses[0]);


    //MongoClient.connect("mongodb://localhost:27017/WizDb", function(err, db)
   // MongoClient.connect("mongodb://192.168.2.10:27017/WizDb", function(err, db)
    MongoClient.connect("mongodb://" + global.myuri + ":27017/WizDb", function(err, db)
    {
        if (err)
        {
            console.log("Connection to mongo failed:"+err)  ;
        }
        else
        {
            console.log("CS4: We are now connected to MongoDb, Wiz database, log collection");

           try{
               db.createCollection("log", { capped : true, size : 5000000, max : 10 },function (err,res){} );
            }
            catch(err){
                console.log("create collection errer" + err);
            }

            global.collectionLog = db.collection('log');
            global.collectionCue = db.collection('cue');
            global.collectionStartup = db.collection('startup');
            collectionCue.ensureIndex({InData:1},function (err,res){});


            //set timezone of pi
           collectionStartup.findOne({'TimeZoneSet':{$exists:true}}, function(err,res){
                if(res){
                    var a = res.TimeZoneSet;
                    time.tzset(res.TimeZoneSet);
                }
                else{
                    time.tzset('US/Eastern'); // this is the default time zone if nothing is set
                }

               });

            // MOVED HERE = open serial port after mongo is running

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
                comlib.openSerialPort("/dev/ttyUSB0"); //not windows - Raspberry PI
            }

        }
    });

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
    app.get('/cs4Start', routes.cs4Start);
    app.get('/cs4Home', routes.cs4Home);
    app.get('/cs4Timing', routes.cs4Timing);
    app.get('/cs4Info', routes.cs4Info);
    app.get('/cs4VerticalScroll', routes.cs4VerticalScroll);
    app.get('/cs4Help', routes.cs4Help);
    app.get('/cs4Settings', routes.cs4Settings);

    //set timezone of pi
   // time.tzset('US/Pacific');
    time.tzset('US/Eastern');

    usbdetect.on('change', function(err, devices) {
        console.log('Number of devices = ', devices.length);
        });
    usbdetect.on('add', function(err, devices) {
        console.log('Number of devices = ', devices.length);
    });
    usbdetect.on('remove', function(err, devices) {
        console.log('Number of devices = ', devices.length);
    });

};


/*Data in may have a prefix.  That prefix is a command and handled here:
    TME     Sets the CS4 I/O clock
    TME TZ  Changes system time zone
    LOG     Sends log file out to client
 */
exports.websocketDataIn = function(dataSocket, Socket){
    if(dataSocket.substr(0,3) == "TME") // if this is a time command
    {
        var datain;
        if(dataSocket.substr(0,6) == "TME TZ")//if timezone command
        {
            datain = dataSocket.substr(7)
            time.tzset(datain); // tz string from client: CMD TZ US/Pacific
          //  collectionStartup.update({'TimeZoneChanged':'Yes'}, {$set:{'TimeZoneSet' : datain}},{upsert:true, w:1},function(err,res){
                collectionStartup.update({'TimeZoneSet':{$exists:true}}, {$set:{'TimeZoneSet' : datain}},{upsert:true, w:1},function(err,res){

                console.log('Time Zone Updated'+res);

            });
        }
        else
        {
            //set the clock on the CS4 I/O board every time the "info" screen is opened
            datain = dataSocket.substr(4);
            datain = SetCS4Time(datain);
            comlib.write(datain);
        }

    }
    else if(dataSocket.substr(0,3) == "LOG")//requesting entire log file to be sent log file
    {
        if(dataSocket.substr(0,7) == "LOG 100")
        {
            collectionLog.find({},{"_id":0}).sort({"_id": 1}).limit(100).toArray(function(error,logfile){
                for(var i = 0; i <logfile.length;i++)
                {
                    logfileData = JSON.stringify(logfile[i]);

                    if(logfile[i].Dout)
                    {
                        comlib.websocketsend(".    Sent: " + logfileData, Socket) ;
                    }
                    else
                    {
                        comlib.websocketsend(parseCue(logfileData),Socket);
                    }
                }
            });
        }
        else
        {
            collectionLog.find({},{"_id":0}).sort({"_id": 1}).toArray(function(error,logfile){
                for(var i = 0; i <logfile.length;i++)
                {
                    logfileData = JSON.stringify(logfile[i]);

                    if(logfile[i].Dout)
                    {
                        comlib.websocketsend(".    Sent: " + logfileData, Socket) ;
                    }
                    else
                    {
                        comlib.websocketsend(parseCue(logfileData),Socket);
                    }
                }
            });
        }
    }
    else if (dataSocket.substr(0,4) == "SEND") // these are commands to send directly to the CS4I/0
    {
        comlib.write(dataSocket.substr(5)+ '\r'); // send it out the serial port
    }
    else
    {
        serialDataSocket = JSON.parse(dataSocket);
        //now we know something is attached to the incoming cue so put it in Cue collection
        // incoming cue = lastCueReceived
        //lastCueReceived is a json parsed object from my io board
        // serialDataSocket is the array data from the websocket

        //
        collectionCue.update({'InData':lastCueReceived.InData}, {$set: lastCueReceived},{upsert:true, w:1},function(err,res){

            console.log('InData to collection Cue'+res);
        });

        collectionCue.update({'InData': lastCueReceived.InData}, {$push:serialDataSocket},function(err,res){

        console.log('added Dout to collection Cue'+res);
        });

        //send the data out to the CS4 I/O
         var dir = serialDataSocket.OutData.Dir;    // ****** needs to ba added to R4-4 Receiver Parsing ****** //
       // dir = "";
        var port = serialDataSocket.OutData.Port;
        var showname = serialDataSocket.OutData.Showname;
        var dataToSend = serialDataSocket.OutData.Dout;

        var outstring = port + " " + showname + " " + dir + " " + dataToSend;
        sendOutput(outstring);
    }
};

// This routine receives serial cue data,
// parses it and sends it out the web socket
// puts it in Log collection.
//
// Then checks to Cue file to see if there any matching cues.
// If so, goes thrugh all outgoing cues.
// sets output timers to send data back to CS-4 IO via serial.


exports.socketDataOut = function (data) {
    var type = "";
    var indata;
    var source;
    var serialData;
    var dataToSend;
    var delay;
    var port;
    var showname;
    var outstring;
    var dir; // ****** needs to ba added to R4-4 Receiver Parsing ****** //

    // put the time string into proper form

    serialData = JSON.parse(data);
    serialData.Time = new Date(serialData.Time);


    // make sure this is incoming cue data
    // if it is, then search for matching cue
    //
    // If matching cue found then iterate through
    // OutData and send the stuff out
    // and send output data to log file
    if (serialData.InData != null) {
        collectionCue.find({'InData': serialData.InData}).toArray(function (err, item) {
            if (item.length == 0) {
                console.log("not Found");
            }
            else {

               for(var i = 0; i< item[0].OutData.length; i++)
               {
                   // dir = item[0].OutData[i][0].Dir;    // ****** needs to ba added to R4-4 Receiver Parsing ****** //
                    dir = "xxxx";
                    port = item[0].OutData[i].Port.toUpperCase();
                    showname = item[0].OutData[i].Showname;
                    dataToSend = item[0].OutData[i].Dout;
                    delay = item[0].OutData[i].Delay;
                    outstring = port + " " + showname + " " + dir + " " + dataToSend;
                    setTimeout(sendOutput, delay, outstring);
                    console.log(item[0].OutData[i].Dout + "  Delay "+item[0].OutData[i].Delay);
                }

            }

        });
    }

if(data.length >= 35) // this is to let GETTIME come through and get logged GETTIME returns a string 34 characters
{
    lastCueReceived = (JSON.parse(JSON.stringify(serialData))); // store the data here in case of Cue file generation
    //get the internal system time or this event so we and keep track of it
    lastCueReceivedInternalTime = new Date();
    lastCueReceivedExternalTime = new Date(lastCueReceived);

    //Log the data into the collection
    collectionLog.insert(serialData, {w: 1}, function (err, result) {
        console.log(result);
    });

    //parse the incoming cue data
   comlib.websocketsend(parseCue(data));
}
else
{   //we have startup time from the CS4 I/O board
    collectionStartup.insert(serialData, {w: 1}, function (err, result) {
        console.log(result);
        try{
           comlib.websocketsend("CS4 Current time is:" + data);
        }
        catch(err)
        {//do nothing
        }
    });

}
};

function parseCue(data)
{
    serialData = JSON.parse(data);
    serialData.Time = new Date(serialData.Time);

    indata = serialData.InData;
    source = serialData.Source;
    // if cue is MIDI then get light cue number from hex string
    if (source.substr(0, 4) == "Midi") {
        if (indata.substr(0, 2) == "F0") // this is a light cue
        {
            var space = "                                    ";
            var hex = "";

            for (i = 18; i < indata.length - 3; i += 3) // extra space added to data at end of string
            {
                hex += String.fromCharCode(parseInt(indata.substr(i, 2), 16));
            }
            type = 'Sysex Cue: ' + hex;
        }

        else if (indata.substr(0, 1) == "8") {
            type = "Note Off";
        }

        else if (indata.substr(0, 1) == "9") {
            type = "Note On";
        }

        else if (indata.substr(0, 1) == "A") {
            type = "Polyphonic Aftertouch";
        }

        else if (indata.substr(0, 1) == "B") {
            type = "Control/Mode Change";
        }

        else if (indata.substr(0, 1) == "C") {
            type = "Program Change";
        }

        else if (indata.substr(0, 1) == "D") {
            type = "Channel Aftertouch";
        }

        else if (indata.substr(0, 1) == "E") {
            type = "Pitch Wheel Control";
        }

        return (serialData.Time.toISOString() + "  " + source + "  " + type + ": " + indata);



    }
    else // just send data
    {
        return (serialData.Time.toISOString() + "  " + source + " " + indata);
    }

}

function SetCS4Time(curTime)
{
    var uptime=0;
    var seconds = 0;
    var minutes = 0;
    var hours = 0;
    var days = 0;
    var month = 0;
    var year = 0;
    var timeZoneOffset = 0;
    curTime = new Date(curTime);
    timeZoneOffset = curTime.getTimezoneOffset();
    year = curTime.getFullYear().toString();
    month = parseInt(curTime.getMonth()) + 1; // months start with 1 in the timer chip
    day = curTime.getDate();
    hours = curTime.getHours();
    minutes = curTime.getMinutes();
    seconds = curTime.getSeconds();
    return "SETTIME " + seconds + " " + minutes + " " + hours + " " + day + " " + month + " " + year.substr(2) + "\n\r";
    //  sendData("SETTIME " + textBoxSecond.Text + " " + textBoxMinute.Text + " " + textBoxHour.Text + " " + textBoxDay.Text + " " + textBoxMonth.Text + " " + textBoxYear.Text);
}

