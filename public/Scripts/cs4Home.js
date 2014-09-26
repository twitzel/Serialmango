/**
 * Created by Steve on 10/21/13.
 */
var bkgnd = 0;
var dataPacket = {};
window.onload = init;
function init(){
    wsUri = "ws://" + window.location.hostname + ":8080";
    output = document.getElementById("websocketlog");
    //    context.canvas.width  = window.innerWidth;
    systemStatus = document.getElementById("test");
    testWebSocket();
    if(Test== 'test' || Test == 'Test'){

        document.getElementById('test').style.display = 'block';
        systemStatus.style.fontSize = "1.1em";
        systemStatus.style.color = "#5c5c5c";
        systemStatus.innerHTML = "&nbsp&nbsp&nbsp&nbspExternal IP address:&nbsp&nbsp".bold() + externalIP.bold();
        systemStatus.innerHTML = systemStatus.innerHTML + "<BR>"+ "&nbsp&nbsp&nbsp&nbspInternal IP address:&nbsp&nbsp".bold() + internalIP.bold();
    }
    else{
        document.getElementById('test').style.display = "none";
    }
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
    output.innerHTML = "";
    writeToScreen("CONNECTED TO CS4");
    // change background color on connection
    var logweb = document.getElementById('websocketlog')
    logweb.style.backgroundColor = '#ececec';
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
    if(message.substr(0,1) != '*' ){
        document.body.style.cursor  = 'default';
    }
}


function buttonClear(){
    output.innerHTML = "";
}

function buttonLog(){
    output.innerHTML = "";
    dataPacket.Type = 'LOG';
    websocket.send(JSON.stringify(dataPacket));//request logfile
    document.body.style.cursor  = 'wait';
}

function buttonLog100(){
    output.innerHTML = "";
    dataPacket.Type = 'LOG 1000';
    websocket.send(JSON.stringify(dataPacket));//request logfile
    document.body.style.cursor  = 'wait';
}

function buttonBackground(){
    if(bkgnd == 0){
        document.getElementById("body").style.backgroundColor =  '#474747';
        document.getElementById("websocketlog").style.backgroundColor =  '#505050';
        bkgnd = 1;
    }
    else{
        document.getElementById("body").style.backgroundColor =  '#ffffff';
        document.getElementById("websocketlog").style.backgroundColor =  '#ececec';
        bkgnd = 0;
    }

}