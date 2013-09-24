
/**
 * Module dependencies.
 */

// I think we can use the require('os') function to determine the system
// it's on and redefine the serial ports for you (win8), me (win 7) and Pi (linux). I'll look at it tomorrow

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var os = require('os');
var app = express();
var db;
var com = require("serialport");

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
var serialPort;

console.log("Host System Name: " + os.hostname());
if(os.hostname() == "SuperFast")
{
    serialPort = new com.SerialPort("COM19", {
    baudrate: 115200,
// Set the object to fire an event after a \n (chr 13 I think)  is in the serial buffer
    parser: com.parsers.readline("\n")

});
    console.log("COM19");

}
else
{
    serialPort = new com.SerialPort("COM14", {
    baudrate: 9600,
// Set the object to fire an event after a \n (chr 13 I think)  is in the serial buffer
    parser: com.parsers.readline("\n")

});
    console.log("COM8") ;
}
// Set the serialport info here
/*
serialPort = new com.SerialPort("COM19", {
    baudrate: 115200,
// Set the object to fire an event after a \n (chr 13 I think)  is in the serial buffer
    parser: com.parsers.readline("\n")

});

*/
// I dont understand this call 0 but it works
serialPort.on("open", function () {
    console.log('open');
});  //it's console.log('open');

    serialPort.on('data', function(data) {

    //    process.collection.insert(data, {w:1}, function(err, result) {console.log(result);});
        console.log(data);
        var doc1 = {'Serial':'yes'};
        doc1.hello = "maybehello"
        doc1.serialdata = data;
        process.collection.insert(doc1, {w:1}, function(err, result) {console.log(result);});

    });
// tnis is the serial write command the 2nd paramter is the callback function and is not required
//   serialPort.write("ls\n", function(err, results) {
 //       console.log('err ' + err);
//       console.log('results ' + results);
//   });

//   Attach the serialPort objecgt (by reference) to the global object process so its available everywhere
process.serialport = serialPort;

// Retrieve
var MongoClient = require('mongodb').MongoClient;

// Connect to the db
MongoClient.connect("mongodb://localhost:27017/exampleDb", function(err, db) {
    if(!err) {
        console.log("We are connected to mondo exampleDb database todd collection");
    }
    var collection = db.collection('todd');
    //   Attach the db.collection objecgt (by reference) to the global object process so its available everywhere
    process.collection =collection;

    collection.find().toArray(function(err, items) {
        console.log(items[1]);
        console.log(items[1].hello);
        console.log(items[3].serialdata)
    });
});
