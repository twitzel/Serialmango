var autoplot;
var pixelArray = [];
var startTime;
var startTimeZoom;
var msPerPixelMain;
var msPerPixelZoom;
var zoomFactor = 0;
var zoomLocation = 50;
var minPixel;
var maxPixel;
var selected = -1;
var selectedPreviousZoomPoint = {};
var arrayPrevious = [];
var canvasMousedownZoom = 0;
var mouseDown = 0;
var dataPacket = {};
var touchStartX=0;
var touchStartX1=0;
var touchStartY=0;
var touchStartY1=0;
var touchDistanceStart;
var touch=0;
var insertReady=0;
var dataToSend = {};
var oneCueFile = 0;
var oneCueFileName;
var totalCues = 0;
var unsaved = 0;
var zoomCanvasXatTouch = 0;
var mousedownScroll=0;

    window.onload = init;
function init(){

    wsUri = "ws://" + window.location.hostname + ":8080";
    output = document.getElementById("websocketlog");
    zoomSlider = document.getElementById("zoom");
    locationSlider = document.getElementById("location");
    document.getElementById('mainCanvas').width =  document.getElementById('canvasDiv').offsetWidth;
    canvas = document.getElementById('mainCanvas');
    context = canvas.getContext('2d');
    rect = canvas.getBoundingClientRect();
    canvas.addEventListener("mouseover",canvasMouseover, false);
    canvas.addEventListener("mouseout",canvasMouseout, false );
    canvas.addEventListener("mousedown",canvasMousedown, false );
    canvas.addEventListener("mouseup",canvasMouseup, false );
    canvas.addEventListener("mousemove",canvasMousemove, false );
    canvas.addEventListener("mousewheel",canvasMousewheel, false );
    canvas.addEventListener("touchstart",canvasTouchstart, false );

    document.getElementById('zoomCanvas').width =  document.getElementById('canvasDiv').offsetWidth;
    zoomcanvas = document.getElementById('zoomCanvas');
    zoomcontext = zoomcanvas.getContext('2d');
    zoomcanvas.addEventListener("mouseover", zoomcanvasMouseover, false);
    zoomcanvas.addEventListener("mouseout", zoomcanvasMouseout, false );
   //
    zoomcanvas.addEventListener("mousedown", zoomcanvasMousedown, false );
    zoomcanvas.addEventListener("mouseup", zoomcanvasMouseup, false );
    zoomcanvas.addEventListener("mousemove", zoomcanvasMousemove, false );
    zoomcanvas.addEventListener("mousewheel", zoomcanvasMousewheel, false );
    zoomcanvas.addEventListener("touchstart",zoomcanvasTouchstart, false );
    zoomcanvas.addEventListener("touchmove", zoomcanvasTouchmove, false );
    zoomcanvas.addEventListener("touchleave", zoomcanvasTouchleave, false );

    testWebSocket();
    if(Desc) {

        Desc = JSON.parse(Desc.replace(/&quot;/g, '"').replace(/&#34;/g, '"'));
        var item = [];
        var TAB = "\t";
        var dropdown = document.getElementById("retimeDesc");
        var tempSort = [];
        for (var i = 0; i < Desc.length; i++) {
            tempSort[i] = Desc[i][0];
        }
        tempSort.sort(); // put them in alphabetical order

        for (var i = 0; i < Desc.length; i++) {
            dropdown[dropdown.length] = new Option(tempSort[i]);         //(Desc[i][0], Desc[i][0]);
        }
    }
  //  document.getElementById('retime').style.display = "block";
    oneCueFile = 1; // all cue files
    oneCueFileName =  document.getElementById("retimeDesc").value;
  //  document.getElementById(buttonRetimeCancel).style.display = none;
  //  document.getElementById(buttonRetimeContinue).style.display = none;
  //  document.getElementById(loadButton).style.display = none;
  //  document.getElementById(loadOneButton).style.display = none;
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
    dataPacket.Type = 'EDIT';
    websocket.send(JSON.stringify(dataPacket));
    context.clearRect(0,0,canvas.width,canvas.height);
    document.body.style.cursor  = 'wait';
}

function onClose(evt) {
    writeToScreen("DISCONNECTED");
    clearInterval(autoplot);
}

function onMessage(evt)    {
    message = JSON.parse(evt.data);
    if(message.packetType){
        if(message.packetType == 'cuefiledata'){
            inMessage = message.data;
            pixelLoad(inMessage);
            canvasPlot();
           // zoomFactor = 85; // now setup initial zoom location and factor
            zoomFactor = 100- 2000/totalCues; //set zoom to display 20 items in zoom window
            zoomSlider.value = zoomFactor;
           // zoomLocation = 1 *100/canvas.width;
            zoomLocation = 0;
           // locationSlider.value = 1*100/canvas.width;
            locationSlider.value = zoomLocation;
            updateCanvas();
        }
        else if (message.packetType =='message'){
            writeToScreen(message.data);

        }
    }
    document.body.style.cursor  = 'default';
}

function onError(evt) {
    writeToScreen('<span style="color: red;">ERROR:</span> ' + evt.data);
}

function doSend(message) {
    writeToScreen("SENT: " + message);  websocket.send(message);
}

function writeToScreen(message) {
    // get time of incoming cue
   // lastCueTime = new Date();
    output.innerHTML = message;
  //output.innerHTML = message + "<BR>" + output.innerHTML;





    //output.value = message+"<BR>"+output.value;
}

function resize_canvas()
{
    document.getElementById('mainCanvas').width =  document.getElementById('canvasDiv').offsetWidth;
    document.getElementById('zoomCanvas').width =  document.getElementById('canvasDiv').offsetWidth;
    updateCanvas();
    //location.reload();
}

function loadclick(){
    oneCueFile = 0;// all cue files
    dataPacket.Type = 'EDIT';
    websocket.send(JSON.stringify(dataPacket));
    context.clearRect(0,0,canvas.width,canvas.height);
   // document.getElementById('retime').style.display = "none";
    document.getElementById("out").innerText = "Zoom Cue Data";
    document.getElementById("in").innerText = "All Cue Data";
}

function loadOneclick(){
    document.getElementById('retime').style.display = "block";
}

function buttonOneContinue(){
    if(unsaved){
        property = document.getElementById('undoButton');
        property.style.backgroundColor = '';
        unsaved = 0;
        var answer = confirm("Cue File has been changed.\nDo you want to save it?")
        if(answer == true){
            saveclick();
        }
        if(answer == false){ // don't want to savve so get rid of highlight button colors
            property = document.getElementById('undoButton');
            property.style.backgroundColor = '';
            property = document.getElementById('saveButton');
            property.style.backgroundColor = '';
        }
    }
    oneCueFile = 1; // all cue files
    oneCueFileName =  document.getElementById("retimeDesc").value;
    dataPacket.Type = 'EDIT';
    websocket.send(JSON.stringify(dataPacket));
    context.clearRect(0,0,canvas.width,canvas.height);
  //  document.getElementById('retime').style.display = "none";
    document.getElementById("out").innerText = "Zoom Cue Data " + oneCueFileName;
    document.getElementById("in").innerText = oneCueFileName + " Data";
}

function buttonOneCancel(){
    oneCueFile = 0;// all cue files
  //  document.getElementById('retime').style.display = "none";
}

function undoclick(){
    if(arrayPrevious.length >1){//make sure there is some data there
        selectedPreviousZoomPoint = arrayPrevious.pop();
        for(i=0; i<pixelArray.length; i++){
            if(pixelArray[i].output == selectedPreviousZoomPoint.output){//we found it
                pixelArray[i].Time = selectedPreviousZoomPoint.Time;
                pixelArray.sort(function(a,b){//sort array by time to put every thing back
                    return new Date(a.Time) - new Date(b.Time);
                });
                if(arrayPrevious.length == 1){//make sure there is nothing there
                    property = document.getElementById('undoButton');
                    property.style.backgroundColor = '';
                }
                updateCanvas(); //redraw
                break; // get out our work here is finished
            }
        }
    }
    else{
        property = document.getElementById('undoButton');
        property.style.backgroundColor = '';
    }

}

function saveclick(){

    property = document.getElementById('saveButton');
    property.style.backgroundColor = '';
    unsaved = 0;
    var warning=confirm("This will backup the Cue File to \nan internal location and create \na new file with this modified data.");
    if (warning ==true)
    {
        document.body.style.cursor  = 'wait';
        dataPacket.Type = 'CUECREATE';
        dataPacket.Data = pixelArray;
        if(oneCueFile == 1){
            dataPacket.File = oneCueFileName;
        }
        else{
            dataPacket.File = '';
        }
        websocket.send(JSON.stringify(dataPacket));
        property = document.getElementById('undoButton');
        property.style.backgroundColor = '';
    }
    else
    {
        alert('Save Cue File Cancelled!');
    }
}

function addclick(){
    if(document.getElementById('addButton').innerHTML == "Add Cues"){
        document.getElementById('mainCanvas').height = 200;
      //  document.getElementById('zoomCanvas').height = 275;
        document.getElementById('adddiv').style.display = "block";
        document.getElementById('addButton').innerHTML = 'Normal View';
        updateCanvas();
    }
    else{
        document.getElementById('mainCanvas').height = 300;
        document.getElementById('zoomCanvas').height = 300;
        document.getElementById('adddiv').style.display = "none";
        document.getElementById('addButton').innerHTML = 'Add Cues';
        updateCanvas();
    }

}

function pixelLoad(item){
    var count = 0;
    pixelArray = []; //clear the array

    if (item.length == 0) {
        console.log("not Found");
    }
    else {
        for(var i = 0; i< item.length; i++){
            if(item[i].OutData){//make sure record is valid
              //  if(item[i].OutData.length ==0 ) { // get rid of unattached cues

              //  }
              //  else{
                { // remove this one
                    if(oneCueFile == 1) {
                        for(var k = 0; k < item[i].OutData.length; k++){
                            if(item[i].OutData[k].Desc == oneCueFileName ){
                                if(item[i].OutData[k].InCue) {
                                    item[i].Time = item[i].OutData[k].InCue.Time; // get the time of the cue that fired time cue
                                }
                                pixelArray[count] = item[i]; // stick the object into the array

                                count++;
                                break;
                            }
                        }
                    }
                    else{
                        if(oneCueFile == 0){
                            pixelArray[count] = item[i]; // stick the object into the array
                            count++;

                        }

                    }
                    //iterate over all of the OutData
                }
                for(var j = 0; j < item[i].OutData.length; j++){
                    var packet = {};
                    if(oneCueFile ==1){ // we only want one descrtption to be edited
                        if (item[i].OutData[j].Desc == oneCueFileName ) {
                            //  packet.Time = new Date(new Date(item[i].Time) + item[i].OutData[j].Delay).toISOString();
                            if(item[i].OutData[j].InCue) {
                                packet.Time = new Date(item[i].OutData[j].InCue.Time);  //get the time of the catual that fired this one.
                            }
                            else{
                                packet.Time = new Date(item[i].Time);
                            }

                            packet.Time = new Date(packet.Time.setMilliseconds(packet.Time.getMilliseconds() + item[i].OutData[j].Delay)).toISOString();
                            packet.Data = item[i].OutData[j];
                            dir = item[i].OutData[j].Dir;
                            port = item[i].OutData[j].Port.toUpperCase();
                            showname = item[i].OutData[j].Showname;
                            dataToSend = item[i].OutData[j].Dout;
                            delay = item[i].OutData[j].Delay;
                            if (dir == "") {
                                outstring = port + " " + showname + " " + dataToSend;
                            }
                            else {
                                outstring = port + " " + showname + " " + dir + " " + dataToSend;
                            }

                            packet.output = outstring;
                            pixelArray[count] = packet;
                            count++;
                        }

                    }
                    else {
                        if (item[i].OutData) {
                            //  packet.Time = new Date(new Date(item[i].Time) + item[i].OutData[j].Delay).toISOString();
                            packet.Time = new Date(item[i].Time);
                            packet.Time = new Date(packet.Time.setMilliseconds(packet.Time.getMilliseconds() + item[i].OutData[j].Delay)).toISOString();
                            packet.Data = item[i].OutData[j];
                            dir = item[i].OutData[j].Dir;
                            port = item[i].OutData[j].Port.toUpperCase();
                            showname = item[i].OutData[j].Showname;
                            dataToSend = item[i].OutData[j].Dout;
                            delay = item[i].OutData[j].Delay;
                            if (dir == "") {
                                outstring = port + " " + showname + " " + dataToSend;
                            }
                            else {
                                outstring = port + " " + showname + " " + dir + " " + dataToSend;
                            }

                            packet.output = outstring;
                            pixelArray[count] = packet;
                            count++;
                        }
                    }
                }
            }
        }
    }
    totalCues = count;
    //sort array by time in case there are some re-done cues
    pixelArray.sort(function(a,b){
        return new Date(a.Time) - new Date(b.Time);
       // return new Date(a.InData) - new Date(b.InData);
    });
}

function timeRound(time, interval){
    diff = new Date(time);
    diff.setSeconds(diff.getSeconds() + interval);
   // diff.setSeconds(0);
    diff.setMilliseconds(0);
    return diff;
}

function timeDifference(time, start){
    return(new Date(time) - new Date(start));
}

function drawTimeLine(start, end){
    context.globalAlpha = 1;
    for(var i = 10; i< canvas.width; i+=10){
        if (i % 100 == 0) {
            context.beginPath();
            context.strokeStyle = 'red';
            context.moveTo(i, canvas.height / 2 - 10);
            context.lineTo(i, canvas.height / 2 + 10);
            new Date().toLocaleTimeString().substring(0,8);
            context.fillText( new Date(new Date(start).setMilliseconds(new Date(start).getMilliseconds() + i*msPerPixelMain)).toLocaleTimeString().substring(0,8),i-15, canvas.height/2+20);

            context.stroke();
        }

        else {
            context.beginPath();
            context.strokeStyle = 'black';
            context.moveTo(i, canvas.height / 2 - 5);
            context.lineTo(i, canvas.height / 2 + 5);
            context.stroke();
        }
    }
}

function drawData(){
    var countTop = 0;
    var countBottom = 0;
    context.globalAlpha = 1;
    for(var i = 0; i< pixelArray.length; i++){
        context.beginPath();
        pixelX=timeDifference(pixelArray[i].Time, startTime)/msPerPixelMain;
        pixelArray[i].normalPoint = pixelX;
        if(pixelArray[i].output){//this is output data
            countTop++;

            context.strokeStyle = 'blue';
            context.moveTo(pixelX, canvas.height / 2 - 25);
            context.lineTo(pixelX, 15);
            if((countTop%5 ==0) || (countTop ==1)){
                wrapText(context, pixelArray[i].output, pixelX-1.5,canvas.height/2-25,canvas.height/2-25,10);
            }
        }
        else{      //this in cue input data
            countBottom++;
            context.strokeStyle = 'green';
            x=timeDifference(pixelArray[i].Time, startTime);
            context.moveTo(pixelX, canvas.height / 2 + 25);
            context.lineTo(pixelX, canvas.height - 5);
            if((countBottom%5 ==0) || (countBottom ==1)){
                wrapText(context, parseCue(pixelArray[i]), pixelX-1.5,canvas.height  - 5,canvas.height/2-25,10);
            }
        }
        context.stroke();
    }
}

function canvasPlot(){
    //plot all of the pixelArray data on the canvas
    //find time difference between first and last event.

    startTime = timeRound(pixelArray[0].Time, -2); //round down 2 seconds
    endTime = timeRound(pixelArray[pixelArray.length -1].Time, 2); //round up 2 seconds
    //timeDifference = new Date(pixelArray[pixelArray.length -1].Time) - new Date(pixelArray[0].Time);
    // timeDifference = new Date(pixelArray[pixelArray.length -1].Time) - new Date(startTime);
    timediff = timeDifference(endTime, startTime);
    msPerPixelMain = timeDifference(endTime, startTime)/canvas.width;
    t = msPerPixelMain;
    drawTimeLine(startTime, endTime);
    drawData();

}

function zoomChange(value){
    zoomFactor = value * 1.1;
    updateCanvas();
}

function locationChange(value){
    zoomLocation = value;
    updateCanvas();
}








function updateCanvas(){
    if(startTime >=0 && endTime >=0){ //make sure we have valid time
        context.clearRect(0,0,canvas.width,canvas.height);
        drawTimeLine(startTime, endTime);
        drawData();
        context.fillStyle = 'gray';
        context.globalAlpha = 0.6;
        offset = (canvas.width/2) * (zoomFactor/100);
        shift = offset * (50 - zoomLocation)/50;
        minPixel = offset-shift;
        maxPixel = canvas.width - (offset + shift);
        context.fillRect(0,0,minPixel, canvas.height);
        context.fillRect(maxPixel,0, canvas.width, canvas.height);
        context.stroke();
        //Now put it in the zoomed canvas
        drawZoomTimeLine(minPixel , maxPixel );
    }
}
/////////////////////////////////
function drawZoomTimeLine(start, end){
    zoomcontext.globalAlpha = 1;
    startTimeZoom =  new Date(new Date(startTime).setMilliseconds(new Date(startTime).getMilliseconds() + minPixel*msPerPixelMain));
    endTimeZoom =    new Date(new Date(startTime).setMilliseconds(new Date(startTime).getMilliseconds() + minPixel*msPerPixelMain + maxPixel*msPerPixelMain));
    msPerPixelZoom = (maxPixel - minPixel)*msPerPixelMain/zoomcanvas.width;
    zoomcontext.clearRect(0,0,zoomcanvas.width,zoomcanvas.height);
    for(var i = 10; i< zoomcanvas.width; i+=10){
        zoomcontext.beginPath();
        if (i % 100 == 0) {
            zoomcontext.strokeStyle = 'red';
            zoomcontext.moveTo(i, zoomcanvas.height / 2 - 10);
            zoomcontext.lineTo(i, zoomcanvas.height / 2 + 10);
            zoomcontext.fillText( new Date(new Date(startTime).setMilliseconds(new Date(startTime).getMilliseconds() + minPixel*msPerPixelMain + i*msPerPixelZoom)).toLocaleTimeString().substring(0,8),i-15, zoomcanvas.height/2+20);
        }
        else {
            zoomcontext.strokeStyle = 'black';
            zoomcontext.moveTo(i, zoomcanvas.height / 2 - 5);
            zoomcontext.lineTo(i, zoomcanvas.height / 2 + 5);
        }
        zoomcontext.stroke();
    }

//now plot the data


    for(var i = 0; i< pixelArray.length; i++){
        zoomcontext.beginPath();



        if((new Date(pixelArray[i].Time) >=  new Date(startTimeZoom)) && (new Date(pixelArray[i].Time) <= new Date(endTimeZoom))){
            pixelX = timeDifference(pixelArray[i].Time,startTimeZoom)/msPerPixelZoom;
            pixelArray[i].zoomPoint = pixelX;
            if(pixelArray[i].output){//this is output data
                zoomcontext.strokeStyle = 'blue';
                zoomcontext.moveTo(pixelX, zoomcanvas.height / 2 - 25);
                zoomcontext.lineTo(pixelX, 15);
                // rotateText(zoomcontext,pixelArray[i].output , pixelX-1.5, zoomcanvas.height / 2 - 25);
                wrapText(zoomcontext, pixelArray[i].output, pixelX-1.5,zoomcanvas.height/2-25,zoomcanvas.height/2-25,10);
            }
            else{      //this in cue input data
                zoomcontext.strokeStyle = 'green';
                zoomcontext.moveTo(pixelX, zoomcanvas.height / 2 + 25);
                zoomcontext.lineTo(pixelX, zoomcanvas.height  - 5);
                wrapText(zoomcontext, parseCue(pixelArray[i]), pixelX-1.5,zoomcanvas.height  - 5,zoomcanvas.height/2-25,10);
                // rotateText(zoomcontext,parseCue(pixelArray[i]) , pixelX-1.5, zoomcanvas.height  - 5);
            }
            zoomcontext.stroke();
        }
        else{
            pixelArray[i].zoomPoint = -1;//point is not on graph
        }
    }

}

function wrapText(cxt, text, x, y, maxWidth, lineHeight) {
    var words = text.split(" ");
    var line = "";

    for(var n = 0; n < words.length; n++) {
        var testLine = line + words[n] + " ";
        var metrics = cxt.measureText(testLine);
        var testWidth = metrics.width;
        if(testWidth > maxWidth) {
            cxt.save();
            cxt.rotate(-Math.PI/2);
            cxt.fillText(line, -y, x);//context.fillText(line, x, y);
            cxt.restore();
            line = words[n] + " ";
            x += lineHeight;
        }
        else {
            line = testLine;
        }
    }

    cxt.save();
    cxt.rotate(-Math.PI/2);
    cxt.fillText(line, -y, x);
    cxt.restore();
}
function rotateText(cxt,text, x,y){
    /* zoomcontext.save();
     zoomcontext.rotate(-Math.PI/2);
     zoomcontext.fillText(text,-y, x); // fix coordinates for rotated change
     zoomcontext.restore();
     */
    cxt.save();
    cxt.rotate(-Math.PI/2);
    cxt.fillText(text,-y, x, zoomcanvas.height/2 -30); // fix coordinates for rotated change
    cxt.restore();
}
function parseCue(data){

    indata = data.InData;
    source = data.Source;
    // if cue is MIDI then get light cue number from hex string
    if (source.substr(0, 4) == "Midi") {
        if (indata.substr(0, 2) == "F0"){// this is a light cue
            var space = "                                    ";
            var hex = "";
            var type;

            for (var i = 18; i < indata.length - 3; i += 3) // extra space added to data at end of string
            {
                if (indata.substr(i,2) == 0x00){
                    hex += '*';
                }
                else{
                    hex += String.fromCharCode(parseInt(indata.substr(i, 2), 16));
                }
            }
            type = 'Cue: ' + hex;
        }
        else if (indata.substr(0, 1) == "8") {
            type = "Note Off";
        }
        else if (indata.substr(0, 1) == "9") {
            type = "Note On";
        }
        else if (indata.substr(0, 1) == "A") {
            type = "Polyphonic Aftertouch";
        }
        else if (indata.substr(0, 1) == "B") {
            type = "Control/Mode Change";
        }
        else if (indata.substr(0, 1) == "C") {
            type = "Program Change";
        }
        else if (indata.substr(0, 1) == "D") {
            type = "Channel Aftertouch";
        }
        else if (indata.substr(0, 1) == "E") {
            type = "Pitch Wheel Control";
        }
        return (source + "  " + type + "  " +
            "" + indata);
    }
    else // just send data
    {
        return (source + " " + indata);
    }
}
//............................................
function canvasTouchstart(){

}

function canvasMouseover(event){
    document.body.style.cursor  = 'pointer';
    //   context.clearRect(0,0,300,300);
    //   wrapText(context, event.clientX + " x pos " + event.clientY + " y pos", 100,200,200,10);

}

function canvasMousewheel(event){
    event.preventDefault();
    zoomFactor += event.wheelDelta/50;
    zoomSlider.value = zoomFactor;
    if (zoomFactor <0){
        zoomFactor= 0;
    }
    if(zoomFactor>99.80){
        zoomFactor = 99.8;
    }
    updateCanvas();
}

function canvasMouseout(event){
    document.body.style.cursor  = 'default';
    canvasMousedownZoom = 0;
    updateCanvas();
}
function canvasMousedown(event){
    if((event.offsetX >= minPixel) && (event.offsetX <= maxPixel)){//we re withing the zoomed area
        canvasMousedownZoom = 1;
        document.body.style.cursor  = 'e-resize';
        zoomSlider.value = zoomFactor;
        zoomLocation = event.offsetX *100/canvas.width;
        locationSlider.value =event.offsetX *100/canvas.width;
        updateCanvas();
    }
    if(zoomFactor == 0){
        zoomFactor = 80;
        zoomSlider.value = zoomFactor;
        zoomLocation = event.offsetX *100/canvas.width;
        locationSlider.value =event.offsetX *100/canvas.width;
        updateCanvas();

    }
    if((event.offsetX < minPixel) || (event.offsetX > maxPixel)){
        zoomSlider.value = zoomFactor;
        zoomLocation = event.offsetX *100/canvas.width;
        locationSlider.value =event.offsetX *100/canvas.width;
        updateCanvas();
    }


}
function canvasMouseup(event){
    canvasMousedownZoom = 0;
    document.body.style.cursor  = 'default';
    // document.body.style.cursor  = 'move';
}
function canvasMousemove(event){
    if(canvasMousedownZoom){ //move the zoomed area
        zoomLocation = event.offsetX *100/canvas.width;
        locationSlider.value =event.offsetX *100/canvas.width;
        updateCanvas();
    }
    else{
        context.globalAlpha = 1;
        context.clearRect(2,2,350,17);
        context.rect(2,2,350,17);
        context.stroke();
        //x = event.clientX -rect.left;
        x= event.offsetX;
        if(event.offsetY < canvas.height/2){//we are in outgoing events part of canvas.  look at outgoing events
            for(var i = 0; i < pixelArray.length; i++){
                var xx =pixelArray[i].output;
                if(pixelArray[i].output && (x < pixelArray[i].normalPoint)){
                    distance = x-pixelArray[i].normalPoint; //get the parameters of where we are
                    point = i;
                    context.fillStyle= 'red';
                    if(i>0){
                        while(!pixelArray[i-1].output){
                            i--;
                            if(i==0){
                                break;
                            }
                        }
                    }
                    if(i >0){
                        distance2 = pixelArray[i-1].normalPoint - x;
                        if(distance > distance2){
                            context.fillText(pixelArray[point].output,5,14,330);
                        }
                        else{
                            context.fillText(pixelArray[i-1].output,5,14,330);
                        }
                    }
                    break;
                }
            }
        }
        else{ //look at incoming events for a match
            for(var i = 0; i < pixelArray.length; i++){
                if(!pixelArray[i].output && (x < pixelArray[i].normalPoint)){
                    distance = x-pixelArray[i].normalPoint; //get the parameters of where we are
                    point = i;
                    context.fillStyle= 'red';
                    if(i>0){
                        while(pixelArray[i-1].output){
                            i--;
                            if(i==0){
                                break;
                            }
                        }
                    }
                    if(i >0){
                        distance2 = pixelArray[i-1].normalPoint - x;
                        if(distance > distance2){
                            context.fillText(parseCue(pixelArray[point]),5,14,330);
                        }
                        else{
                            context.fillText(parseCue(pixelArray[i-1]),5,14, 330);
                        }
                    }
                    break;
                }
            }
        }

        context.fillStyle="black";
    }
}
//------------------------------
function zoomcanvasTouchleave(){
    touch=0;
}
function zoomcanvasTouchstart(event){

    event.preventDefault();
    touch=1;
    if(event.touches.length > 1){
        touchStartX = event.targetTouches[0].clientX;
        touchStartY = event.targetTouches[0].clientY;
        touchStartX1 = event.targetTouches[1].clientX;
        touchStartY1 = event.targetTouches[1].clientY;
        xsquared = Math.pow(touchStartX  - touchStartX1,2);
        ysquared = Math.pow(touchStartY  - touchStartY1,2);
        touchDistanceStart = xsquared+ysquared;

    }
    else{
        touchStartX = event.changedTouches[0].clientX;
        touchStartY = event.changedTouches[0].clientY;
    }
}

function zoomcanvasTouchmove(event){
    if(touch){
        event.preventDefault();
        zoom = 1;
        if(event.touches.length > 1){
            //we have at least 2 fingers down lets do pinch zoom
            xsquared = Math.pow(event.targetTouches[0].clientX  - event.targetTouches[1].clientX,2);
            ysquared = Math.pow(event.targetTouches[0].clientY  - event.targetTouches[1].clientY,2);
            touchDistance = xsquared + ysquared;
            if(touchDistanceStart < (xsquared + ysquared)){ // we are getting farther so zoom out
                zoom = 1;
            }
            else{
                zoom = -1;
            }
          //  zoomFactor += zoom/2;
            zoomFactor -= ((Math.sqrt(touchDistanceStart) - Math.sqrt(xsquared + ysquared))*100/canvas.width)*zoomFactor/100;
            if(zoomFactor < 0){
                zoomFactor = 0;
            }
            if(zoomFactor > 99.8){
                zoomFactor = 99.8;
            }
            zoomSlider.value = zoomFactor;
            touchDistanceStart = xsquared + ysquared;


        }
        else{ //just scroll
            direction = -1;
            if((event.changedTouches[0].clientX - touchStartX) >0 ){
                direction = -1;
            }
            else{
                direction = +1;
            }

           // zoomLocation  +=(event.changedTouches[0].clientX - touchStartX )*2/canvas.width;
            zoomLocation += (event.changedTouches[0].clientX - touchStartX)*8/((zoomFactor*2)+1);
           // zoomLocation += direction/2;
            if(zoomLocation < 0){
                zoomLocation = 0;
            }
            if(zoomLocation > 100){
                zoomLocation = 100;
            }
            locationSlider.value =zoomLocation;
            touchStartX = event.changedTouches[0].clientX;
        }
        updateCanvas();
    }
}

function zoomcanvasMouseover(event){
    document.body.style.cursor  = 'pointer';
    //   context.clearRect(0,0,300,300);
    //   wrapText(context, event.clientX + " x pos " + event.clientY + " y pos", 100,200,200,10);

}

function zoomcanvasMousewheel(event){
    zoomLocation -= event.wheelDelta/50;
    if(zoomLocation <0){
        zoomLocation = 0;
    }
    if(zoomLocation > 100){
        zoomLocation = 100;
    }
    locationSlider.value = zoomLocation;
    if (zoomFactor <0){
        zoomFactor= 0;
    }
    if(zoomFactor>100){
        zoomFactor =100;
    }
    updateCanvas();
}

function zoomcanvasMouseout(event){
    document.body.style.cursor  = 'default';
    mouseDown = 0;
    mousedownScroll = 0;
    selected = -1;
    updateCanvas();
}
function zoomcanvasMousedown(event){
    event.preventDefault();
    if(event.which == 1){ //left mouse button
        zoomCanvasXatTouch = event.offsetX;
        if(event.offsetY > zoomcanvas.height/2){
            mousedownScroll = 1;
        }
        if((insertReady == 0) && (event.offsetY < zoomcanvas.height/2)){
            if(selected >=0 || selected <=pixelArray.length){
                selectedPreviousZoomPoint={};
                mouseDown = 1;
                selectedPreviousZoomPoint.Point = parseInt(pixelArray[selected].zoomPoint);
                selectedPreviousZoomPoint.output = pixelArray[selected].output;
                selectedPreviousZoomPoint.Time = pixelArray[selected].Time;
                arrayPrevious.push(selectedPreviousZoomPoint);
                if(arrayPrevious.length >0){
                    property = document.getElementById('undoButton');
                    property.style.backgroundColor = '#eeee00';
                    property = document.getElementById('saveButton');
                    property.style.backgroundColor = '#CC0000';
                    unsaved = 1;
                }
            }
        }
        else if(document.body.style.cursor  == 'crosshair'){  //insert manual item here if we are in the right place
            itemToInsert = {};
            itemToInsert.Data = {};
            incremental = new Date(startTimeZoom);
            incremental = new Date(incremental.setMilliseconds(incremental.getMilliseconds() +  event.offsetX*msPerPixelZoom)).toISOString();
            itemToInsert.Time = new Date(incremental);
            itemToInsert.Data.Desc = oneCueFileName;
            itemToInsert.Data.Delay = 100;
            itemToInsert.Data.Port = "";
            itemToInsert.Data.Showname = "";
            itemToInsert.Data.Dir = "";
            itemToInsert.Data.Dout = dataToSend;
            itemToInsert.output = dataToSend;
            pixelArray.push(itemToInsert);
            field = document.getElementsByClassName('field');
            for(i=0; i<field.length; i++){
                field[i].style.backgroundColor = '';
            }
            field = document.getElementsByClassName('but');
            for(i=0; i<field.length; i++){
                field[i].innerHTML = 'Insert';
            }
            insertReady = 0;
            pixelArray.sort(function(a,b){ // sort
                return new Date(a.Time) - new Date(b.Time);
            });
            updateCanvas();
        }

    }
    else if (event.which == 3){ //we have right button pressed
       mouseDown = 3;
       var text;
       if(selected != -1){
           if(event.offsetY < zoomcanvas.height/2){//we are in outgoing events part of canvas.  look at outgoing events
             text =  pixelArray[selected].output;
           }
           else{
             text = parseCue(pixelArray[selected]);
           }

           r = confirm('Are you sure you want to permanently remove cue \n' + text + '?\nThis action can not be undone');
           if(r == true){
               pixelArray.splice(selected,1);
               updateCanvas();
           }

       }

    }

}
function zoomcanvasMouseup(event){
    mouseDown = 0;
    mousedownScroll = 0;
    //sort array by time in case there are some re-done cues
    pixelArray.sort(function(a,b){
        return new Date(a.Time) - new Date(b.Time);
    });
}
function zoomcanvasMousemove(event){
    if(insertReady == 0){
        if(mousedownScroll == 1){//now we can scroll the data (change position)
            var amount = zoomCanvasXatTouch - event.offsetX;
            zoomCanvasXatTouch = event.offsetX;


            zoomLocation += amount/10;

            if(zoomLocation < 0){ // put the limits on it
                zoomLocation = 0;
            }
            if(zoomLocation > 100){
                zoomLocation = 100;
            }



            locationSlider.value = zoomLocation;
            updateCanvas();
        }



        if(mouseDown == 1){
            if(selected >=0 && selected <=pixelArray.length){
                //check if before first cue
                if(event.offsetX > pixelArray[0].zoomPoint){
                    document.body.style.cursor  = 'pointer';
                    //calculate a new time
                    incremental = new Date(pixelArray[selected].Time);
                    incremental = new Date(incremental.setMilliseconds(incremental.getMilliseconds() - (pixelArray[selected].zoomPoint - event.offsetX)*msPerPixelZoom  )).toISOString();
                    pixelArray[selected].Time = incremental;
                    updateCanvas();
                    zoomcontext.strokeStyle = 'blue';
                    zoomcontext.clearRect(2,2,355,20);
                    zoomcontext.rect(2,2,350,17);
                    zoomcontext.stroke();
                    zoomcontext.fillText("Changed " +(parseInt((event.offsetX  - selectedPreviousZoomPoint.Point)* msPerPixelZoom )/zoomcanvas.width).toFixed(3) +  "  Seconds"  ,5,14,330);
                }
                else{
                    document.body.style.cursor  = 'not-allowed';
                    zoomcontext.strokeStyle = 'red';
                    zoomcontext.clearRect(2,2,355,20);
                    zoomcontext.rect(2,2,350,17);
                    zoomcontext.stroke();
                    zoomcontext.fillText("Can NOT be before first CUE"  ,5,14,330);
                }
            }

        }
        else{
            zoomcontext.globalAlpha = 1;
            updateCanvas();
            zoomcontext.strokeStyle = 'blue';
            zoomcontext.fillstyle = 'red';
            zoomcontext.clearRect(2,2,355,20);
            zoomcontext.rect(2,2,350,17);
            zoomcontext.stroke();

            x = event.offsetX;
            if(event.offsetY < zoomcanvas.height/2){//we are in outgoing events part of canvas.  look at outgoing events
                for(var i = 0; i < pixelArray.length; i++){
                    if(pixelArray[i].output && (x < pixelArray[i].zoomPoint)){
                        distance = x-pixelArray[i].zoomPoint; //get the parameters of where we are
                        point = i;
                        zoomcontext.fillStyle= 'red';
                        if(i>0){
                            while(!pixelArray[i-1].output){
                                i--;
                                if(i==0){
                                    break;
                                }
                            }
                        }
                        if(i >0){
                            distance2 = pixelArray[i-1].zoomPoint - x;
                            if(distance > distance2){
                                zoomcontext.fillText(pixelArray[point].output,5,14,330);
                                selected=point;
                            }
                            else{
                                zoomcontext.fillText(pixelArray[i-1].output,5,14,330);
                                selected = i-1;
                            }
                        }
                        zoomcontext.fillStyle= 'black';
                        break;
                    }
                }
                if(selected >=0 && selected <=pixelArray.length){
                    drawSingleEvent(selected,'red', 'yellow');
                    document.body.style.cursor  = 'col-resize';
                }

            }
            else{ //look at incoming events for a match
                document.body.style.cursor = 'pointer';
                for(var i = 0; i < pixelArray.length; i++){
                    if(!pixelArray[i].output && (x < pixelArray[i].zoomPoint)){
                        distance = x-pixelArray[i].zoomPoint; //get the parameters of where we are
                        point = i;
                        zoomcontext.fillStyle= 'red';
                        if(i>0){
                            while(pixelArray[i-1].output){
                                i--;
                                if(i==0){
                                    break;
                                }
                            }
                        }
                        if(i >0){
                            distance2 = pixelArray[i-1].zoomPoint - x;
                            if(distance > distance2){
                                zoomcontext.fillText(parseCue(pixelArray[point]),5,14,330);
                                selected = point;
                            }
                            else{
                                zoomcontext.fillText(parseCue(pixelArray[i-1]),5,14, 330);
                                selected = i-1;
                            }
                        }
                        break;
                    }
                }
           //     zoomcontext.strokeStyle = 'yellow';
           //     zoomcontext.moveTo(pixelArray[selected].zoomPoint, zoomcanvas.height / 2 + 25);
           //     zoomcontext.lineTo(pixelArray[selected].zoomPoint, zoomcanvas.height  - 5);
           //     zoomcontext.stroke();
            }
        }
            zoomcontext.fillStyle="black";
    }
    else{ // we can insert manual cues here
            if(event.offsetY > zoomcanvas.height/2){//we are at bottom half of canvas
                document.body.style.cursor  = 'not-allowed';
            }
            else if(event.offsetX <= pixelArray[0].zoomPoint){
                document.body.style.cursor  = 'not-allowed';
            }
            else{
                document.body.style.cursor  = 'crosshair';
            }
    }
}

function drawSingleEvent(element, colorstroke, colorfill){
    zoomcontext.strokeStyle = colorstroke;
    zoomcontext.fillStyle = colorfill;
    pixelX = timeDifference(pixelArray[element].Time,startTimeZoom)/msPerPixelZoom;
    if(pixelArray[element].output){//this is output data
        //  zoomcontext.strokeStyle = 'blue';
        zoomcontext.moveTo(pixelX, zoomcanvas.height / 2 - 25);
        zoomcontext.lineTo(pixelX, 15);

        wrapText(zoomcontext, pixelArray[element].output, pixelX-1.5,zoomcanvas.height/2-25,zoomcanvas.height/2-25,10);
    }
    else{      //this in cue input data
        // zoomcontext.strokeStyle = 'green';
        zoomcontext.moveTo(pixelX, zoomcanvas.height / 2 + 25);
        zoomcontext.lineTo(pixelX, zoomcanvas.height  - 5);
        wrapText(zoomcontext, parseCue(pixelArray[element]), pixelX-1.5,zoomcanvas.height  - 5,zoomcanvas.height/2-25,10);
    }
    zoomcontext.stroke();

    zoomcontext.strokeStyle = 'black';
    zoomcontext.fillStyle = 'black';
}




function relayclick(){
    dataToSend = document.getElementById('relayselect').value;
    if(document.getElementById('relayopen').checked){
        dataToSend += " 0";
    }
    else{
        dataToSend += " 1";
    }
    document.getElementById("fieldset1").style.backgroundColor = 'palegreen';
    document.getElementById("insertrelay").innerHTML = "Ready";
    insertReady = 1;
}

function manualclick(){
    document.getElementById("fieldset6").style.backgroundColor = 'palegreen';
    document.getElementById("insertmanual").innerHTML = "Ready";
    dataToSend = document.getElementById('manualmessage').value.trim();
    insertReady = 1;
}

function serialclick(){
    document.getElementById("fieldset2").style.backgroundColor = 'palegreen';
    document.getElementById("insertserial").innerHTML = "Ready";
    dataToSend = document.getElementById("serialselect").value;
    dataToSend += document.getElementById("baudselect").value;
    dataToSend += document.getElementById("parityselect").value;
    if(document.getElementById('asciiselect').checked){
        dataToSend += ' A ';
    }
    else{
        dataToSend += ' H ';
    }
    dataToSend += document.getElementById('message').value.trim();
    insertReady = 1;
}

function smpteclick(){
    document.getElementById("fieldset4").style.backgroundColor = 'palegreen';
    document.getElementById("insertsmpte").innerHTML = "Ready";
    insertReady = 1;
    if(document.getElementById('smpteon').checked){
        dataToSend = 'SLAVE SMPTE ON';
    }
    else{
        dataToSend = 'SLAVE SMPTE OFF';
    }
}
function dmxclick(){
    document.getElementById("fieldset3").style.backgroundColor = 'palegreen';
    document.getElementById("insertdmx").innerHTML = "Ready";
    var val1 = document.getElementById('dmx1').value;
    var val2 = document.getElementById('dmx2').value;
    var val3 = document.getElementById('dmx3').value;
    dataToSend = 'SLAVE DMX_CH ' + val1 +  " " + val2 + " " + val3 + '';
    insertReady = 1;
}
function dacclick(){
    document.getElementById("fieldset5").style.backgroundColor = 'palegreen';
    document.getElementById("insertdac").innerHTML = "Ready";
    insertReady = 1;
    if(document.getElementById('dac1').checked){
        dataToSend = 'SLAVE DAC1 ';
    }
    else{
        dataToSend = 'SLAVE DAC2 ';
    }
    dataToSend += document.getElementById('dacout').value + '';
}

