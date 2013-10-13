
var wsUri = "ws://witzel.homeserver.com:8080";
var output;
var graph ={};


//  c.font = "14px sans-serif";
function graphskeleton(prop)
{

    var low = 999;
    var high = 0;
    for (var i =0;i<dp.length;++i){
        if (dp[i][prop] > high){high = dp[i][prop];}
        if (dp[i][prop] < low){low = dp[i][prop];}
    }
    var loffset = 50;
    var toffset=20;
    //graph[prop] = {}; // moved to init routine
    graph[prop].low = low;
    graph[prop].high = high;
    graph[prop].id=document.getElementById(prop);
    graph[prop].id_rt=document.getElementById(prop+"_rt"); // realtime graph
    graph[prop].context = graph[prop].id.getContext("2d");
    graph[prop].context_rt = graph[prop].id_rt.getContext("2d");
    graph[prop].degperpixel = (graph[prop].id.height-toffset)/(high-low);
    graph[prop].context.lineWidth = 1;
    graph[prop].context.strokeStyle = "rgb(0,0,0)";
    graph[prop].context.clearRect (0 , 0 , graph[prop].id.width , graph[prop].id.height );
    graph[prop].context.beginPath();
    graph[prop].context.moveTo(loffset,(graph[prop].id.height-(dp[0][prop]-low)*graph[prop].degperpixel));
    graph[prop].loffset = loffset;
    graph[prop].toffset = toffset;


    for (var i = 0; i<dp.length;++i)
    {
        if (dp[i][prop]){
            graph[prop].context.lineTo(i+graph[prop].loffset,(graph[prop].id.height-(dp[i][prop]-graph[prop].low)*graph[prop].degperpixel));
        } else
        { //no sensor data
            // graph[prop].context.lineTo(i+loffset,graph[prop].id.height);
        }
    }
    graph[prop].context.stroke();
    graph[prop].context.fillStyle = "blue";
    graph[prop].context.font = "16px Arial";
    graph[prop].context.fillText(high,2,13+toffset);
    graph[prop].context.fillText(low,2,graph[prop].id.height-1);
   if (!graph[prop].data){
       graph[prop].data = []
   }
   ;
}
function graphclick(){
    var prop = this.id;
    graphskeleton(prop);
    graph[prop].context.strokeStyle = "grey";
    graph[prop].context.beginPath();
    graph[prop].context.moveTo(graph[prop].loffset,event.offsetY);
    graph[prop].context.lineTo(this.width,event.offsetY);
    graph[prop].context.stroke();

    var lineval = ((((graph[prop].id.height-event.offsetY)/graph[prop].degperpixel)+graph[prop].low)*100);
    lineval = Math.round(lineval)/100;
    //*graph[prop].degperpixel
    graph[prop].context.fillStyle = "red";
    graph[prop].context.fillText(lineval,2,event.offsetY+6);
    if (event.offsetX > graph[prop].loffset){


        if (dp[event.offsetX-graph[prop].loffset][prop]) {
            graph[prop].context.strokeStyle = "green";
            graph[prop].context.beginPath();
            graph[prop].context.arc(event.offsetX,(graph[prop].id.height-(dp[event.offsetX-graph[prop].loffset][prop]-graph[prop].low)*graph[prop].degperpixel),
            5,0,2*Math.PI);
            graph[prop].context.stroke();
            graph[prop].context.fillStyle = "green";
            graph[prop].context.fillText(dp[event.offsetX-graph[prop].loffset][prop],event.offsetX-20,13);
        }

    }

}

function nameclick(){
   // alert(this);
    tempwhatwasclicked=this;

    this.innerHTML=("<input type='text' onkeydown='if (event.keyCode == 13) blurtest()'" +
        " onBlur='blurtest()' autofocus='autofocus' value='"+this.dataset.name+"'> "+
        this.dataset.sensor );

}function blurtest(){
    tempwhatwasclicked.innerHTML= tempwhatwasclicked.firstChild.value;
    var sendobj = {};
    sendobj.packettype="Sensor name update";
    sendobj.sensor =tempwhatwasclicked.dataset.sensor;
    sendobj.name = tempwhatwasclicked.innerHTML;
    if (tempwhatwasclicked.dataset.name != sendobj.name) {
        tempwhatwasclicked.dataset.name = sendobj.name;
        doSend(JSON.stringify(sendobj));}
    }
function init()
{
    output = document.getElementById("output");
    for(var prop in dp[dp.length-1]){

        graph[prop] = {};
        graphskeleton(prop);
    }
    testWebSocket();
    //graph();
}
function testWebSocket()
{
    websocket = new WebSocket(wsUri);
    websocket.onopen = function(evt) { onOpen(evt) };
    websocket.onclose = function(evt) { onClose(evt) };
    websocket.onmessage = function(evt) { onMessage(evt) };
    websocket.onerror = function(evt) { onError(evt) };
}
function onOpen(evt) { writeToScreen("CONNECTED");
    //   doSend("WebSocket rocks");
}
function onClose(evt) {
    writeToScreen("DISCONNECTED");
}
function onMessage(evt)    {
    if (evt.data){
        var indata = JSON.parse(evt.data);
    }

    writeToScreen(indata.datatype);
    for(var prop in indata){

        if (prop.substr(0,4) == 'Temp'){
            graph[prop].data.push(indata[prop]);
            graph[prop].context_rt.clearRect (0 , 0 , graph[prop].id_rt.width , graph[prop].id_rt.height );
            if (graph[prop].data.length > 100)
            {
                graph[prop].data.shift();

            }
            graph[prop].context_rt.beginPath();
            graph[prop].context_rt.moveTo(loffset,(graph[prop].id_rt.height-(graph[prop].data[0]-graph[prop].low)*graph[prop].degperpixel));
            graph[prop].context_rt.lineWidth = 1;
            graph[prop].context_rt.strokeStyle = "rgb(0,0,0)";
            var loffset = 0;
            for (var i = 0; i<graph[prop].data.length; ++i)
            {

                    graph[prop].context_rt.lineTo(i+loffset,(graph[prop].id_rt.height-(graph[prop].data[i]-graph[prop].low)*graph[prop].degperpixel));
                //graph[prop].context_rt.lineTo(i+loffset,20);
            }

            graph[prop].context_rt.stroke();

        }
    }

    //websocket.close();
}
function onError(evt) {
   // writeToScreen('<span style="color: red;">ERROR:</span> ' + evt.data);
}
function doSend(message) {
    writeToScreen("SENT: " + message);  websocket.send(message);
}
function writeToScreen(message) {

    output.innerHTML = message+"<BR>"+output.innerHTML;
}
