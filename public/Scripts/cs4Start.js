
//var wsUri = "ws://localhost:8080";//
var counter = 0;
var lastCueTime;
var delay;
var wsUri = "ws://" + window.location.hostname + ":8080";
//below from scroll
var canvas = document.getElementById('myCanvas');
var context = canvas.getContext('2d');
var canvasWidth = canvas.width;
var canvasStart = canvasWidth*.8;
var canvasHeight = canvas.height;
var pixelData = new Array(); //time: ,line: , data,
var numberLoops = 0;
var ticIncrement = 10; // this gives a time increment of 1 ms per pixel //
var lineStart = 180; // bottom of tic line


window.onload = init;
function init()
{
    output = document.getElementById("websocketlog");
    initScroll();
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
    pixelData(lineStart) = {data : message};

    //output.value = message+"<BR>"+output.value;
}
function buttonclick(message) {

    websocket.send("I got a que request I better do something");
    output.innerHTML = "Sent something out the websocket! -  order the sensors from amazon<br> This doesnt send until the button is released<br>"
        +output.innerHTML;
// text1.innerHTML = "button pressed " + "again" + text1.innerHTML;
    // text1.value = 1 + 5 +2;
    counter = parseInt(text1.value) + 1;
    if(isNaN(counter))
    {counter = 100;
    }
    text1.value = counter;


}

function cueclick(message){
    document.getElementById("body").style.backgroundColor =  '#550000';
 //   counter = parseInt(text1.value) + 1;
//    if(isNaN(counter))
//    {counter = 10 ;}
//    text1.value = counter;
//    delay = (new Date()-lastCueTime);

//    websocket.send("{\"OutData\": [{\"Delay\": "+delay+" , \"Port\":\"Zig1\", \"Showname\":\"MamaMia\", \"Dir\":\"English\", \"Dout\":\"GO slide" + counter +".jpg NEXT slide"+(counter +1) +".jpg\"}]}");

//    textData.value = "{\"OutData\": [{\"Delay\": "+delay+" , \"Port\":\"Zig1\", \"Showname\":\"MamaMia\", \"Dir\":\"English\", \"Dout\":\"GO slide" + counter +".jpg NEXT slide"+(counter +1) +".jpg\"}]}";
}
