/**
 * Created by Steve on 12/10/13.
 */
window.onload = init;
function init(){
    wsUri = "ws://" + window.location.hostname + ":8080";
    output = document.getElementById("websocketlog");
    //    context.canvas.width  = window.innerWidth;

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
}

//************************************  RELAYS ******************************
function relay1onbutton()
{
    websocket.send('SEND RELAY 1 1\r');//
}
function relay1offbutton()
{
    websocket.send('SEND RELAY 1 0\r');//
}
function relay2onbutton()
{
    websocket.send('SEND RELAY 2 1\r');//
}
function relay2offbutton()
{
    websocket.send('SEND RELAY 2 0\r');//
}
function relay3onbutton()
{
    websocket.send('SEND RELAY 3 1\r');//
}
function relay3offbutton()
{
    websocket.send('SEND RELAY 3 0\r');//
}
function relay4onbutton()
{
    websocket.send('SEND RELAY 4 1\r');//
}
function relay4offbutton()
{
    websocket.send('SEND RELAY 4 0\r');//
}

//************************************  SMPTE  ******************************
function smpteonbutton()
{
    websocket.send('SEND SLAVE SMPTE ON\r');//
}

function smpteoffbutton()
{
    websocket.send('SEND SLAVE SMPTE OFF\r');//
}

//************************************  DAC  ******************************
function dac1button()
{
    var val = document.getElementById('dac1output').value;
    websocket.send('SEND SLAVE DAC1 ' + val + '\r');//
}

function dac2button()
{
    var val = document.getElementById('dac2output').value;
    websocket.send('SEND SLAVE DAC2 ' + val + '\r');//
}

//************************************  DMX  ******************************
function dmxchwatch()
{
    var val1 = document.getElementById('dmx1').value;
    var val2 = document.getElementById('dmx2').value;
    var val3 = document.getElementById('dmx3').value;
    websocket.send('SEND SLAVE DMX_CH ' + val1 +  " " + val2 + " " + val3 + '\r');//
}

//************************************  SEND TO DISPLAY  ******************************
function sendtext()
{
    var name = document.getElementById('showname').value.trim();
    var text = document.getElementById('texttosend').value.trim();

    websocket.send('SEND DISP ' + name +  " Text " + text + '\r');//
}

//************************************  SERIAL  ******************************
function sendserial1()
{
    var baud = document.getElementById('serial1baud').value;
    var text = document.getElementById('serial1data').value.trim();

    websocket.send('SEND SLAVE SER1 ' + baud +  " " + text + '\r');//
}

function sendserial2()
{
    var baud = document.getElementById('serial2baud').value;
    var text = document.getElementById('serial2data').value.trim();

    websocket.send('SEND SLAVE SER2 ' + baud +  " " + text + '\r');//
}

function sendserial3()
{
    var baud = document.getElementById('serial3baud').value;
    var text = document.getElementById('serial3data').value.trim();

    websocket.send('SEND SLAVE SER3 ' + baud +  " " + text + '\r');//
}