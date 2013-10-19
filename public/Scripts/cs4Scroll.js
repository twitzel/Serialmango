/**
 * Created by Steve on 10/18/13.
 */

    /*
var canvas = document.getElementById('myCanvas');
var context = canvas.getContext('2d');
var canvas = document.getElementById('myCanvas');
var canvasWidth = canvas.width;
var canvasStart = canvasWidth*.8;
var canvasHeight = canvas.height;
var pixelData = new Array(); //time: ,line: , data,
var numberLoops = 0;
var ticIncrement = 10; // this gives a time increment of 1 ms per pixel //
var lineStart = 180; // bottom of tic line

*/

//setup origional time marks and time in the array

//window.onload = initScroll;
var imageData = context.getImageData(0,0,canvasWidth, canvasHeight);


function initScroll(){

    for(var i = 0; i  <=canvasStart; i+=ticIncrement){
        if(i%50 == 0){
            pixelData[i] = {line : 40};
        }
        else{
            pixelData[i] = {line : 20};
        }
    }
    context.lineWidth = 1.1;


    setInterval(function(){movedata()},30); //refresh the chart ever 10ms
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
    var words = text.split(" ");
    var line = "";

    for(var n = 0; n < words.length; n++) {
        var testLine = line + words[n] + " ";
        var metrics = context.measureText(testLine);
        var testWidth = metrics.width;
        if(testWidth > maxWidth) {
            context.fillText(line, x, y);
            line = words[n] + " ";
            y += lineHeight;
        }
        else {
            line = testLine;
        }
    }
    context.fillText(line, x, y);
}


function movedataNew(){

    numberLoops++;
    pixelData.shift();  //movers everything over 1 px
    context.beginPath();
    context.clearRect(0,0,canvas.width,canvas.height);
    context.putImageData(imageData, 0,0);

    if(numberLoops%100 == 0){
     //   pixelData[canvasStart] = {line : 40, time : new Date().toLocaleTimeString().substring(0,8)};
        context.moveTo(canvasStart,lineStart);
        context.lineTo(canvasStart,lineStart -40);
        context.fillText(new Date().toLocaleTimeString().substring(0,8),canvasStart-21 ,192)
    }
    else if(numberLoops % ticIncrement == 0){
        context.strokeRect(canvasStart,lineStart-20,.05,20);
      //  context.moveTo(canvasStart,lineStart);
      //  context.lineTo(canvasStart,lineStart -20);
    }
   context.stroke();
   imageData = context.getImageData(1,0, canvasWidth, canvasHeight);

/*
    for(var i = 0; i< pixelData.length; i++ ){
        if(pixelData[i]){
            if(pixelData[i].line){
                context.moveTo(i,lineStart);
                context.lineTo(i,lineStart -pixelData[i].line);
            }
            if(pixelData[i].time) {
                context.fillText(pixelData[i].time,i-21 ,192)

            }
            if(pixelData[i].data){
                if(pixelData[i].data.substring(0,1) == ".")
                {
                    context.fillStyle = 'blue';
                    context.fillRect(i,20,2,130);
                    context.fillStyle='rgba(0,0,200,.2)';
                    context.fillRect(i,20,140,45);
                    context.fillStyle = 'black';
                    wrapText(context,pixelData[i].data.substring(57),i+5,30,130,10);
                }
                else
                {
                    context.fillStyle = 'red';
                    context.fillRect(i,80,2,70);
                    context.fillStyle='rgba(200,0,0,.2)';
                    context.fillRect(i,80,140,45);
                    context.fillStyle = 'black';
                    wrapText(context,pixelData[i].data.substring(25),i+5,90,130,10);
                }
            }
        }
    }
*/
}
function movedata(){

    numberLoops++;
    pixelData.shift();  //movers everything over 1 px

    context.clearRect(0,0,canvas.width,canvas.height);
    if(numberLoops%(ticIncrement*10) == 0){
        pixelData[canvasStart] = {line : 40, time : new Date().toLocaleTimeString().substring(0,8)};
    }
    else if(numberLoops % ticIncrement == 0){
        pixelData[canvasStart] = {line : 20};
    }
    context.beginPath();

    for(var i = 0; i< pixelData.length; i++ ){
        if(pixelData[i]){
            if(pixelData[i].line){
                context.moveTo(i,lineStart);
                context.lineTo(i,lineStart -pixelData[i].line);
            }
            if(pixelData[i].time) {
                context.fillText(pixelData[i].time,i-21 ,192)

            }
            if(pixelData[i].data){
               context.save();
                context.rotate(Math.PI);
                if(pixelData[i].data.substring(0,1) == ".")
                {
                    context.fillStyle = 'blue';
                    context.fillRect(i,20,2,130);
                    context.fillStyle='rgba(0,0,200,.2)';
                    context.fillRect(i,20,140,45);
                    context.fillStyle = 'black';
                    wrapText(context,pixelData[i].data.substring(57),i+5,30,130,10);
                }
                else
                {
                    context.fillStyle = 'red';
                    context.fillRect(i,80,2,70);
                    context.fillStyle='rgba(200,0,0,.2)';
                    context.fillRect(i,80,140,45);
                    context.fillStyle = 'black';
                    wrapText(context,pixelData[i].data.substring(25),i+5,90,130,10);
                }
                context.restore();
            }
        }
    }
    context.stroke();
    //add starting line
    context.beginPath();
    context.strokeStyle = 'red';
    context.moveTo(canvasStart, 0);
    context.lineTo(canvasStart, canvasHeight);
    context.stroke();
    context.strokeStyle = 'black';
    context.imageSmoothingEnabled = 5;

  //  context.stroke();
}