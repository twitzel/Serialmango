var status;
var autoplot;


window.onload = init;
function init(){

    wsUri = "ws://" + window.location.hostname + ":8080";
    output = document.getElementById("websocketlog");

    document.getElementById('myCanvas').width =  document.getElementById('canvasDiv').offsetWidth;
    canvas = document.getElementById('myCanvas');

    context = canvas.getContext('2d');
    canvasWidth = canvas.width;
    canvasStart = 0;
    canvasHeight = canvas.height;
    pixelData = new Array(); //time: ,line: , data,
    numberLoops = 0;
    ticIncrement = 10; // this gives a time increment of 1 ms per pixel //
    lineStart = canvasWidth/2; // bottom of tic line

    //setup origional time marks and time in the array
    /*    for(var i = 0; i  <=canvasHeight; i+=ticIncrement){
     if(i%50 == 0){
     pixelData[i] = {line : 25};
     }
     else{
     pixelData[i] = {line : 10};
     }
     }
     */
    testWebSocket();
    //  autoplot = setInterval(function(){movedata()},30);

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
   // autoplot = setInterval(function(){movedata()},30);

}

function onClose(evt) {
    writeToScreen("DISCONNECTED");
    clearInterval(autoplot);
}

function onMessage(evt)    {
    message = JSON.parse(evt.data);
    if(message.packetType == 'cuefiledata'){
        inMessage = message.data;
        pixelLoad(inMessage);
    }
    else{
       writeToScreen(inMessage);
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
////    output.innerHTML = message + "<BR>" + output.innerHTML;

    pixelData[canvasStart] = {data : message};



    //output.value = message+"<BR>"+output.value;
}

function loadclick(){
    websocket.send('EDIT');//
}

function pixelLoad(item){
    //lastconverted   = new Date(lastCueReceived.Time);
   // addTime = addTime + "\""+  (new Date( lastconverted.setMilliseconds(lastconverted.getMilliseconds() + (timerStartTime -lastCueReceivedInternalTime)))).toISOString() +"\", \"Dout\" : \"" + dataToSend + "\"}";

    //  (new Date( lastconverted.setMilliseconds(lastconverted.getMilliseconds() + (timerStartTime -lastCueReceivedInternalTime)))).toISOString()
    //
    var count = 0;
    var pixelArray = [];
    var dte;
    if (item.length == 0) {
        console.log("not Found");
    }
    else {
        for(var i = 0; i< item.length; i++){
            pixelArray[count] =  item[i]; // stick the object into the array
            count++;
            //iterate over all of the OutData

            for(var j = 0; j < item[i].OutData.length; j++){
                var packet = {};
                //  packet.Time = new Date(new Date(item[i].Time) + item[i].OutData[j].Delay).toISOString();
                packet.Time = new Date(item[i].Time);
                packet.Time = new Date(packet.Time.setMilliseconds(packet.Time.getMilliseconds() + item[i].OutData[j].Delay)).toISOString();
                packet.Data = item[i].OutData[j];
                dir = item[i].OutData[j].Dir;    // ****** needs to ba added to R4-4 Receiver Parsing ****** //
                // dir = "xxxx";
                port = item[i].OutData[j].Port.toUpperCase();
                showname = item[i].OutData[j].Showname;
                dataToSend = item[i].OutData[j].Dout;
                delay = item[i].OutData[j].Delay;
                if(dir ==""){
                    outstring = port + " " + showname + " " + dataToSend;
                }
                else{
                    outstring = port + " " + showname + " " + dir + " " + dataToSend;
                }

                packet.output = outstring;
                pixelArray[count] = packet;
                count++;
            }
        }

    }
}



