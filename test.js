console.log('\033[5;10r')
console.log('start');
for (var i= 1;i < 15; ++i){
   console.log('line '+i);
   // console.log('\033[1;10H****************');


}
console.log('\033[s');
console.log('line 1');
console.log('line 2');
console.log('line 3');
console.log('line 4');
console.log('\033[u');
console.log('line 11');
console.log('line 211');
console.log('line 3');
console.log('line 41');
return;
console.log('line 1');
console.log('line 2');
console.log('line 3');
console.log('line 4');
console.log('line 5');
console.log('line 6');
console.log('\033[s\033[0;0fZ,Z');

console.log('\033[0;0fZ,Z\033[u');

return;
//console.log('\033[2J');
console.log(' \033[5A up five');
console.log('\033[3A\033[1;35m BASH \033[1B\033[1D down one');
console.log('\033[4A\033[1;35m BASH2 \033[7B\033[6D');
console.log(' \033[2J???');
console.log ('0,0');
console.log('\033[0;0fZ,Z')
console.log('\033[5;5f5,5')
return;


var MongoClient = require('mongodb').MongoClient;
global.x = 0;

MongoClient.connect("mongodb://localhost:27017/test", function(err, db)
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
        updateAvg(1);
    }
});

function updateAvg(period)
{
if (!period){period = 1;}
    console.log('period minutes '+period);
    // update the average temp collection
    collectionLog.find({},{Time : 1 ,_id: 0 }).sort( { _id : -1 } ).limit(1).toArray(function(err,item){
        console.log("latest item "+item[0].Time);

       if (period == 1) {item[0].Time = new Date(item[0].Time.setSeconds(0)-60000);}
        if (period > 1 && period < 60){
            item[0].Time.setMinutes((~~(item[0].Time.getMinutes()/period)*period)-period);
        }
        if (period >= 60){
            // ~~ truncates the integer eg ~~1.22 = 1
            var hourperiod = period / 60;
            item[0].Time.setMinutes(0);
            item[0].Time.setHours((~~(item[0].Time.getHours()/hourperiod)*hourperiod)-hourperiod);
        }
        console.log('Current Period'+item[0].Time);

        collectionAvg.find({period  :period}).sort( { Time : -1 } ).limit(1).toArray(function(err,aitem){
            // now find the most recent avg time entry
            if (!aitem[0])
            {
            console.log("Creating First Entry in Avg for period of "+period);
                collectionLog.find({},{Time : 1 ,_id: 0 }).sort( { _id : 1 } ).limit(1).toArray(function(err,item){
                    var avgitem = {};
                    avgitem.Time=item[0].Time;
                    avgitem.Time.setHours(0);
                    avgitem.Time.setMinutes(0);
                    avgitem.Time.setSeconds(0);
                    avgitem.period = period;
                    collectionAvg.update({"Time":avgitem.startTime} ,avgitem ,{ upsert: true },function (err,res){

                           console.log("Creation results:"+res);


                    });


                });

            return;

            }
            console.log("Last avg entry"+aitem[0].Time);

            var lastavg = aitem[0].Time.getTime();
            // why not check if all the sensors are in the settings collection here? - ok
//            for(var prop in aitem[0])
//            {
//                if (!sensorSettings[prop] &&(prop != "Time") && (prop != "datatype")){
//                    sensorSettings[prop]={};
//                    console.log("Found new sensor:"+prop);
//                    collectionSettings.update({'type':'sensors'}, sensorSettings ,{upsert:true, w:1},function(err,res){
//
//                        console.log('Saved new sensor');
//                    });
//                }
//            }

            var maxupdates = 5500;
            for (var i = lastavg+(60000*period); i <= item[0].Time; i=i+(60000*period)){

                console.log("Running Sensor averages for:"+new Date(i));
                avgReadings(new Date(i),60*period);
                if (maxupdates < 2){break;}
                maxupdates--;
            }
        });

    });
}
function avgReadings(startTime,seconds)
{
    startTime.setSeconds(0);
  //  console.log(startTime);
    var avgitem = {};
    var avgitemcount = {};
    collectionLog.find({"Time":{$gte : startTime,$lte : new Date(startTime.getTime()+(seconds*1000))}}).toArray(function(err,item)
    {

        if (err){
            console.log("Error in mongo find: "+err);
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
            // check for any new sensors not in the settings.sensor


        }
        avgitem.Time = startTime;
        avgitem.period = seconds/60;

        try
        {
            //console.log("sending sensor avg update");
            avgitem.datatype="Sensor Avg Update";
            //console.log(avgitem);
            comlib.websocketsend(JSON.stringify(avgitem));

        }
        catch(err)
        {
          //  console.log("ws error"+err);
        }
        delete avgitem.datatype;
        collectionAvg.update({"Time":startTime} ,avgitem ,{ upsert: true },function (err,res){

                 console.log("count:"+global.x);
            ++x;


        });



    });
}

