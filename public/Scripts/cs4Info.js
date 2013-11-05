/**
 * Created by Steve on 11/4/13.
 */
window.onload = init;
function init()
{
    outputStartup = document.getElementById("startup");
    outputCountcue = document.getElementById("countcue");
    outputCountlog = document.getElementById("countlog");
    outputTitles = document.getElementById("titles");

    outputTitles.innerHTML = "System:" ;


    outputStartup.innerHTML =  "1.  " + new Date(startup[0].Time).toString().substr(0,25); // this to eliminate blank line at top
    for(var i = 1; i < startup.length; i++)
    {
        outputStartup.innerHTML = outputStartup.innerHTML +"<BR>" + (parseInt(i)+1) + ".  " +new Date(startup[i].Time).toString().substr(0,25) ;
    }

    outputStartup.innerHTML =   outputStartup.innerHTML + "<BR>" +"Number of Startups:" + "<BR>" + countStartup;

    outputCountcue.innerHTML = "Number of Cues:" + "<BR>" + countCue;
   outputCountlog.innerHTML = "Number of Entries in Log File:" + "<BR>" + countLog;

}
