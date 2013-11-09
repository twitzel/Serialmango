
/*
 * GET home page.
 */

exports.index = function(req, res){
    res.render('index.jade', { title: 'Express - Serial Port Sending data' });
//sending serial data  and a non function to call back with the results
    var timestamp = new Date();
    timestamp.setHours(timestamp.getHours()-6)   ;
    console.log("set new time"+timestamp);
    timestamp = Math.round((timestamp.valueOf()/1000))  ;
    comlib.write("settime "+timestamp+"\n")   ;

};
exports.com = function(req, res){
//    res.render('com.jade', { title: 'com.jade' });
    res.render('test.ejs');
};

exports.data = function(req, res){
       // global.collectionLog.findOne( {UnitID:2} ,{Sort:{_id:1}},function(err, item){
    // initial graph data
    // todd added this
   //    collectionAvg.find({},{_id:0,"Time":0}).sort( { "Time": 1 } ).limit(300).toArray(function(err,item)
    x= new Date();
    x=new Date(x-(3600000*6)); // 6 hours age
    //collectionAvg.find({"Time":{$gt:x}},{_id:0,"Time":0}).sort( { "Time": 1 } ).toArray(function(err,item)
    collectionAvg.find({"Time":{$gt:x},"period":1},{_id:0}).sort( { "Time": 1 } ).toArray(function(err,item){
           //  console.log(item[0].Time);

           collectionSettings.findOne({"type":"sensors"},function(err,sensors){
                if (!sensors){ sensors={};}
               res.render('data.jade', { title: 'stuff' , item: item , sensors: sensorSettings });

           });

        });

};
exports.graph = function(req, res){
    // global.collectionLog.findOne( {UnitID:2} ,{Sort:{_id:1}},function(err, item){
    // initial graph data
    // todd added this
    //    collectionAvg.find({},{_id:0,"Time":0}).sort( { "Time": 1 } ).limit(300).toArray(function(err,item)
    x= new Date();
    x=new Date(x-(3600000*12*2)); // 6 hours age
    //collectionAvg.find({"Time":{$gt:x}},{_id:0,"Time":0}).sort( { "Time": 1 } ).toArray(function(err,item)
    collectionAvg.find({"Time":{$gt:x},"period":3},{_id:0}).sort( { "Time": 1} ).toArray(function(err,item){
        //  console.log(item[0].Time);

        collectionSettings.findOne({"type":"sensors"},function(err,sensors){
            if (!sensors){ sensors={};}
            res.render('graph.jade', { title: 'Sensor Graph' , item: item , sensors:sensors });

        });

    });

};

exports.data2 = function(req, res){
    res.render('data2.jade',{ title: 'CS-4 Output', myuri:"ws://localhost:8080" });
};

exports.data3 = function(req, res){
   res.render('data3.jade',{ title: 'CS-4 Output Data testing', myuri:"ws://localhost:8080" });
};

exports.data2 = function(req, res){
   res.render('cs4Start.ejs',{ title: 'CS-4 Output Data 3', myuri:"ws://localhost:8080" });
};

exports.cs4Start = function(req, res){
    var startup;
    collectionStartup.find().sort({"Time": -1}).toArray(function(error,startup){

        collectionCue.find().toArray(function(error,countCue){
           var counter = 0;
            for(var i=0; i< countCue.length; i++)
            {
                counter += countCue[0].OutData.length
            }
            collectionLog.count(function(error,countLog){

                collectionStartup.count(function(error,countStartup){

                    res.render('CS4Start.ejs',{ title: 'CS-4 Output Data tester', countCue:countCue, countLog:countLog, countStartup:countStartup });

                });

            });

        });

    });

  };

exports.cs4Info = function(req, res){
    var startup;
    collectionStartup.find().sort({"Time": -1}).limit(25).toArray(function(error,startup){

        collectionCue.find().toArray(function(error,countCue){
            var counter = 0;
            for(var i=0; i< countCue.length; i++)
            {
                counter += countCue[i].OutData.length
            }


            collectionLog.count(function(error,countLog){

                collectionStartup.count(function(error,countStartup){

                    res.render('cs4Info.ejs',{ title: 'CS-4 Info', startup:startup, countCue:counter, countLog:countLog, countStartup:countStartup, curTime: new Date() });

                });

            });

        });

    });

};


exports.cs4Home = function(req, res){
    res.render('cs4Home.ejs',{ title: 'CS-4 Home', myuri:"ws://localhost:8080" });
};

exports.cs4Timing = function(req, res){
    res.render('cs4Timing.ejs',{ title: 'CS-4 Timing', myuri:"ws://localhost:8080" });
};