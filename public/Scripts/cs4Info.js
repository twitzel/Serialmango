/**
 * Created by Steve on 11/4/13.
 */
var wsUri = "ws://" + window.location.hostname + ":8080";

window.onload = init;
function init()
{
    testWebSocket();



    outputStartup = document.getElementById("startup");
    outputCountstartup = document.getElementById("countstartup");
    outputCountcue = document.getElementById("countcue");
    outputCountlog = document.getElementById("countlog");
    outputTitles = document.getElementById("titles");
    outputUpTime = document.getElementById("uptime");

    UpTime(); //get uptime and update it every second

    outputStartup.innerHTML =  "1.  " + new Date(startup[0].Time).toString().substr(0,25); // this to eliminate blank line at top
    outputStartup.innerHTML = "Last 25 Restarts:".bold() + "<br>" + outputStartup.innerHTML;
    for(var i = 1; i < startup.length; i++)
    {
        outputStartup.innerHTML = outputStartup.innerHTML +"<BR>" + (parseInt(i)+1) + ".  " +new Date(startup[i].Time).toString().substr(0,25) ;
    }

    outputCountstartup.innerHTML =  "Number of Restarts:".bold() + "<BR>" + countStartup;

    outputCountcue.innerHTML = "Number of Cues:".bold() + "<BR>" + countCue;
    outputCountlog.innerHTML = "Number of Entries in Log File:".bold() + "<BR>" + countLog;



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
  //  output.innerHTML = "";
  //  writeToScreen("CONNECTED TO CS4");
    // change background color on connection
  //  var logweb = document.getElementById('websocketlog')
 //   logweb.innerHTML = "CONNECTED";
  //  logweb.style.backgroundColor = '#ececec';
    var send = SetCS4Time();
    websocket.send("CMD " + send); // SET the CS4 I/O clock to current browser time - ignores time zone offset
}

function onClose(evt) {
 //   writeToScreen("DISCONNECTED");
  //  var logweb = document.getElementById('websocketlog')
  //  logweb.style.backgroundColor = '#ff6559';
 //   setTimeout(testWebSocket(),1000);
}

function onMessage(evt)    {
   // writeToScreen(evt.data);
}

function onError(evt) {
 //   writeToScreen('<span style="color: red;">ERROR:</span> ' + evt.data);
}

function doSend(message) {
  //  writeToScreen("SENT: " + message);  websocket.send(message);
}

function writeToScreen(message) {

 //   var logweb = document.getElementById('websocketlog')
 //   logweb.innerHTML = "NOT !!!!  CONNECTED";

    //output.value = message+"<BR>"+output.value;
}


function UpTime()
{
   if(startup.length > 0)
   {
        var uptime=0;
        var seconds = 0;
        var minutes = 0;
        var hours = 0;
        var days = 0;
        var ti = new Date(startup[0].Time);
        curTime = new Date();
        uptime = curTime - ti;
        uptime = uptime / 1000;
        seconds = Math.round(uptime % 60);
        if((seconds <10) && (seconds >=0)){seconds = "0" + seconds}
        uptime /= 60;
        minutes = Math.round(uptime % 60);
        if((minutes <10) && (minutes >=0)){minutes = "0" + minutes}
        uptime /= 60;
        hours = Math.round(uptime % 24);
        if((hours <10) && (hours >=0)){hours = "0" + hours}
        uptime /= 24;
        days = Math.round(uptime) ;
        uptime = days + " Days " + hours + " Hrs " + minutes + " Min " + seconds + " Sec";

        outputUpTime.innerHTML = "System Up Time:".bold() + "<br>" + uptime ;
        setTimeout(function(){UpTime();}, ( 1000));
   }
    else
   {
       outputUpTime.innerHTML = "System Up Time:".bold() + "<br>" + "System Just Started!" ;
   }
}

function SetCS4Time()
{
    var uptime=0;
    var seconds = 0;
    var minutes = 0;
    var hours = 0;
    var days = 0;
    var month = 0;
    var year = 0;
    var timeZoneOffset = 0;
    curTime = new Date();
    timeZoneOffset = curTime.getTimezoneOffset();
    year = curTime.getFullYear().toString();
    month = parseInt(curTime.getMonth()) + 1; // months start with 1 in the timer chip
    day = curTime.getDate();
    hours = curTime.getHours();
    minutes = curTime.getMinutes();
    seconds = curTime.getSeconds();
    return "SETTIME " + seconds + " " + minutes + " " + hours + " " + day + " " + month + " " + year.substr(2) + "\n\r";
  //  sendData("SETTIME " + textBoxSecond.Text + " " + textBoxMinute.Text + " " + textBoxHour.Text + " " + textBoxDay.Text + " " + textBoxMonth.Text + " " + textBoxYear.Text);
}
