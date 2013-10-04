
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
    res.render('com.jade', { title: 'com.jade' });
};

exports.data = function(req, res){
       // global.collectionLog.findOne( {UnitID:2} ,{Sort:{_id:1}},function(err, item){
    // initial graph data
    collectionLog.find({'UnitID':1}).sort( { _id : -1 } ).limit(1000).toArray(function(err,item){
             console.log(item[0].Time);


           res.render('data.jade', { title: 'stuff' , item: item });

        });

    };


