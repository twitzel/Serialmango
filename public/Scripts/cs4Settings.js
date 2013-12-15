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
    websocket.send('SEND RELAY 1 1');//
}
function relay1offbutton()
{
    websocket.send('SEND RELAY 1 0');//
}
function relay2onbutton()
{
    websocket.send('SEND RELAY 2 1');//
}
function relay2offbutton()
{
    websocket.send('SEND RELAY 2 0');//
}
function relay3onbutton()
{
    websocket.send('SEND RELAY 3 1');//
}
function relay3offbutton()
{
    websocket.send('SEND RELAY 3 0');//
}
function relay4onbutton()
{
    websocket.send('SEND RELAY 4 1');//
}
function relay4offbutton()
{
    websocket.send('SEND RELAY 4 0');//
}

//************************************  SMPTE  ******************************
function smpteonbutton()
{
    websocket.send('SEND SLAVE SMPTE ON');//
}

function smpteoffbutton()
{
    websocket.send('SEND SLAVE SMPTE OFF');//
}

//************************************  DAC  ******************************
function dac1button()
{
    var val = document.getElementById('dac1output').value;
    websocket.send('SEND SLAVE DAC1 ' + val + '');//
}

function dac2button()
{
    var val = document.getElementById('dac2output').value;
    websocket.send('SEND SLAVE DAC2 ' + val + '');//
}

//************************************  DMX  ******************************
function dmxchwatch()
{
    var val1 = document.getElementById('dmx1').value;
    var val2 = document.getElementById('dmx2').value;
    var val3 = document.getElementById('dmx3').value;
    websocket.send('SEND SLAVE DMX_CH ' + val1 +  " " + val2 + " " + val3 + '');//
}

//************************************  SEND TO DISPLAY  ******************************
function sendtext()
{
    var name = document.getElementById('showname').value.trim();
    var text = document.getElementById('texttosend').value.trim();

    websocket.send('SEND DISP ' + name +  " Text " + text + '');//
}

//************************************  SERIAL  ******************************
function sendserial1()
{
    var baud = document.getElementById('serial1baud').value;
    var text = document.getElementById('serial1data').value.trim();

    websocket.send('SEND SLAVE SER1 ' + baud +  " " + text + '');//
}

function sendserial2()
{
    var baud = document.getElementById('serial2baud').value;
    var text = document.getElementById('serial2data').value.trim();

    websocket.send('SEND SLAVE SER2 ' + baud +  " " + text + '');//
}

function sendserial3()
{
    var baud = document.getElementById('serial3baud').value;
    var text = document.getElementById('serial3data').value.trim();

    websocket.send('SEND SLAVE SER3 ' + baud +  " " + text + '');//
}

//************************************  STATUS  ******************************
function adc1button()
{
    websocket.send('SEND SLAVE ADC1');//
}
function adc2button()
{
    websocket.send('SEND SLAVE ADC2');//
}
function closure1button()
{
    websocket.send('SEND SLAVE CLOSURE1');//
}
function closure2button()
{
    websocket.send('SEND SLAVE CLOSURE2');//
}
function dmxbutton()
{
    websocket.send('SEND SLAVE DMX');//
}

//************************************  MIDI  ******************************
function midi1button()
{
    if(document.getElementById('light').checked)
    {
        var start = "SEND MIDI1 F07F05020101";
        var cue = document.getElementById('lightcuenumber').value.trim();

        for (var i = 0; i < cue.length; i ++)  // convert cue info to hex string be adding 0x30
        {
            if(cue[i] == ".")
            {
                start += "2E";
            }
            else
            {
                start += (parseInt(cue[i])  + 0x30).toString(16);
            }
        }
        start += "F7";

        websocket.send(start);
    }
    if(document.getElementById('noteon').checked)
    {
        websocket.send('SEND MIDI1 920403');
    }
    if(document.getElementById('noteoff').checked)
    {
        websocket.send('SEND MIDI1 821216');
    }
    if(document.getElementById('hex').checked)
    {
        var cue = document.getElementById('hexnumber').value.trim();
        websocket.send( "SEND MIDI1 " + cue)
    }
}

function midi2button()
{
    if(document.getElementById('light').checked)
    {
        var start = "SEND MIDI2 F07F05020101";
        var cue = document.getElementById('lightcuenumber').value.trim();

        for (var i = 0; i < cue.length; i ++)  // convert cue info to hex string be adding 0x30
        {
            if(cue[i] == ".")
            {
                start += "2E";
            }
            else
            {
                start += (parseInt(cue[i])  + 0x30).toString(16);
            }
        }
        start += "F7";

        websocket.send(start);
    }
    if(document.getElementById('noteon').checked)
    {
        websocket.send('SEND MIDI2 920403');
    }
    if(document.getElementById('noteoff').checked)
    {
        websocket.send('SEND MIDI2 821216');
    }
    if(document.getElementById('hex').checked)
    {
        var cue =document.getElementById('hexnumber').value.trim();
        websocket.send( "SEND MIDI2 " + cue)
    }
}