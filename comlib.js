var com = require('serialport');
var cs4 = require('./cs4');
var twi = require('./twi');

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
}

//enumerate the serial ports
exports.listPorts = function()
{
    serialPort.listPorts(function (err, ports) {
        ports.forEach(function(port) {
            console.log(port.comName);
            console.log(port.pnpId);
            console.log(port.manufacturer);
        });
    });
}


exports.write = function(data) {
    serialPort.write(data,function(err, results)
    {
          console.log('err (undefined is none)' + err);
        console.log('results (serial bytes sent maybe)' + results);
 //   serialPort.write("settime "+timestamp+"\n",function(err, results) {
   //     console.log("set new time"+timestamp);

    });
}