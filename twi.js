/**
 * Created by Steve on 9/30/13.
 */

MongoClient = require('mongodb').MongoClient;
var os = require('os');
var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var sensorSettings = {}; //setting from the settins database

exports.websocketDataIn = function(data){
    // if you want to get socket data it's here!!
    try{
        var webData = JSON.parse(data);

    }
    catch(err)
    {
        console.log("parse web data error"+err)
    }

    console.log(webData.packettype);
    if (webData.packettype == "Sensor name update"){
        delete webData.packettype;
        for(var prop in webData)
        {
            sensorSettings[prop].name = webData[prop].name;
        }

        collectionSettings.update({'type':'sensors'}, sensorSettings ,{upsert:true, w:1},function(err,res){

            console.log('Sensors settings name updated'+res);

        });


    }

    if (webData.packettype == "Sensor order update"){
        delete webData.packettype;
        for(var prop in webData)
        {
            sensorSettings[prop].order = webData[prop].order;
        }

        collectionSettings.update({'type':'sensors'},sensorSettings,{upsert:true, w:1},function(err,res){

            console.log('Sensor Setting order updated'+res);
        });


    }



};

exports.serialDataIn  = function(data)
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
        //serialData.Time = new Date(serialData.Time);
        serialData.Time = new Date();

    }
    else
    {
        console.log("serialData.time not defined");
        return;
    }
    //console.log(serialData.Time);
   if (global.collectionLog){

       collectionLog.insert(serialData, {w:1}, function(err, result) {
     //  collectionLog.insert({"test":1}, {w:1}, function(err, result) {

    });
   }
    else
   {
       console.log("Serial data rec - no database connections yet;")
   }

// send to the websock - should be somewhere else
         try
        {
           serialData.datatype="Sensor Update";
            global.websocket.send(JSON.stringify(serialData));
        }
        catch(err)
        {
            console.log("ws error"+err);
        }
 //  console.log("Sending ws");
//    if (global.collectionLog){
//    collectionLog.find({'UnitID':1}).sort( { _id : -1 } ).limit(100).toArray(function(err,item)
//    {
//     if (err){
//         console.log("Error in mongo find"+err);
//         return;
//     }
//      //  console.log(item[0].Time);
//        try
//        {
//            global.websocket.send(JSON.stringify(item));
//        }
//        catch(err)
//        {
//
//        }
//      });
//    }
};


exports.setup = function()
{
    MongoClient.connect("mongodb://10.6.1.119:27017/test", function(err, db)
    {
        if (err)
        {
            console.log("Connection to mongo failed:"+err)  ;
        }
        else
        {
            console.log("TWI: We are connected to mondo test database");
            global.collectionLog = db.collection('todd');
            global.collectionAvg = db.collection('avg');
            global.collectionSettings = db.collection('settings')
           setInterval(function(){updateAvg();},60000);
            // updateAvg();
            console.log("average updates set to 60 seconds");
            collectionSettings.findOne({"type":"sensors"},function(err,sensors){
                if (sensors){
                    sensorSettings=sensors;
                } else
                {
                    console.error(" Sensor Settings missing");
                    //to-do create sensor settings
                }


            });
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
        comlib.openSerialPort('com17'); //windows
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
};

function updateAvg()
{
    // update the average temp collection
    collectionLog.find({},{Time : 1 ,_id: 0 }).sort( { _id : -1 } ).limit(1).toArray(function(err,item){
        console.log("latest item "+item[0].Time);
        var curPeriod = item[0].Time.setSeconds(0)-60000;

        collectionAvg.find({},{_id: 0 }).sort( { _id : -1 } ).limit(1).toArray(function(err,aitem){
            // now find the most recent avg time entry
            console.log("Last avg entry"+aitem[0].Time);
            var lastavg = aitem[0].Time.getTime();
            // why not check if all the sensors are in the settings collection here? - ok
            for(var prop in aitem[0])
            {
                    if (!sensorSettings[prop] &&(prop != "Time") && (prop != "datatype")){
                    sensorSettings[prop]={};
                        console.log("Found new sensor:"+prop);
                        collectionSettings.update({'type':'sensors'}, sensorSettings ,{upsert:true, w:1},function(err,res){

                            console.log('Saved new sensor');
                        });
                    }
            }


            for (var i = lastavg+60000; i <= curPeriod; i=i+60000){

                console.log("Running Sensor averages for:"+new Date(i));
                avgReadings(new Date(i),60);
            }
        });

    });
}
function avgReadings(startTime,seconds)
{
    startTime.setSeconds(0);
    console.log(startTime);
    var avgitem = {};
    var avgitemcount = {};
    collectionLog.find({"Time":{$gte : startTime,$lte : new Date(startTime.getTime()+(seconds*1000))}}).toArray(function(err,item)
    {

        if (err){
            console.log("Error in mongo find: "+err);
            return;
        }
        item.forEach(function(initem)
        {


            for(var prop in initem){
                if (prop.substr(0,4) == 'Temp'){
                    if(avgitem[prop]){
                        avgitem[prop]=avgitem[prop]+(initem[prop]);
                        avgitemcount[prop]=avgitemcount[prop]+1;
                    }else
                    {
                        avgitem[prop]=(initem[prop]);
                        avgitemcount[prop]=1;
                    }


                }

                //   console.log(prop + 'is ' + initem[prop]);
            }

        });



        for(var prop in avgitem){
            avgitem[prop]=Math.round((avgitem[prop]/avgitemcount[prop])*100)/100;
            // check for any new sensors not in the settings.sensor


        }
        avgitem.Time = startTime;

        try
        {
            console.log("sending sensor avg update");
            avgitem.datatype="Sensor Avg Update";
            console.log(avgitem);
            global.websocket.send(JSON.stringify(avgitem));
            delete avgitem.datatype;
        }
        catch(err)
        {
            console.log("ws error"+err);
        }

        global.collectionAvg.update({"Time":startTime} ,avgitem ,{ upsert: true },function (err,res){

       //     console.log("res"+res);


        });



    });

}