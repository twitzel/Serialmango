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
var cueStats = [];

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
        window.location.href = "/cs4Home";
    }

    //remove this line
    document.getElementById("blackout").style.visibility="visible"; //if correct password make visible
    if(Test== 'test' || Test == 'Test'){

        document.getElementById('test').style.display = 'block';
    }
    else{
        document.getElementById('test').style.display = "none";
    }
    if(Desc) {

        Desc = JSON.parse(Desc.replace(/&quot;/g, '"'));
        var item = [];
        var TAB = "\t";
        var cueHistory =document.getElementById("cueinfo");
        var dropdown = document.getElementById("retimeDesc");
        for (var i = 0; i < Desc.length; i++) {
           // cueStats[i] = Desc[i][0] + TAB + TAB + TAB + Desc[i][1] + TAB +TAB + Desc[i][2] + TAB + TAB + Desc[i][3];
          //  cueHistory.innerHTML = cueStats[i] + "<BR>" + cueHistory.innerHTML;
            dropdown[dropdown.length] = new Option(Desc[i][1], Desc[i][1]);
        }
        var table = document.getElementById("cuetable");

        var row;
        var cell = [];

        for(var i = 0; i<Desc.length; i++){
            row = table.insertRow(1+i);
            for(var j =0; j< 5; j++){
                row.insertCell(j).innerHTML = Desc[i][j];
            }
        }
    }
    if(Settings){
        Settings = JSON.parse(Settings.replace(/&quot;/g, '"'));
        showname = Settings.showname;
        showname = showname.sort();
        populateShowName();
    }
}

function populateShowName(){


    showname = showname.sort();
    var showselect = document.getElementById("showname1");
    showselect.innerHTML='';
    for (var i = 0; i < showname.length; i++) {
        showselect[showselect.length] = new Option(showname[i], showname[i]);
    }
    showselect = document.getElementById("showname2");
    showselect.innerHTML='';
    for (var i = 0; i < showname.length; i++) {
        showselect[showselect.length] = new Option(showname[i], showname[i]);
    }
    showselect = document.getElementById("showname3");
    showselect.innerHTML='';
    for (var i = 0; i < showname.length; i++) {
        showselect[showselect.length] = new Option(showname[i], showname[i]);
    }
    showselect = document.getElementById("shownameDesc");
    showselect.innerHTML='';
    for (var i = 0; i < showname.length; i++) {
        showselect[showselect.length] = new Option(showname[i], showname[i]);
    }

}

function saveParameters(showname){

    Settings.showname = showname;
    dataPacket.Type ='SETTINGS';
    dataPacket.Data = Settings;
    websocket.send(JSON.stringify(dataPacket));
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
    if((evt.data.substr(0,1) != '.')&& (evt.data.indexOf("ZIGBEE2")<0)){
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
    var testinh = message.indexOf("ZIGBEE2");
    if((message.substring(0,1) != ".") && (message.indexOf("ZIGBEE2")<0)) //make sure it's an incoming cue and not zigbee
    {
        lastCueTime = new Date().getTime();
    }

    output.innerHTML = message + "<BR>" + output.innerHTML.substr(0, 20000);


    //output.value = message+"<BR>"+output.value;
}

function buttonShowname(){
    document.getElementById('shownamearray').style.display = "block";
}

function buttonShownameCancel(){
    document.getElementById('shownamearray').style.display = "none";
}
function buttonShownameDelete(){
    var index = showname.indexOf(document.getElementById("shownameDesc").value);
    if (index > -1) {
        showname.splice(index, 1); //removes item from index
    }
    showname = showname.sort();
    Settings.showname = showname;
    dataPacket.Type ='SETTINGS';
    dataPacket.Data = Settings;
    websocket.send(JSON.stringify(dataPacket));
    populateShowName(); // update list
}

function buttonShownameAdd(){
    var item = document.getElementById("shownameAdd").value;
    if(item == ""){
        alert("Show Name Can not be empty!");
        return;
    }

    showname.push(item)
    showname = showname.sort();
    Settings.showname = showname;
    dataPacket.Type ='SETTINGS';
    dataPacket.Data = Settings;
    websocket.send(JSON.stringify(dataPacket));
    populateShowName(); // update list
    document.getElementById("shownameAdd").value = '';//clear text box
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
    var desc;

    desc = document.getElementById('description1').value;
    dataFormat = document.getElementById('type1').value;

    if(dataFormat == 'slide'){
        dataOut =  "GO slide" + counter +".jpg NEXT slide"+(counter +1) +".jpg";
    }
    else{
        dataOut = "GO " + dataFormat + counter + ".mp3";
    }

    cuevalue1.value = counter +1; //update the cue count
    delay = (new Date().getTime() - lastCueTime);
   // websocket.send("{\"OutData\": [{\"Delay\": "+delay+" , \"Port\":\"Zig1\", \"Showname\":\""+ showName +"\", \"Dir\":\""+ directory +"\", \"Dout\":\"" + dataOut + "\"}]}");
    dataPacket.Data = "{\"OutData\": {\"Desc\":\""+ desc +"\",\"Delay\": "+delay+" , \"Port\":\"ZIG1\", \"Showname\":\""+ showName +"\", \"Dir\":\""+ directory +"\", \"Dout\":\"" + dataOut + "\"}}";
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
    var desc;

    desc = document.getElementById('description2').value;
    dataFormat = document.getElementById('type2').value;

    if(dataFormat == 'slide'){
        dataOut =  "GO slide" + counter +".jpg NEXT slide"+(counter +1) +".jpg";
    }
    else{
        dataOut = "GO " + dataFormat + counter + ".mp3";
    }
    cuevalue2.value = counter +1; //update the cue count
    delay = (new Date().getTime() - lastCueTime);
    dataPacket.Data = ("{\"OutData\": {\"Desc\":\""+ desc +"\",\"Delay\": "+delay+" , \"Port\":\"ZIG1\", \"Showname\":\""+ showName +"\", \"Dir\":\""+ directory +"\", \"Dout\":\"" + dataOut + "\"}}");
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
    var desc;

    desc = document.getElementById('description3').value;
    dataFormat = document.getElementById('type3').value;

    if(dataFormat == 'slide'){
        dataOut =  "GO slide" + counter +".jpg NEXT slide"+(counter +1) +".jpg";
    }
    else{
        dataOut = "GO " + dataFormat + counter + ".mp3";
    }
    cuevalue3.value = counter +1; //update the cue count
    delay = (new Date().getTime() - lastCueTime);
    dataPacket.Data = ("{\"OutData\": {\"Desc\":\""+ desc +"\",\"Delay\": "+delay+" , \"Port\":\"ZIG1\", \"Showname\":\""+ showName +"\", \"Dir\":\""+ directory +"\", \"Dout\":\"" + dataOut + "\"}}");
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

function buttonSave(){
    var inputConfirm =confirm("Are you sure you are finished with this Timing?");
    if (inputConfirm==true)
    {
        window.location.href = "/cs4Home";
    }
}

function buttonRetime() {
    document.getElementById('retime').style.display = "block";
}

function buttonRetimeContinue(){
    var inputConfirm =confirm("This will permanently DELETE the \n"+ document.getElementById("retimeDesc").value + " timing in the cue file. \n A backup will be created in the default location.\n\n Are you sure you want to continue?");
    if (inputConfirm==true)
    {
        dataPacket.Type = 'DELETEONECUE';
        dataPacket.data = document.getElementById("retimeDesc").value;
        websocket.send(JSON.stringify(dataPacket));
        //now update cue info
        var TAB = "\t";
        var cueHistory =document.getElementById("cueinfo");
        var dropdown = document.getElementById("retimeDesc");
        cueHistory.innerHTML =""; // clear div
        dropdown.options.length = 0;//clear select box
        for (var i = 0; i < Desc.length; i++) {
            cueStats[i] = Desc[i][0] + TAB + TAB + TAB + Desc[i][1] + TAB + TAB + Desc[i][2] + TAB + TAB + Desc[i][3];
            if (dataPacket.data != Desc[i][0]) {
                cueHistory.innerHTML = cueStats[i] + "<BR>" + cueHistory.innerHTML;
                dropdown[dropdown.length] = new Option(Desc[i][0], Desc[i][0]);
            }
        }
    }
    document.getElementById('retime').style.display = "none";
    dataPacket.Type = ''; // reset the packet type
}

function buttonRetimeCancel(){
    document.getElementById('retime').style.display = "none";
}


function buttonTest(){
    testing=1;
}