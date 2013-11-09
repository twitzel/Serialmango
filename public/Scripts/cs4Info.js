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

    var uptime1;
    var ti = new Date(startup[0].Time);
    curTime = new Date(curTime);
    uptime1 = curTime - ti; var x;
    uptime1 = uptime1 / 1000;
    seconds = Math.round(uptime1 % 60);
    uptime1 /= 60;
    minutes = Math.round(uptime1 % 60);
    uptime1 /= 60;
    hours = Math.round(uptime1 % 24);
    uptime1 /= 24;
    days = Math.round(uptime1);


    outputUpTime.innerHTML = "System Up Time:" + "<br>" + uptime1 ;

    outputStartup.innerHTML =  "1.  " + new Date(startup[0].Time).toString().substr(0,25); // this to eliminate blank line at top
    outputStartup.innerHTML = "Last 25 Restarts:" + "<br>" + outputStartup.innerHTML;
    for(var i = 1; i < startup.length; i++)
    {
        outputStartup.innerHTML = outputStartup.innerHTML +"<BR>" + (parseInt(i)+1) + ".  " +new Date(startup[i].Time).toString().substr(0,25) ;
    }

    outputCountstartup.innerHTML =  "Number of Startups:" + "<BR>" + countStartup;

    outputCountcue.innerHTML = "Number of Cues:" + "<BR>" + countCue;
   outputCountlog.innerHTML = "Number of Entries in Log File:" + "<BR>" + countLog;

}
