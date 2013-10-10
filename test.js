var MongoClient = require('mongodb').MongoClient;


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
        global.collectionAvg = db.collection('avg');
        //var x = new Date(new Date()-(60*1000));
        //avgReadings(x,60);
        updateAvg();
    }
});
function updateAvg(){

    collectionLog.find({},{Time : 1 ,_id: 0 }).sort( { _id : -1 } ).limit(1).toArray(function(err,item){
        console.log("latest item "+item[0].Time);
        var curPeriod = item[0].Time.setSeconds(0)-60000;

        collectionAvg.find({},{Time : 1 ,_id: 0 }).sort( { _id : -1 } ).limit(1).toArray(function(err,aitem){
            // now find the most recent avg time entry
            console.log("Last avg entry"+aitem[0].Time);
            var lastavg = aitem[0].Time.getTime();
            console.log("lastavg"+lastavg);
            for (var i = lastavg+60000; i < curPeriod; i=i+60000){

                // console.log(new Date(i));
                avgReadings(new Date(i),60);
            }
        });

    });
}
function avgReadings(startTime,seconds)
{
    startTime.setSeconds(0);
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
        global.collectionAvg.update({"Time":startTime} ,avgitem ,{ upsert: true },function (err,res){
            console.log("res"+res);
        });



    });

}