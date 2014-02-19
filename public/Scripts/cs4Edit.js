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
    var countTop = 0;
    var countBottom = 0;
    context.globalAlpha = 1;
    for(var i = 0; i< pixelArray.length; i++){
        context.beginPath();
        pixelX=timeDifference(pixelArray[i].Time, startTime)/msPerPixelMain;
        if(pixelArray[i].output){//this is output data
            countTop++;
            context.strokeStyle = 'blue';
            context.moveTo(pixelX, canvasHeight / 2 - 25);
            context.lineTo(pixelX, 15);
            if((countTop%5 ==0) || (countTop ==1)){
            wrapText(context, pixelArray[i].output, pixelX-1.5,canvasHeight/2-25,canvasHeight/2-25,10);
            }
        }
        else{      //this in cue input data
            countBottom++;
            context.strokeStyle = 'green';
            x=timeDifference(pixelArray[i].Time, startTime);
            context.moveTo(pixelX, canvasHeight / 2 + 25);
            context.lineTo(pixelX, canvasHeight - 5);
            if((countBottom%5 ==0) || (countBottom ==1)){
            wrapText(context, parseCue(pixelArray[i]), pixelX-1.5,canvasHeight  - 5,canvasHeight/2-25,10);
            }
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
            zoomcontext.fillText( new Date(new Date(startTime).setMilliseconds(new Date(startTime).getMilliseconds() + minPixel*msPerPixelMain + i*msPerPixelZoom)).toLocaleTimeString().substring(0,8),i-15, zoomcanvasHeight/2+20);
        }
        else {
            zoomcontext.strokeStyle = 'black';
            zoomcontext.moveTo(i, zoomcanvasHeight / 2 - 5);
            zoomcontext.lineTo(i, zoomcanvasHeight / 2 + 5);
        }
        zoomcontext.stroke();
    }

//now plot the data


    for(var i = 0; i< pixelArray.length; i++){
        zoomcontext.beginPath();



        if((new Date(pixelArray[i].Time) >=  new Date(startTimeZoom)) && (new Date(pixelArray[i].Time) <= new Date(endTimeZoom))){
            pixelX = timeDifference(pixelArray[i].Time,startTimeZoom)/msPerPixelZoom;
            if(pixelArray[i].output){//this is output data
                zoomcontext.strokeStyle = 'blue';
                zoomcontext.moveTo(pixelX, zoomcanvasHeight / 2 - 25);
                zoomcontext.lineTo(pixelX, 15);
               // rotateText(zoomcontext,pixelArray[i].output , pixelX-1.5, zoomcanvasHeight / 2 - 25);
                wrapText(zoomcontext, pixelArray[i].output, pixelX-1.5,zoomcanvasHeight/2-25,zoomcanvasHeight/2-25,10);
            }
            else{      //this in cue input data
                zoomcontext.strokeStyle = 'green';
                zoomcontext.moveTo(pixelX, zoomcanvasHeight / 2 + 25);
                zoomcontext.lineTo(pixelX, zoomcanvasHeight  - 5);
                wrapText(zoomcontext, parseCue(pixelArray[i]), pixelX-1.5,zoomcanvasHeight  - 5,zoomcanvasHeight/2-25,10);
               // rotateText(zoomcontext,parseCue(pixelArray[i]) , pixelX-1.5, zoomcanvasHeight  - 5);
            }
            zoomcontext.stroke();
        }
    }

}

function wrapText(cxt, text, x, y, maxWidth, lineHeight) {
    var words = text.split(" ");
    var line = "";

    for(var n = 0; n < words.length; n++) {
        var testLine = line + words[n] + " ";
        var metrics = cxt.measureText(testLine);
        var testWidth = metrics.width;
        if(testWidth > maxWidth) {
            cxt.save();
            cxt.rotate(-Math.PI/2);
            cxt.fillText(line, -y, x);//context.fillText(line, x, y);
            cxt.restore();
            line = words[n] + " ";
            x += lineHeight;
        }
        else {
            line = testLine;
        }
    }

    cxt.save();
    cxt.rotate(-Math.PI/2);
    cxt.fillText(line, -y, x);
    cxt.restore();
}
function rotateText(cxt,text, x,y){
   /* zoomcontext.save();
    zoomcontext.rotate(-Math.PI/2);
    zoomcontext.fillText(text,-y, x); // fix coordinates for rotated change
    zoomcontext.restore();
  */
    cxt.save();
    cxt.rotate(-Math.PI/2);
    cxt.fillText(text,-y, x, zoomcanvasHeight/2 -30); // fix coordinates for rotated change
    cxt.restore();
}
function parseCue(data){

    indata = data.InData;
    source = data.Source;
    // if cue is MIDI then get light cue number from hex string
    if (source.substr(0, 4) == "Midi") {
        if (indata.substr(0, 2) == "F0"){// this is a light cue
            var space = "                                    ";
            var hex = "";
            var type;

            for (var i = 18; i < indata.length - 3; i += 3) // extra space added to data at end of string
            {
                if (indata.substr(i,2) == 0x00){
                    hex += '*';
                }
                else{
                    hex += String.fromCharCode(parseInt(indata.substr(i, 2), 16));
                }
            }
            type = 'Cue: ' + hex;
        }
        else if (indata.substr(0, 1) == "8") {
            type = "Note Off";
        }
        else if (indata.substr(0, 1) == "9") {
            type = "Note On";
        }
        else if (indata.substr(0, 1) == "A") {
            type = "Polyphonic Aftertouch";
        }
        else if (indata.substr(0, 1) == "B") {
            type = "Control/Mode Change";
        }
        else if (indata.substr(0, 1) == "C") {
            type = "Program Change";
        }
        else if (indata.substr(0, 1) == "D") {
            type = "Channel Aftertouch";
        }
        else if (indata.substr(0, 1) == "E") {
            type = "Pitch Wheel Control";
        }
        return (source + "  " + type + " " + indata);
    }
    else // just send data
    {
        return (source + " " + indata);
    }

}