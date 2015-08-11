
/**
 * Module dependencies.
 */
/*                                                                       */
/*                                                                       */
/*              Select one of the two lines below                        */
/*              for Todd's branch or Steve's branch                      */
/*                                                                       */


                global.branch = process.argv[2];
//          ** put cs4 ot twi in the edit configuration app parameters
//                global.branch = 'cs4';
            console.info ("Branch set to "+global.branch);
/*                                                                       */
/*                                                                       */
/*                                                                       */
/*                                                                       */

/*todd was here*/


var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

//var MongoClient = require('mongodb').MongoClient;

global.comlib = require('./comlib');
global.myuri;
global.externalIP;

//Set up all express stuff
app = express();

app.set('port', 3000); // This is a default port.  Change here only if necessary
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
//moved here
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

//  All route information now is contained in
//  TWI.js or CS4.js


// Set up the server


/*
    Set up for the desired branch
    All code for each branch is contained
    in TWI.js OR CS4.js

    This should keep a common set of
    stuff so we are on the same page

 */

if(branch == 'twi')
{
// Connect to the db
   var twi = require('./twi');
  twi.setup();
}
else if(branch == 'cs4')
{
    var cs4 = require('./cs4');
    cs4.ledOff(); // turn off the ready led
    cs4.setup(startwebserver);
}

function startwebserver(){
  http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
    comlib.startwebsocketserver();


  });
  
}


