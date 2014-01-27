/**
 * Created by Steve on 10/28/13.
 */
var status;
var autoplot;
window.onload = init;
function init(){

    wsUri = "ws://" + window.location.hostname + ":8080";
    output = document.getElementById("websocketlog");

    document.getElementById('myCanvas').width =  document.getElementById('canvasDiv').offsetWidth;
    canvas = document.getElementById('myCanvas');

    context = canvas.getContext('2d');
    canvasWidth = canvas.width;
    canvasStart = 0;
    canvasHeight = canvas.height;
    pixelData = new Array(); //time: ,line: , data,
    numberLoops = 0;
    ticIncrement = 10; // this gives a time increment of 1 ms per pixel //
    lineStart = canvasWidth/2; // bottom of tic line

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
    autoplot = setInterval(function(){movedata()},30);

}

function onClose(evt) {
    writeToScreen("DISCONNECTED");
    clearInterval(autoplot);
}

function onMessage(evt)    {
    writeToScreen(evt.data);
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

function movedata(){
    numberLoops++;

    pixelData.unshift({null:1});  //movers everything over 1 px
    while(pixelData.length > canvasHeight){
        pixelData.pop(); // keep the array size fixed to canvas height
    }

    context.clearRect(0,0,canvas.width,canvas.height);
    if(numberLoops%100 == 0){
        pixelData[canvasStart+1] = { time : new Date().toLocaleTimeString().substring(0,8)};
    }
    else if(numberLoops % ticIncrement == 0){
        pixelData[canvasStart] = {line : 10};
    }
    context.beginPath();

    for(var i = 0; i< pixelData.length; i++ ){
        if(pixelData[i]){
            if(pixelData[i].line==10){

                context.moveTo(lineStart, i);
                context.lineTo(lineStart -pixelData[i].line, i );
            }
            else if(pixelData[i].line==25){

                context.moveTo(lineStart+7, i);
                context.lineTo(lineStart+7 -pixelData[i].line, i );
            }
            else if(pixelData[i].time) {
                context.fillStyle = "red";
                context.fillText(pixelData[i].time,lineStart-25, i+3)

            }
            else if(pixelData[i].data){
                var test = pixelData[i].data.substring(0,6);
                if(pixelData[i].data.substring(0,6) == "  Sent")
                {
                    context.fillStyle = "blue";
                    wrapText(context,pixelData[i].data.substring(54, pixelData[i].data.length -2),i+5,lineStart+25,lineStart-25,10);//get rid of extraneous stuff before writing
                }
                else
                {
                    context.fillStyle = "black";
                    //context.fillText(pixelData[i].data.substr(25),lineStart-350, i)
                    var metrics = context.measureText(pixelData[i].data.substr(25)); // get actual length on line
                    var start;
                    if (metrics.width > lineStart)
                    {
                        start = 10;
                    }
                    else
                    {
                        start = lineStart-metrics.width-30;
                    }
                    var len = metrics.width;
                   // context.fillText(pixelData[i].data.substr(25),lineStart-metrics.width-23, i)


                   wrapText(context,pixelData[i].data.substring(25),i+5,start,lineStart-25,10);




                }
            }
        }
    }
    context.stroke();
    //add starting line
    context.beginPath();
    context.strokeStyle = 'red';
    context.moveTo(canvasStart, 0);
    context.lineTo(canvasStart, canvasHeight);
    context.stroke();
    context.strokeStyle = 'black';

    context.stroke();
}

function resize_canvas()
{
    document.getElementById('myCanvas').width =  document.getElementById('canvasDiv').offsetWidth;
    lineStart = document.getElementById('myCanvas').width/2;
}

function wrapText(context, text, y, x, maxWidth, lineHeight) {
    var words = text.split(" ");
    var line = "";

    for(var n = 0; n < words.length; n++) {
        var testLine = line + words[n] + " ";
        var metrics = context.measureText(testLine);
        var testWidth = metrics.width;
        if(testWidth > maxWidth) {

            context.fillText(line, x, y);
            line = words[n] + " ";
            y += lineHeight;
        }
        else {
            line = testLine;
        }
    }
      context.fillText(line, x, y);
}