var com = require('serialport');
var cs4 = require('./cs4');
var twi = require('./twi');
var WebSocketServer = require('ws').Server;
exports.openSerialPort = function(portname)
{
    console.log("Attempting to open serial port "+portname);
   // serialport declared with the var to make it module global

    serialPort = new com.SerialPort(portname, {
        baudrate: 115200,
// Set the object to fire an event after a \n (chr 13 I think)  is in the serial buffer
        parser: com.parsers.readline("\n")
    });
     //serialPort.



// I dont understand this call 0 but it works
    serialPort.on("open", function (err,res) {
        console.log("Port open success:"+portname);
    });  //it's console.log('open');

    serialPort.on('data', function(data) {

        if(branch == 'twi')
        {

            twi.serialDataIn(data);

        }
        else if(branch == 'cs4')
        {
            cs4.socketDataOut(data);


        }

    });
};


exports.write = function(data) {
    serialPort.write(data,function(err, results)
    {
          console.log('err (undefined is none)' + err);
        console.log('results (serial bytes sent maybe)' + results);
 //   serialPort.write("settime "+timestamp+"\n",function(err, results) {
   //     console.log("set new time"+timestamp);

    });
};

//Set up the web socket here.. Default port is 8080
wss = new WebSocketServer({port: 8080}, function(err,res){

    //  console.log(wss.url);
    if (err){
        console.log("Websocket error:"+err);
    }
    else
    {

        console.log("Websocket server Listening");
    }
});


websocket = {};
//Set up Web socket for a connection and make it global
wss.on('connection', function(ws) {

    var i = 0;
    while (true)
    {
        if (!websocket[i]){
            break;
        }
        i++;
    }
    websocket[i]=ws;
    console.log('Websocket Connected Id:'+i);
    var thisId= i;

    //this line sends to twi and cs4 and causes an error on Todds webpage
    // ws.send('Log Window Now Active');

    ws.on('message', function(message) {

        if(branch == 'twi')
        {
            twi.websocketDataIn(message,thisId);
        }
        else if(branch == 'cs4')
        {
            console.log('received: %s', message,thisId);
            cs4.websocketDataIn(message);
        }
    });
    ws.on('close', function(ws){
        console.log('Websocket disconnected Id:'+thisId);
        delete websocket[thisId];
    });
    ws.on('error', function(ws){
        console.log('Websocket Error Id:'+thisId);
        delete websocket[thisId];
    });
});


exports.websocketsend = function(data,id)
    {

        if (websocket[id])
        {
            websocket[id].send(data);
        } else
        {
//            console.log('keys'+ Object.keys(websocket));
//            console.log('len'+websocket.length);
            //Object.keys(websocket).length -
            //someday fix this so it tracks the number of connections
            for (var i=0; i < 10; i++)
            {
                if (websocket[i])
                {
                    websocket[i].send(data);
                    console.info("websocket sending to client "+i);
                }


            }

        }

    };