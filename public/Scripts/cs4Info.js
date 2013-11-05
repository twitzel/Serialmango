/**
 * Created by Steve on 11/4/13.
 */
window.onload = init;
function init()
{
    outputStartup = document.getElementById("startup");
    outputCountcue = document.getElementById("countcue");
    outputCountlog = document.getElementById("countlog");


    outputStartup.innerHTML = "System last started on:" ;

    for(var i = 0; i < startup.length; i++)
    {
        outputStartup.innerHTML = outputStartup.innerHTML +"<BR>" + startup[i].Time;
    }

    outputStartup.innerHTML =   outputStartup.innerHTML + "<BR>" +"Number of Startups:" + "<BR>" + countStartup;

    outputCountcue.innerHTML = "Number of Cues:" + "<BR>" + countCue;
   outputCountlog.innerHTML = "Number of Entries in Log File:" + "<BR>" + countLog;

}
