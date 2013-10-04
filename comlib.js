var com = require("serialport");
var cs4 = require('./cs4');


exports.openSerialPort = function(portname)
{

   // serialport declared with the var to make it module global

    serialPort = new com.SerialPort(portname, {
        baudrate: 115200,
// Set the object to fire an event after a \n (chr 13 I think)  is in the serial buffer
        parser: com.parsers.readline("\n")
    });
     //serialPort.



// I dont understand this call 0 but it works
    serialPort.on("open", function () {
        console.log("Port open success:"+portname);
    });  //it's console.log('open');

    serialPort.on('data', function(data) {
       // console.log("Incoming Serial");

        if(branch == 'twi')
        {
            twi.socketDataOut(data);
        }
        else if(branch == 'cs4')
        {
            cs4.socketDataOut(data);
        }

    });
}
exports.write = function(data) {
    serialPort.write(data,function(err, results) {
          console.log('err (undefined is none)' + err);
        console.log('results (serial bytes sent maybe)' + results);
 //   serialPort.write("settime "+timestamp+"\n",function(err, results) {
   //     console.log("set new time"+timestamp);

    });
}