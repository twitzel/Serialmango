/**
 * Created by Steve on 11/14/13.
 */
var output;
(function(){
    window.addEventListener("resize",show_device_width);
    output = document.createElement("div");
    output.style.position = "absolute";
    output.style.top= "10px"
    output.style.left = "10px";
    output.style.width = "50px";
    output.style.height = "20px";
    output.style.padding = "5px";
    output.style.textAlign = "center";
    output.style.backgroundColor = "#000";
    output.style.borderRadius = "20px";
    output.style.color = "#fff";
    output.style.fontFamily = "Arial, Helvetica, sans-serif";
    output.style.fontSize = "20px";
    output.style.fontWeight = "bold";
    output.style.opacity = "0.7";
    output.innerHTML = window.innerWidth
    document.body.appendChild(output);
})()

function show_device_width(){
    output.innerHTML = window.innerWidth;
}

