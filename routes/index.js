
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express - Serial Port Sending data' });
//sending serial data  and a non function to call back with the results
  process.serialport.write("settime 10 10 10\n",function(err, results) {
            console.log('err (undefined is none)' + err);
      console.log('results (serial bytes sent maybe)' + results);
  });

};