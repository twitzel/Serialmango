var autoplot;
var pixelArray = [];
var startTime;
var msPerPixelMain;
var msPerPixelZoom;
var zoomFactor = 0;
var zoomLocation = 50;

window.onload = init;
function init(){

    wsUri = "ws://" + window.location.hostname + ":8080";
    output = document.getElementById("websocketlog");

    document.getElementById('mainCanvas').width =  document.getElementById('canvasDiv').offsetWidth;
    canvas = document.getElementById('mainCanvas');
    context = canvas.getContext('2d');
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;

    document.getElementById('zoomCanvas').width =  document.getElementById('canvasDiv').offsetWidth;
    zoomcanvas = document.getElementById('zoomCanvas');
    zoomcontext = zoomcanvas.getContext('2d');
    zoomcanvasWidth = zoomcanvas.width;
    zoomcanvasHeight = zoomcanvas.height;
    testWebSocket();
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
//  output.innerHTML = message + "<BR>" + output.innerHTML;





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

function timeDifference(time, start){
    return(new Date(time) - new Date(start));
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
        context.beginPath();
        if(pixelArray[i].output){//this is output data
            context.strokeStyle = 'blue';
            x=timeDifference(pixelArray[i].Time, startTime);
            context.moveTo(timeDifference(pixelArray[i].Time,startTime)/msPerPixelMain, canvasHeight / 2 - 15);
            context.lineTo(timeDifference(pixelArray[i].Time,startTime)/msPerPixelMain, canvasHeight / 2 - 150);

        }
        else{      //this in cue input data
            context.strokeStyle = 'green';
            x=timeDifference(pixelArray[i].Time, startTime);
            context.moveTo(timeDifference(pixelArray[i].Time,startTime)/msPerPixelMain, canvasHeight / 2 + 35);
            context.lineTo(timeDifference(pixelArray[i].Time,startTime)/msPerPixelMain, canvasHeight / 2 + 150);
            context.stroke();
        }
        context.stroke();
    }
}

function canvasPlot(){
    //plot all of the pixelArray data on the canvas
    //find time difference between first and last event.

    startTime = timeRound(pixelArray[0].Time, -0); //round down to nearest minute
    endTime = timeRound(pixelArray[pixelArray.length -1].Time, 1);

   //timeDifference = new Date(pixelArray[pixelArray.length -1].Time) - new Date(pixelArray[0].Time);
   // timeDifference = new Date(pixelArray[pixelArray.length -1].Time) - new Date(startTime);
    timediff = timeDifference(endTime, startTime);
    msPerPixelMain = timeDifference(endTime, startTime)/canvasWidth;
    t = msPerPixelMain;
    drawTimeLine(startTime, endTime);
    drawData();

}

function zoomChange(value){
    zoomFactor = value;
    updateCanvas();
}

function locationChange(value){
    zoomLocation = value;
    updateCanvas();
}

function updateCanvas(){
    context.clearRect(0,0,canvasWidth,canvasHeight);
    drawTimeLine(startTime, endTime);
    drawData();
    context.fillStyle = 'gray';
    context.globalAlpha = 0.5;
    offset = (canvasWidth/2) * (zoomFactor/100);
    shift = offset * (50 - zoomLocation)/50;
    minPixel = offset-shift;
    maxPixel = canvasWidth - (offset + shift);
    context.fillRect(0,0,minPixel, canvasHeight);
    context.fillRect(maxPixel,0, canvasWidth, canvasHeight);
    context.stroke();
    //Now put it in the zoomed canvas
    drawZoomTimeLine(minPixel , maxPixel );

}
/////////////////////////////////
function drawZoomTimeLine(start, end){
    zoomcontext.globalAlpha = 1;
    startTimeZoom =  new Date(new Date(startTime).setMilliseconds(new Date(startTime).getMilliseconds() + minPixel*msPerPixelMain));
    endTimeZoom =    new Date(new Date(startTime).setMilliseconds(new Date(startTime).getMilliseconds() + minPixel*msPerPixelMain + maxPixel*msPerPixelMain));
    msPerPixelZoom = (maxPixel - minPixel)*msPerPixelMain/zoomcanvasWidth;
    zoomcontext.clearRect(0,0,zoomcanvasWidth,zoomcanvasHeight);
    for(var i = 10; i< zoomcanvasWidth; i+=10){
        zoomcontext.beginPath();
        if (i % 100 == 0) {
            zoomcontext.strokeStyle = 'red';
            zoomcontext.moveTo(i, zoomcanvasHeight / 2 - 10);
            zoomcontext.lineTo(i, zoomcanvasHeight / 2 + 10);
            new Date().toLocaleTimeString().substring(0,8);
            zoomcontext.fillText( new Date(new Date(startTime).setMilliseconds(new Date(startTime).getMilliseconds() + minPixel*msPerPixelMain + i*msPerPixelZoom)).toLocaleTimeString().substring(0,8),i-15, canvasHeight/2+20);
        }

        else {
            zoomcontext.strokeStyle = 'black';
            zoomcontext.moveTo(i, canvasHeight / 2 - 5);
            zoomcontext.lineTo(i, canvasHeight / 2 + 5);

        }
        zoomcontext.stroke();
    }

//now plot the data


    for(var i = 0; i< pixelArray.length; i++){
        zoomcontext.beginPath();



        if((new Date(pixelArray[i].Time) >=  new Date(startTimeZoom)) && (new Date(pixelArray[i].Time) <= new Date(endTimeZoom))){
            if(pixelArray[i].output){//this is output data
                zoomcontext.strokeStyle = 'blue';
                zoomcontext.moveTo(timeDifference(pixelArray[i].Time,startTimeZoom)/msPerPixelZoom, zoomcanvasHeight / 2 - 15);
                zoomcontext.lineTo(timeDifference(pixelArray[i].Time,startTimeZoom)/msPerPixelZoom, zoomcanvasHeight / 2 - 150);

            }
            else{      //this in cue input data
                zoomcontext.strokeStyle = 'green';
                zoomcontext.moveTo(timeDifference(pixelArray[i].Time,startTimeZoom)/msPerPixelZoom, zoomcanvasHeight / 2 + 35);
                zoomcontext.lineTo(timeDifference(pixelArray[i].Time,startTimeZoom)/msPerPixelZoom, zoomcanvasHeight / 2 + 150);
            }
            zoomcontext.stroke();
        }
    }

}