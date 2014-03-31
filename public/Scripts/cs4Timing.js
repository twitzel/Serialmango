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
var bkgnd = 0;
var incue = 0;
var dataPacket = {};
var testing = 0;
//window.onload = init;
window.addEventListener("load", init, true);
function init()
{
    output = document.getElementById("websocketlog");
    testWebSocket();
    cuevalue1 = document.getElementById("cue1");
    cuevalue2 = document.getElementById("cue2");
    cuevalue3 = document.getElementById("cue3");


    var password =prompt("This is a system level protected area.  ANY changes entered here will affect CS4 System operation.  \n\nPlease enter password to continue." ,"");

    if(password != "" && password !== null) //check for cancel button
    {
        if (password == "qwerty")
        {
            document.getElementById("blackout").style.visibility="visible"; //if correct password make visible
        }
        else
        {
            init(); //if wrong password start again
        }
    }
    else
    {
        window.location.href = "cs4Home";
    }

    //remove this line
    document.getElementById("blackout").style.visibility="visible"; //if correct password make visible
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
    var logweb = document.getElementById('websocketlog')
    logweb.style.backgroundColor = '#ff6559';
    setTimeout(testWebSocket(),1000);
}

function onMessage(evt)    {
    writeToScreen(evt.data);
    if(evt.data.substr(0,1) == '2'){
        incue = 1;
    }

}

function onError(evt) {
    writeToScreen('<span style="color: red;">ERROR:</span> ' + evt.data);
}

function doSend(message) {
    writeToScreen("SENT: " + message);
    dataPacket.Data = message;

    websocket.send(JSON.stringify(dataPacket));
}

function writeToScreen(message) {

    // get time of incoming cue
    if(message.substring(0,1) != " ") //make sure it's an incoming cue
    {
        lastCueTime = new Date();
    }

    output.innerHTML = message + "<BR>" + output.innerHTML.substr(0, 20000);


    //output.value = message+"<BR>"+output.value;
}


function cueclick1(message){
    if(incue ==0){
        alert(" Please wait for an incoming cue before starting!");
        return;
    }
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
   // websocket.send("{\"OutData\": [{\"Delay\": "+delay+" , \"Port\":\"Zig1\", \"Showname\":\""+ showName +"\", \"Dir\":\""+ directory +"\", \"Dout\":\"" + dataOut + "\"}]}");
    dataPacket.Data = "{\"OutData\": {\"Delay\": "+delay+" , \"Port\":\"ZIG1\", \"Showname\":\""+ showName +"\", \"Dir\":\""+ directory +"\", \"Dout\":\"" + dataOut + "\"}}";
    websocket.send(JSON.stringify(dataPacket));
    if(testing ==1){
        setTimeout(function(){cueclick1( );}, 5000);
    }
}

function cueclick2(message){
    if(incue ==0){
        alert(" Please wait for an incoming cue before starting!");
        return;
    }
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
    dataPacket.Data = ("{\"OutData\": {\"Delay\": "+delay+" , \"Port\":\"ZIG1\", \"Showname\":\""+ showName +"\", \"Dir\":\""+ directory +"\", \"Dout\":\"" + dataOut + "\"}}");
    websocket.send(JSON.stringify(dataPacket));

}

function cueclick3(message){
    if(incue ==0){
        alert(" Please wait for an incoming cue before starting!");
        return;
    }
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
    dataPacket.Data = ("{\"OutData\": {\"Delay\": "+delay+" , \"Port\":\"ZIG1\", \"Showname\":\""+ showName +"\", \"Dir\":\""+ directory +"\", \"Dout\":\"" + dataOut + "\"}}");
    websocket.send(JSON.stringify(dataPacket));
}

function buttonClear(){
    output.innerHTML = "";
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

function buttonDelete(){
    var inputConfirm =confirm("This will permanently DELETE the current CUE file. \n A backup will be created in the default location.\n\n Are you sure you want to continue?");
    if (inputConfirm==true)
    {
        dataPacket.Type = 'DELETECUE';
        websocket.send(JSON.stringify(dataPacket));
    }
    dataPacket.Type = ''; // reset the packet type
}

function buttonTest(){
    testing=1;
}