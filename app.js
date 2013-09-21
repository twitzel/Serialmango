
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();

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

// Set the serialport info here
var serialPort;
serialPort = new com.SerialPort("COM8", {
    baudrate: 57600,
    parser: com.parsers.readline("\n")

});
// I dont understand this call 0 but it works
serialPort.on("open", function () {
    console.log('open');
});

    serialPort.on('data', function(data) {
        console.log(data);
    });
//   serialPort.write("ls\n", function(err, results) {
 //       console.log('err ' + err);
//       console.log('results ' + results);
//   });

//   Attach the serialPort objecgt (by reference) to the global object process so its available everywhere
//process.serialport = serialPort;

