
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
var WebSocketServer = require('ws').Server;

var MongoClient = require('mongodb').MongoClient;
 global.comlib = require('./comlib');

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

console.log("Host System Name: " + os.hostname());
// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
app.get('/com', routes.com);
app.get('/', routes.index);
app.get('/users', user.list);




http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

wss = new WebSocketServer({port: 8080}, function(){
            console.log("Websocket server Listeninging");
        });
wss.on('connection', function(ws) {
    ws.on('message', function(message) {
        console.log('received: %s', message);
    });
    global.websocket=ws;
    ws.send('something');

});
// This is a hook into the console.log function
// It sends a copy of the console.log data to the last open websocket

var orig = console.log
console.log = function(input) {
   if (global.websocket)  {
    websocket.send(":"+input)  ;
   }
    orig.apply(console, [input]);
}


// Connect to the db
MongoClient.connect("mongodb://localhost:27017/exampleDb", function(err, db) {
    if(!err) {
        console.log("We are connected to mondo exampleDb database todd collection");
        comlib.openSerialPort("com5")    ;
    }
   global.collection = db.collection('todd');
    //   Attach the db.collection objecgt (by reference) to the global object process so its available everywhere

 // query something to see if we can and show it
   // collection.find().toArray(function(err, items) {
  //  });
});




