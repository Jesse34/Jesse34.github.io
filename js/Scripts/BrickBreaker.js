var brickSprite = document.createElement("img");
var armouredBrickSprite = document.createElement("img");
var bombBrickSprite = document.createElement("img");
var bricks1Loaded = false;
var bricks2Loaded = false;
var bricks3Loaded = false;
/**                
	TODO:   
			-Double the amount of hitpoints in the circle to prevent as much graphical overlap
			-Fine tune game speed
			-Fine tune bumper deflection aiming (higher floors, lower ceilings on both axis'.)
			-Use current ball velocity as momentum on bumper deflections
			-Bomb chains begin to have looping issues when the chain exceeds 3-4 bombs
	FINSHED:  
			-Ball Physics are now fully functional. (Only reflecting ball velocity, not changing it)
			-The ball is encased but a 8 point circular hitbox. 
			-Refined the brick grid to use an integer array instead of boolean to allow for more states than on/off
			-Added image textures for each type of brick
	Features: 
			-Bumper aiming that increase SpeedX near the edges and SpeedY near the Center of the bumper
			-Normal Bricks, Armoured Bricks, and Bomb bricks added
			-Bomb brick explosions can now chain from one bomb to another if it's in range:  1,1,0,1,1,
																							 1,0,0,0,1,
																							 0,0,3,0,0,
																							 1,0,0,0,1,
																							 1,1,0,1,1,
																					
	BONUS:
			-Power-up bricks
*/

//Global Variables
var c, cc;                                                                                              //c = canvas, cc = canvasContext

var backgroundMusic = new Music();
var break_brick = new Sound("Audio-Effects/Brick Breaking");
var metal_hit = new Sound("Audio-Effects/Metal Hit");
var explosion = new Sound("Audio-Effects/Explosion");

//Player Variables
var totalLives = 3, remainingLives = totalLives;                                                        //The total count of player lives.

//Ball Graphic Variables
var ballX = 300,                                                                                        //Ball x coordinate starting position (center of ball)
	ballY = 350,                                                                                        //Ball y coordinate starting position (center of ball)   
	ballRadius = 5,                                                                                     //Ball radius
	ballColour = 'lime';                                                                                //Ball colour
	
//Ball Movement Variables                                      
var baseBallSpeedX = 1.5, ballSpeedX = baseBallSpeedX,                                                  //Ball speed values on the x-axis
	baseBallSpeedY = 1.5, ballSpeedY = baseBallSpeedY;                                                  //Ball speed values on the y-axis

//Bumper Graphic Variables 
var bumpX = 325,                                                                                        //Bumper initial x axis position
	bumpY = 540,                                                                                        //Distance from bottom of canvas edge to top of bumper
	bumpWidth = 150,                                                                                    //Width of the main body of the bumper (without the round edges, total bumper width == bumpWidth+bumpHeight (the extended hitbox adds a few invisible pixels))
	bumpHeight = 10,                                                                                    //Height of the bumper
	bumpColour = 'white';                                                                               //Width of the bumper    

//Brick Attributes
const BRICK_WIDTH = 32,                                                                                 //Width of brick
	  BRICK_HEIGHT = 20,                                                                                //Height of brick   
	  NUM_OF_ROWS = 17,                                                                                 //Total rows of bricks
	  NUM_OF_COLS = 25,                                                                                 //Total columns of bricks
	  BRICK_GAP = 2,                                                                                    //Gap distance between bricks
	  BRICK_COLOUR = 'palegreen';                                                                       //Colour of bricks

//Brick Grid Array
var bricks = new Array();                                                                               //Create an array to store the brick grid. 1 brick border of empty space around playing area)            
var wallGap = BRICK_GAP/1.6;                                                            //  Var to seperate the bricks from left wall and ceiling evenly                                                             
var remainingBricks;                                                                                //Create a variable to contain the number of active bricks on screen


//Mouse X and Y coordinate values
var mouseX;                                                                                             //Initialize a variable to contain the mouse x coordinate
var mouseY;                                                                                             //Initialize a variable to contain the mouse y coordinate

//Ball Tracking variables 
var xPos;                                                                                               //Initialize a variable to contain the cheatmode dot x coordinate 
var yPos;                                                                                               //Initialize a variable to contain the cheatmode dot y coordinate
var ballTracking = false;                                                                               //Initialize a variable to toggle ballTracking cheatmode (toggled false at default)

function updateMousePosition(evt){
	var canvasArea = c.getBoundingClientRect();                                                         //Find the bounds of the playing area
	var root = document.documentElement;                                                                //Create a variable to store the documentElement
	mouseX = evt.clientX - canvasArea.left - root.scrollLeft;                                           //Determine x-coordinate value
	mouseY = evt.clientY - canvasArea.top - root.scrollTop;                                             //Determine x-coordinate value
	
	bumpX = mouseX - bumpWidth/2;                                                                       //Adjust the bumper's x position accordingly
	
	//To test brick to ball collision, mouse controlls ball spawn
	/*ballY = mouseY;
	ballX = mouseX;
	ballSpeedX = baseBallSpeedX;
	ballSpeedY = -baseBallSpeedY;
	*/}


window.onload = function(){                                                                             //Load the the program
	c = document.getElementById('gameCanvas');                                                          //Initialize a variable for Canvas                                               
	cc = c.getContext('2d');                                                                            //Initialize a variable for CanvasContext
	drawCanvas();                                                                                       //Paint canvas before interval to avoid a white screen on page load
	
	var framesPerSecond = 150;                                                                          //Frame Rate
	setInterval(gameCycle,1000/framesPerSecond);                                                        //Set the game tick interval to be match with the frame rate  
	
	c.addEventListener('mousemove',updateMousePosition);                                                //Create event listener to track mouse movement

	brickSprite.onload = function(){
		bricks1Loaded = true;
	}
	brickSprite.src = "images/Brick.png";
	
	armouredBrickSprite.onload = function(){
		bricks2Loaded = true;
	}
	armouredBrickSprite.src = "images/Brick (Armoured).png";
	
	bombBrickSprite.onload = function(){
		bricks3Loaded = true;
	}
	bombBrickSprite.src = "images/Brick (Bomb).png";
	
	brickReset();                                                                                       //Call brickReset to either fill the brick grid or to randomize them
	ballReset();                                                                                        //Call ballReset to send the ball to it's starting postion, speed, and direction.
	setMapLayout('default'); 
	backgroundMusic.loopSong("Audio-Effects/Danger Storm");
}

function gameCycle(){                                                                                   //Define what happens in each game tick    
	drawCanvas();                                                                                       //Re-paint canvas
	moveObjects();                                                                                      //Call drawCanvas() to then call other functions to paint the game canvas 
}    

function drawCanvas(){  
	drawRect(0,0,c.width,c.height,'black');                                                             //Set background
	//drawGrid('white');                                                                                  //A visible grid to draw to see the canvas's grid layout
	
	drawBallTracking();                                                                                 //Cheatmode dotted line used for testing/asthetic    
	
	if(bricks1Loaded && bricks2Loaded && bricks3Loaded){
		 drawBricks();                                                                                  //Draw in the bricks that are active
	}               
	
	drawCircle(ballX,ballY,ballRadius+1.5,'silver');                                                    //Draw the Outline for the ball object
	drawCircle(ballX,ballY,ballRadius,ballColour);                                                      //Draw the ball
	
	drawBumper();                                                                                       //Draw the Bumper
	
	//drawMouseGridID();                                                                                  //Draw the row/col/brickid of the current mouse position on the grid
}

function moveObjects(){
	moveBall();                                                                                         //Update the ball's position using the speed variables
	
	detectBallBrickCollision();                                                                         //Detect collision w/ Ball and Brick and react accordingly
	
	detectBallBumperCollision();                                                                        //Detect collision w/ Ball and Bumper and calculate Aim Power

	checkGameState();
}

function checkGameState(){
	//checkPlayerLives();
}

function moveBall(){
	if(ballX+ballRadius >= c.width && ballSpeedX > 0){                                                    //Bounces the ball off the right wall                
		ballSpeedX = -ballSpeedX;                                                                       //Inverts the ballSpeedX var to invert direction            
	}
	if(ballX-ballRadius <= 0 && ballSpeedX < 0){
		ballSpeedX = -ballSpeedX;
	}
	if(ballY-ballRadius <= 0 && ballSpeedY < 0){                                                                           //Bounces the ball off the roof              
		ballSpeedY = -ballSpeedY;                                                                       //Inverts the ballSpeedY var to invert direction            
	}                      
	if(ballY+ballRadius >= c.height){                                                                   //Check if ball hits the ground
		remainingLives--;
		ballReset();                                                                                    //Call ballReset function
	} 
	
	ballX += ballSpeedX;                                                                                //Add the speedX value to the balls X position (The speed value will ne inverted negative or positive so there is no need to Add/Subract, only Add)
	ballY += ballSpeedY;                                                                                //Add the speedY value to the balls Y position (The speed value will ne inverted negative or positive so there is no need to Add/Subract, only Add)
}

/**
		Brick collision issues. 
			-Hitting the bottom of the brick from bottom left to top right 
			-Hitting side of brick from top -> down   
*/

function detectBallBrickCollision(){
	//console.log(remainingBricks);
	//Radius / 0.7 returns the displacement to meet the 45 degree diagonal position
	var ballTop = ballY - ballRadius;                                                                   //Hitbox of the Top of ball
	var ballBottom = ballY + ballRadius;                                                                //Hitbox of the Bottom of ball
	var ballLeft = ballX - ballRadius;                                                                  //Hitbox of the Left of ball
	var ballRight = ballX + ballRadius;                                                                 //Hitbox of the Right of ball
	var ballTRightX = ballX + ballRadius*0.7;                                                           //Hitbox X of the Top Right of ball
	var ballTRightY = ballY - ballRadius*0.7;                                                           //Hitbox Y of the Top Right of ball
	var ballTLeftX = ballX - ballRadius*0.7;                                                            //Hitbox X of the Top Right of ball
	var ballTLeftY = ballY - ballRadius*0.7;                                                            //Hitbox Y of the Top Right of ball
	var ballBRightX = ballX + ballRadius*0.7;                                                           //Hitbox X of the Bottom Right of ball
	var ballBRightY = ballY + ballRadius*0.7;                                                           //Hitbox Y of the Bottom Right of ball
	var ballBLeftX = ballX - ballRadius*0.7;                                                            //Hitbox X of the Bottom Left of ball
	var ballBLeftY = ballY + ballRadius*0.7;                                                            //Hitbox Y of the Bottom Left of ball
	
	var ballXHitboxs = new Array(ballX, ballTRightX, ballRight, ballBRightX,                            //Top, Top-left, Right, and Bottom-right x hitbox positions
								 ballX, ballBLeftX, ballLeft, ballTLeftX);                              //Bottom, Bottom-left, Left, and Top-left x hitbox positions
								 
	var ballYHitboxs = new Array(ballTop, ballTRightY, ballY, ballBRightY,                              //Top, Top-left, Right, and Bottom-right y hitbox positions
								 ballBottom, ballBLeftY, ballY, ballTLeftY);                            //Bottom, Bottom-left, Left, and Top-left y hitbox positions
	for(var i=0; i<ballXHitboxs.length; i++){                                                           //LOOP for number of hitbox positions (8)
		var ballGridCol = Math.floor(ballXHitboxs[i]/BRICK_WIDTH);                                      //Calculate the column of the current ball x position
		var ballGridRow = Math.floor(ballYHitboxs[i]/BRICK_HEIGHT);                                     //Calculate the row of the current ball y position
		var ballIndex = calcBrickGridIndex(ballGridCol,ballGridRow);                                    //Use the above two values to pinpoint the current hitbox position
			
		if(ballGridRow < NUM_OF_ROWS && ballGridRow >= 0                                                /**This determines ball to brick collision*/    
		&& ballGridCol < NUM_OF_COLS && ballGridCol >= 0){                                              //If the ball is within the bounds of the brick grid
			
			if(bricks[ballIndex] != 0){                                                                      //IF the brick is active (visable)
				remainingBricks--;
				break_brick.play();

				if(bricks[ballIndex] == 2){
					bricks[ballIndex] = 1;
					metal_hit.play();
				} 

				else if(bricks[ballIndex] == 3){
					explodeBombBrick(ballIndex);
					explosion.play();
					/*for(var i=1;i<3;i++){
						bricks[ballIndex] = 0;
						
						var up = ballIndex+(-NUM_OF_COLS*i);
						var right = ballIndex+(1*i);
						var left = ballIndex+(-1*i);
						var down = ballIndex+(NUM_OF_COLS*i);
						var corner1 = ballIndex-1-NUM_OF_COLS;
						var corner2 = ballIndex+1-NUM_OF_COLS;
						var corner3 = ballIndex+1+NUM_OF_COLS;
						var corner4 = ballIndex-1+NUM_OF_COLS;
						
						bricks[corner1] = 0;
						bricks[corner2] = 0;
						bricks[corner3] = 0;
						bricks[corner4] = 0;
						bricks[up] = 0;
						bricks[right] = 0;
						bricks[left] = 0;
						bricks[down] = 0;
					}*/
				} else {
					bricks[ballIndex] = 0;                                                              //  Set the brick to false (turn off brick)
				}
				
				var lastBallXPos = ballXHitboxs[i] - ballSpeedX;                                        //  Collect the previous X position before collision
				var lastBallYPos = ballYHitboxs[i] - ballSpeedY;                                        //  Collect the previous Y position before collision    
				var lastGridCol = Math.floor(lastBallXPos/BRICK_WIDTH);                                 //  Calculate the Column of the previous X position
				var lastGridRow = Math.floor(lastBallYPos/BRICK_HEIGHT);                                //  Calculate the Row of the previous Y position
				var collisionCheckFailed = true;                                                        //  This Boolean is used to deflect the ball diagonal of perfect corner hits
				
				if(lastGridCol != ballGridCol){                                                         //  IF the ball passed over to a new column during collision
					var adjBrickSide = calcBrickGridIndex(lastGridCol, ballGridRow);                    //      Determine the index of the adjacent brick to the one the ball collided with. (This is used to treat two bricks as a wall and not defect weird near the corners) 
					if(bricks[adjBrickSide] != 1){                                                   //      IF the adjacent brick is not active (!= true is the same as (Undefined || False))
						ballSpeedX = -ballSpeedX;                                                       //          Flip the X-axis speed. This brick is considered a verticle wall
						collisionCheckFailed = false;                                                   //          Update the boolean to tell skip the related If statement 
					}
				}
				if(lastGridRow != ballGridRow){                                                         //  IF the ball passed over to a new row during collision    
					var adjBrickTopBottom = calcBrickGridIndex(ballGridCol, lastGridRow);               //      Determine the index of the adjacent brick to the one the ball collided with. (This is used to treat two bricks as a wall and not defect weird near the corners) 
					if(bricks[adjBrickTopBottom] != 1){                                              //      IF the adjacent brick is not active (!= true is the same as (Undefined || False))
						ballSpeedY = -ballSpeedY;                                                       //          Flip the Y-axis speed. This brick is considered a horizontal wall
						collisionCheckFailed = false;                                                   //          Update the boolean to tell skip the related If statement 
					}
				}
				if(collisionCheckFailed && (i == 1 || i == 3 || i == 5 || i == 7)){                     //  IF one of the diagonal hitbox positions connect with a brick corner
					ballSpeedX = -ballSpeedX;                                                           //      Reflect X-axis Speed        
					ballSpeedY = -ballSpeedY;                                                           //      Reflect Y-axis Speed
				}                                                                                 //  This makes the ball reflect diagonally
				return;                                                                                 //  Return to prevent from hitting two bricks at once
			} //stop checking the colliding brick 
		} //stop checking if the ball is withing grid boundaries
	} //stop looping for the 8 hitbox points   
}

function detectBallBumperCollision(){
	var ballTop = ballY - ballRadius;                                                                   //Hitbox of the Top of ball
	var ballBottom = ballY + ballRadius;                                                                //Hitbox of the Bottom of ball
	var ballLeft = ballX - ballRadius;                                                                  //Hitbox of the Left of ball
	var ballRight = ballX + ballRadius;                                                                 //Hitbox of the Right of ball
	var bumpTop = bumpY;                                                                                //Hitbox of the Top of bumper
	var bumpBottom = bumpY+bumpHeight;                                                                  //Hitbox of the Bottom of bumper
	var bumpLeft = bumpX-bumpHeight/2;                                                                  //Hitbox of the Left of bumper
	var bumpRight = bumpX + bumpWidth + bumpHeight/2;                                                   //Hitbox of the Right of bumper
	var bumpCenterX = bumpX + bumpWidth/2;                                                              //Center of the bumper's X-axis   
	
	var extHitbox = 3;                                                                                  //Extra range added to hitboxes to add flexibility
	if(ballBottom >= bumpTop                                                                            //Check if the bottom of the ball makes contact
	&& ballY <= bumpTop+bumpHeight/2                                                                    //Check if the ball is on the surface to prevent hitting the side and getting stuck
	&& ballRight >= bumpLeft-extHitbox                                                                  //Check if the ball is right of the left edge of the bumper
	&& ballLeft <= bumpRight+extHitbox){                                                                //Check if the ball is left of the right edge of the bumper               
																										//IF the collision occurs                                                                                   
		var aimCalibration = baseBallSpeedX/30;                                                         //  Divide speed/30 to keep gradual scaling. This variable affects the power of the shot on both X and Y axis. To change only Y axis, go to aimPowerY.
		var xDistanceFromBumperCenter = ballX - bumpCenterX;                                            //  The distance (positive or negative) from the center of the bumper to the ball.                    
		
		var calibratedAimFromCenter = xDistanceFromBumperCenter*aimCalibration;                         //  A calibrated version of the distance from center to have less drastic changes. (This is essentially aimPowerX) (Outer edges affext X most)
		var aimPowerY = -((bumpWidth/2*1.3)*aimCalibration);                                            //  This does the reverse of the above variable by calculating a maximum power and subtracting the distance from center. (Center affects Y most)
		
		ballSpeedX = calibratedAimFromCenter;                                                           //  Assign ballSpeedX it's speed value, calulated above.    
		
		if(ballSpeedY > 0){                                                                             //  Ensures that the ball does not get sent downwards on hit (or juggle)
			if(xDistanceFromBumperCenter >= 0){                                                         //  IF the ball is to the right of bumper center,
				ballSpeedY = aimPowerY+calibratedAimFromCenter;                                         //      Calculate ballSpeedY by adding
			}
			if(xDistanceFromBumperCenter <= 0){                                                         //  IF the ball is to the left of bumper center,
				ballSpeedY = aimPowerY-calibratedAimFromCenter;                                         //      Calculate ballSpeedY by subtracting
			}
		}   
		if(remainingBricks <= 0){                                                                       //IF the Ball touched the Bumper after all of the bricks are destroyed
			 brickReset();                                                                              //  Call brickReset to reset the grid 
		}
	} //end check for bumper collision         
}

function ballReset(){
	ballX = 500;//c.width/2;                                                                                  //Set ballX value to be in the middle of the screen
	ballY = 500;//c.height/2+50;                                                                                 //Set ballY value to be in the middle of the screen
	ballSpeedX = -baseBallSpeedX;                                                                        //Reset ballSpeedX value to it's base value    
	ballSpeedY = -baseBallSpeedY;                                                                        //Reset ballSpeedY value to it's base value   
}

function brickReset(){
	remainingBricks = 0;
	for(var i=0; i<NUM_OF_ROWS * NUM_OF_COLS; i++){                                                     //LOOP for the total number of all bricks (currently 30x25=750 bricks)    
		bricks[i] = 1;                                                                               //Turn all bricks on during reset
	}
	//remainingBricks = remainingBricks - ((NUM_OF_COLS + (NUM_OF_ROWS*2))-2);                            //Subtract the number of bricks being deleted from the grid outer layer. The extra -2 is to account for the two corners that overlap
	remainingLives = totalLives;
}

function checkPlayerLives(){
	if(remainingLives <= 0){
		brickReset();
		ballReset();
	}
}

function explodeBombBrick(bombIndex){
	for(var i=1;i<3;i++){

		var up = bombIndex+(-NUM_OF_COLS*i);
		var right = bombIndex+(1*i);
		var left = bombIndex+(-1*i);
		var down = bombIndex+(NUM_OF_COLS*i);
		var corner1 = bombIndex-1-NUM_OF_COLS;
		var corner2 = bombIndex+1-NUM_OF_COLS;
		var corner3 = bombIndex+1+NUM_OF_COLS;
		var corner4 = bombIndex-1+NUM_OF_COLS;
		
		var destroyedBricks = new Array(
								up,
								right,
								left,
								down,
								corner1,
								corner2,
								corner3,
								corner4
								);
		
		for(var p=0;p<destroyedBricks.length;p++){
			var destroyIndex = destroyedBricks[p];
			console.log(destroyedBricks[p]);
			
			/*if(bricks[destroyIndex] == 3){
				explodeBombBrick(destroyIndex);
			}*/
			
			bricks[destroyIndex] = 0;
			
		}
		bricks[bombIndex] = 0;
	}
}

function calcBrickGridIndex(c, r){                                                                      //Calculate brick id using col and row
	return (r * NUM_OF_COLS) + c;                                                                       //id = (current row * total columns) + current column 
}

function drawBricks(){
	var activeBricks = 0;
	for(var row=0; row<NUM_OF_ROWS; row++){                                                             //Loop through the NUM_OF_ROWS and carry a row id to assign to each brick        
		for(var col=0; col<NUM_OF_COLS; col++){                                                         //Loop through the NUM_OF_COLS and carry a col id to assign to each brick   
			
			var gridIndex = calcBrickGridIndex(col, row);                                               //Calculate the id of the current brick being drawn    
			
			if(col==0 || col==(NUM_OF_COLS-1) || row == 0){                                             
				bricks[gridIndex] = 0;                                                              //Remove one layer of bricks on the left side, right side and top of screen
			}
			switch(bricks[gridIndex]){
				case 0:
					break;
				case 1:
					drawBasicBrick(col,row,gridIndex);
					break;
				case 2:
					drawArmouredBrick(col,row,gridIndex);
					break;
				case 3:
					drawBombBrick(col,row,gridIndex);
					break;
			}
			if(bricks[gridIndex] != 0){
				activeBricks++;
			}
		}// stop drawing bricks 
		remainingBricks = activeBricks;
	}
}

function drawBasicBrick(col,row,index){
	cc.drawImage(brickSprite,BRICK_WIDTH*col+wallGap,BRICK_HEIGHT*row+wallGap);
	//drawRect(BRICK_WIDTH*col+wallGap,BRICK_HEIGHT*row+wallGap,                          //      Paint the brick using BRICK_COLOUR    
			 //BRICK_WIDTH-BRICK_GAP,BRICK_HEIGHT-BRICK_GAP,                                                 
			 //BRICK_COLOUR);
}

function drawArmouredBrick(col,row,index){
	cc.drawImage(armouredBrickSprite,BRICK_WIDTH*col+wallGap,BRICK_HEIGHT*row+wallGap);
	//drawRect(BRICK_WIDTH*col+wallGap,BRICK_HEIGHT*row+wallGap,                          //      Paint the brick red    
			 //BRICK_WIDTH-BRICK_GAP,BRICK_HEIGHT-BRICK_GAP, 
			 //'silver');
}

function drawBombBrick(col,row,index){
	cc.drawImage(bombBrickSprite,BRICK_WIDTH*col+wallGap,BRICK_HEIGHT*row+wallGap);
	//drawRect(BRICK_WIDTH*col+wallGap,BRICK_HEIGHT*row+wallGap,                          //      Paint the brick red    
			 //BRICK_WIDTH-BRICK_GAP,BRICK_HEIGHT-BRICK_GAP, 
			 //'red');
}
		
function drawBumper(){ 
	drawRect(bumpX,bumpY,bumpWidth,bumpHeight,bumpColour);                                              //Draw main body of the bumper
	drawCircle(bumpX,bumpY+bumpHeight/2,bumpHeight/2,bumpColour);                                       //Draw round edge on left side of bumper
	drawCircle(bumpX+bumpWidth,bumpY+bumpHeight/2,bumpHeight/2,bumpColour);                             //Draw round edge on right side of bumper
	
	drawRect(bumpX+bumpWidth/2-1,bumpY,3,bumpHeight,'black');                                           //Draw middle line on bumper
	drawRect(bumpX+8,bumpY,1,3,'black');                                                                //Draw left notch on bumper
	drawRect(bumpX+bumpWidth-8,bumpY,1,3,'black');                                                      //Draw right notch on bumper                                                    
}

function drawText(x,y,string,colour){
	cc.fillStyle = colour;                                                                              //Set the text colour to the colour id provided    
	cc.fillText(string, x, y);                                                                          //Draw the text using the string provided
	
}

function drawGrid(gridColour){
	for(var row=0; row<NUM_OF_ROWS+1; row++){                                                           //LOOP for NUM_OF_ROWS
		drawRect(0,BRICK_HEIGHT*row-1,c.width,2,gridColour)                                             //Draw the vertical lines to the grid (limited to NUM_OF_COLS) 
	}
	for(var col=0; col<NUM_OF_COLS+1; col++){                                                           //LOOP for NUM_OF_COLS
		drawRect(BRICK_WIDTH*col-1,0,2,NUM_OF_ROWS*(BRICK_HEIGHT),gridColour)                           //Draw the horizontal lines to the grid (limited to NUM_OF_ROWS) 
	}
}

function drawMouseGridID(){
	var mouseGridCol = Math.floor(mouseX/BRICK_WIDTH);                                                  //Calculate the mouseX position grid row
	var mouseGridRow = Math.floor(mouseY/BRICK_HEIGHT);                                                 //Calculate the mouseY position grid column
	var mouseIndexIndicator = calcBrickGridIndex(mouseGridCol, mouseGridRow);                           //Calculate the the ID of the brick using the mouse's corrdinates
	drawRect(mouseX+1,mouseY-9,50,9,'black');                                                           //Draw a black rectangle to deplay text on
	drawText(mouseX+2,mouseY-1,mouseGridCol+","+mouseGridRow+":"+mouseIndexIndicator,'lime');           //Display the column,row, and ID of the current brick by the mouse
}

function drawBallTracking(){
	var ballTrackingColour = ballColour;                                                                //Assign the ballTracking colour (usually is ballColour)
	
	var dottedLineGap = 15;                                                                             //Set the distance of the gap between each dot    
	var dotSize = 1;                                                                                    //Set the size of each dot
	
	if(ballTracking == true){                                                                           //IF ballTracking is toggled on 
		var ballsX = [];                                                                                //  Create array to contain the x values of each dot
		var ballsY = [];                                                                                //  Create array to contain the y values of each dot
		
		for(i = 0; i < 50; i++){                                                                        //  LOOP 50 times 
		
			xPos = ballSpeedX*(dottedLineGap*i);                                                        //    Use the ballSpeedX value to predict the displacement of the x coordinate
			yPos = ballSpeedY*(dottedLineGap*i);                                                        //    Use the ballSpeedX value to predict the displacement of the x coordinate
			var x = ballX+xPos;                                                                         //    Use the posX value to predict the future x values of the ball
			var y = ballY+yPos;                                                                         //    Use the posY value to predict the future y values of the ball
			
			drawCircle(x,y,dotSize,ballTrackingColour);                                                 //    Draw the current dot in the loop
			
			drawRect(ballX-8,c.height-4,16,4,'lime');                                                   //    Draw the sliding rectangle at the bottom of the screen to indicate the ball X position to the player
		}//stop looping the main function
	}
}

function toggleBallTracking(){ 
	if(ballTracking == true){                                                                           //IF the ball tracker is off, turn it on
		ballTracking = false;
	}
	if(ballTracking == false){                                                                          //IF the ball tracker is off, turn it on
		ballTracking = true;                                                                            
	}
}

function drawCircle(centerX,centerY,radius,colour){                                                     //Function to draw a circle
	cc.fillStyle = colour;                                                                              //Set the fillStyle to the colour argument
	cc.beginPath();                                                                                     //Begin drawing path
	cc.arc(centerX,centerY,radius,0,Math.PI*2,true);                                                    //Draw circle using the provided arguments    
	cc.fill();                                                                                          //Fill circle area
}

function drawRect(x,y,w,h,colour){
	cc.fillStyle = colour;                                                                              //Set background colour
	cc.fillRect(x,y,w,h);                                                                               //Fill rectangle area
}

function setMapLayout(mapName){
	
	/**DEFAULT MAP LAYOUT*/
	bricks = new Array //0 == inactive, 1 == normal brick, 2 = armoured brick, 3 = bomb brick, 4.
					//0,1,2,3,4,5,6,7,8,9,0,1,2,1,0,9,8,7,6,5,4,3,2,1,0 Used to gauge x position
					 (0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
					  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
					  0,0,0,0,0,0,1,1,1,3,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,
					  0,0,0,0,0,1,1,1,1,1,1,1,3,1,1,1,3,1,1,1,0,0,0,0,0,
					  0,0,0,0,1,0,3,1,1,1,1,1,1,1,3,1,1,1,1,0,1,0,0,0,0,
					  0,0,0,0,1,1,0,1,0,0,0,0,0,0,0,0,0,1,0,3,1,0,0,0,0,
					  0,0,0,0,1,1,1,0,1,1,3,1,1,1,1,1,3,0,1,1,1,0,0,0,0,
					  0,0,0,0,1,3,1,0,1,1,1,2,2,2,1,1,1,0,1,1,1,0,0,0,0,
					  0,0,0,0,1,1,1,0,3,1,1,2,3,2,1,1,1,0,1,1,3,0,0,0,0,
					  0,0,0,0,1,1,1,0,1,1,1,2,2,2,3,1,1,0,1,1,1,0,0,0,0,
					  0,0,0,0,1,1,1,3,1,1,1,1,1,1,1,1,1,3,1,1,1,0,0,0,0,
					  0,0,0,0,2,3,1,0,1,3,1,1,3,1,1,3,1,0,1,3,2,0,0,0,0,
					  0,0,0,0,2,1,0,1,3,1,1,1,1,1,1,1,1,1,0,1,2,0,0,0,0,
					  0,0,0,0,0,2,1,1,1,1,1,1,1,3,1,1,3,1,1,2,0,0,0,0,0,
					  0,0,0,0,0,0,2,2,3,1,3,1,1,1,1,1,1,2,2,0,0,0,0,0,0,
					  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
					  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);
}