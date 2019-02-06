/*
        Author: Jesse Burke
        
        Starting Date: June 26, 2017
        Last update: July 4, 2017
        
        Description: 
*/

/**                
    TODO:   
            -
    FINSHED:  
            -Remodel the car to be bigger
    Features: 
            -
    BONUS:
            -
*/

//Global Variables
var c, cc;                                                                   //c = canvas, cc = canvasContext

//Car Tracking variables 
var xPos;                                                                    //Initialize a variable to contain the cheatmode dot x coordinate 
var yPos;                                                                    //Initialize a variable to contain the cheatmode dot y coordinate
var carTracking = false;                                                     //Initialize a variable to toggle carTracking cheatmode (toggled false at default)

var player_car = new carClass();
var ai_car = new carClass();

window.onload = function(){                                                  //Load the the program
    c = document.getElementById('gameCanvas');                               //Initialize a variable for Canvas                                               
    cc = c.getContext('2d');                                                 //Initialize a variable for CanvasContext

    drawRect(0,0,c.width,c.height);
    drawText(c.width/2-40,c.height/2,"LOADING GAME...","white");

    loadImages();

}

//In Track Tiles (Winning has been turned off)
function startGame(){
    var framesPerSecond = 60;                                                //Frame Rate
    setInterval(gameCycle,1000/framesPerSecond);                             //Set the game tick interval to be match with the frame rate  
    
    setupInputCollection();
    
    loadTrack(trackOne);
}

function loadTrack(trackID){
    tiles = trackID.slice();
    player_car.reset(carSprite, "Player 1");                                                              //Call carReset to send the car to it's starting postion, speed, and direction.
    ai_car.reset(aiCarSprite, "Player 2"); 
}

function gameCycle(){                                                        //Define what happens in each game tick    
    drawCanvas();                                                            //Re-paint canvas
    moveObjects();                                                           //Call drawCanvas() to call other functions to paint the game canvas 
}    

function drawCanvas(){  
    
    drawTiles();                                                             //Draw in the tiles that are active
    
    player_car.draw();
    ai_car.draw();
    //drawGrid('white');                                                     //A visible grid to draw to see the canvas's grid layout
    //drawMouseGridID();                                                       //Draw the row/col/tileid of the current mouse position on the grid
}

function moveObjects(){
    player_car.move();                                                               //Update the car's position using the speed variables
    ai_car.move();
}


function drawGrid(gridColour){
    for(var row=0; row<NUM_OF_ROWS+1; row++){                                //LOOP for NUM_OF_ROWS
        drawRect(0,TILE_HEIGHT*row-1,c.width,2,gridColour)                   //Draw the vertical lines to the grid (limited to NUM_OF_COLS) 
    }
    for(var col=0; col<NUM_OF_COLS+1; col++){                                //LOOP for NUM_OF_COLS
        drawRect(TILE_WIDTH*col-1,0,2,NUM_OF_ROWS*(TILE_HEIGHT),gridColour);//Draw the horizontal lines to the grid (limited to NUM_OF_ROWS) 
    }
}

function drawMouseGridID(){
    var mouseGridCol = Math.floor(mouseX/TILE_WIDTH);                        //Calculate the mouseX position grid row
    var mouseGridRow = Math.floor(mouseY/TILE_HEIGHT);                                //Calculate the mouseY position grid column
    var mouseIndexIndicator = calcTileGridIndex(mouseGridCol, mouseGridRow);          //Calculate the the ID of the tile using the mouse's c 
    drawRect(mouseX+1,mouseY-9,55,9,'black');                                //Draw a black rectangle to deplay text on
    drawText(mouseX+2,mouseY-1,mouseGridCol+","+mouseGridRow+":"+mouseIndexIndicator,'lime'); //Display the column,row, and ID of the current tile by the mouse
}