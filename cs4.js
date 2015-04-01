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
var timedOutInterval = 250; //time to wait between serial transmitts
var timedOut = true; // set to false will delay transmission;
var comlib = require('./comlib');
var spawn = require('child_process').spawn;
var nodemailer = require("nodemailer");
var pmp = require('pmp');
var sudo = require('sudo');
var momentTZ = require('moment-timezone');

var lastCueReceived = {"Time" : "10/09/13 15:20:04.20", "Source" : "Midi1", "InData" : "F0 7F 05 02 01 01 31 2E 30 30 F7 "};
var serialDataSocket;
var lastCueReceivedInternalTime= new Date();
//var lastCueReceivedTimeOffset = 0;
//var lastCueReceivedExternalTime = new Date();
var usbstickPath;
var path;
var sourcePath;
var destinationPath;
var mongoDirectory;
var collectionName = 'WizDb';
var smtpTransport;
var dataPacket = {};
global.cs4Settings = {};
var zigbee2State;
var blink;
var autoTest;
var autoTest1;
var usbInputEnabled = 0;
var tempcntincoming = 0;
var tempcntoutgoing = 0;
var extrnalIP ="";
var fmt = "ddd, MMM DD YYYY, HH:mm:ss.SS"; // format string for momentTZ time strings
var timerStartTime;
var waitTime;
var TimeToTest = 1000*60*5;//5 minutes  //1000*60*60*24;

//routine to ensure that serial data is not sent more than
// every timedOutInterval
//
// adds time stamp to Outgoing data and puts it in Log collection

sendOutput = function (dataToSend)
{
    var addTime = "{\"Time\":";
    console.log("We are at sendOutput");
    if (timedOut)
    {
        timerStartTime = new Date();
        timedOut = false;
        comlib.write("         " + dataToSend + "\r"); // add spaces at beginning for R4 zigbee stuff and terminate\n\r
        ledInfoOn(27);
        setTimeout(function(){ledInfoOff(27);}, 100);
        setTimeout(function(){timedOut = true;}, timedOutInterval);

        console.log("Sending to CS4: " +dataToSend);
        //send it out the socket
        comlib.websocketsend(".  Sent: " + momentTZ(timerStartTime).format(fmt) + "   Dout: "  +  dataToSend) ;

        addTime = addTime + "\""+  (timerStartTime).toISOString() +"\", \"Dout\" : \"" + dataToSend + "\"}";
        //Log the data into the collection
        addTime = JSON.parse(addTime);
        addTime.Time = new Date(addTime.Time); //get to real time format.
        collectionLog.insert(addTime, {w: 1}, function (err, result) {
           // console.log(result);
        });
    }
    else
    {
        var tme = new Date();
        // var test2 = tme.getMilliseconds();
        // var test3 = timerStartTime.getMilliseconds();
        /// var test = timedOutInterval -(tme.getMilliseconds() - timerStartTime.getMilliseconds())+2;
        //since we are not ready for this to go out (or we wouldn't be here) -- reset a timer with actual time left.
        waitTime=timedOutInterval +2-(tme - timerStartTime);
        if(waitTime <= 0){
            waitTime = 2;
            timedOut = true;
        }
        setTimeout(function(){sendOutput(dataToSend);}, waitTime); // pad with 2 extra ms
        console.log("At sendoutput -- ELSE - timer start time: " + timerStartTime.getMilliseconds()+ " tme:  " + tme.getMilliseconds());
        //  var delay =  setTimeout(function(){sendOutput(dataToSend);}, ( timedOutInterval -(timerStartTime - Date())));
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
    app.get('/cs4Home/:Test', routes.cs4Home);
    app.get('/cs4Timing', routes.cs4Timing);
    app.get('/cs4Timing/:Test', routes.cs4Timing);
    app.get('/cs4Info', routes.cs4Info);
    app.get('/cs4Info/:Test', routes.cs4Info);
    app.get('/cs4VerticalScroll', routes.cs4VerticalScroll);
    app.get('/cs4VerticalScroll/:Test', routes.cs4VerticalScroll);
 //   app.get('/cs4Help', routes.cs4Help);
    app.get('/cs4Settings', routes.cs4Settings);
    app.get('/cs4Edit', routes.cs4Edit);
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
    CUECREATE               Makes a copy of all files to internal, deletes the cue file and recreates it form cue editor data.
    SETTINGS                Saves any changes to the settings collection
    SYSTEMTEST              Sends a cue and makes sure a received zigbee return channel is logged
    DELETECUE               Copies all mongodb files to the default directory and then deletes the cue collection
    DELETEONECUE            Copies all mongodb files to the default directory and then deletes one cue DESC from the collection

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
                setTimeout(function(){sendOutput('TIMEGET');}, 500);
               // setTimeout(function(){setAutoTest();}, 5000); //setup for auto test with new time being set
            }

        }
        else if(dataSocket.Type.substr(0,3) == "LOG")//requesting entire log file to be sent log file
        {
            var dataToSend = "";

            if(dataSocket.Type == "LOG 1000")
            {
                    comlib.websocketsend("* Preparing Data For Display. \n* Please Wait. \n* (may take several seconds) ", Socket) ;
                        collectionLog.find({},{_id:0}).sort({"Time": -1}).limit(1000).toArray(function(error,logfile){
                      //collectionLog.find({},{_id:0}).sort({ $natural: -1 }).limit(1000).toArray(function(error,logfile){
                        for(var i = 0; i <logfile.length;i++)
                        {
                            logfileData = JSON.stringify(logfile[i]);

                            if(logfile[i].Dout)
                            {
                                //comlib.websocketsend(".    Sent: " + logfileData, Socket) ;
                                dataToSend = dataToSend + ".    Sent: " +formatLogData(logfileData) + "\n" ;
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
                collectionLog.find({},{_id:0}).sort({"Time": 1}).toArray(function(error,logfile){
               // collectionLog.find({},{_id:0}).sort({ $natural: 1 }).toArray(function(error,logfile){
                    for(var i = 0; i <logfile.length;i++)
                    {
                        logfileData = JSON.stringify(logfile[i]);

                        if(logfile[i].Dout)
                        {
                            dataToSend = dataToSend + ".    Sent: " +formatLogData(logfileData) + "\n" ;
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
           stopIO(1); //stop accesses to mongp
            copyFromUSB();
            stopIO(0); //restart all io
        }
        else if(dataSocket.Type.substr(0,14) == "COPYTOINTERNAL")
        {
            copyToInternal(dataSocket.Type.substr(15,1));
        }
        else if(dataSocket.Type.substr(0,16) == "COPYFROMINTERNAL")
        {
            stopIO(1); //stop accesses to mongp
            copyFromInternal(dataSocket.Type.substr(17,1));
            stopIO(0); //restart all io
        }
        else if(dataSocket.Type == "COPYTOPUBLIC")
        {
            copyToPublic();
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
                    makeCueFile(dataSocket, dataSocket.File);
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
                    makeCueFile(dataSocket, dataSocket.File);
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
        else if(dataSocket.Type == "DELETEONECUE"){
            // copies database to destinationPath for a backup, then deletes one Cue Desc in cue file.
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
                comlib.websocketsend("Successfully backed up all data to default storage and removed " + dataSocket.data + " from the cue file");
                console.log("Successfully backed up all data to default storage: "+ destinationPath + " " + code);
                collectionCue.update({}, {$pull: {OutData: {Desc: dataSocket.data}}}, {multi: true}, function(err, item){
                    console.log("inside cues with desc" + item);
                });

            });
        }

        else if(dataSocket.Type == "SETTINGS") {
            cs4Settings = dataSocket.Data; // get the data
            exports.saveSettings(); // save it
            dataToSend = '          SLAVE DMX_CH ' + cs4Settings.dmx1 +  " " + cs4Settings.dmx2 + " " + cs4Settings.dmx3 + ''; //update the DMX channels
            sendOutput(dataToSend) ;
            comlib.websocketsend("Successfully updated settings file");
            dataToSend = '          SLAVE ZIGEN ' + cs4Settings.enableZigbee2 ; //update the DMX channels
            sendOutput(dataToSend) ;
           // clearInterval(autoTest); // if any previous timers are set, delete them
           // clearInterval(autoTest1); // if any previous timers are set, delete them
           // sendOutput('TIMEGET');
            autoTest1 = setTimeout(function(){sendOutput('TIMEGET');}, 2000);
            //  setTimeout(function(){setAutoTest();}, 3000); //setup for auto test
        }

        else if(dataSocket.Type == "SYSTEMTEST") {
          startSystemTest();
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


exports.usbSerialDataIn = function (data) {
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
    var serialDataTimeOrig; // needed for setting system clock of Pi

    // put the time string into proper form
    if(!usbInputEnabled){ // if we are not ready for data - just get out!!!
        return;
    }
    serialData = JSON.parse(data);
    if(serialData.Time) {
        serialDataTimeOrig = serialData.Time;
        serialData.Time = new Date(serialData.Time);//convert to date function
    }


    // make sure this is incoming cue data
    // if it is, then search for matching cue
    //
    // If matching cue found then iterate through
    // OutData and send the stuff out
    // and send output data to log file

    //added search fields: must match InData and Source
    if ((serialData.InData != null) && (serialData.Source != 'zigbee2:')) {// DON't use zigbee2 as source for timing

        if (cs4Settings.ignoreSource == 'NO') { // match source
            collectionCue.find({$and: [{'InData': serialData.InData} ,{'Source': serialData.Source }]}).toArray(function (err, item) {
                //collectionCue.find({'InData': serialData.InData }).toArray(function (err, item) {
                if (item.length == 0) {
                    console.log("not Found");
                }
                else {

                    //added to stop any pending cues from firing if new cue comes in
                    if (global.timeoutlist != undefined){
                        for (var i=0;i<global.timeoutlist.length;++i){

                            clearTimeout(global.timeoutlist[i])
                        }
                    }

                    global.timeoutlist=[];
                    lastCueReceivedInternalTime = new Date().getTime();
                   // lastCueReceivedTimeOffset=serialData.Time.getTime()-lastCueReceivedInternalTime;

                    for (var i = 0; i < item[0].OutData.length; i++) {
                        dir = item[0].OutData[i].Dir;    // ****** needs to be added to R4-4 Receiver Parsing ****** //
                        // dir = "xxxx";
                        port = item[0].OutData[i].Port.toUpperCase();
                        showname = item[0].OutData[i].Showname;
                        dataToSend = item[0].OutData[i].Dout;
                        delay = item[0].OutData[i].Delay;
                        if (dir == "") {
                            outstring = port + " " + showname + " " + dataToSend;
                        }
                        else {
                            outstring = port + " " + showname + " " + dir + " " + dataToSend;
                        }

                        global.timeoutlist[i]=   setTimeout(sendOutput, delay, outstring);
                       // console.log(item[0].OutData[i].Dout + "  Delay " + item[0].OutData[i].Delay);
                    }
                }
            });
        }
        else{
            collectionCue.find({'InData': serialData.InData }).toArray(function (err, item) { // ignore source
                if (item.length == 0) {
                    console.log("not Found");
                }
                else {

                    //added to stop any pending cues frim firing if new cue comes in
                    if (global.timeoutlist != undefined){
                        for (var i=0;i<global.timeoutlist.length;++i){

                            clearTimeout(global.timeoutlist[i])
                        }
                    }

                    global.timeoutlist=[];
                    lastCueReceivedInternalTime = new Date().getTime();
                    testvariaable = serialData.Time.getTime();
                 //   lastCueReceivedTimeOffset=serialData.Time.getTime()-lastCueReceivedInternalTime;

                    for (var i = 0; i < item[0].OutData.length; i++) {
                        dir = item[0].OutData[i].Dir;    // ****** needs to ba added to R4-4 Receiver Parsing ****** //
                        // dir = "xxxx";
                        port = item[0].OutData[i].Port.toUpperCase();
                        showname = item[0].OutData[i].Showname;
                        dataToSend = item[0].OutData[i].Dout;
                        delay = item[0].OutData[i].Delay;
                        if (dir == "") {
                            outstring = port + " " + showname + " " + dataToSend;
                        }
                        else {
                            outstring = port + " " + showname + " " + dir + " " + dataToSend;
                        }

                        global.timeoutlist[i]= setTimeout(sendOutput, delay, outstring);
                        console.log(item[0].OutData[i].Dout + "  Delay " + item[0].OutData[i].Delay);
                    }
                }
            });
        }
    }

    if(data.length >= 35) // this is to let GETTIME come through and get logged GETTIME returns a string 34 characters
    {

        if(serialData.Source != 'zigbee2:') { //only update if real cue NOT zigbee2
            lastCueReceived = (JSON.parse(JSON.stringify(serialData))); // store the data here in case of Cue file generation
        }
        //get the internal system time or this event so we and keep track of it

     /*   if(serialData.Source != 'zigbee2:'){ //only update if real cue NOT zigbee2
            lastCueReceivedInternalTime = new Date().getTime();
           // lastCueReceivedExternalTime = new Date(lastCueReceived.Time);
        }
        */
        //Log the data into the collection

        collectionLog.insert(serialData, {w: 1}, function (err, result) {
          //  console.log(result);
        });

        //parse the incoming cue data
        if(serialData.Source == 'zigbee2:'){
            delete serialData.Time;
            delete serialData._id;
            comlib.websocketsend("    ZIGBEE2 RECEIVED OK: " + serialData.InData);
        }
        else{
            comlib.websocketsend(parseCue(data));
        }

      // comlib.websocketsend(parseCue(serialData));
    }
    else{
        if(serialData.Time){
            //we have startup time from the CS4 I/O board
            collectionStartup.insert(serialData, {w: 1}, function (err, result) {
                // If PI set the system clock to CS4 I/O board time
                if(os.type() != 'Windows_NT'){  //This is for pi only
                    console.log("Time " + serialDataTimeOrig.toString());
                    child = sudo([ 'date', '-s', serialDataTimeOrig ]);
                    child.stdout.on('data', function (data) {
                        console.log(data.toString());
                        console.log("SUDO DATE CHANGED");
                    });
                }
                comlib.websocketsend("CS4 Current tme is: " + momentTZ(serialData.Time).format(fmt));
                console.log(result);
            });

        }
        else if(serialData.Tme1){
            setAutoTest();
            if(os.type() != 'Windows_NT'){  //This is for pi only
                console.log("Tme! " + serialData.Tme1.toString());
                child = sudo([ 'date', '-s', serialData.Tme1 ]);
                child.stdout.on('data', function (data) {
                  //  console.log(data.toString());
                    comlib.websocketsend("SUDO DATE CHANGED");
                });
            }
            serialData.Tme1 = new Date(serialData.Tme1);//convert to real time data
          //  comlib.websocketsend("CS4 Current time is: " + momentTZ(serialData.Tme1).format(fmt));
            comlib.websocketsend("CS4 System time is: " + momentTZ(new Date()).format(fmt));
           // setTimeout(function(){setAutoTest();}, 5000);//this will restart the system test each time it's run
        }

    }
};

function formatLogData(data){

    var timeFormatted;
    var Dout;
    serialData = JSON.parse(data);

    serialData.Time = new Date(serialData.Time);
    timeFormatted = momentTZ(serialData.Time).format(fmt);
    indata = serialData.InData;
    Dout = serialData.Dout;

    return (timeFormatted + "   Dout: "  +  Dout);
}

function parseCue(data)
{
    var timeFormatted;
    ledInfoOn(17);
    setTimeout(function(){ledInfoOff(17);}, 100);
    serialData = JSON.parse(data);
    serialData.Time = new Date(serialData.Time);
    timeFormatted = momentTZ(serialData.Time).format(fmt);
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

        return (timeFormatted + "  " + source + "  " + type + ": " + indata);



    }
    else // just send data
    {
        return (timeFormatted + "  " + source + " " + indata);
    }

}

function makeCueFile(dataSocket, fileName){
    tempcntincoming=0;
    tempcntoutgoing = 0;
    if(fileName !=""){  //this is a one Desc file edit!  just remove one Desc
        collectionCue.update({}, {$pull: {OutData: {Desc: fileName}}}, {multi: true}, function(err, item){
            console.log("inside remove call back" + item);
            for(i = 0; i< dataSocket.Data.length; i++){
                serialDataSocketEdit = {};
                if(dataSocket.Data[i].OutData){ // this is an incoming cue, so put data in proper form
                    lastCueReceivedEdit = {};
                    lastCueTime = dataSocket.Data[i].Time;
                    lastCueReceivedEdit.InData = dataSocket.Data[i].InData;
                    lastCueReceivedEdit.Source = dataSocket.Data[i].Source;
                    lastCueReceivedEdit.Time = dataSocket.Data[i].Time;
                    tempcntincoming ++;
                }
                else{ //This is cue data.  Adjust delay and put data in proper form
                    tempcntoutgoing ++;
                    serialDataSocketEdit.OutData = dataSocket.Data[i].Data;
                    serialDataSocketEdit.OutData.Delay = new Date(dataSocket.Data[i].Time) - new Date(lastCueTime);

                    collectionCue.update({'InData':lastCueReceivedEdit.InData}, {$set: lastCueReceivedEdit},{upsert:true, w:1},function(err,res){

                        if(err){
                            console.log('InData to collection Cue -- error: ' + err);
                        }

                    });

                    collectionCue.update({'InData': lastCueReceivedEdit.InData}, {$push:serialDataSocketEdit},function(err,res){
                        if(err){
                            console.log('added Dout to collection Cue -- error: ' + err);
                        }

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
    else{
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
                    tempcntincoming ++;
                }
                else{ //This is cue data.  Adjust delay and put data in proper form
                    tempcntoutgoing ++;
                    serialDataSocketEdit.OutData = dataSocket.Data[i].Data;
                    serialDataSocketEdit.OutData.Delay = new Date(dataSocket.Data[i].Time) - new Date(lastCueTime);

                    collectionCue.update({'InData':lastCueReceivedEdit.InData}, {$set: lastCueReceivedEdit},{upsert:true, w:1},function(err,res){

                       if(err){
                           console.log('InData to collection Cue -- error: ' + err);
                       }

                    });

                    collectionCue.update({'InData': lastCueReceivedEdit.InData}, {$push:serialDataSocketEdit},function(err,res){
                        if(err){
                            console.log('added Dout to collection Cue -- error: ' + err);
                        }

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
    curTime = momentTZ.tz(curTime,cs4Settings.timezone); //convert to timezone
    curTime = curTime.format(fmt); //finish converting to timezone
    curTime = new Date(curTime); //restore to date format

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
        usbstickPath = "/media/usb0";
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
                    var path = usbstickPath ; //       +  "/" + file;
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
        usbstickPath = "/media/usb0";
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
                    var path = usbstickPath ; //       + "/" + file;
                    console.log("path: " + path)

                    fse.rmrf(destinationPath, function (err) {
                        if (err) {
                            console.error(err);
                        }
                        console.log('we are here dir removed');


                        if(fs.existsSync(path + '/dump')){
                            fse.copyRecursive(path + '/dump', destinationPath, function (err) {
                                if (err) {
                                    console.log('error -- NO PATH??? ' + err);
                                }
                                console.log('copied from usb');
                                spawn(mongoDirectory + 'mongorestore', ['--db', collectionName, destinationPath + "/" + collectionName, '--drop', '-vvv']).on('exit', function (code) {
                                    console.log('finished ' + code);
                                });

                                comlib.websocketsend("Successfully Copied All Data from USB Stick");
                                console.log("Successfully Copied " + usbstickPath + " to " + destinationPath);
                            });
                        }



                       else{
                            comlib.websocketsend("Data not on this USB Stick");
                            console.log("Data not on this USB Stick " + usbstickPath + " to " + destinationPath);

                        }
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
    spawn(mongoDirectory + 'mongodump', ['-o', destinationPath]).on('exit',function(code){
 // spawn('d:/mongo/bin/mongodump', ['-o', destinationPath]).on('exit',function(code){
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

function copyToPublic(){
    comlib.websocketsend("Preparing Data To Download");
    // copies database to destinationPath.
    if(os.type() == 'Windows_NT')
    {
        destinationPath = "d:/Dev/Git Projects/Serialmango/public/images"; //this is particular to the system mongo is running on
        mongoDirectory = 'd:/mongo/bin/'; //this is based on system install of mongo
    }
    //this is for the pi
    else
    {
        destinationPath = "/home/pi/Serialmango/public/images"; // this was arbitrarily chosen but now fixed
        mongoDirectory = '/opt/mongo/bin/';
    }
    spawn(mongoDirectory + 'mongodump', ['-o', destinationPath]).on('exit',function(code){
        comlib.websocketsend("Data Ready To Download");//this message is checked in the script DONT CHANGE!!!
        console.log("Successfully copied all data to Public/images: "+ destinationPath + " " + code);
        return(1);
    });

}

exports.getSettings = function(){
    usbInputEnabled = 1; //let the usb data through
    sendOutput('GETTIME'); // get the system time as the startup time

    collectionSettings.findOne({},function(error,result){
        if(result){
            cs4Settings = result;
        }
        else{// there are no settings create them
            cs4Settings.type = 'cs4';
            cs4Settings.ignoreSource = 'NO';
            cs4Settings.enableZigbee2 = 'YES';
            cs4Settings.emailAddress = 'switzel@wizcomputing.com';
            cs4Settings.dmx1 = 10;
            cs4Settings.dmx2 = 20;
            cs4Settings.dmx3 = 30;
            cs4Settings.testTime = "00:00:00";
            cs4Settings.systemName = "CS4 System";
            cs4Settings.emailAccount = "stevewitz@gmail.com";
            cs4Settings.emailAccountPassword = "panema2020!";
            cs4Settings.timezone = "US/Eastern";
            collectionSettings.insert(cs4Settings, {w: 1}, function (err, result) {
                console.log(result);
            })
        }

        //set up initial mail parameters here
        smtpTransport = nodemailer.createTransport("SMTP",{
            service: "Gmail",
            auth: {
                user: cs4Settings.emailAccount,
                pass: cs4Settings.emailAccountPassword
            }
        });

        dataToSend = '          SLAVE DMX_CH ' + cs4Settings.dmx1 +  " " + cs4Settings.dmx2 + " " + cs4Settings.dmx3 + ''; //update the DMX channels
        sendOutput(dataToSend) ;
        dataToSend = '          SLAVE ZIGEN ' + cs4Settings.enableZigbee2 + ''; //update the DMX channels
        sendOutput(dataToSend) ;
        exports.ledOn();

    });
};

exports.saveSettings = function(){
    delete cs4Settings._id;
    collectionSettings.update({'type':"cs4"},cs4Settings , {upsert:true, w:1},function(err, res){

        console.log ('cs4Settings has been updated');
    });

};

exports.ledOn = function(){

    if(os.type() != 'Windows_NT') // this is only for the pi
    {
        var led = require('fastgpio');
        led.prepareGPIO(4);
        led.set(4);
        clearInterval(blink);
    }

    pmp.findGateway("",function(err,gateway){
        var error = 0;
        ///console.log(err,gateway.ip);
        if(err){
            console.log('Gateway not found',err);
        }
        else{
            global.externalIP = gateway.externalIP;
            console.log('gateway found: '+ gateway.ip + ", External IP: "+ gateway.externalIP);
            pmp.portMap(gateway,3000,3000,0,'CS4 Main',function(err,rslt){

                if(!err) {
                    console.log("Sucessfully logged port: "+ gateway.externalIP + ": " + gateway.publicPort + " to " + gateway.ip + ": " + gateway.privatePort) ;
                }
                else{
                    console.log(err,rslt);
                }

                pmp.portMap(gateway,8080,8080,0,'CS4 Websocket',function(err,rslt){

                    if(!err) {
                        console.log("Sucessfully logged port: "+ gateway.externalIP + ": " + gateway.publicPort + " to " + gateway.ip + ": " + gateway.privatePort) ;
                    }
                    else{
                        console.log(err,rslt);
                    }
                    pmp.portMap(gateway,9090,9090,0,'CS4 Misc',function(err,rslt){

                        if(!err) {
                            console.log("Sucessfully logged port: "+ gateway.externalIP + ": " + gateway.publicPort + " to " + gateway.ip + ": " + gateway.privatePort) ;
                        }
                        else{
                            console.log(err,rslt);
                        }

                        /////////////
                        console.log('Ready to send START UP email message');
                        var mailOptions = {
                            from: "CS4 @ " + myuri + "✔ " + cs4Settings.emailAccount,
                            //  from: "CS4 192.168.2.10 ✔ <stevewitz@gmail.com>", // sender address
                            to: cs4Settings.emailAddress,
                            // to: "steve@wizcomputing.com      ", // comma seperated list of receivers
                            subject: "Start Up Message from CS4 ✔: "+ cs4Settings.systemName, // Subject line
                            text: cs4Settings.systemName+ " CS4 has just started.\n  External IP address:  http://" + global.externalIP + ":3000" + " - and internal IP address: "  +global.myuri+ ":3000", // plaintext body
                            html: cs4Settings.systemName+ " CS4 has just started.\n  External IP address:  http://" + global.externalIP + ":3000" + " - and internal IP address: "  +global.myuri+ ":3000"// html body
                        };

                        // send mail with defined transport object
                        sendMail(mailOptions);
                        console.log("READY to start system test in 10 seconds");
                        setTimeout(function(){startSystemTest();}, 10000); // check for results after delay
                      //  setTimeout(function(){setAutoTest(0);}, 20000);
                        /////////////////////




                    });

                });
            });

        }

    });
};

exports.ledOff = function(){

    if(os.type() != 'Windows_NT') // this is only for the pi
    {
        var led = require('fastgpio');
        led.prepareGPIO(4);
        led.unset(4);
        clearInterval(blink);
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

function ledInfoBlink(GPIOnum){
    ledInfoOn(GPIOnum); // turn it on
    setTimeout(function(){ledInfoOff(GPIOnum);}, 500); // turn it off
    blink = setTimeout(function(){ledInfoBlink(GPIOnum);}, 1000); // restart

}

function startSystemTest(auto){

    if(auto){
      //  clearTimeout(autoTest1); //erase any previous timeouts
      //  clearTimeout(autoTest); //erase any previous timeouts
      //  autoTest1 = setTimeout(function(){startSystemTest(1);}, TimeToTest); // start again in 24 hours
      //  console.log("Starting next System Test");
      //  comlib.websocketsend("Starting next System Test");
    }
    dataToSend = '          SLAVE ZIGEN ' + 'YES' + '\r'; //Enable the zigee2 channel
    comlib.write(dataToSend) ;

    if(cs4Settings.enableZigbee2 =='NO'){ // make sure we can receive zigbee2.  If not enable it
        zigbee2State = 'NO';
        dataToSend = '          SLAVE ZIGEN ' + 'YES' + '\r'; //Enable the zigee2 channel
        comlib.write(dataToSend) ;
    }

        for(var i = 0; i < 5 ; i++){
          //  sendOutput('ZIG1' + ' ' + 'TEST '  + "GO slide1111.jpg NEXT slide2222.jpg");
            setTimeout(function(){sendOutput('ZIG1' + ' ' + 'TEST '  + "GO slide1111.jpg NEXT slide2222.jpg");}, 500*i);
        }
        setTimeout(function(){checkForZigbee(auto);}, 5000); // check for results after delay
}

function checkForZigbee(auto){
    var success = 0;

    if(zigbee2State =='NO'){ // make sure to put zigbee2 channel back where it was before test
        dataToSend = '          SLAVE ZIGEN ' + 'NO' + '\r'; //Disable the zigee2 channel
        comlib.write(dataToSend) ;
    }
    //collectionLog.find({},{_id:0}).sort({"Time": -1}).limit(6).toArray(function(error,logfile) {
    collectionLog.find({},{_id:0}).sort({ $natural: -1}).limit(6).toArray(function(error,logfile) {

        for( var i = 0; i < logfile.length; i++){
                    t = logfile[i].Source;
                if(logfile[i].Source == 'zigbee2:'){
                    if(logfile[i].InData.trim().substr(0,4) == 'TEST'){
                        success = 1;
                    }
                }
        }

        if(success){
            //send success email
            comlib.websocketsend(" ***" );
            comlib.websocketsend("    SYSTEM TEST COMPLETED SUCCESSFULLY");
            comlib.websocketsend(" ***" );
            var mailOptions = {
                from: "CS4 @ " + myuri + "✔ " + cs4Settings.emailAccount,
                //  from: "CS4 192.168.2.10 ✔ <stevewitz@gmail.com>", // sender address
                to: cs4Settings.emailAddress,
                // to: "steve@wizcomputing.com      ", // comma seperated list of receivers
                subject: "Success Message from CS4 ✔: "+ cs4Settings.systemName, // Subject line
                text: cs4Settings.systemName+ " CS4 has just PASSED the SYSTEM TEST.\n  External IP address:  http://" + global.externalIP + ":3000"+ " - and internal IP address: "  +global.myuri+ ":3000", // plaintext body
                html: cs4Settings.systemName+ " CS4 has just PASSED the SYSTEM TEST.\n  External IP address:  http://" + global.externalIP + ":3000" + " - and internal IP address: "  +global.myuri+ ":3000"// html body
            };
            ledInfoOn(4); // turn on the light
            sendMail(mailOptions);

        }
        else{
            //send fail email
            comlib.websocketsend(" ***   ***" );
            comlib.websocketsend("    SYSTEM TEST FAILED !!!!");
            comlib.websocketsend(" ***   ***" );
            var mailOptions = {
                from: "CS4 @ " + myuri + "✔ " + cs4Settings.emailAccount,
                //  from: "CS4 192.168.2.10 ✔ <stevewitz@gmail.com>", // sender address
                to: cs4Settings.emailAddress,
                // to: "steve@wizcomputing.com      ", // comma seperated list of receivers
                subject: "Error Message from CS4 ✔: "+ cs4Settings.systemName, // Subject line
                text: cs4Settings.systemName+ " CS4 has just FAILED the SYSTEM TEST.\n  External IP address:  http://" + global.externalIP + ":3000"+ " - and internal IP address: "  +global.myuri+ ":3000", // plaintext body
                html: cs4Settings.systemName+ " CS4 has just FAILED the SYSTEM TEST.\n  External IP address:  http://" + global.externalIP + ":3000" + " - and internal IP address: "  +global.myuri+ ":3000"// html body
            };
            ledInfoBlink(4); // blink the light to indicate error
            sendMail(mailOptions);
        }


    });
    setTimeout(function(){sendOutput('TIMEGET');}, 5000); // this will update ti pi time to CS4 i/o time
}

function setAutoTest(){
    var offsetTime;
  //  console.log("STARTING AUTO TEST");
    //get latest time from startup data base and calculate how long to delay before starting test
    collectionStartup.find({},{_id:0}).sort({"Time": -1}).limit(1).toArray(function(error,Startupfile) {

        //startDate = new Date(Startupfile[0].Time);
        startDate = new Date(); // now that system time is correct
        currentHours = startDate.getHours();
        currentMinutes = startDate.getMinutes();
        currentSeconds = startDate.getSeconds();
        currentMilli = startDate.getMilliseconds();
        wantedTime = parseInt(cs4Settings.testTime.substr(0,2));
        offsetTime = wantedTime - currentHours;
        if(offsetTime <= 0){
            offsetTime += 24;
        }
        //calculate milliseconds until start of test
        offsetTime = offsetTime*60*60*1000 - currentMinutes*60*1000 - currentSeconds*1000 - currentMilli;
     //   clearTimeout(autoTest1); //erase any previous timeouts
        clearTimeout(autoTest); //erase any previous timeouts

       // offsetTime=60000;
        autoTest =  setTimeout(function(){startSystemTest(1);}, offsetTime);
        comlib.websocketsend("Auto Test will start in: " + offsetTime/1000 + " seconds");
    });
}


function sendConsole(){
    console.log('Delays ', startDate, currentHours, wantedTime);
}




function sendMail(mailOptions){
    smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
        }
        else{
            console.log("Message sent: " + response.message);
        }
    });
}

function stopIO(state){
    if(state){
        //stop any pending cues frim firing if new cue comes in
        if (global.timeoutlist != undefined){
            for (var i=0;i<global.timeoutlist.length;++i){

                clearTimeout(global.timeoutlist[i])
            }
        }
        //stop input from cs4 IO board
        usbInputEnabled = 0;
    }
    else{ // start inputs from CS4 IO Board
        usbInputEnabled = 1;

    }
}

