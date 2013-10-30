
var wsUri = "ws://witzel.homeserver.com:8080";
//var wsUri = "ws://10.6.1.119:8080";
var output;
var graph ={};
var moving = false;
var movingid = '';
function moveup(){move(-1);}
function movedown(){move(1);}
function move(units){

    var   fromElement =this.event.target.parentNode.parentNode;
    units = units + (fromElement.dataset.position * 1);
    var   toElement  = document.getElementById('position'+units);

//***
    var htmlsave = fromElement.innerHTML;
    var sensorsave = fromElement.dataset.sensor;

    fromElement.dataset.sensor =toElement.dataset.sensor;
    fromElement.innerHTML = toElement.innerHTML;

    toElement.dataset.sensor = sensorsave;
    toElement.innerHTML = htmlsave;
    fromElement.style.transitionDuration = '0';
    toElement.style.transitionDuration = '0';

    fromElement.style.opacity = '.05';
    toElement.style.opacity = '.05';

    graphskeleton(fromElement.dataset.sensor);
    graphskeleton(toElement.dataset.sensor);

    addEventListeners();
    var sendobj = {};

    sendobj.packettype="Sensor order update";
    //reset event listeners
    var i = 0;
    for(var prop in dp[dp.length-1]){
        if (prop.substr(0,4) == 'Temp'){
            var temp = document.getElementById("position"+i);
            sendobj[temp.dataset.sensor]={};
            sendobj[temp.dataset.sensor].order = temp.dataset.position;
            i++;
        }

    }
    doSend(JSON.stringify(sendobj));
    fromElement.style.transitionDuration = '3.5s';
    toElement.style.transitionDuration = '3.5s';

    fromElement.style.opacity = '1';
    toElement.style.opacity = '1';

//            setTimeout(callback(toElement),1250);
//            setTimeout(callback(fromElement),1250);


 //   ***
}
function callback(a){
    return function(){
        a.style.opacity="1";
    }
}
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
    var boffset = 20;

    //graph[prop] = {}; // moved to init routine
    graph[prop].low = low;
    graph[prop].high = high;
    graph[prop].loffset = loffset;
    graph[prop].toffset = toffset;
    graph[prop].boffset = boffset;

    graph[prop].id=document.getElementById(prop);
    graph[prop].id_rt=document.getElementById(prop+"_rt"); // realtime graph
    graph[prop].context = graph[prop].id.getContext("2d");
    graph[prop].context_rt = graph[prop].id_rt.getContext("2d");
    graph[prop].degperpixel = (graph[prop].id.height-toffset-boffset)/(high-low);
    graph[prop].context.lineWidth = 1;
    graph[prop].context.strokeStyle = "rgb(0,0,0)";
    graph[prop].context.clearRect (0 , 0 , graph[prop].id.width , graph[prop].id.height );
    graph[prop].context.beginPath();
    graph[prop].context.moveTo(loffset,(graph[prop].id.height-graph[prop].boffset)-(dp[0][prop]-low)*graph[prop].degperpixel);


    for (var i = 0; i<dp.length;++i)
    {
        if (dp[i][prop]){
            graph[prop].context.lineTo(i+graph[prop].loffset,((graph[prop].id.height-graph[prop].boffset)-(dp[i][prop]-graph[prop].low)*graph[prop].degperpixel));



        } else
        { //no sensor data
            // graph[prop].context.lineTo(i+loffset,graph[prop].id.height);
        }
    }
    graph[prop].context.stroke();
    graph[prop].context.beginPath();
 //draw time lines
    graph[prop].context.strokeStyle ="rgb(220,200,220)";
    graph[prop].context.fillStyle = "black";
    graph[prop].context.font = "10px Arial";
    for (var i = 0; i<dp.length-1;++i){
    if ((new Date(dp[i].Time).getMinutes() % 60) == 0){
        graph[prop].context.moveTo(i+graph[prop].loffset,graph[prop].toffset);
        graph[prop].context.lineTo(i+graph[prop].loffset,graph[prop].id.height);
        var curtime = new Date(dp[i].Time);

        graph[prop].context.fillText(curtime.getHours()+' 00',i+graph[prop].loffset-14,graph[prop].id.height);


    }
    }
    graph[prop].context.stroke();
    graph[prop].context.beginPath();
    graph[prop].context.strokeStyle ="rgb(100,100,100)";
    graph[prop].context.moveTo(graph[prop].loffset,graph[prop].toffset);
    graph[prop].context.lineTo(graph[prop].id.width,graph[prop].toffset);
    graph[prop].context.moveTo(graph[prop].loffset,graph[prop].id.height-graph[prop].boffset);
    graph[prop].context.lineTo(graph[prop].id.width,graph[prop].id.height-graph[prop].boffset);
    graph[prop].context.stroke();

    graph[prop].context.fillStyle = "blue";
    graph[prop].context.font = "12px Arial";
    graph[prop].context.fillText(high,2,6+toffset);
    graph[prop].context.fillText(low,2,graph[prop].id.height-graph[prop].boffset+7);
   if (!graph[prop].data){
       graph[prop].data = [];
   }
    if (!graph[prop].Time){
        graph[prop].Time = [];
    }
}
function graphclick(){
    var prop = this.id;
    graphskeleton(prop);
    graph[prop].context.strokeStyle = "grey";
    graph[prop].context.beginPath();
    graph[prop].context.moveTo(graph[prop].loffset,event.offsetY);
    graph[prop].context.lineTo(this.width,event.offsetY);
    graph[prop].context.stroke();

    var lineval = ((((graph[prop].id.height-graph[prop].boffset-event.offsetY)/graph[prop].degperpixel)+graph[prop].low)*100);
    lineval = Math.round(lineval)/100;
    //*graph[prop].degperpixel
    graph[prop].context.fillStyle = "red";
    graph[prop].context.fillText(lineval,2,event.offsetY+6);
    if (event.offsetX > graph[prop].loffset){


        if (dp[event.offsetX-graph[prop].loffset][prop]) {
            graph[prop].context.strokeStyle = "green";
            graph[prop].context.beginPath();
            graph[prop].context.arc(event.offsetX,(graph[prop].id.height-graph[prop].boffset-(dp[event.offsetX-graph[prop].loffset][prop]-graph[prop].low)*graph[prop].degperpixel),
            5,0,2*Math.PI);
            graph[prop].context.moveTo(event.offsetX,(graph[prop].id.height-graph[prop].boffset-(dp[event.offsetX-graph[prop].loffset][prop]-graph[prop].low)*graph[prop].degperpixel)-3);
            graph[prop].context.lineTo(event.offsetX,13);
            graph[prop].context.stroke();
            graph[prop].context.fillStyle = "green";
            graph[prop].context.fillText(dp[event.offsetX-graph[prop].loffset][prop],event.offsetX-17,13);
            graph[prop].context.fillText(new Date(dp[event.offsetX-graph[prop].loffset].Time).toLocaleTimeString(),event.offsetX-17,graph[prop].id.height-8);
        }

    }

}

function nameclick(){
   // alert(this);


    this.innerHTML=("<div contenteditable='true' onblur='blurtest() '> <input  type='text' onkeydown='if (event.keyCode == 13) blurtest()'" +
        " onBlur='blurtest()'  value='"+this.dataset.name+"'> "+
        this.dataset.sensor )+"</div>";

}function savesensorname(){

    var name = window.event.currentTarget.innerHTML;

    var sendobj = {};
    sendobj[window.event.currentTarget.dataset.sensor]= {};
    sendobj.packettype="Sensor name update";
    sendobj[window.event.currentTarget.dataset.sensor].name=name;
   // dataset.name is the name from when the page loaded passed as data-name
    // just send if the name changed
    if (window.event.currentTarget.dataset.name != name) {
        window.event.currentTarget.dataset.name = name;
        doSend(JSON.stringify(sendobj));}
    }

function init()
{
    output = document.getElementById("output");
    for(var prop in dp[dp.length-1]){
        if (prop.substr(0,4) == 'Temp')
        {
            graph[prop] = {};
            // console.log("initial drawing of :"+prop);

            graphskeleton(prop);
        }
    }
    testWebSocket();
    setInterval('timestampRealtime()',1000);
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
function onMessage(evt)
{
    if (evt.data)
    {
        var indata = JSON.parse(evt.data);
    }
    if (indata.datatype=="Sensor Update")
    {
    writeToScreen(indata.datatype);
        for(var prop in indata)

        {

            if (prop.substr(0,4) == 'Temp')
            {
                graph[prop].data.push(indata[prop]);
                graph[prop].Time.push(indata.Time);
                graph[prop].context_rt.clearRect (0 , 0 , graph[prop].id_rt.width , graph[prop].id_rt.height );
                if (graph[prop].data.length > 100)
                {
                    graph[prop].data.shift();
                    graph[prop].Time.shift();

                }
                graph[prop].context_rt.beginPath();
                graph[prop].context_rt.moveTo(loffset,(graph[prop].id_rt.height-graph[prop].boffset-(graph[prop].data[0]-graph[prop].low)*graph[prop].degperpixel));
                graph[prop].context_rt.lineWidth = 1;
                graph[prop].context_rt.strokeStyle = "rgb(0,0,0)";
                var loffset = 0;
                for (var i = 0; i<graph[prop].data.length; ++i)
                {

                        graph[prop].context_rt.lineTo((i*2)+loffset,(graph[prop].id_rt.height-graph[prop].boffset-(graph[prop].data[i]-graph[prop].low)*graph[prop].degperpixel));
                    //graph[prop].context_rt.lineTo(i+loffset,20);
                }

                graph[prop].context_rt.stroke();
                // draw time marks
                graph[prop].context_rt.beginPath();
                graph[prop].context_rt.strokeStyle ="rgb(220,200,220)";
                graph[prop].context_rt.fillStyle = "black";
                graph[prop].context_rt.font = "10px Arial";
                for (var i = 0; i<graph[prop].data.length; ++i){
                    if (graph[prop].Time[i]>0){

                        graph[prop].context_rt.moveTo(i*2,graph[prop].toffset);
                        graph[prop].context_rt.lineTo(i*2,graph[prop].id.height);


                        graph[prop].context_rt.fillText(graph[prop].Time[i],(i*2)-14,graph[prop].id.height);


                    }
                }
                graph[prop].context_rt.stroke();
                //
            }
        }
    }

    if (indata.datatype=="Sensor Avg Update")
    {
       if (indata.period == 1) {
        dp.shift();
        newlen = dp.length;
        dp.push({});
        dp[newlen].Time=indata.Time;
        for(var prop in sensors)


        {
            if (prop.substr(0,4) == 'Temp'){
            dp[newlen][prop]=indata[prop];
            if (indata[prop]){
                //maybe allow this to work to draw blank for non reports
                console.log('redrew'+prop);
                graphskeleton(prop);
            }
    else
                {console.log("property"+prop)}

        }
        }

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

    output.innerHTML = message;
}


function buttonclick(){

    var element = document.getElementById('position10');
    element.style.opacity = "0.1";

}
function addEventListeners()
{
var i = 0;
    for(var prop in sensors){
        if (prop.substr(0,4) == 'Temp')   {
            var temp = document.getElementById("position"+i);

            //temp.addEventListener("click",stopmoving,false);


            temp = document.getElementById(prop);
            temp.addEventListener("click",graphclick,false);
            temp = document.getElementById("moveButton"+i);
            temp.addEventListener("click",moveup,false);
            temp = document.getElementById("moveButtonDown"+i);
            temp.addEventListener("click",movedown,false);
            i++;
        }

    }
}
function timestampRealtime()
{

    var temp = new Date();

    if (temp.getSeconds()%30 == 0)
    {
        for(var prop in sensors)

     {

        if (prop.substr(0,4) == 'Temp'){
           //console.log((temp.getSeconds()/sensors[prop].interval)%10);
         //   if ((temp.getSeconds()/sensors[prop].interval)%15 == 0) {

         graph[prop].Time[graph[prop].Time.length-1]=temp.getSeconds();



       // }
        }
     }
     }
}
function bigGraphInit(id)
{
    output = document.getElementById("output");

    //testWebSocket();

    document.getElementById('graph0').width =  document.getElementById('graph0').parentElement.clientWidth;
    //graph();
    g = {};
    id = 0

    g[id]={};
    g[id].id = document.getElementById('graph0');
    g[id].id.addEventListener("click",bigGraphClick,false);
    document.getElementById("selectedtempcolor"+id).addEventListener('change',selectedcolor,false);
    document.getElementById("test").addEventListener('change',test,false);
    g[id].context = g[id].id.getContext("2d");
    g[id].min = 60
    g[id].max = 80
    for(var prop in sensors){
        if (prop.substr(0,4) == 'Temp')   {
            if (!sensors[prop].g)
            {
                sensors[prop].g = [];
                sensors[prop].g[id]={};
                sensors[prop].g[id].min = 40;
                sensors[prop].g[id].max = 80;
                sensors[prop].g[id].lineWidth= 1;
                sensors[prop].g[id].style = 'Black';
            }

        }
    }



    resize();

}

function resize()
{
    id=0;
    document.getElementById('graph0').width =  document.getElementById('graph0').parentElement.clientWidth;


    g[id].offTop = 10
    g[id].offBottom = 50;
    g[id].offLeft = 50
    g[id].offRight = 10;
    g[id].top = g[id].offTop
    g[id].bottom = g[id].id.height - g[id].offBottom;
    g[id].left = g[id].offLeft;
    g[id].right = g[id].id.width - g[id].offRight;
    g[id].startTime = new Date(dp[id].Time).getTime();
    g[id].endTime = new Date(dp[dp.length-1].Time).getTime();
    g[id].width = (g[id].endTime-g[id].startTime)/1000;
    g[id].xScale = (g[id].id.width-(g[id].offLeft+g[id].offRight ))/g[id].width;
    for(var prop in sensors){
        if (prop.substr(0,4) == 'Temp')   {


    sensors[prop].g[id].yScale = (g[id].id.height-(g[id].offTop+g[id].offBottom ))/(sensors[prop].g[id].max-sensors[prop].g[id].min);

        }
        }
    g[id].lineWidth = 1;
    console.log('right:'+g[id].right);
    console.log('right:'+g[id].left);
    console.log('right:'+g[id].top);
   // console.log('yScale:'+g[id].yScale);
    bigGraph(id);

}
function bigGraph(id)
{
    var startTime = new Date(dp[0].Time).getTime();
    var xpos = 0;
    var c = g[id].context;
    c.clearRect (0 , 0 , g[id].id.width , g[id].id.height );
   // maybe tempory - draw graph offset borders
    c.strokeStyle = 'red';
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(g[id].left,g[id].top);
    c.lineTo(g[id].right,g[id].top);
    c.lineTo(g[id].right,g[id].bottom);
    c.lineTo(g[id].left,g[id].bottom);
    c.lineTo(g[id].left,g[id].top);
    c.stroke();



    c.strokeStyle = "black";
    c.lineWidth = g[0].lineWidth;

    //graph[prop].context.moveTo(graph[prop].loffset,event.offsetY);

//debugger;
    for(var prop in dp[dp.length-1]){
        c.strokeStyle = "black";
        c.lineWidth = g[0].lineWidth;
        if (prop.substr(0,4) == 'Temp')
        {
           // highlight if selected
            if (sensors[prop].name ==   document.getElementById('selectedtemp'+id).value){
               c.strokeStyle='yellow';
               c.lineWidth=4;

           }

            c.beginPath();
            for (var i = 0; i < (dp.length) ; ++i)
           {
            xpos =  ((new Date(dp[i].Time).getTime())-startTime)/1000;
            c.lineTo(sx(xpos,id),sy(dp[i][prop],id,prop))
            }
            c.stroke();
        }

    }


}
function sx(val,id){
    return (val*g[id].xScale)+g[id].offLeft;
}
function sy(val,id,prop){

    val = (val - sensors[prop].g[id].min)*sensors[prop].g[id].yScale;



    return g[id].bottom -  val;

}
function bigGraphClick(id){
    id = 0
    var c = g[0].context;


    //this g[id] needs to be changed to get the graph number
    //scale the click to match the time scale
var clickx = (event.offsetX-g[id].offLeft)/g[id].xScale;
var clicky ;
    //find the first point in time after the click

    for (var i = 0; i < (dp.length) ; ++i) { if (((new Date(dp[i].Time).getTime())-g[id].startTime)/1000 > clickx) { break; } }
      // check if the point before in time is closer and if it is use it
       if ((clickx-((new Date(dp[i-1].Time).getTime())-g[id].startTime)/1000)< (((new Date(dp[i].Time).getTime())-g[id].startTime)/1000)-clickx)
       {
           i--;
       }
// now find the closest plot - this will have to change to check only the visible plots
    var difference = 9999;
    var closestTemp = '';
    for(var prop in dp[dp.length-1]){

        if (prop.substr(0,4) == 'Temp'){
            clicky = ((g[id].bottom-event.offsetY)/sensors[prop].g[id].yScale)+sensors[prop].g[id].min;
            if (Math.abs(dp[i][prop]-clicky)< difference){
                difference = Math.abs(dp[i][prop]-clicky);
                closestTemp = prop;
             }

        }

    }
    console.log('Temperate clicked'+clicky);
    console.log('Closest temperature'+closestTemp);
    document.getElementById('selectedtemp'+id).value=sensors[closestTemp].name;
        //todo check if the dp before is closer
    //console.log("x,y:"+event.offsetX+","+event.offsetY);

    //console.log("datapoint:"+i);

    var xpos =  ((new Date(dp[i].Time).getTime())-g[id].startTime)/1000;
    var ypos = dp[i][closestTemp];
    bigGraph(id);
    c.strokeStyle = 'green';
    c.lineWidth = 1;
    c.beginPath();
    c.arc(sx(xpos,id),sy(ypos,id,closestTemp),5,0,2*Math.PI);
    c.moveTo(sx(xpos,id),g[id].top);

    c.lineTo(sx(xpos,id),g[id].bottom);
        c.stroke();
    return;

}
function selectedcolor(){
    console.log('adf' + this);
}
function test(){
    sensors[document.getElementById('selectedtemp'+id).value].g[0].max = this.value;
    resize(0);

}