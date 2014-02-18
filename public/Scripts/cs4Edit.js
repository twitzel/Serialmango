var autoplot;
var pixelArray = [];
var startTime;
var msPerPixelMain;
var msPerPixelZoom;

window.onload = init;
function init(){

    wsUri = "ws://" + window.location.hostname + ":8080";
    output = document.getElementById("websocketlog");

    document.getElementById('mainCanvas').width =  document.getElementById('canvasDiv').offsetWidth;
    document.getElementById('zoomCanvas').width =  document.getElementById('canvasDiv').offsetWidth;
    canvas = document.getElementById('mainCanvas');

    context = canvas.getContext('2d');
    canvasWidth = canvas.width;
    canvasStart = 0;
    canvasHeight = canvas.height;
    pixelData = new Array(); //time: ,line: , data,
 //   numberLoops = 0;
 //   ticIncrement = 10; // this gives a time increment of 1 ms per pixel //
 //   lineStart = canvasWidth/2; // bottom of tic line

    //setup origional time marks and time in the array
    /*    for(var i = 0; i  <=canvasHeight; i+=ticIncrement){
     if(i%50 == 0){
     pixelData[i] = {line : 25};
     }
     else{
     pixelData[i] = {line : 10};
     }
     }
     */
    testWebSocket();
    //  autoplot = setInterval(function(){movedata()},30);

}

function testWebSocket()
{
    websocket = new WebSocket(wsUri);
    websocket.onopen = function(evt) { onOpen(evt) };
    websocket.onclose = function(evt) { onClose(evt) };
    websocket.onmessage = function(evt) { onMessage(evt) };
    websocket.onerror = function(evt) { onError(evt) };

}

function onOpen(evt) {
    writeToScreen("CONNECTED");
   // autoplot = setInterval(function(){movedata()},30);

}

function onClose(evt) {
    writeToScreen("DISCONNECTED");
    clearInterval(autoplot);
}

function onMessage(evt)    {
    message = JSON.parse(evt.data);
    if(message.packetType == 'cuefiledata'){
        inMessage = message.data;
        pixelLoad(inMessage);
        canvasPlot();
    }
    else{
       writeToScreen(inMessage);
    }

}

function onError(evt) {
    writeToScreen('<span style="color: red;">ERROR:</span> ' + evt.data);
}

function doSend(message) {
    writeToScreen("SENT: " + message);  websocket.send(message);
}

function writeToScreen(message) {
    // get time of incoming cue
    lastCueTime = new Date();
////    output.innerHTML = message + "<BR>" + output.innerHTML;

    pixelData[canvasStart] = {data : message};



    //output.value = message+"<BR>"+output.value;
}

function loadclick(){
    websocket.send('EDIT');
    context.clearRect(0,0,canvasWidth,canvasHeight);
}

function pixelLoad(item){
    var count = 0;
    pixelArray = []; //clear the array

    if (item.length == 0) {
        console.log("not Found");
    }
    else {
        for(var i = 0; i< item.length; i++){
            pixelArray[count] =  item[i]; // stick the object into the array
            count++;
            //iterate over all of the OutData

            for(var j = 0; j < item[i].OutData.length; j++){
                var packet = {};
                //  packet.Time = new Date(new Date(item[i].Time) + item[i].OutData[j].Delay).toISOString();
                packet.Time = new Date(item[i].Time);
                packet.Time = new Date(packet.Time.setMilliseconds(packet.Time.getMilliseconds() + item[i].OutData[j].Delay)).toISOString();
                packet.Data = item[i].OutData[j];
                dir = item[i].OutData[j].Dir;
                port = item[i].OutData[j].Port.toUpperCase();
                showname = item[i].OutData[j].Showname;
                dataToSend = item[i].OutData[j].Dout;
                delay = item[i].OutData[j].Delay;
                if(dir ==""){
                    outstring = port + " " + showname + " " + dataToSend;
                }
                else{
                    outstring = port + " " + showname + " " + dir + " " + dataToSend;
                }

                packet.output = outstring;
                pixelArray[count] = packet;
                count++;
            }
        }

    }
    //sort array by time in case there are some re-done cues
    pixelArray.sort(function(a,b){
        return new Date(a.Time) - new Date(b.Time);
    });
}

function timeRound(time, interval){
    diff = new Date(time);
    diff.setMinutes(diff.getMinutes() + interval);
    diff.setSeconds(0);
    diff.setMilliseconds(0);
    return diff;
}

function timeDifference(time){
    return(new Date(time) - new Date(startTime));
}

function drawTimeLine(start, end){
    context.globalAlpha = 1;
    for(var i = 10; i< canvasWidth; i+=10){
        if (i % 100 == 0) {
            context.beginPath();
            context.strokeStyle = 'red';
            context.moveTo(i, canvasHeight / 2 - 10);
            context.lineTo(i, canvasHeight / 2 + 10);
            new Date().toLocaleTimeString().substring(0,8);
            context.fillText( new Date(new Date(start).setMilliseconds(new Date(start).getMilliseconds() + i*msPerPixelMain)).toLocaleTimeString().substring(0,8),i-15, canvasHeight/2+20);

            context.stroke();
        }

        else {
            context.beginPath();
            context.strokeStyle = 'black';
            context.moveTo(i, canvasHeight / 2 - 5);
            context.lineTo(i, canvasHeight / 2 + 5);
            context.stroke();
        }
    }

}

function drawData(){
    context.globalAlpha = 1;
    for(var i = 0; i< pixelArray.length; i++){
        if(pixelArray[i].output){//this is output data
            context.beginPath();
            context.strokeStyle = 'blue';
            x=timeDifference(pixelArray[i].Time);
            context.moveTo(timeDifference(pixelArray[i].Time)/msPerPixelMain, canvasHeight / 2 - 15);
            context.lineTo(timeDifference(pixelArray[i].Time)/msPerPixelMain, canvasHeight / 2 - 150);
            context.stroke();
        }
        else{
            context.beginPath();
            context.strokeStyle = 'green';
            x=timeDifference(pixelArray[i].Time);
            context.moveTo(timeDifference(pixelArray[i].Time)/msPerPixelMain, canvasHeight / 2 + 35);
            context.lineTo(timeDifference(pixelArray[i].Time)/msPerPixelMain, canvasHeight / 2 + 150);
            context.stroke();
        }

    }


}

function canvasPlot(){
    //plot all of the pixelArray data on the canvas
    //find time difference between first and last event.

    startTime = timeRound(pixelArray[0].Time, -0); //round down to nearest minute
    endTime = timeRound(pixelArray[pixelArray.length -1].Time, 1);

   //timeDifference = new Date(pixelArray[pixelArray.length -1].Time) - new Date(pixelArray[0].Time);
   // timeDifference = new Date(pixelArray[pixelArray.length -1].Time) - new Date(startTime);
    timediff = timeDifference(endTime);
    msPerPixelMain = timeDifference(endTime)/canvasWidth;
    t = msPerPixelMain;
    drawTimeLine(startTime, endTime);
    drawData();
}

function zoomChange(value){
    context.clearRect(0,0,canvasWidth,canvasHeight);
    drawTimeLine(startTime, endTime);
    drawData();
    context.fillStyle = 'gray';
    context.globalAlpha = 0.5;
    context.fillRect(0,0,(canvasWidth/2) * (value/100), canvasHeight);
    context.fillRect(canvasWidth - (canvasWidth/2) * (value/100),0, canvasWidth, canvasHeight);
    context.stroke();
    val = value;
    x = val;
}

