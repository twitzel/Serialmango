
/*
 * GET home page.
 */
var itemInfoFinal = [];
var cs4Settings;
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
    var startup=0;
    var counter=0;
    var notcounted = 0;
    var notindex = 0;
    collectionStartup.find({'Time':{$exists:true}}).sort({"Time": -1}).limit(25).toArray(function(error,startup){

        collectionCue.find().toArray(function(error,countCue){
            var counter = 0;
            for(var i=0; i< countCue.length; i++)
            {
                if(countCue[i].OutData) {
                    counter += countCue[i].OutData.length
                }
                else{
                   notcounted +=1;
                   notindex = i;
                }
            }


            collectionLog.count(function(error,countLog){

                collectionStartup.count(function(error,countStartup){

                    collectionStartup.findOne({'TimeZoneSet':{$exists:true}}, function(err,tme){
                        if(tme){
                            var a = tme.TimeZoneSet;
                            timeZone = tme.TimeZoneSet;
                        }
                        else{
                            timeZone = 'US/Eastern'; // this is the default time zone if nothing is set
                        }

                        res.render('cs4Info.ejs',{ title: 'CS-4 Info', Test: req.params.Test, startup:startup, countCue:counter, countLog:countLog, timeZone:timeZone, countStartup:countStartup, curTime: new Date() });
                    });
                });

            });

        });

    });

};


exports.cs4Home = function(req, res){
    res.render('cs4Home.ejs',{ title: 'CS-4 Home', myuri:"ws://localhost:8080",Test: req.params.Test, externalIP:global.externalIP + ":3000", internalIP:global.myuri+ ":3000" });
}

exports.cs4Timing = function(req, res){
    itemInfoFinal = [];
    itemInfoFinal.length = 0; // clear the array
   // var cs4Settings; // made global
    collectionSettings.findOne({},function(error,result){
        if(result){
            cs4Settings = result;
        }
        else{
            cs4Settings = {};
        }
    });
    collectionCue.find().toArray(function(error,countCue) {
        var counter = 0;
        for (var i = 0; i < countCue.length; i++) {
            if (countCue[i].OutData) {
                counter += countCue[i].OutData.length
            }
            else {
                notcounted += 1;
                notindex = i;
            }
        }
        if (counter > 0) {
            //////////////////////////////////////////////////////
            var results = [];
            var i;
            var counter = 0;
            var item;
            var items;
            var itemsWaiting = 0;
            var count;
            itemInfoFinal = [];
            itemInfoFinal.length = 0; // clear the array
            collectionCue.aggregate([
                {"$unwind": "$OutData"},
                {"$group": {"_id": "$OutData.Desc", "sum": {"$sum": 1}}}
            ], function (err, item) {
                for (i = 0; i < item.length; i++) {
                    itemsWaiting++;
                    collectionCue.aggregate({ $unwind: "$OutData" }, { $match: {"OutData.Desc": item[i]._id}}, {$limit: 1}, function (err1, itemInfo) {
                        itemsWaiting--;
                        for (j = 0; j < item.length; j++) { //connect the sum with the proper description
                            if (itemInfo[0].OutData) {

                                if (item[j]._id == itemInfo[0].OutData.Desc) {
                                    count = item[j].sum;
                                    break;
                                }
                            }
                        }
                       // itemInfoFinal.push([itemInfo[0].OutData.Desc, count, itemInfo[0].OutData.Showname, itemInfo[0].OutData.Dout]);
                        if (itemInfo[0].OutData) {
                            itemInfoFinal.push([itemInfo[0].OutData.Showname, itemInfo[0].OutData.Desc, itemInfo[0].OutData.Dir, count, itemInfo[0].OutData.Dout]);
                        }
                        if (itemsWaiting == 0) {
                            allDoneTiming(req, res);
                        }
                    });

                }
            });
            /////////////////////////////////////////////////
        }
        else{
            allDoneTiming(req, res);
        }
    });
};

function allDoneTiming(req, res) {
    collectionSettings.findOne({},function(error,result){
        if(result){
            cs4Settings = result;
        }
        else{
            cs4Settings = {};
        }

        console.log(itemInfoFinal);
        res.render('cs4Timing.ejs', { title: 'CS-4 Timing', Test: req.params.Test , Desc: itemInfoFinal, Settings: cs4Settings});
    });



}
function allDoneEdit(req, res) {
    console.log(itemInfoFinal);
    res.render('cs4Edit.ejs',{ title: 'CS-4 Cue Editor', myuri:"ws://localhost:8080", Desc: itemInfoFinal });
}


exports.cs4VerticalScroll = function(req, res){
    res.render('CS4VerticalScroll.ejs',{ title: 'CS-4 Scroll', Test: req.params.Test });
};

exports.cs4Help = function(req, res){
    res.render('cs4Help.ejs',{ title: 'CS-4 Scroll', myuri:"ws://localhost:8080" });
};

exports.cs4Settings = function(req, res){
    collectionSettings.findOne({},function(error,result){
        if(result){
            cs4Settings = result;
        }
        else{
            cs4Settings = {};
        }
        console.log("This is cs4 SETTINGS: ", cs4Settings)
        res.render('cs4Settings.ejs',{ title: 'CS-4 Scroll', myuri:"ws://localhost:8080", cs4Settings:cs4Settings });
    });
};

exports.cs4Edit = function(req, res){
    itemInfoFinal = [];
    itemInfoFinal.length=0; // clear the array
    collectionCue.find().toArray(function(error,countCue) {
        var counter = 0;
        for (var i = 0; i < countCue.length; i++) {
            if (countCue[i].OutData) {
                counter += countCue[i].OutData.length
            }
            else {
                notcounted += 1;
                notindex = i;
            }
        }
        if (counter > 0) {
            //////////////////////////////////////////////////////
    var results = [];
    var i;
    var counter=0;
    var item;
    var items;
    var itemsWaiting = 0;
    var count;
    itemInfoFinal = [];
    itemInfoFinal.length=0; // clear the array
    collectionCue.aggregate([{"$unwind":"$OutData"},{"$group":{"_id":"$OutData.Desc",  "sum":{"$sum":1}}}],function (err, item) {
        for(i =0;i<item.length;i++) {
            itemsWaiting++;
            collectionCue.aggregate({ $unwind : "$OutData" },{ $match : {"OutData.Desc": item[i]._id}},{$limit:1}, function(err1, itemInfo){
                itemsWaiting--;
                for(j=0; j< item.length; j++){ //connect the sum with the proper description
                    if (itemInfo[0].OutData) {
                        if (item[j]._id == itemInfo[0].OutData.Desc) {
                            count = item[j].sum;
                            break;
                        }
                    }
                }
                if (itemInfo[0].OutData) {
                    itemInfoFinal.push([itemInfo[0].OutData.Desc, count, itemInfo[0].OutData.Showname, itemInfo[0].OutData.Dout]);
                }
                if(itemsWaiting == 0){
                    allDoneEdit(req, res);
                }
            });

        }
    });
            /////////////////////////////////////////////////
        }
        else{
            allDoneEdit(req, res);
        }
    });
};

