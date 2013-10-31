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

    output.innerHTML = message + "<BR>" + output.innerHTML.substr(0, 20000);


    //output.value = message+"<BR>"+output.value;
}


function cueclick1(message){
    var counter = parseInt(cuevalue1.value);
    var showName = document.getElementById('showname1').value.trim();
    var directory = document.getElementById('directory1').value.trim();
    var radioButtons = document.getElementsByName('output1');
    var dataFormat;
    var dataOut;

    for (var i = 0, length = radioButtons.length; i < length; i++) {
        if (radioButtons[i].checked) {

           dataFormat = (radioButtons[i].value);

            // get out of loop now that we have value
            break;
        }
    }

    if(dataFormat == 'r4slides'){
      dataOut =  "GO slide" + counter +".jpg NEXT slide"+(counter +1) +".jpg";
    }
    else if(dataFormat == 'r4audio'){
      dataOut = "GO audio" + counter + ".mp3";
    }
    cuevalue1.value = counter +1; //update the cue count
    delay = (new Date()-lastCueTime);
    websocket.send("{\"OutData\": [{\"Delay\": "+delay+" , \"Port\":\"Zig1\", \"Showname\":\""+ showName +"\", \"Dir\":\""+ directory +"\", \"Dout\":\"" + dataOut + "\"}]}");

}

function cueclick2(message){
    var counter = parseInt(cuevalue2.value);
    var showName = document.getElementById('showname2').value.trim();
    var directory = document.getElementById('directory2').value.trim();
    var radioButtons = document.getElementsByName('output2');
    var dataFormat;
    var dataOut;

    for (var i = 0, length = radioButtons.length; i < length; i++) {
        if (radioButtons[i].checked) {

            dataFormat = (radioButtons[i].value);

            // get out of loop now that we have value
            break;
        }
    }

    if(dataFormat == 'r4slides'){
        dataOut =  "GO slide" + counter +".jpg NEXT slide"+(counter +1) +".jpg";
    }
    else if(dataFormat == 'r4audio'){
        dataOut = "GO audio" + counter + ".mp3";
    }
    cuevalue2.value = counter +1; //update the cue count
    delay = (new Date()-lastCueTime);
    websocket.send("{\"OutData\": [{\"Delay\": "+delay+" , \"Port\":\"Zig1\", \"Showname\":\""+ showName +"\", \"Dir\":\""+ directory +"\", \"Dout\":\"" + dataOut + "\"}]}");

}

function cueclick3(message){
    var counter = parseInt(cuevalue3.value);
    var showName = document.getElementById('showname3').value.trim();
    var directory = document.getElementById('directory3').value.trim();
    var radioButtons = document.getElementsByName('output3');
    var dataFormat;
    var dataOut;

    for (var i = 0, length = radioButtons.length; i < length; i++) {
        if (radioButtons[i].checked) {

            dataFormat = (radioButtons[i].value);

            // get out of loop now that we have value
            break;
        }
    }

    if(dataFormat == 'r4slides'){
        dataOut =  "GO slide" + counter +".jpg NEXT slide"+(counter +1) +".jpg";
    }
    else if(dataFormat == 'r4audio'){
        dataOut = "GO audio" + counter + ".mp3";
    }
    cuevalue3.value = counter +1; //update the cue count
    delay = (new Date()-lastCueTime);
    websocket.send("{\"OutData\": [{\"Delay\": "+delay+" , \"Port\":\"Zig1\", \"Showname\":\""+ showName +"\", \"Dir\":\""+ directory +"\", \"Dout\":\"" + dataOut + "\"}]}");

}

function buttonClear(){
    output.innerHTML = "";
}
