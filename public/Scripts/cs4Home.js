/**
 * Created by Steve on 10/21/13.
 */
var counter = 0;
var lastCueTime;
var delay;
var wsUri = "ws://" + window.location.hostname + ":8080";



window.onload = init;
function init(){
    output = document.getElementById("websocketlog");
    testWebSocket();}

function testWebSocket(){
    websocket = new WebSocket(wsUri);
    websocket.onopen = function(evt) { onOpen(evt) };
    websocket.onclose = function(evt) { onClose(evt) };
    websocket.onmessage = function(evt) { onMessage(evt) };
    websocket.onerror = function(evt) { onError(evt) };
}

function onOpen(evt) {
    writeToScreen("CONNECTED");
}

function onClose(evt) {
    writeToScreen("DISCONNECTED");
    setTimeout(init(),500); // if disconnected - wait 500 ms then try to connect again
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
 //   output.innerHTML = message + "<BR>" + output.innerHTML;
    //output.value = message+"<BR>"+output.value;
}