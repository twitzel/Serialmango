/**
 * Created by Steve on 9/30/13.
 */


MongoClient = require('mongodb').MongoClient;
var os = require('os');

exports.setup = function()
{
    MongoClient.connect("mongodb://localhost:27017/exampleDb", function(err, db)
    {
        if (err)
        {
            Console.log("Connection to mongo failed:"+err)  ;
        }
        else
        {
            console.log("CS4: We are connected to mondo exampleDb database todd collection");
            global.collection = db.collection('todd');
        }
    });

    //now lets find out if we are on a windows system
    // if we are open the required com port
    //if not open the pi port
    console.log("Host System Name: " + os.type());
    if(os.type() == 'Windows_NT')
    {
        comlib.openSerialPort('com19'); //windows
    }
    else
    {
        comlib.openSerialPort("/dev/ttyAMC0"); //not windows
    }

}

