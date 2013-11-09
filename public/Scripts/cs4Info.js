/**
 * Created by Steve on 11/4/13.
 */
window.onload = init;
function init()
{
    outputStartup = document.getElementById("startup");
    outputCountstartup = document.getElementById("countstartup");
    outputCountcue = document.getElementById("countcue");
    outputCountlog = document.getElementById("countlog");
    outputTitles = document.getElementById("titles");
    outputUpTime = document.getElementById("uptime");

  UpTime();

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

function UpTime()
{
    var uptime;
    var ti = new Date(startup[0].Time);
    curTime = new Date();
    uptime = curTime - ti;
    uptime = uptime / 1000;
    seconds = Math.round(uptime % 60);
    if(seconds <10){seconds = "0" + seconds}
    uptime /= 60;
    minutes = Math.round(uptime % 60);
    if(minutes <10){minutes = "0" + minutes}
    uptime /= 60;
    hours = Math.round(uptime % 24);
    if(hours <10){hours = "0" + hours}
    uptime /= 24;
    days = Math.round(uptime);
    uptime = days + " Days " + hours + " Hrs " + minutes + " Min " + seconds + " Sec";

    outputUpTime.innerHTML = "System Up Time:".bold() + "<br>" + uptime ;
    setTimeout(function(){UpTime();}, ( 1000));
}
