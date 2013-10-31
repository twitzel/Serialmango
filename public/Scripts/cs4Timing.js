/**
 * Created by Steve on 10/29/13.
 */
//var wsUri = "ws://localhost:8080";//
var counter = 0;
var lastCueTime;
var delay;
var wsUri = "ws://" + window.location.hostname + ":8080";
var cuevalue1;
var cuevalue2;
var cuevalue3;


window.onload = init;
function init()
{
    output = document.getElementById("websocketlog");
    testWebSocket();
    cuevalue1 = document.getElementById("cue1");
    cuevalue2 = document.getElementById("cue2");
    cuevalue3 = document.getElementById("cue3");



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

    writeToScreen("CONNECTED TO CS4");

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
    if(message.substring(0,1) != ".") //make sure it's an incoming cue
    {
        lastCueTime = new Date();
    }

    output.innerHTML = message + "<BR>" + output.innerHTML;


    //output.value = message+"<BR>"+output.value;
}


function cueclick1(message){

    cuevalue1.value = parseInt(cuevalue1.value) +1;
    var dataFormat;
    var radioButtons = document.getElementsByName('output');
    for (var i = 0, length = radioButtons.length; i < length; i++) {
        if (radioButtons[i].checked) {

           dataFormat = (radioButtons[i].value);

            // get out of loop now that we have value
            break;
        }
    }

   // document.getElementById("body").style.backgroundColor =  '#550000';
    //   counter = parseInt(text1.value) + 1;

//    text1.value = counter;
//    delay = (new Date()-lastCueTime);

//    websocket.send("{\"OutData\": [{\"Delay\": "+delay+" , \"Port\":\"Zig1\", \"Showname\":\"MamaMia\", \"Dir\":\"English\", \"Dout\":\"GO slide" + counter +".jpg NEXT slide"+(counter +1) +".jpg\"}]}");
    websocket.send("{\"OutData\": [{\"Delay\": "+delay+" , \"Port\":\"Zig1\", \"Showname\":\"MamaMia\", \"Dir\":\"English\", \"Dout\":\"GO slide" + counter +".jpg NEXT slide"+(counter +1) +".jpg\"}]}");

//    textData.value = "{\"OutData\": [{\"Delay\": "+delay+" , \"Port\":\"Zig1\", \"Showname\":\"MamaMia\", \"Dir\":\"English\", \"Dout\":\"GO slide" + counter +".jpg NEXT slide"+(counter +1) +".jpg\"}]}";
}
