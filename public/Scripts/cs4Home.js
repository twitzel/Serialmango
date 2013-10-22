/**
 * Created by Steve on 10/21/13.
 */

window.onload = init;
function init(){
    wsUri = "ws://" + window.location.hostname + ":8080";
    output = document.getElementById("websocketlog");

    canvas = document.getElementById('myCanvas');
    context = canvas.getContext('2d');
    canvasWidth = canvas.width;
    canvasStart = canvasWidth*.8;
    canvasHeight = canvas.height;
    pixelData = new Array(); //time: ,line: , data,
    numberLoops = 0;
    ticIncrement = 10; // this gives a time increment of 1 ms per pixel //
    lineStart = 180; // bottom of tic line

     //setup origional time marks and time in the array
    for(var i = 0; i  <=canvasStart; i+=ticIncrement){
        if(i%50 == 0){
            pixelData[i] = {line : 40};
        }
        else{
            pixelData[i] = {line : 20};
        }
    }
    testWebSocket();
    setInterval(function(){movedata()},30);
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
    writeToScreen('#{myuri}');
}

function onClose(evt) {
    writeToScreen("DISCONNECTED");
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
    output.innerHTML = message + "<BR>" + output.innerHTML;
    pixelData[canvasStart] = {data : message};

    //output.value = message+"<BR>"+output.value;
}

function movedata(){
    numberLoops++;
    pixelData.shift();  //movers everything over 1 px

    context.clearRect(0,0,canvas.width,canvas.height);
    if(numberLoops%100 == 0){
        pixelData[canvasStart] = {line : 40, time : new Date().toLocaleTimeString().substring(0,8)};
    }
    else if(numberLoops % ticIncrement == 0){
        pixelData[canvasStart] = {line : 20};
    }
    context.beginPath();

    for(var i = 0; i< pixelData.length; i++ ){
        if(pixelData[i]){
            if(pixelData[i].line){
                context.moveTo(i,lineStart);
                context.lineTo(i,lineStart -pixelData[i].line);
            }
            if(pixelData[i].time) {
                context.fillText(pixelData[i].time,i-21 ,192)

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