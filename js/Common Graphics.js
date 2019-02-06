function drawCenteredGraphicWithRotation(image,xPos,yPos,angle){
  cc.save();
  cc.translate(xPos,yPos);
  cc.rotate(angle);
  cc.drawImage(image,-image.width/2,-image.height/2);
  cc.restore();
}

function drawText(x,y,string,colour){
    cc.fillStyle = colour;                                                   //Set the text colour to the colour id provided    
    cc.fillText(string, x, y);                                               //Draw the text using the string provided
}

function drawCircle(centerX,centerY,radius,colour){                          //Function to draw a circle
    cc.fillStyle = colour;                                                   //Set the fillStyle to the colour argument
    cc.beginPath();                                                          //Begin drawing path
    cc.arc(centerX,centerY,radius,0,Math.PI*2,true);                         //Draw circle using the provided arguments    
    cc.fill();                                                               //Fill circle area
}

function drawRect(x,y,w,h,colour){
    cc.fillStyle = colour;                                                   //Set background colour
    cc.fillRect(x,y,w,h);                                                    //Fill rectangle area
}