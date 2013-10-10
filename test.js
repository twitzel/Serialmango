var MongoClient = require('mongodb').MongoClient;
console.log("asdf");

MongoClient.connect("mongodb://10.6.1.119:27017/test", function(err, db)
{
    if (err)
    {
        console.log("Connection to mongo failed:"+err)  ;
    }
    else
    {
        console.log("TWI: We are connected to mondo exampleDb database todd collection");
        global.collectionLog = db.collection('todd');
        var x = new Date(new Date()-(60*1000));
        avgReadings(x,60);
    }
});
function avgReadings(startTime,seconds)
{
console.log(startTime);
    var avgitem = [];
    var avgitemcount = [];
collectionLog.find({"Time":{$gte : startTime,$lte : new Date(startTime.getTime()+(seconds*1000))}}).toArray(function(err,item)
{

    if (err){
        console.log("Error in mongo find"+err);
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
    }
    avgitem.Time = startTime;
    console.log(avgitem);



});

}