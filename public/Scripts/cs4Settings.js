/**
 * Created by Steve on 12/10/13.
 */
window.onload = init;
var autocount;
var autocue;
var dataToShow = "";
var bkgnd = 0;
var dataPacket = {};


function init(){
    wsUri = "ws://" + window.location.hostname + ":8080";
    output = document.getElementById("websocketlog");
    //    context.canvas.width  = window.innerWidth;
    if(cs4Settings) {
       // cs4Settings = JSON.parse(cs4Settings.replace(/&quot;/g, '"').replace(/&#34;/g, '"'));
        // load the sysetm parameters into the fieldset

        if(cs4Settings.enableZigbee2 == "YES"){
            document.getElementById("zigbeemonitoryes").checked = true;
        }
        else if(cs4Settings.enableZigbee2 == "NO"){
            document.getElementById("zigbeemonitorno").checked = true;
        }

        if(cs4Settings.ignoreSource == "YES"){
            document.getElementById("inputsourceyes").checked = true;
        }
        else if(cs4Settings.ignoreSource == "NO"){
            document.getElementById("inputsourceno").checked = true;
        }
        document.getElementById("email").value = cs4Settings.emailAddress;
        document.getElementById("startupdmx1").value = cs4Settings.dmx1;
        document.getElementById("dmx1").value = cs4Settings.dmx1;
        document.getElementById("startupdmx2").value = cs4Settings.dmx2;
        document.getElementById("dmx2").value = cs4Settings.dmx2;
        document.getElementById("startupdmx3").value = cs4Settings.dmx3;
        document.getElementById("dmx3").value = cs4Settings.dmx3;
        document.getElementById("testtimeselect").value = cs4Settings.testTime;
        document.getElementById("systemname").value = cs4Settings.systemName;
        document.getElementById("emailAccount").value = cs4Settings.emailAccount;
        document.getElementById("emailAccountPassword").value = cs4Settings.emailAccountPassword;

        document.getElementById("timeZoneCombo").value = cs4Settings.timezone;

        document.getElementById("midisysex1").value = cs4Settings.midisex1;
        document.getElementById("deviceIDLow1").value = cs4Settings.deviceIDLow1;
        document.getElementById("deviceIDHigh1").value = cs4Settings.deviceIDHigh1;
        document.getElementById("type1").value = cs4Settings.type1;
        document.getElementById("commandformat1").value = cs4Settings.commandformat1;
        document.getElementById("command1").value = cs4Settings.command1;

        document.getElementById("sysexcuelist1").value = cs4Settings.sysexcuelist1;
        document.getElementById("cuelistnumber1a").value = cs4Settings.cuelistnumber1a;
        document.getElementById("cuelistnumber1b").value = cs4Settings.cuelistnumber1b;
        document.getElementById("cuelistnumber1c").value = cs4Settings.cuelistnumber1c;

        document.getElementById("nonsysex1").value = cs4Settings.nonsysex1;
        document.getElementById("nonsysextype1").value = cs4Settings.nonsysextype1;
        document.getElementById("nonsysexchannel1").value = cs4Settings.nonsysexchannel1;

        document.getElementById("midisysex2").value = cs4Settings.midisex2;
        document.getElementById("deviceIDLow2").value = cs4Settings.deviceIDLow2;
        document.getElementById("deviceIDHigh2").value = cs4Settings.deviceIDHigh2;
        document.getElementById("type2").value = cs4Settings.type2;
        document.getElementById("commandformat2").value = cs4Settings.commandformat2;
        document.getElementById("command2").value = cs4Settings.command2;
        document.getElementById("nonsysex2").value = cs4Settings.nonsysex2;
        document.getElementById("nonsysextype2").value = cs4Settings.nonsysextype2;
        document.getElementById("nonsysexchannel2").value = cs4Settings.nonsysexchannel2;

        document.getElementById("midisysex3").value = cs4Settings.midisex3;
        document.getElementById("deviceIDLow3").value = cs4Settings.deviceIDLow3;
        document.getElementById("deviceIDHigh3").value = cs4Settings.deviceIDHigh3;
        document.getElementById("type3").value = cs4Settings.type3;
        document.getElementById("commandformat3").value = cs4Settings.commandformat3;
        document.getElementById("command3").value = cs4Settings.command3;
        document.getElementById("nonsysex3").value = cs4Settings.nonsysex3;
        document.getElementById("nonsysextype3").value = cs4Settings.nonsysextype3;
        document.getElementById("nonsysexchannel3").value = cs4Settings.nonsysexchannel3;

        document.getElementById("midisysex4").value = cs4Settings.midisex4;
        document.getElementById("deviceIDLow4").value = cs4Settings.deviceIDLow4;
        document.getElementById("deviceIDHigh4").value = cs4Settings.deviceIDHigh4;
        document.getElementById("type4").value = cs4Settings.type4;
        document.getElementById("commandformat4").value = cs4Settings.commandformat4;
        document.getElementById("command4").value = cs4Settings.command4;
        document.getElementById("nonsysex4").value = cs4Settings.nonsysex4;
        document.getElementById("nonsysextype4").value = cs4Settings.nonsysextype4;
        document.getElementById("nonsysexchannel4").value = cs4Settings.nonsysexchannel4;
        midisysexchange1();

        sysexcuelistchange1();

        nonsysexchange1();
        midisysexchange2();
        nonsysexchange2();
        midisysexchange3();
        nonsysexchange3();
        midisysexchange4();
        nonsysexchange4();

    }
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
    if(evt.data == "Data Ready To Download"){
        downLoadFiles();
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
    dataToShow =  message + "<BR>" + dataToShow;
    output.innerHTML = dataToShow;
       // output.innerHTML = message + "<BR>" + output.innerHTML;
}

function buttonClear(){
    output.innerHTML = "";
    dataToShow = "";
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

function buttonStartupParameters(){
    document.getElementById("setup").style.display = "block";
}

//************************************  Startup Parameters ******************************
function saveParameters(){
    if(document.getElementById('inputsourceno').checked){
        cs4Settings.ignoreSource = "NO";
    }
    else{
        cs4Settings.ignoreSource = "YES"
    }
    if(document.getElementById('zigbeemonitorno').checked){
        cs4Settings.enableZigbee2 = "NO";
    }
    else{
        cs4Settings.enableZigbee2 = "YES"
    }
    cs4Settings.emailAddress = document.getElementById('email').value;
    cs4Settings.dmx1 = document.getElementById('startupdmx1').value;
    cs4Settings.dmx2 = document.getElementById('startupdmx2').value;
    cs4Settings.dmx3 = document.getElementById('startupdmx3').value;
    cs4Settings.testTime = document.getElementById("testtimeselect").value;
    cs4Settings.systemName = document.getElementById("systemname").value;
    cs4Settings.emailAccount = document.getElementById("emailAccount").value;
    cs4Settings.emailAccountPassword = document.getElementById("emailAccountPassword").value;
    cs4Settings.timezone = document.getElementById("timeZoneCombo").value;
    
    cs4Settings.midisex1 = document.getElementById("midisysex1").value;
    cs4Settings.deviceIDLow1 = document.getElementById("deviceIDLow1").value;
    cs4Settings.deviceIDHigh1 = document.getElementById("deviceIDHigh1").value;
    cs4Settings.type1 = document.getElementById("type1").value;
    cs4Settings.commandformat1 = document.getElementById("commandformat1").value;
    cs4Settings.command1 = document.getElementById("command1").value;

    cs4Settings.sysexcuelist1 = document.getElementById("sysexcuelist1").value;
    if(cs4Settings.sysexcuelist1 == null || cs4Settings.sysexcuelist1 == ""){cs4Settings.sysexcuelist1 = "0"}; // always make sure it is a   value
    cs4Settings.cuelistnumber1a = document.getElementById("cuelistnumber1a").value;
    if(cs4Settings.cuelistnumber1a == null || cs4Settings.cuelistnumber1a == ""){cs4Settings.cuelistnumber1a = "0"};
    cs4Settings.cuelistnumber1b = document.getElementById("cuelistnumber1b").value;
    if(cs4Settings.cuelistnumber1b == null || cs4Settings.cuelistnumber1b == ""){cs4Settings.cuelistnumber1b = "0"};
    cs4Settings.cuelistnumber1c = document.getElementById("cuelistnumber1c").value;
    if(cs4Settings.cuelistnumber1c == null || cs4Settings.cuelistnumber1c == ""){cs4Settings.cuelistnumber1c = "0"};

    cs4Settings.nonsysex1 = document.getElementById("nonsysex1").value;
    cs4Settings.nonsysextype1 = document.getElementById("nonsysextype1").value;
    cs4Settings.nonsysexchannel1 = document.getElementById("nonsysexchannel1").value;

    cs4Settings.midisex2 = document.getElementById("midisysex2").value;
    cs4Settings.deviceIDLow2 = document.getElementById("deviceIDLow2").value;
    cs4Settings.deviceIDHigh2 = document.getElementById("deviceIDHigh2").value;
    cs4Settings.type2 = document.getElementById("type2").value;
    cs4Settings.commandformat2 = document.getElementById("commandformat2").value;
    cs4Settings.command2 = document.getElementById("command2").value;
    cs4Settings.nonsysex2 = document.getElementById("nonsysex2").value;
    cs4Settings.nonsysextype2 = document.getElementById("nonsysextype2").value;
    cs4Settings.nonsysexchannel2 = document.getElementById("nonsysexchannel2").value;
    
    cs4Settings.midisex3 = document.getElementById("midisysex3").value;
    cs4Settings.deviceIDLow3 = document.getElementById("deviceIDLow3").value;
    cs4Settings.deviceIDHigh3 = document.getElementById("deviceIDHigh3").value;
    cs4Settings.type3 = document.getElementById("type3").value;
    cs4Settings.commandformat3 = document.getElementById("commandformat3").value;
    cs4Settings.command3 = document.getElementById("command3").value;
    cs4Settings.nonsysex3 = document.getElementById("nonsysex3").value;
    cs4Settings.nonsysextype3 = document.getElementById("nonsysextype3").value;
    cs4Settings.nonsysexchannel3 = document.getElementById("nonsysexchannel3").value;

    cs4Settings.midisex4 = document.getElementById("midisysex4").value;
    cs4Settings.deviceIDLow4 = document.getElementById("deviceIDLow4").value;
    cs4Settings.deviceIDHigh4 = document.getElementById("deviceIDHigh4").value;
    cs4Settings.type4 = document.getElementById("type4").value;
    cs4Settings.commandformat4 = document.getElementById("commandformat4").value;
    cs4Settings.command4 = document.getElementById("command4").value;
    cs4Settings.nonsysex4 = document.getElementById("nonsysex4").value;
    cs4Settings.nonsysextype4 = document.getElementById("nonsysextype4").value;
    cs4Settings.nonsysexchannel4 = document.getElementById("nonsysexchannel4").value;

    dataPacket.Type ='SETTINGS';
    dataPacket.Data = cs4Settings;
    websocket.send(JSON.stringify(dataPacket));
}

function closeParameters(){
    //document.getElementById("setup").style.display = "none";
    location.reload();
}

//************************************  RELAYS ******************************
function relay1onbutton(){
    dataPacket.Type = 'SEND' ;
    dataPacket.Data = 'RELAY 1 1'
    websocket.send(JSON.stringify(dataPacket));//
}
function relay1offbutton(){
    dataPacket.Type ='SEND' ;
    dataPacket.Data = 'RELAY 1 0';
    websocket.send(JSON.stringify(dataPacket));//
}
function relay2onbutton(){
    dataPacket.Type ='SEND';
    dataPacket.Data = 'RELAY 2 1';
    websocket.send(JSON.stringify(dataPacket));//
}
function relay2offbutton(){
    dataPacket.Type ='SEND';
    dataPacket.Data = 'RELAY 2 0';
    websocket.send(JSON.stringify(dataPacket));
}
function relay3onbutton(){
    dataPacket.Type ='SEND';
    dataPacket.Data = 'RELAY 3 1';
    websocket.send(JSON.stringify(dataPacket));
}
function relay3offbutton(){
    dataPacket.Type ='SEND';
    dataPacket.Data = 'RELAY 3 0';
    websocket.send(JSON.stringify(dataPacket));
}
function relay4onbutton(){
    dataPacket.Type ='SEND';
    dataPacket.Data = 'RELAY 4 1';
    websocket.send(JSON.stringify(dataPacket));
}
function relay4offbutton(){
    dataPacket.Type ='SEND';
    dataPacket.Data = 'RELAY 4 0';
    websocket.send(JSON.stringify(dataPacket));
}

//************************************  SMPTE  ******************************
function smpteonbutton(){
    dataPacket.Type ='SEND';
    dataPacket.Data = 'SLAVE SMPTE ON';
    websocket.send(JSON.stringify(dataPacket));
}

function smpteoffbutton(){
    dataPacket.Type ='SEND';
    dataPacket.Data = 'SLAVE SMPTE OFF';
    websocket.send(JSON.stringify(dataPacket));
}

//************************************  DAC  ******************************
function dac1button(){

    dataPacket.Type ='SEND';
    dataPacket.Data = 'SLAVE DAC1 ';
    dataPacket.Data += document.getElementById('dac1output').value + '';
    websocket.send(JSON.stringify(dataPacket));
}

function dac2button(){
    dataPacket.Type ='SEND';
    dataPacket.Data = 'SLAVE DAC2 ';
    dataPacket.Data += document.getElementById('dac2output').value + '';
    websocket.send(JSON.stringify(dataPacket));
}

//************************************  DMX  ******************************
function dmxchwatch(){
    dataPacket.Type ='SEND' ;
    var val1 = document.getElementById('dmx1').value;
    var val2 = document.getElementById('dmx2').value;
    var val3 = document.getElementById('dmx3').value;
    dataPacket.Data = 'SLAVE DMX_CH ' + val1 +  " " + val2 + " " + val3 + '';
    websocket.send(JSON.stringify(dataPacket));
}

//************************************  SEND TO DISPLAY  ******************************
function sendtext(){
    dataPacket.Type ='SEND';
    var name = document.getElementById('showname').value.trim();
    var text = document.getElementById('texttosend').value.trim();
    dataPacket.Data = 'DISP ' + name +  " Text " + text + '';
    websocket.send(JSON.stringify(dataPacket));
}

//************************************  SERIAL  ******************************
function sendserial(){
    dataPacket.Type ='SEND';
    dataPacket.Data = document.getElementById("serialselect").value;
    dataPacket.Data += document.getElementById("baudselect").value;
    dataPacket.Data += document.getElementById("parityselect").value;
    if(document.getElementById('asciiselect').checked){
        dataPacket.Data += ' A ';
    }
    else{
        dataPacket.Data += ' H ';
    }
    dataPacket.Data += document.getElementById('message').value.trim();
    dataPacket.Data += '';
    websocket.send(JSON.stringify(dataPacket));
}
function sendserial1(){
    dataPacket.Type ='SEND';
    var baud = document.getElementById('serial1baud').value;
    var text = document.getElementById('serial1data').value.trim();
    dataPacket.Data =  'SLAVE SER1 ' + baud +  " " + text + '';
    websocket.send(JSON.stringify(dataPacket));
}

function sendserial2(){
    dataPacket.Type ='SEND';
    var baud = document.getElementById('serial2baud').value;
    var text = document.getElementById('serial2data').value.trim();
    dataPacket.Data = 'SLAVE SER2 ' + baud +  " " + text + '';
    websocket.send(JSON.stringify(dataPacket));
}

function sendserial3(){
    dataPacket.Type ='SEND' ;
    var baud = document.getElementById('serial3baud').value;
    var text = document.getElementById('serial3data').value.trim();
    dataPacket.Data = 'SLAVE SER3 ' + baud +  " " + text + '';
    websocket.send(JSON.stringify(dataPacket));
}

//************************************  STATUS  ******************************
function adc1button(){
    dataPacket.Type ='SEND' ;
    dataPacket.Data = 'SLAVE ADC1'
    websocket.send(JSON.stringify(dataPacket));
}
function adc2button(){
    dataPacket.Type ='SEND';
    dataPacket.Data =  'SLAVE ADC2';
    websocket.send(JSON.stringify(dataPacket));
}
function closure1button(){
    dataPacket.Type ='SEND';
    dataPacket.Data = 'SLAVE CLOSURE1';
    websocket.send(JSON.stringify(dataPacket));
}
function closure2button(){
    dataPacket.Type ='SEND';
    dataPacket.Data = 'SLAVE CLOSURE2';
    websocket.send(JSON.stringify(dataPacket));
}

function dmxbutton(){
    dataPacket.Type ='SEND';
    dataPacket.Data = 'SLAVE DMX';
    websocket.send(JSON.stringify(dataPacket));
}

//************************************  MIDI  ******************************
function midi1button(){
    if(document.getElementById('light').checked)
    {
        var start = "MIDI1 F07F05020101";
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
        dataPacket.Type ='SEND';
        dataPacket.Data = start;
        websocket.send(JSON.stringify(dataPacket));
    }
    if(document.getElementById('noteon').checked)
    {
        dataPacket.Type ='SEND';
        dataPacket.Data ='MIDI1 920403';
            websocket.send(JSON.stringify(dataPacket));
    }
    if(document.getElementById('noteoff').checked)
    {
        dataPacket.Type ='SEND';
        dataPacket.Data =' MIDI1 821216';
        websocket.send(JSON.stringify(dataPacket));
    }
    if(document.getElementById('hex').checked)
    {
        dataPacket.Type ="SEND";
        var cue = document.getElementById('hexnumber').value.trim();
        dataPacket.Data = 'MIDI1 ' + cue;
        websocket.send(JSON.stringify(dataPacket));
    }
}

function midi2button(){
    if(document.getElementById('light').checked)
    {
        var start = "MIDI2 F07F05020101";
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

        dataPacket.Type ='SEND';
        dataPacket.Data = start;
        websocket.send(JSON.stringify(dataPacket));
    }
    if(document.getElementById('noteon').checked)
    {
        dataPacket.Type ='SEND';
        dataPacket.Data = 'MIDI2 920403';
        websocket.send(JSON.stringify(dataPacket));
    }
    if(document.getElementById('noteoff').checked)
    {
        dataPacket.Type ='SEND';
        dataPacket.Data = 'MIDI2 821216';
        websocket.send(JSON.stringify(dataPacket));
    }
    if(document.getElementById('hex').checked)
    {
        dataPacket.Type ="SEND";
        var cue =document.getElementById('hexnumber').value.trim();
        dataPacket.Data = 'MIDI2' + cue;
        websocket.send(JSON.stringify(dataPacket));
    }
}

function sendMidiAuto(){
    if((document.getElementById('sendMidiAuto').innerHTML == "Send Midi Auto") ||(document.getElementById('sendMidiAuto').innerHTML == "Send Midi 1 Auto") ){
        document.getElementById('sendMidiAuto').innerHTML = "Stop Midi Auto"  ;
        document.getElementById("sendMidiAuto").style.background='#FF0000';
        midiAuto(); //start settimeout and repeats forever -- unless stopped
    }
    else{
        document.getElementById('sendMidiAuto').innerHTML = "Send Midi Auto"  ;
        clearTimeout(autocount);
        document.getElementById("sendMidiAuto").style.background='#F1F1F1';
    }
}

function midiAuto(){
    var start = "MIDI1 F07F05020101";
    var cue = document.getElementById('cuenumber').value.trim();
    var temp = document.getElementById('sendMidiAuto');

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
    dataPacket.Type = 'SEND';
    dataPacket.Data = start;
    websocket.send(JSON.stringify(dataPacket));

    autocount = setTimeout(function(){midiAuto()}, parseInt(document.getElementById('cuetime').value)*1000);
    document.getElementById('cuenumber').value = parseInt(document.getElementById('cuenumber').value) +1;

    if(parseInt(document.getElementById('cuenumber').value)> 1000){
        document.getElementById('cuenumber').value = 1; //count to 1000 then repeat
    }
}

function r4CueAuto(message){
    if(document.getElementById('r4CueAuto').innerHTML == "Send Cue Auto"){
        document.getElementById('r4CueAuto').innerHTML = "Stop Cue Auto"  ;
        document.getElementById("r4CueAuto").style.background='#FF0000';
        cueAuto('Auto'); //start settimeout and repeats forever -- unless stopped

    }
    else{
        document.getElementById('r4CueAuto').innerHTML = "Send Cue Auto"  ;
        clearTimeout(autocue);
        document.getElementById("r4CueAuto").style.background='#F1F1F1';
    }
}

function r4CueManual(message){
    cueAuto('Manual'); //
}
function cueAuto(type){ //now it's mis named only sends once.
    var counter = parseInt(cue.value);
    var showName = document.getElementById('showname').value.trim();
    var directory = document.getElementById('directory').value.trim();
    var radioButtons = document.getElementsByName('outputcue');
    var dataFormat;
    var dataOut;

    for (var i = 0, length = radioButtons.length; i < length; i++) {
        if (radioButtons[i].checked) {

            dataFormat = (radioButtons[i].value);

            // get out of loop now that we have value
            break;
        }
    }

    if(dataFormat == 'r4slidescue'){
        dataOut =  "GO slide" + counter +".jpg NEXT slide"+(counter +1) +".jpg";
    }
    else if(dataFormat == 'r4audiocue'){
        dataOut = "GO audA" + counter + ".mp3";
    }
    cue.value = counter +1; //update the cue count
   // delay = (new Date()-lastCueTime);
    dataPacket.Type ='SEND';
    dataPacket.Data = 'ZIG1' + ' ' + showName + ' ' + directory + ' ' + dataOut;
    websocket.send(JSON.stringify(dataPacket));
    if(type != 'Manual'){
        autocue = setTimeout(function(){cueAuto()}, parseInt(document.getElementById('delay').value)*1000);
    }
}


function copyToUSB(){
    dataPacket.Type ="COPYTOUSB";
    websocket.send(JSON.stringify(dataPacket));
}

function copyFromUSB(){
    dataPacket.Type ="COPYFROMUSB";
    websocket.send(JSON.stringify(dataPacket));
}

function copyToInternal(){
    if(document.getElementById('internalLocation').value == -1){
        alert('Please Select Internal Storage Location');
    }
    else{
        dataPacket.Type ="COPYTOINTERNAL" + document.getElementById('internalLocation').value;
        websocket.send(JSON.stringify(dataPacket));
    }
}

function copyFromInternal(){
    if(document.getElementById('internalLocation').value == -1){
        alert('Please Select Internal Storage Location');
    }
    else{
        dataPacket.Type ="COPYFROMINTERNAL" + document.getElementById('internalLocation').value;
        websocket.send(JSON.stringify(dataPacket));
    }
}

function copyToPublic(){
    dataPacket.Type ="COPYTOPUBLIC";
    websocket.send(JSON.stringify(dataPacket));
}

function downLoadFiles(){
    //generate keyclicks to force downloads
   // window.location.href = "/images/sailogo.jpg";
 //   window.open("/images/sailogo.jpg",'Download');
    document.getElementById('dl1').click();
    document.getElementById('dl2').click();
    document.getElementById('dl3').click();
    document.getElementById('dl4').click();
    document.getElementById('dl5').click();
    document.getElementById('dl6').click();
    document.getElementById('dl7').click();
    document.getElementById('dl8').click();
    document.getElementById('dl9').click();
    writeToScreen("Download Finished");


}
//************************************  TIME  ******************************

function gettimebutton(){
    dataPacket.Type ="SEND";
    dataPacket.Data = 'TIMEGET';
    websocket.send(JSON.stringify(dataPacket));
}

function timebutton(){
    dataPacket.Type ='TME';
    var send = new Date();
    dataPacket.Data = send;
    websocket.send(JSON.stringify(dataPacket));// SET the CS4 I/O clock to current browser time - ignores time zone offset
}
/*
function timeZoneChange(){
    dataPacket.Type = 'TME TZ';
    timeZone = document.getElementById('timeZoneCombo');
    value = timeZone.value;
    dataPacket.Data = value;
    websocket.send(JSON.stringify(dataPacket));
}
*/
function systemtestbutton(){
    dataPacket.Type ="SYSTEMTEST";
    websocket.send(JSON.stringify(dataPacket));
}
//************************************  FILTERS  ******************************


function midisysexchange1(){
    switch (document.getElementById("midisysex1").value){
        case '0':
            document.getElementById("sysex1").style.display = "none";
            break;

        case '1':
            document.getElementById("sysex1").style.display = "block";
            break;

        case '2':
            document.getElementById("sysex1").style.display = "block";
            break;
        default:
            document.getElementById("sysex1").style.display = "none";
    }
}
function midisysexchange2(){
    switch (document.getElementById("midisysex2").value){
        case '0':
            document.getElementById("sysex2").style.display = "none";
            break;

        case '1':
            document.getElementById("sysex2").style.display = "block";
            break;

        case '2':
            document.getElementById("sysex2").style.display = "block";
            break;
        default:
            document.getElementById("sysex2").style.display = "none";
    }
}
function midisysexchange3(){
    switch (document.getElementById("midisysex3").value){
        case '0':
            document.getElementById("sysex3").style.display = "none";
            break;

        case '1':
            document.getElementById("sysex3").style.display = "block";
            break;

        case '2':
            document.getElementById("sysex3").style.display = "block";
            break;
        default:
            document.getElementById("sysex3").style.display = "none";
    }
}
function midisysexchange4(){
    switch (document.getElementById("midisysex4").value){
        case '0':
            document.getElementById("sysex4").style.display = "none";
            break;

        case '1':
            document.getElementById("sysex4").style.display = "block";
            break;

        case '2':
            document.getElementById("sysex4").style.display = "block";
            break;
        default:
            document.getElementById("sysex4").style.display = "none";
    }
}

function sysexcuelistchange1(){
    switch (document.getElementById("sysexcuelist1").value) {
        case '0':
            document.getElementById("sysexcuelist1a").style.display = "none";
            document.getElementById("sysexcuelist1b").style.display = "none";
            break;
        case '1':
        case '3':
            document.getElementById("sysexcuelist1a").style.display = "block";
            document.getElementById("sysexcuelist1b").style.display = "none";
            break;
        case '2':
        case '4':
            document.getElementById("sysexcuelist1a").style.display = "none";
            document.getElementById("sysexcuelist1b").style.display = "block";
            break;
        default:
            document.getElementById("sysexcuelist1a").style.display = "none";
            document.getElementById("sysexcuelist1b").style.display = "none";
    }
}

function nonsysexchange1(){
    switch (document.getElementById("nonsysex1").value){
        case '0':
            document.getElementById("other1").style.display = "none";
            break;

        case '1':
            document.getElementById("other1").style.display = "block";
            break;

        case '2':
            document.getElementById("other1").style.display = "block";
            break;
        default:
            document.getElementById("other1").style.display = "none";
    }
}

function nonsysexchange2(){
    switch (document.getElementById("nonsysex2").value){
        case '0':
            document.getElementById("other2").style.display = "none";
            break;

        case '1':
            document.getElementById("other2").style.display = "block";
            break;

        case '2':
            document.getElementById("other2").style.display = "block";
            break;
        default:
            document.getElementById("other2").style.display = "none";
    }
}

function nonsysexchange3(){
    switch (document.getElementById("nonsysex3").value){
        case '0':
            document.getElementById("other3").style.display = "none";
            break;

        case '1':
            document.getElementById("other3").style.display = "block";
            break;

        case '2':
            document.getElementById("other3").style.display = "block";
            break;
        default:
            document.getElementById("other3").style.display = "none";
    }
}

function nonsysexchange4(){
    switch (document.getElementById("nonsysex4").value){
        case '0':
            document.getElementById("other4").style.display = "none";
            break;

        case '1':
            document.getElementById("other4").style.display = "block";
            break;

        case '2':
            document.getElementById("other4").style.display = "block";
            break;
        default:
            document.getElementById("other4").style.display = "none";
    }
}
