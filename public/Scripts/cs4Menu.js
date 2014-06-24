/**
 * Created by Steve on 1/24/14.
 */
window.addEventListener("load", initmenu, true);
window.addEventListener("resize", menuresize, true);
var visible = 0;
function initmenu(){
    if(window.innerWidth < 761)
    {
        document.getElementById("menunav").style.display="none";
        document.getElementById("menubutton").style.display="inline-block";
    }
    else{
        document.getElementById("menubutton").style.display="none";
    }

}




function buttonMenu(){
    if(visible == 0){
        document.getElementById("menunav").style.display="block";
        visible = 1;
        // document.getElementById("menubutton").style.display="none";
    }
    else{
        document.getElementById("menunav").style.display="none";
        visible = 0;
    }

}

function menuresize(){

    if(window.innerWidth < 761)
    {
        document.getElementById("menubutton").style.display="block";
        document.getElementById("menunav").style.display="none";
    }
    else{
        document.getElementById("menubutton").style.display="none";
        document.getElementById("menunav").style.display="block";
    }
}