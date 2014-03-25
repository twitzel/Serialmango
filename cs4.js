/**
 * Created by Steve on 10/10/13.
 */
/**
 * Created by Steve on 9/30/13.
 */


MongoClient = require('mongodb').MongoClient;
var fs = require('fs');
var fse = require('fs.extra');
var os = require('os');
var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var time = require('time');
var timedOutInterval = 200; //time to wait between serial transmitts
var timedOut = true; // set to false will delay transmission;
var comlib = require('./comlib');
var spawn = require('child_process').spawn;
var nodemailer = require("nodemailer");

var lastCueReceived = {"Time" : "10/09/13 15:20:04.20", "Source" : "Midi1", "InData" : "F0 7F 05 02 01 01 31 2E 30 30 F7 "};
var serialDataSocket;
var lastCueReceivedInternalTime= new Date();
var lastCueReceivedExternalTime = new Date();
var usbstickPath;
var path;
var sourcePath;
var destinationPath;
var mongoDirectory;
var collectionName = 'WizDb';
var smtpTransport;
var dataPacket = {};
var settings = {};
var ignoreSource = 0; // set to 1 to ignore incoming source
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
        ledInfoOn(27);
        setTimeout(function(){ledInfoOff(27);}, 100);
        setTimeout(function(){timedOut = true;}, timedOutInterval);
        timerStartTime = new Date();
        console.log(dataToSend);
        //


    //change the time of data sent to correlate with CS-4 I/O clock
    lastconverted   = new Date(lastCueReceived.Time);
    addTime = addTime + "\""+  (new Date( lastconverted.setMilliseconds(lastconverted.getMilliseconds() + (timerStartTime -lastCueReceivedInternalTime)))).toISOString() +"\", \"Dout\" : \"" + dataToSend + "\"}";

    //send it out the socket
    comlib.websocketsend("  Sent: " + addTime) ;

    //Log the data into the collection
    addTime = JSON.parse(addTime);
    addTime.Time = new Date(addTime.Time); //get to real time format.
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

    MongoClient.connect("mongodb://" + global.myuri + ":27017/" + collectionName, function(err, db)
    {
        if (err)
        {

            console.log("Connection to mongo failed:"+err)  ;
        }
        else
        {
            console.log("CS4: We are now connected to MongoDb, Wiz database, log collection");

           try{
               db.createCollection("log", { capped : true, size : 10000000, max : 25000 },function (err,res){} );
            }
            catch(err){
                console.log("create collection errer" + err);
            }

            global.collectionLog = db.collection('log');
         //   collectionLog.ensureIndex({Time:1},function (err,res){});
            global.collectionCue = db.collection('cue');
            global.collectionStartup = db.collection('startup');
            global.collectionSettings = db.collection('settings');
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
            var baud = 230400;
            if(os.type() == 'Windows_NT')
            {
               // comlib.openSerialPort('com19', baud); //windows
                comlib.openSerialPort('com19', baud); //windows
            }
            else
            {
                comlib.openSerialPort("/dev/ttyUSB0", baud); //not windows - Raspberry PI
            }

        }
    });

    //set up all routes HERE
    //set up all routes HERE
    //set up all routes HERE
    //set up all routes HERE
  //  app.get('/com', routes.com);

 //   app.get('/users', user.list);
 //   app.get('/data', routes.data);
 //   app.get('/data2', routes.data2);
 //   app.get('/data3', routes.data3);
    app.get('/', routes.cs4Home);
 //   app.get('/cs4Start', routes.cs4Start);
    app.get('/cs4Home', routes.cs4Home);
    app.get('/cs4Timing', routes.cs4Timing);
    app.get('/cs4Info', routes.cs4Info);
    app.get('/cs4VerticalScroll', routes.cs4VerticalScroll);
 //   app.get('/cs4Help', routes.cs4Help);
    app.get('/cs4Settings', routes.cs4Settings);
    app.get('/cs4Edit', routes.cs4Edit);

    //set timezone of pi
   // time.tzset('US/Pacific');
    time.tzset('US/Eastern');
    //set up email
    smtpTransport = nodemailer.createTransport("SMTP",{
        service: "Gmail",
        auth: {
            user: "stevewitz@gmail.com",
            pass: "panema2020"
        }
    });

};



/*Data in may have a Type.  That Type is a command and handled here:
    TME                     Sets the CS4 I/O clock
    TME TZ                  Changes system time zone
    LOG                     Sends log file out to client
    SEND                    Sends dommangs to CS$ I/O
    COPYTOUSB               Copies all mongodb files to usb stick
    COPYFROMUSB             Copies all mongodb files from usb stick
    COPYTOINTERNAL          Copies all mongodb files to internal location
    COPYFROMINTERNAL        Copies all mongodb files from internal location
    EDIT                    Sends all Cue collection data to client
    CUECREATE               MAkse a copy of all files to internal, deletes the cue file and recreates it form cue editor data.

dataSocket.Type
dataSocket.Data

 */
exports.websocketDataIn = function(dataSocket, Socket){
    dataSocket = JSON.parse(dataSocket);
    if(dataSocket.Type){


        if(dataSocket.Type.substr(0,3) == "TME") // if this is a time command
        {
            var datain;
            if(dataSocket.Type == "TME TZ")//if timezone command
            {
                datain = dataSocket.Data;
                time.tzset(datain); // tz string from client: CMD TZ US/Pacific
              //  collectionStartup.update({'TimeZoneChanged':'Yes'}, {$set:{'TimeZoneSet' : datain}},{upsert:true, w:1},function(err,res){
                    collectionStartup.update({'TimeZoneSet':{$exists:true}}, {$set:{'TimeZoneSet' : datain}},{upsert:true, w:1},function(err,res){

                    console.log('Time Zone Updated '+res + " "+ datain);


                });
            }
            else
            {
                //set the clock on the CS4 I/O board every time the "info" screen is opened
                datain = dataSocket.Data;
                datain = SetCS4Time(datain);
                comlib.write(datain);
            }

        }
        else if(dataSocket.Type.substr(0,3) == "LOG")//requesting entire log file to be sent log file
        {
            var dataToSend = "";

            if(dataSocket.Type == "LOG 1000")
            {
                    comlib.websocketsend("* Preparing Data For Display. \n* Please Wait. \n* (may take several seconds) ", Socket) ;
                    collectionLog.find({},{}).sort({"Time": -1}).limit(1000).toArray(function(error,logfile){
                        for(var i = 0; i <logfile.length;i++)
                        {
                            logfileData = JSON.stringify(logfile[i]);

                            if(logfile[i].Dout)
                            {
                                //comlib.websocketsend(".    Sent: " + logfileData, Socket) ;
                                dataToSend = dataToSend + ".    Sent: " + logfileData + "\n" ;
                            }
                            else
                            {
                                //comlib.websocketsend(parseCue(logfileData),Socket);
                                dataToSend = dataToSend + parseCue(logfileData) + "\n" ;
                            }
                        }
                        comlib.websocketsend(dataToSend, Socket) ;

                    });
            }
            else
            {
                comlib.websocketsend("* Preparing Data For Display. \n* Please Wait. \n* (may take up to 1 minute) ", Socket) ;
                collectionLog.find({},{}).sort({"Time": 1}).toArray(function(error,logfile){
                    for(var i = 0; i <logfile.length;i++)
                    {
                        logfileData = JSON.stringify(logfile[i]);

                        if(logfile[i].Dout)
                        {
                            dataToSend = ".    Sent: " + logfileData + "\n" + dataToSend;
                        }
                        else
                        {
                            dataToSend = parseCue(logfileData) + "\n" + dataToSend;
                        }
                    }
                    comlib.websocketsend(dataToSend, Socket) ;
                });

            }
        }
        else if (dataSocket.Type == "SEND") // these are commands to send directly to the CS4I/0
        {
            comlib.write("         " +dataSocket.Data+ '\r'); // send it out the serial port
            ledInfoOn(27); // light to output light
            setTimeout(function(){ledInfoOff(27);}, 100); // turn it off
            setTimeout(function(){timedOut = true;}, timedOutInterval);
        }
        else if(dataSocket.Type == "COPYTOUSB")
        {
            copyToUSB();
        }
        else if(dataSocket.Type == "COPYFROMUSB")
        {
            copyFromUSB();
        }
        else if(dataSocket.Type.substr(0,14) == "COPYTOINTERNAL")
        {
            copyToInternal(dataSocket.Type.substr(15,1));
        }
        else if(dataSocket.Type.substr(0,16) == "COPYFROMINTERNAL")
        {
            copyFromInternal(dataSocket.Type.substr(17,1));
        }
        else if(dataSocket.Type == "EDIT"){
            collectionCue.find({},{}).sort({"Time": 1}).toArray(function(error,cuefile){
                var packet = {};
                packet.packetType="cuefiledata";
                packet.data = cuefile;

                //JSON.parse(x);
                //packettype = x.packettype;
                //data = x.data;
                comlib.websocketsend(JSON.stringify(packet), Socket);

            });
        }
        else if (dataSocket.Type == "CUECREATE"){
            // copies database to destinationPath for a backup, then remove all records in cue file then insert records from client.
            if(os.type() == 'Windows_NT')
            {
                //  usbstickPath = "G:/"; // this is based on particular usbsticl
                //   path = usbstickPath ;
                //  sourcePath = "d://data/db"; // this is based on system install of mongo
                destinationPath = "d:/mongoBackup/dump"; //this is particular to the system mongo is running on
                mongoDirectory = 'd:/mongo/bin/'; //this is based on system install of mongo

                spawn('d:/mongo/bin/mongodump', ['-o', destinationPath]).on('exit',function(code){
                    comlib.websocketsend("Successfully copied all data to default storage");
                    console.log("Successfully copied all data to default storage: "+ destinationPath + " " + code);
                    makeCueFile(dataSocket);
                });
            }
            //this is for the pi
            else
            {
                //  usbstickPath = "/media";
                //  path = usbstickPath ;
                //  sourcePath = "/data/db";
                destinationPath = "/home/pi/mongoBackup/dump"; // this was arbitrarily chosen but now fixed
                mongoDirectory = '/opt/mongo/bin/';

                spawn(mongoDirectory + 'mongodump', ['-o', destinationPath]).on('exit',function(code){
                    comlib.websocketsend("Successfully copied all data to default storage");
                    console.log("Successfully copied all data to default storage: "+ destinationPath + " " + code);
                    makeCueFile(dataSocket);
                });
            }

        }
        else if(dataSocket.Type == "DELETECUE"){
            // copies database to destinationPath for a backup, then deletes all records in cue file.
            if(os.type() == 'Windows_NT')
            {
                //  usbstickPath = "G:/"; // this is based on particular usbsticl
                //   path = usbstickPath ;
                //  sourcePath = "d://data/db"; // this is based on system install of mongo
                destinationPath = "d:/mongoBackup/dump"; //this is particular to the system mongo is running on
                mongoDirectory = 'd:/mongo/bin/'; //this is based on system install of mongo
            }
            //this is for the pi
            else
            {
                //  usbstickPath = "/media";
                //  path = usbstickPath ;
                //  sourcePath = "/data/db";
                destinationPath = "/home/pi/mongoBackup/dump"; // this was arbitrarily chosen but now fixed
                mongoDirectory = '/opt/mongo/bin/';
            }
            spawn(mongoDirectory + 'mongodump', ['-o', destinationPath]).on('exit',function(code){
                comlib.websocketsend("Successfully copied all data to default storage and deleted the cue file");
                console.log("Successfully copied all data to default storage: "+ destinationPath + " " + code);
                collectionCue.remove({},function(err,numberRemoved){
                    console.log("inside remove call back" + numberRemoved);
                });

            });



        }



    }
    else //This is the real live system timing data
    {
        serialDataSocket = JSON.parse(dataSocket.Data);
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
       // var dir = "";
        var port = serialDataSocket.OutData.Port;
        var showname = serialDataSocket.OutData.Showname;
        var dataToSend = serialDataSocket.OutData.Dout;
        if(dir =="")
        {
           var  outstring = port + " " + showname + " " + dataToSend;
        }
        else
        {
           var outstring = port + " " + showname + " " + dir + " " + dataToSend;
        }

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

    //added search fields: must match InData and Source
    if (serialData.InData != null) {
        collectionCue.find({$and: [{'InData': serialData.InData} , {'Source': serialData.Source }]}).toArray(function (err, item) {
        //collectionCue.find({'InData': serialData.InData }).toArray(function (err, item) {
            if (item.length == 0) {
                console.log("not Found");
            }
            else {

               for(var i = 0; i< item[0].OutData.length; i++)
               {
                    dir = item[0].OutData[i].Dir;    // ****** needs to ba added to R4-4 Receiver Parsing ****** //
                   // dir = "xxxx";
                    port = item[0].OutData[i].Port.toUpperCase();
                    showname = item[0].OutData[i].Showname;
                    dataToSend = item[0].OutData[i].Dout;
                    delay = item[0].OutData[i].Delay;
                    if(dir =="")
                    {
                        outstring = port + " " + showname + " " + dataToSend;
                    }
                    else
                    {
                        outstring = port + " " + showname + " " + dir + " " + dataToSend;
                    }

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

    if(serialData.Source != 'zigbee2:'){ //only update if real cue NOT zigbee2
        lastCueReceivedInternalTime = new Date();
        lastCueReceivedExternalTime = new Date(lastCueReceived);
    }
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
    ledInfoOn(17);
    setTimeout(function(){ledInfoOff(17);}, 100);
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
            var type;

            for (var i = 18; i < indata.length - 3; i += 3) // extra space added to data at end of string
            {
                if (indata.substr(i,2) == 0x00)
                {
                    hex += '*';
                }
                else
                {
                    hex += String.fromCharCode(parseInt(indata.substr(i, 2), 16));
                }

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

function makeCueFile(dataSocket){
    collectionCue.remove({},function(err,numberRemoved){
        console.log("inside remove call back" + numberRemoved);
        for(i = 0; i< dataSocket.Data.length; i++){
            serialDataSocketEdit = {};
            if(dataSocket.Data[i].OutData){ // this is an incoming cue, so put data in proper form
                lastCueReceivedEdit = {};
                lastCueTime = dataSocket.Data[i].Time;
                lastCueReceivedEdit.InData = dataSocket.Data[i].InData;
                lastCueReceivedEdit.Source = dataSocket.Data[i].Source;
                lastCueReceivedEdit.Time = dataSocket.Data[i].Time;
            }
            else{ //This is cue data.  Adjust delay and put data in proper form

                serialDataSocketEdit.OutData = dataSocket.Data[i].Data;
                serialDataSocketEdit.OutData.Delay = new Date(dataSocket.Data[i].Time) - new Date(lastCueTime);

                collectionCue.update({'InData':lastCueReceivedEdit.InData}, {$set: lastCueReceivedEdit},{upsert:true, w:1},function(err,res){

                    console.log('InData to collection Cue -- error: ' + err);
                });

                collectionCue.update({'InData': lastCueReceivedEdit.InData}, {$push:serialDataSocketEdit},function(err,res){

                    console.log('added Dout to collection Cue -- error: ' + err);
                });
            }
        }
        message = {};
        message.packetType = "message";
        message.data = "Successfully Updated Cue File";
        comlib.websocketsend(JSON.stringify(message));
        console.log("Successfully Updated Cue File")
    });
}

/**
 * @return {string}
 */
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

function copyToUSB()
{
    // copies database to destinationPath.  Then copies to usbstick
    // USBStick MUST be formatted to fat32

    if(os.type() == 'Windows_NT')
    {

         usbstickPath = "G:/"; // this is based on particular usbsticl
         path = usbstickPath ;
         sourcePath = "d://data/db"; // this is based on system install of mongo
         destinationPath = "d:/bac/dump"; //this is particular to the system mongo is running on
         mongoDirectory = 'd:/mongo/bin/'; //this is based on system install of mongo
        try
        {
            fs.statSync(usbstickPath);
            spawn('d:/mongo/bin/mongodump', ['-o', destinationPath]).on('exit',function(code){
            console.log('finished ' + code);
                //remove files if they exist or copy will error with 'file exists'
                fse.rmrf(usbstickPath +'dump', function (err) {
                    if (err) {
                        console.error('Error removing files ' + err);
                    }
                    fse.copyRecursive(destinationPath , usbstickPath +'dump', function (err) {
                        if (err) {
                            console.log('error '+ err);
                        }

                        comlib.websocketsend("Successfully Copied All Data to USB Stick");
                        console.log("Successfully Copied " + destinationPath + " to " + usbstickPath);
                    });
                });

            });
        }
        catch (er)
        {
            comlib.websocketsend("USB stick is not detected.  Please insert USB stick and try again ");
            console.log("USB stick is not detected.  Please insert USB stick and try again ");
        }
    }
    //this is for the pi
    else
    {
        usbstickPath = "/media";
         path = usbstickPath ;
         sourcePath = "/data/db";
         destinationPath = "/home/pi/dump"; // this wass abritrauraly chosen but now fixed
         mongoDirectory = '/opt/mongo/bin/';

        //have to find out the 'name' of the usb stick - it will be the only device in media
        fs.readdir(usbstickPath, function(err,list){
            if( list.length!= 0)
            {
                list.forEach(function (file) {
                    // Full path of that file
                    var path = usbstickPath + "/" + file;
                    console.log("path: " + path)
                    spawn(mongoDirectory + 'mongodump', ['-o', destinationPath]).on('exit',function(code){
                        console.log('finished ' + code);
                        fse.copyRecursive(destinationPath , path + '/dump', function (err) {
                            if (err) {
                                console.log('error '+ err);
                            }
                            comlib.websocketsend("Successfully Copied All Data to USB Stick");
                            console.log("Successfully Copied " + destinationPath + " to " + usbstickPath);
                        });
                    });
                });
            }
            else
            {
                comlib.websocketsend("USB stick is not detected.  Please insert USB stick and try again ");
                console.log("USB stick is not detected.  Please insert USB stick and try again ");
            }
        });
    }
}

function copyFromUSB()
{
    // copies database from usbstick to destination path, then restores to mongoDb
    // USBStick MUST be formatted to fat32

    if(os.type() == 'Windows_NT')
    {

        usbstickPath = "G:/"; // this is based on particular usb stick
        path = usbstickPath ;
        sourcePath = "d://data/db"; // this is based on system install of mongo
        destinationPath = "d:/bac/dump"; //this is particular to the system mongo is running on
        mongoDirectory = 'd:/mongo/bin/'; //this is based on system install of mongo
        try
        {
            fs.statSync(usbstickPath);
                //remove files from existing directory
            fse.rmrf(destinationPath, function (err) {
                if (err) {
                    console.error(err);
                }
                fse.copyRecursive(usbstickPath +'dump', destinationPath , function (err) {
                    if (err) {
                        console.log('error '+ err);
                    }
                    spawn(mongoDirectory + 'mongorestore', ['--db',collectionName , destinationPath + "/" + collectionName , '--drop', '-vvv']).on('exit',function(code){
                        console.log('finished ' + code);
                    });

                    comlib.websocketsend("Successfully Copied All Data from USB Stick");
                    console.log("Successfully Copied " + usbstickPath + " to " + destinationPath);
                });
            });
        }
        catch (er)
        {
            comlib.websocketsend("USB stick is not detected.  Please insert USB stick and try again ");
            console.log("USB stick is not detected.  Please insert USB stick and try again ");
        }
    }
    //this is for the pi
    else
    {
        usbstickPath = "/media";
        path = usbstickPath ;
        sourcePath = "/data/db";
        destinationPath = "/home/pi/dump"; // this wass abritrauraly chosen but now fixed
        mongoDirectory = '/opt/mongo/bin/';

        //have to find out the 'name' of the usb stick - it will be the only device in media
        fs.readdir(usbstickPath, function(err,list){
            if( list.length!= 0)
            {
                list.forEach(function (file) {
                    // Full path of that file
                    var path = usbstickPath + "/" + file;
                    console.log("path: " + path)

                    fse.rmrf(destinationPath, function (err) {
                        if (err) {
                            console.error(err);
                        }
                        console.log('we are here dir removed');
                        fse.copyRecursive(path +'/dump', destinationPath , function (err) {
                            if (err) {
                                console.log('error '+ err);
                            }
                            console.log('copied from usb');
                            spawn(mongoDirectory + 'mongorestore', ['--db',collectionName , destinationPath + "/" + collectionName , '--drop', '-vvv']).on('exit',function(code){
                                console.log('finished ' + code);
                            });

                            comlib.websocketsend("Successfully Copied All Data from USB Stick");
                            console.log("Successfully Copied " + usbstickPath + " to " + destinationPath);
                        });
                    });
                });
            }
            else
            {
                comlib.websocketsend("USB stick is not detected.  Please insert USB stick and try again ");
                console.log("USB stick is not detected.  Please insert USB stick and try again ");
            }
        });
    }
}

function copyToInternal(location)
{
    // copies database to destinationPath.
    if(os.type() == 'Windows_NT')
    {
      //  usbstickPath = "G:/"; // this is based on particular usbsticl
     //   path = usbstickPath ;
      //  sourcePath = "d://data/db"; // this is based on system install of mongo
        destinationPath = "d:/mongoBackup/dump" + location; //this is particular to the system mongo is running on
        mongoDirectory = 'd:/mongo/bin/'; //this is based on system install of mongo
    }
    //this is for the pi
    else
    {
      //  usbstickPath = "/media";
      //  path = usbstickPath ;
      //  sourcePath = "/data/db";
        destinationPath = "/home/pi/mongoBackup/dump" + location; // this was arbitrarily chosen but now fixed
        mongoDirectory = '/opt/mongo/bin/';
    }
    spawn('d:/mongo/bin/mongodump', ['-o', destinationPath]).on('exit',function(code){
        comlib.websocketsend("Successfully copied all data to internal storage location " + location);
        console.log("Successfully copied all data to internal storage: "+ destinationPath + " " + code);
        return(1);
    });
}

function copyFromInternal(location)
{
    // restores database from from internal storage to Mongo data path

    if(os.type() == 'Windows_NT')
    {
        destinationPath = "d:/mongoBackup/dump"+ location; //this is particular to the system mongo is running on
        mongoDirectory = 'd:/mongo/bin/'; //this is based on system install of mongo
    }
    //this is for the pi
    else
    {
        destinationPath = "/home/pi/mongoBackup/dump" + location; // this was arbitrarily chosen but now fixed
        mongoDirectory = '/opt/mongo/bin/';
    }
    if (fs.existsSync(destinationPath)) { //make sure it exists
        spawn(mongoDirectory + 'mongorestore', ['--db',collectionName , destinationPath + "/" + collectionName , '--drop', '-vvv']).on('exit',function(code){
            console.log('finished ' + code);
            comlib.websocketsend("Successfully Copied All Data from Internal Storage Location " + location);
            console.log("Successfully Copied " + destinationPath + " to " + mongoDirectory);
        });

    }
    else{
        comlib.websocketsend("Internal Storage Location "+ location+ ' does not exist' );
        console.log(destinationPath + " does not exist");
    }
}

exports.getSettings = function(){
    collectionSettings.find({},{}).toArray(function(error,settings){
        if(settings.length < 1){ // there are no settings create them

            settings.ignoreSource = 'NO';
            settings.enableZigbee2 = 'YES';
            settings.emailAddress = 'steve@wizcomputing.com';
            collectionSettings.insert(settings, {w: 1}, function (err, result) {
                console.log(result);
            })
        }

        if(settings[0].enableZigbee2 == 'YES'){
            comlib.write("         SLAVE ZIGBEE2 YES \r"); // send it out the serial port
        }
        else if(settings[0].enableZigbee2 == 'NO'){
            comlib.write("         SLAVE ZIGBEE2 NO \r"); // send it out the serial port
        }

        if(settings[0].ignoreSource == 'NO'){
            ignoreSource = 0;
        }
        else if(settings[0].ignoreSource =='YES'){
            ignoreSource = 1;
        }

        exports.ledOn(settings[0].emailAddress);
    });
};

exports.ledOn = function(emailadd){

    if(os.type() != 'Windows_NT') // this is only for the pi
    {
        var led = require('fastgpio');
        led.prepareGPIO(4);
        led.set(4);
    }
    //send startup email
    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: "CS4 192.168.2.10 ✔ <stevewitz@gmail.com>", // sender address
        to: emailadd,
       // to: "steve@wizcomputing.com      ", // comma seperated list of receivers
        subject: "Message from CS4 ✔", // Subject line
        text: "This CS4 has just been started", // plaintext body
        html: "This CS4 has just been started" // html body
    }

// send mail with defined transport object
    smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
        }
        else{
            console.log("Message sent: " + response.message);
        }
    });
};

exports.ledOff = function(){

    if(os.type() != 'Windows_NT') // this is only for the pi
    {
        var led = require('fastgpio');
        led.prepareGPIO(4);
        led.unset(4);
    }
};

function ledInfoOn(GPIOnum){
    if(os.type() != 'Windows_NT') // this is only for the pi
    {
        var led = require('fastgpio');
        led.prepareGPIO(GPIOnum);
        led.set(GPIOnum);
    }
}

function ledInfoOff(GPIOnum){
    if(os.type() != 'Windows_NT') // this is only for the pi
    {
        var led = require('fastgpio');
        led.prepareGPIO(GPIOnum);
        led.unset(GPIOnum);
    }
}