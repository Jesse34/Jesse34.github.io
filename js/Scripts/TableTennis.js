var canvas;
var canvasContext;
var ballX = 400;
var ballY = 300;
var tmlBlue = '#013E7F';
var bosGold = '#FDB930';
var ballColour = '#016F4A';
var bumper1Colour = tmlBlue;
var bumper2Colour = bosGold;

var startGame = true;

var mouseX;
var mouseY; 

var xPos; // Used to generate cheatmode dotted line
var yPos;

var aimAssist = false;
var mouseTracking = false;
var ballTracking = false;
var assistOnOff = 0; //Used to toggle aimAssist (assistOnOff%2 == 0) is Off
var mouseTrackingOnOff = 0; //Used to toggle mouseTracking (mouseTrackingOnOff%2 == 0) is Off
var ballTrackingOnOff = 0; //Used to toggle ballTracking (ballTrackingOnOff%2 == 0) is Off

var player1Score = 0;
var player2Score = 0;
const scoreLimit = 10;

var displayMainMenu = true;
var displayWinScreen = false;

var aiBaseSpeed = 1.6; //1.6 = easy, 1.7 = medium, 1.8 = hard
var aiSpeed = aiBaseSpeed;
var aiSpeedLimit = aiBaseSpeed+0.3;
var aiBaseAcceleration = aiBaseSpeed*0.003;
var aiAcceleration = aiBaseAcceleration;

var ballSpeedX;
var ballSpeedY;
var ballSpeed;
var ballAcceleration = 0.05;
var ballRadius = 5;
var velocity = 0;
var topVelocity = 0;
randomizeStartingBall();

var bumper1Y = 250;
var bumper1X = 20;

var bumper2Y = 250;
var bumper2X; //references canvas so the value is defined in function 

var bumperHeight = 100;
var bumperWidth = 12;
var triggerDistance = bumperHeight/6;

//Variables for the Difficulty Pointer 
var diffPX = 65;
var diffPY = 290;

//Variables for the Bumper Size Button Pointer 
var sizePX = 220;
var sizePY = 420;

//These values are relevant to clicking the cheatmode button
var cheatBX = 270;
var cheatBY = 15;
var cheatBWidth = 76;
var cheatBHeight = 15;

//These values are relevant to clicking the Aim Assist button
var aaX = 270;
var aaY = 15;
var aaWidth = 76;
var aaHeight = 15;

var btnTxtOnColour = '#228B22';
var btnBorderOnColour = '#3CB371';
var btnTxtOffColour = '#C23636';
var btnBorderOffColour = '#9B1A1A';

function mouseClick(evt){
	if(displayWinScreen){
		player1Score = 0;
		player2Score = 0;
		
		aiAcceleration = aiBaseAcceleration;
		displayWinScreen = false;   
	}
	if(displayMainMenu){
		//Check if clicked START Button
		if(mouseX >= 275 && mouseX <= 525
			&& mouseY >= 200 && mouseY <= 287){
			startGame = true;
			displayMainMenu = false;
		}
		//Check if Clicked Bumper Size Change 
		if(mouseX > 560 && mouseY > 485){
			changeBallColour();
		}
		if(true){
			changeBumperSize();
		}
		//Check if Clicked Difficulty Change
		if(mouseX >= 43 && mouseX <= 217
			&& mouseY >= 233 && mouseY <= 287){
			changeDifficulty();
		}
	}
	
	if(startGame){
		var extHitbox = 3;
		if(mouseX >= cheatBX-extHitbox && mouseX <= cheatBX+cheatBWidth+extHitbox
			&& mouseY >= cheatBY-extHitbox && mouseY <= cheatBY+cheatBHeight+extHitbox){
			ballTrackToggle();
		}
		if(mouseX >= aaX-extHitbox && mouseX <= aaX+aaWidth+extHitbox
			&& mouseY >= aaY-extHitbox && mouseY <= aaY+aaHeight+extHitbox){
			aimAssistToggle();
		}
	}
	console.log(mouseX+" "+mouseY);
}

function keyPressed(evt){
	var key = evt.keyCode;
	
	//"x" pressed to turn on MouseTracking
	if(key == 88){ //X
		mouseTrackToggle();
	}
}

window.addEventListener('keydown',keyPressed,false);

window.onload = function() {
	canvas = document.getElementById('gameCanvas');
	canvasContext = canvas.getContext('2d');
	
	var framesPerSecond = 288; //FPS rate
	setInterval(function(){
		if(startGame){
			moveEverything(); //move
			drawCanvas(); //repaint
		}
	},1000/framesPerSecond); //Called each game cycle
	
	//Listen for mouse click on menu screens
	canvas.addEventListener('mousedown',mouseClick);
	
	//Track Mouse x,y coordinates
	canvas.addEventListener('mousemove', 
		function(evt) {
			var mousePos = calculateMousePos(evt);
			//if(bumper1Y-bumperWidth < canvas.height-bumperHeight){ //Checks if not hitting the floor, then updates position
				mouseX = mousePos.x;
				mouseY = mousePos.y
				bumper1Y = mouseY-(bumperHeight/2);
				
			/** This code stops the paddle from going above or below the screen
			if(bumper1Y-bumperWidth <= 0){ //Stops bumper from being jittery on the ceiling
				bumper1Y = bumperWidth;
			}
			if(bumper1Y+bumperHeight+bumperWidth >= canvas.height){ //Stops bumper from being jittery on the floor
				bumper1Y = canvas.height-bumperHeight-bumperWidth;
			}*/
		});
	   
	/**canvas.addEventListener('mousemove',    //This code controls the right bumper
		function(evt) {
			var mousePos = calculateMousePos(evt);
			bumper2Y = mousePos.y-(bumperHeight/2);
		});*/
}

	/**                
		TODO:   
				-Include a boost to ballSpeedX if the ball hits closer to the center of the bumper
				-Randomize ball velocity's using doubles instead of ints to have more dynamic ball spawns
				-Main Menu Screen
				-Difficulty level
				-Interchangeable backgrounds
				-Winning Screen
				-Leafs Logo Lettering and Styling
				-Powerups
		FIXED:  
				-aiAcceleration / ai speeds up slightly when the ball is far away (Used for difficulty balance)
				-Forcefield on left bumper x-Axis
				-Ball getting stuck inside Left Bumper, forcefield above left bumper
				-BOTH Bumpers have a limit on how high and low it can go.
					limit = bumperWidth(currently 15px) from the ceiling/floor
		
		Features: 
				-Aiming shots cheatBY hitting the ball above or below the center of the bumper. The further from the center, the harder the hit.
				-Cheatmode / ball path tracking (Would like to get the path to reflect the future bounce path)
				-aimAssist bumper tracking
				-mouseTracking on x-axis and y-axis
	*/

function drawCanvas() {

	openMainMenu();
	openWinningScreen();
	
	if(displayWinScreen){
		return;
	}
	
	if(displayMainMenu){
		return;
	}
	
	drawRect(0,0,canvas.width,canvas.height,'black'); //Background

	drawDetails(); //Goal lines, Center Ice, Background details
	
	drawAimAssist();
	drawBallTracking(); //Cheatmode for the ball's path
	drawMouseTracking(); //x-axis and y-axis tracking (toggled at runtime)
	
	updateLeftBumper(); //Main rectangle and top/bottom bump
	updateRightBumper(); //TODO Top/bottom bumps
	
	drawCircle(ballX,ballY,ballRadius+1.5,'silver'); //Ball Outline
	drawCircle(ballX,ballY,ballRadius,ballColour); //Ball
	
	displayScore();
	canvasContext.fillText("Ball Speed: "+(velocity.toFixed(2)),250,canvas.height-25);
	//canvasContext.fillText("BallX Speed: "+(ballSpeedX.toFixed(2)),450,canvas.height-25);
	//canvasContext.fillText("BallY Speed: "+(ballSpeedY.toFixed(2)),550,canvas.height-25);
}

function computerMovement(){
	var bumper2YCenter = bumper2Y + bumperHeight/2;
	bumper2X = canvas.width-bumper1X-bumperWidth; //refrences canvas so the value is defined in function
 
	
	if(ballY > bumper2Y+triggerDistance && ballY < bumper2Y+bumperHeight-triggerDistance){ 
		aiSpeed = 0; 
	} else if(aiSpeed > -aiBaseSpeed && aiSpeed < aiBaseSpeed){ 
		aiSpeed = aiBaseSpeed;
	}
	
	if ((bumper2Y-bumperWidth < canvas.width-bumperHeight) && (bumper2Y+bumperWidth > 0)){
		if(bumper2Y+bumperHeight-triggerDistance < ballY+ballRadius){ //AI move down
			bumper2Y += aiSpeed;
			aiSpeed += aiAcceleration;
			
		} else if(bumper2Y+triggerDistance > ballY-ballRadius){ //AI move up 
			bumper2Y -= aiSpeed;
			aiSpeed += aiAcceleration;
		} 
		if(aiSpeed>aiSpeedLimit){
			aiSpeed = aiSpeedLimit
		}
	}
	
	if(bumper2Y-bumperWidth < 0){
		bumper2Y = bumperWidth;
	}
	if(bumper2Y+bumperWidth > canvas.height-bumperHeight){
		bumper2Y = canvas.height-bumperHeight-bumperWidth;
	}
}

function moveEverything(){
	
	if(displayWinScreen){
		return;
	}
	
	if(displayMainMenu){
		return;
	}
	
	if(bumper2Y+bumperHeight < canvas.height+1){ //Moves bumper2 and prevents from getting stuck in floor
		computerMovement();
	} else {
		bumper2Y = canvas.height-bumperHeight;
	}
	
	if(ballSpeedX > bumperWidth-1) //Set ballSpeedX to be equal to the bumperWidth to prevent the ball passing through
	ballSpeedX = bumperWidth-1;
	
	if(ballSpeedX < -bumperWidth+1) //Set ballSpeedX to be equal to the bumperWidth to prevent the ball passing through
	ballSpeedX = -bumperWidth+1;
	
	ballX += ballSpeedX;
	ballY += ballSpeedY;
	
	//Ball Reset on right wall
	if((ballX+ballRadius > bumper2X+bumperWidth)){
		player1Score++;
		ballReset();
	}
	
	//Ball Reset on left wall
	if(ballX-ballRadius < bumper1X-bumperWidth){
		player2Score++;
		ballReset();
	}
	
	var extraRange = 3; //Used to get an extra length of invisible hitbox for hitbox forgiveness
	if(((ballX-ballRadius <= bumper1X+bumperWidth) && (ballX-ballRadius >= bumper1X) 
			&& (ballY+ballRadius >= bumper1Y-bumperWidth/2-extraRange) && (ballY-ballRadius <= bumper1Y+bumperHeight+bumperWidth/2+extraRange))
			|| (ballX > bumper2X-ballRadius)){ //Check if ball hit either bumper
			
		var xPower = 0.0175;
		var yPower = 0.04;
		
		if(((ballX-ballRadius <= bumper1X+bumperWidth) && (ballX-ballRadius >= bumper1X)
			&& (ballY+ballRadius >= bumper1Y-bumperWidth/2-extraRange) && (ballY-ballRadius <= bumper1Y+bumperHeight+bumperWidth/2+extraRange))){ //Bounce off the Left Bumper side
				 
			if(ballSpeedX < 0) //If ball is going left, make it go right to avoid getting stuck
				ballSpeedX = -ballSpeedX; 
				
				var differenceY = ballY-(bumper1Y+bumperHeight/2+extraRange); //Aimed shots from player
				ballSpeedY = differenceY*yPower;
				
				if(differenceY > 0)
					ballSpeedX += differenceY*xPower;
					
				if(differenceY < 0)
					ballSpeedX += -differenceY*xPower;
		}

		if((ballX+ballRadius >= bumper2X)&& (ballX+ballRadius <= bumper2X+bumperWidth) && //Bounce off the Right Bumper
			(ballY+ballRadius >= bumper2Y-bumperWidth/2 &&         //Bottom edge of right bumper
			ballY-ballRadius <= bumper2Y+bumperHeight+bumperWidth/2)){ //Top edge of right bumper
			
			if(ballSpeedX > 0){ //If ball is going right, make it go left to avoid getting stuck
				ballSpeedX = -ballSpeedX;
				
				var differenceY = ballY-(bumper2Y+bumperHeight/2); //Aimed shots from AI
					ballSpeedY = differenceY*yPower;
			
				if(differenceY < 0)
					ballSpeedX += differenceY*xPower;
				
				if(differenceY > 0)
					ballSpeedX += -differenceY*xPower;
			}
		}    
		ballBumpAccelerate(); //Accelerate the ball after every bumper hit
		}
	ballConstAccelerate();

	if(ballY >= canvas.height-(ballRadius)){ //Bounce off floor
		ballSpeedY = -ballSpeedY;
	}
	if(ballY <= 0){ //Bounce off top wall
		ballSpeedY = -ballSpeedY;
	}
	calculateVelocity();
	//console.log(aiSpeed.toFixed(3)+" "+aiAcceleration.toFixed(5));
}

function openMainMenu(){
	if(displayMainMenu){
		drawRect(0,0,canvas.width,canvas.height,'grey'); //Background Border
		drawRect(4,4,canvas.width-8,canvas.height-8,'silver'); //Background
		
		//MainMenu Header
		drawRect(75,25,650,141,tmlBlue); //Main Menu Header Border
		drawRect(77,27,646,137,'silver');
		drawRect(82,32,636,127,tmlBlue); 
		drawRect(84,34,632,123,'lightgrey'); //Main Menu Header
		canvasContext.fillStyle = 'black';
		canvasContext.font='60px Comic Sans MS, cursive, sans-serif';
		canvasContext.fillText("2D TABLE-TENNIS",117.5,115);
		
		//MainMenu START Button
		drawRect(275,200,250,87,'black'); //Start Button black border
		drawRect(280,205,240,77,'darkgrey');
		drawRect(282,207,236,73,'#B22222');
		canvasContext.fillStyle = 'black';
		canvasContext.font='60px Arial Black, Gadget, sans-serif';
		canvasContext.fillText("START",290,265);
		
		//Ball Colour example
		drawCircle(canvas.width/2+100,canvas.height-75,40+1.5,'black'); //Ball Outline
		drawCircle(canvas.width/2+100,canvas.height-75,40,ballColour); //Ball
		
		//Ball Colour Selections
		drawRect(560,485,60,20,'#B22222');      //Colour Border
			drawRect(562,487,56,16,'black');   //black Fill   
		drawRect(640,485,60,20,'orange');
			drawRect(642,487,56,16,'black');
		drawRect(720,485,60,20,'yellow');
			drawRect(722,487,56,16,'black');
		drawRect(560,515,60,20,'lime');
			drawRect(562,517,56,16,'black');
		drawRect(640,515,60,20,'cyan');
			drawRect(642,517,56,16,'black');
		drawRect(720,515,60,20,'#1270E0');
			drawRect(722,517,56,16,'black');
		drawRect(560,545,60,20,'#9455C2');
			drawRect(562,547,56,16,'black');
		drawRect(640,545,60,20,'hotpink');
			drawRect(642,547,56,16,'black');
		drawRect(720,545,60,20,'white');
			drawRect(722,547,56,16,'black');
		
		//Labels for the Ball Colour Buttons
			canvasContext.fillStyle = '#B22222';
			canvasContext.font='17px Comic Sans MS, cursive, sans-serif';
			canvasContext.fillText("RED",574,501);
			canvasContext.fillStyle = 'orange';
			canvasContext.font='13px Comic Sans MS, cursive, sans-serif';
			canvasContext.fillText("ORANGE",642,500);
			canvasContext.fillStyle = 'yellow';
			canvasContext.font='13px Comic Sans MS, cursive, sans-serif';
			canvasContext.fillText("YELLOW",722.5,500);
			canvasContext.fillStyle = 'lime';
			canvasContext.font='15px Comic Sans MS, cursive, sans-serif';
			canvasContext.fillText("LIME",571,530);
			canvasContext.fillStyle = 'cyan';
			canvasContext.font='15px Comic Sans MS, cursive, sans-serif';
			canvasContext.fillText("CYAN",648.5,530);
			canvasContext.fillStyle = '#1270E0';
			canvasContext.font='15px Comic Sans MS, cursive, sans-serif';
			canvasContext.fillText("BLUE",731,530);
			canvasContext.fillStyle = '#9455C2';
			canvasContext.font='13px Comic Sans MS, cursive, sans-serif';
			canvasContext.fillText("PURPLE",567,560);
			canvasContext.fillStyle = 'hotpink';
			canvasContext.font='15px Comic Sans MS, cursive, sans-serif';
			canvasContext.fillText("PINK",651,560);
			canvasContext.fillStyle = 'white';
			canvasContext.font='13px Comic Sans MS, cursive, sans-serif';
			canvasContext.fillText("WHITE",726,560);
		
		//Bumper Size example
		drawRect(bumper1X,canvas.height-200,bumperWidth,bumperHeight,bumper1Colour); //Left Bumper
		drawCircle(bumper1X+bumperWidth/2,canvas.height-200,bumperWidth/2,bumper1Colour); //Left Bumper Top Edge
		drawCircle(bumper1X+bumperWidth/2,canvas.height-200+bumperHeight,bumperWidth/2,bumper1Colour); //Left Bumper Bottom Edge
		
		//Draw Bumper Size SMALL Button
		drawRect(75,400,140,40,'grey'); 
		drawRect(77,402,136,36,'palegreen');
			canvasContext.fillStyle = 'black';
			canvasContext.font='35px Arial Black, Gadget, sans-serif';
			canvasContext.fillText("SMALL",78,433);
			
		//Draw Bumper Size MEDIUM Button
		drawRect(75,450,140,40,'grey'); 
		drawRect(77,452,136,36,'palegreen');
			canvasContext.fillStyle = 'black';
			canvasContext.font='29px Arial Black, Gadget, sans-serif';
			canvasContext.fillText("MEDIUM",78,481);
			
		//Draw Bumper Size LARGE Button
		drawRect(75,500,140,40,'grey'); 
		drawRect(77,502,136,36,'palegreen');
			canvasContext.fillStyle = 'black';
			canvasContext.font='35px Arial Black, Gadget, sans-serif';
			canvasContext.fillText("LARGE",78,533);
		
		//Draw Difficulty Selector Buttons
		drawRect(52,223,157,1,'black'); 
			canvasContext.fillStyle = 'black';
			canvasContext.font='35px Comic Sans MS, cursive, sans-serif';
			canvasContext.fillText("Difficulty",50,220);
		drawCircle(70,260,27,'black'); //Outlines
		drawCircle(130,260,27,'black');
		drawCircle(190,260,27,'black');
		drawCircle(70,260,26,'#0589C7'); //Colours
		drawCircle(130,260,26,'#EAD224');
		drawCircle(190,260,26,'#B22222');
		
			canvasContext.font='15px Comic Sans MS, cursive, sans-serif';
			canvasContext.fillStyle = 'black';
			canvasContext.fillText("Easy",55,265);
			canvasContext.fillText("Normal",105,265);
			canvasContext.fillText("Hard",172,265);
		
		//Difficulty Selection Pointer
		drawPointer();

		canvasContext.fillStyle = 'black';
		canvasContext.font='10px Comic Sans MS, cursive, sans-serif';
		canvasContext.fillText("Created by: Jesse Burke",10,590);
		//canvasContext.fillText("Map Selection TBD...",500,400);
		return;
	}
}

function openWinningScreen(){
	if(displayWinScreen){
	
		drawRect(0,0,canvas.width,canvas.height,'black'); //Background
		canvasContext.fillStyle = 'white';
		
		if(player1Score >= scoreLimit){
			canvasContext.fillText("You win "+player1Score+" - "+player2Score+"!",canvas.width/2-25,200);
		}else if(player2Score >= scoreLimit){
			canvasContext.fillText("You lost to the computer "+player2Score+" - "+player1Score+"!",canvas.width/2-65,200);
		}
		
		canvasContext.fillText("The highest velocity reached was: "+topVelocity.toFixed(4)+"m/s",canvas.width/2-92,400);
		
		canvasContext.fillText("Click to Continue",canvas.width/2-30,500);
		return;
	}
}

//1.6 = easy, 1.7 = medium, 1.8 = hard
function changeDifficulty(){
	if(mouseX >= 43 && mouseX <= 97
		&& mouseY >= 233 && mouseY <= 287){
		aiBaseSpeed = 1.7; //Set difficulty to easy
		diffPX = 65;
	}
	if(mouseX >= 103 && mouseX <= 157
		&& mouseY >= 233 && mouseY <= 287){
		aiBaseSpeed = 1.8; //Set difficulty to normal
		diffPX = 126;
	}
	if(mouseX >= 163 && mouseX <= 217
		&& mouseY >= 233 && mouseY <= 287){
		aiBaseSpeed = 1.9; //Set difficulty to hard
		diffPX = 187;
	}
}
		
function changeBumperSize(){
	if(mouseX > 75 && mouseX < 215 && //Set Bumper size to small
		mouseY > 400 && mouseY < 440){
		bumperHeight = 100;
		sizePY = 420;
	}
	if(mouseX > 75 && mouseX < 215 &&
		mouseY > 450 && mouseY < 490){
		bumperHeight = 125;
		sizePY = 470;
	}
	if(mouseX > 75 && mouseX < 215 &&
		mouseY > 500 && mouseY < 540){
		bumperHeight = 150;
		sizePY = 520;
	}
}

function changeBallColour(){
	if(mouseX >= 560 && mouseX <= 620
			&& mouseY >= 485 && mouseY <= 505){
		ballColour = '#B22222';
	} else if(mouseX >= 640 && mouseX <= 700
			&& mouseY >= 485 && mouseY <= 505){
		ballColour = 'orange';
	} else if(mouseX >= 720 && mouseX <= 780
			&& mouseY >= 485 && mouseY <= 505){
		ballColour = 'yellow';
	} else if(mouseX >= 560 && mouseX <= 620
			&& mouseY >= 515 && mouseY <= 535){
		ballColour = 'lime';
	} else if(mouseX >= 640 && mouseX <= 700
			&& mouseY >= 515 && mouseY <= 535){
		ballColour = 'cyan';
	} else if(mouseX >= 720 && mouseX <= 780
			&& mouseY >= 515 && mouseY <= 535){
		ballColour = '#1270E0';
	} else if(mouseX >= 560 && mouseX <= 620
			&& mouseY >= 545 && mouseY <= 565){
		ballColour = 'purple';
	} else if(mouseX >= 640 && mouseX <= 700
			&& mouseY >= 545 && mouseY <= 565){
		ballColour = 'hotpink';
	} else if(mouseX >= 720 && mouseX <= 780
			&& mouseY >= 545 && mouseY <= 565){
		ballColour = 'white';
	} 
}

function ballReset(){
	aiAcceleration += aiAcceleration/30;
	
	if(player1Score >= scoreLimit ||
	   player2Score >= scoreLimit){
	   displayWinScreen = true;
	}

	ballSpeedX = randomInt(1,1.4);
	ballSpeedY = randomInt(1,1.4);
	
	var percent25 = randomInt(1,4);
	if(percent25 == 1){
	ballSpeedY = ballSpeedY;
	ballSpeedX = -ballSpeedX;
	}
	if(percent25 == 2){
	ballSpeedY = -ballSpeedY;
	ballSpeedX = ballSpeedX;
	}
	if(percent25 == 3){
	ballSpeedY = ballSpeedY;
	ballSpeedX = ballSpeedX;
	}
	if(percent25 == 4){
	ballSpeedY = -ballSpeedY;
	ballSpeedX = -ballSpeedX;
	}
	
	ballX = canvas.width/2;
	ballY = canvas.height/2;
}

function randomizeStartingBall(){
	var option = randomInt(1,4);
	
	ballSpeedX = randomInt(1,1.4);
	ballSpeedY = randomInt(1,1.4);
	
	switch(option) {
	case 1:
		ballSpeedX = ballSpeedX;
		ballSpeedY = ballSpeedY;
		break;
	case 2:
		ballSpeedX = ballSpeedX;
		ballSpeedY = -ballSpeedY;
		break;
	case 3:
		ballSpeedX = -ballSpeedX;
		ballSpeedY = ballSpeedY;
		break;
	case 4:
		ballSpeedX = -ballSpeedX;
		ballSpeedY = -ballSpeedY;
		break;    
	}
}

function ballBumpAccelerate(){
	
	if(ballSpeedX > 0){
		ballSpeedX += ballAcceleration;
	}
	if(ballSpeedX < 0){
		ballSpeedX -= ballAcceleration;
	}
	if(ballSpeedY > 0){
		ballSpeedY += ballAcceleration;
	}
	if(ballSpeedY < 0){
		ballSpeedY -= ballAcceleration;
	}
}

function ballConstAccelerate(){
	
	if(ballSpeedX > 0){
		ballSpeedX += ballSpeedX*0.0001;
	}
	if(ballSpeedX < 0){
		ballSpeedX += ballSpeedX*0.0001;
	}
	if(ballSpeedY > 0){
		ballSpeedY += ballSpeedY*0.0001;
	}
	if(ballSpeedY < 0){
		ballSpeedY += ballSpeedY*0.0001;
	}
}

function calculateVelocity(){
	var x
	var y
	
	if(ballSpeedX < 0)
	x = -ballSpeedX;
	
	if(ballSpeedY < 0)
	y = -ballSpeedY;
	
	if(ballSpeedX > 0)
	x = ballSpeedX;
	
	if(ballSpeedY > 0)
	y = ballSpeedY;
	
	velocity = (x+y)/2;
	if(velocity >= topVelocity)
		topVelocity = velocity;
}

function calculateMousePos(evt){
	var rect = canvas.getBoundingClientRect();
	var root = document.getElementById("game-window");
	var mouseX = evt.clientX - rect.left - root.scrollLeft;
	var mouseY = evt.clientY - rect.top - root.scrollTop;
	return {
		x:mouseX,
		y:mouseY
	};
}

function drawDetails(){
	drawRect(0,0,5,canvas.height,'#A7331A'); //Left Goal Line
	drawRect(canvas.width-10/2,0,5,canvas.height,'#A7331A'); //Right Goal Line
	drawRect(0,0,1,canvas.height,'black'); //Black Canvas Left Outline
	drawRect(canvas.width-1,0,1,canvas.height,'black'); //Black Canvas Right Outline
	drawRect(0,0,canvas.width,1,'black'); //Black Canvas Top Outline
	drawRect(0,canvas.height-1,canvas.width,1,'black'); //Black Canvas Bottom Outline
	
	drawCheatmodeButton();
	drawAimAssistButton();
	
	var midLineWidth = 50;
	drawRect(canvas.width/2-midLineWidth/2,0,midLineWidth,canvas.height,'white'); //Middle Line Coloured Lines
	drawRect((canvas.width/2-midLineWidth/4)+2,0,(midLineWidth/2)-4,canvas.height,'black'); //Middle line Black Middle
	drawLeafLogo(0.5,5);
	drawCircle(canvas.width/2,canvas.height/2,4,'black'); //Center Dot (black outline)
	drawCircle(canvas.width/2,canvas.height/2,3,'#A7331A'); //Center Dot (colour)
	drawCircle(canvas.width/2,canvas.height/2,1,'black'); //Center Dot (black fill)
}

function updateLeftBumper(){
	drawRect(bumper1X,bumper1Y,bumperWidth,bumperHeight,bumper1Colour); //Left Bumper
	drawCircle(bumper1X+bumperWidth/2,bumper1Y,bumperWidth/2,bumper1Colour); //Left Bumper Top Edge
	drawCircle(bumper1X+bumperWidth/2,bumper1Y+bumperHeight,bumperWidth/2,bumper1Colour); //Left Bumper Bottom Edge
}

function updateRightBumper(){
	drawRect(bumper2X,bumper2Y,bumperWidth,bumperHeight,bumper2Colour); //Right Bumper
	drawCircle(bumper2X+bumperWidth/2,bumper2Y,bumperWidth/2,bumper2Colour); //Left Bumper Top Edge
	drawCircle(bumper2X+bumperWidth/2,bumper2Y+bumperHeight,bumperWidth/2,bumper2Colour); //Left Bumper Bottom Edge
}   

function drawPointer(){
	//Difficulty Button Pointer
	canvasContext.fillStyle = 'black';
	canvasContext.beginPath();
	canvasContext.moveTo(diffPX+5,diffPY); 
	canvasContext.lineTo(diffPX+10,diffPY+15);
	canvasContext.lineTo(diffPX+5,diffPY+10);
	canvasContext.lineTo(diffPX,diffPY+15);
	canvasContext.stroke();
	canvasContext.fill();
	
	//Bumper Size Button Pointer
	canvasContext.beginPath();
	canvasContext.moveTo(sizePX,sizePY); 
	canvasContext.lineTo(sizePX+15,sizePY-5);
	canvasContext.lineTo(sizePX+10,sizePY);
	canvasContext.lineTo(sizePX+15,sizePY+5);
	canvasContext.stroke();
	canvasContext.fill();
}

function drawCheatmodeButton(){
	cheatBX = 270;
	cheatBY = 15;
	cheatBWidth = 76;
	cheatBHeight = 15;
	var borderWidth = 1;
	
	if(ballTracking){
		drawRect(cheatBX-borderWidth,cheatBY-borderWidth,cheatBWidth+borderWidth*2,cheatBHeight+borderWidth*2,btnBorderOnColour);
		drawRect(cheatBX+borderWidth,cheatBY+borderWidth,cheatBWidth-borderWidth*2,cheatBHeight-borderWidth*2,'black');
		canvasContext.fillStyle = btnTxtOnColour;
	} else {
		drawRect(cheatBX-borderWidth,cheatBY-borderWidth,cheatBWidth+borderWidth*2,cheatBHeight+borderWidth*2,btnBorderOffColour);
		drawRect(cheatBX+borderWidth,cheatBY+borderWidth,cheatBWidth-borderWidth*2,cheatBHeight-borderWidth*2,'black');
		canvasContext.fillStyle = btnTxtOffColour;
	}
	canvasContext.font="11px Arial";
	canvasContext.fillText("Cheatmode",cheatBX+borderWidth*11,cheatBY+borderWidth*11);
}

function drawAimAssistButton(){
	aaX = 170;
	aaY = 15;
	aaWidth = 73;
	aaHeight = 15;
	var borderWidth = 1;
	
	if(aimAssist){
		drawRect(aaX-borderWidth,aaY-borderWidth,aaWidth+borderWidth*2,aaHeight+borderWidth*2,btnBorderOnColour);
		drawRect(aaX+borderWidth,aaY+borderWidth,aaWidth-borderWidth*2,aaHeight-borderWidth*2,'black');
		canvasContext.fillStyle = btnTxtOnColour;
	} else {
		drawRect(aaX-borderWidth,aaY-borderWidth,aaWidth+borderWidth*2,aaHeight+borderWidth*2,btnBorderOffColour);
		drawRect(aaX+borderWidth,aaY+borderWidth,aaWidth-borderWidth*2,aaHeight-borderWidth*2,'black');
		canvasContext.fillStyle = btnTxtOffColour;
	}
	canvasContext.font="11px Arial";
	canvasContext.fillText("Aim Assist",aaX+borderWidth*11,aaY+borderWidth*11);
}

function drawBallTracking(){
	var ballTrackingColour = ballColour; 
	
	var dottedLineGap = 10;
	var dotSize = 1;
	
	if(ballTracking == true){
		var ballsX = [];
		var ballsY = [];
		for(i = 0; i < 69; i++){
		
			xPos = ballSpeedX*(dottedLineGap*i);
			yPos = ballSpeedY*(dottedLineGap*i);
			var x = ballX+xPos;
			var y = ballY+yPos;
			
			drawCircle(x,y,dotSize,ballTrackingColour);
			
			if(x<=0){ //Green sliding ball height indicator
				drawRect(0,ballY-2.5,5,5,'lime');
			}
		}
	}
}

function drawMouseTracking(){
	var trackingColour = "silver"; 
	if(mouseTracking == true){
		drawRect(0,mouseY,canvas.width,1,trackingColour); //Mouse tracking x-Axis
		drawRect(mouseX,0,1,canvas.height,trackingColour); //Mouse tracking y-Axis
	}
}

//Copied from other game, doesnt work here
//          function drawMouseGridID(){
//     var mouseGridCol = Math.floor(mouseX/TILE_WIDTH);                        //Calculate the mouseX position grid row
//     var mouseGridRow = Math.floor(mouseY/TILE_HEIGHT);                                //Calculate the mouseY position grid column
//     var mouseIndexIndicator = calcTileGridIndex(mouseGridCol, mouseGridRow);          //Calculate the the ID of the tile using the mouse's c 
//     drawRect(mouseX+1,mouseY-9,55,9,'black');                                //Draw a black rectangle to deplay text on
//     drawText(mouseX+2,mouseY-1,mouseGridCol+","+mouseGridRow+":"+mouseIndexIndicator,'lime'); //Display the column,row, and ID of the current tile by the mouse
// }

function drawAimAssist(){
	var aimAssistColour = "silver"; 
	if(aimAssist == true){
		drawRect(bumper1X+bumperWidth-3,mouseY,canvas.width,1,aimAssistColour); //Mouse tracking x-Axis
		for(var i=0;i<canvas.width;i+=30){
			drawRect(bumper1X+bumperWidth+i-3,bumper1Y-bumperWidth/2,10,1,aimAssistColour); //X-Axis aim assist top
						drawRect(bumper1X+bumperWidth+i-3,bumper1Y+bumperHeight+bumperWidth/2-1,10,1,aimAssistColour); //X-Axis aim assist top
		}
	}
}

function ballTrackToggle(){
	ballTrackingOnOff += 1; //Alternates toggle on/off
	
	if(ballTrackingOnOff%2 == 0)
	ballTracking = false;
	
	if(ballTrackingOnOff%2 == 1)
	ballTracking = true;
}

function mouseTrackToggle(){
	mouseTrackingOnOff += 1; //Alternates toggle on/off
	
	if(mouseTrackingOnOff%2 == 0){
		mouseTracking = false;
	}
	
	if(mouseTrackingOnOff%2 == 1){
		mouseTracking = true;
	}
}

function aimAssistToggle(){
	assistOnOff += 1; //Alternates toggle on/off
	
	if(assistOnOff%2 == 0){
		aimAssist = false;
	}
	
	if(assistOnOff%2 == 1){
		aimAssist = true;
	}
}

function displayScore(){
	
	var distanceFromWall = 100;
	var distanceFromCeiling = 100;
   
	//Update Player1's Score
	var scoreColour = 'white';
	canvasContext.fillStyle = scoreColour;
	canvasContext.fillText(player1Score,distanceFromWall,distanceFromCeiling);
	
	//Update Player2's Score
	canvasContext.fillStyle = scoreColour;
	canvasContext.fillText(player2Score,canvas.width-distanceFromWall,distanceFromCeiling);
}

function drawCircle(centerX,centerY,radius, colour){
	canvasContext.fillStyle = colour;
	canvasContext.beginPath();
	canvasContext.arc(centerX,centerY,radius,0,Math.PI*2,true);
	canvasContext.fill();
}

function drawRect(leftX,topY,width,height,colour){
	canvasContext.fillStyle = colour; 
	canvasContext.fillRect(leftX,topY,width,height);
}

function drawLeafLogoDetails(xFromC,yFromC){       
	canvasContext.fillStyle = 'white';

	// //Leafs "L"
	// canvasContext.beginPath();
	// canvasContext.moveTo(xFromC-43,yFromC+172); 
	// canvasContext.lineTo(xFromC-38,yFromC+172);
	// canvasContext.lineTo(xFromC-38,yFromC+186);
	// canvasContext.lineTo(xFromC-32,yFromC+186);
	// canvasContext.lineTo(xFromC-32,yFromC+191);
	// canvasContext.lineTo(xFromC-43,yFromC+191);
	// canvasContext.lineTo(xFromC-43,yFromC+172);
	// canvasContext.stroke();
	// canvasContext.fill();
	
	// //Leafs "E"
	// canvasContext.beginPath();
	// canvasContext.moveTo(xFromC-26,yFromC+172); 
	// canvasContext.lineTo(xFromC-14,yFromC+172);
	// canvasContext.lineTo(xFromC-14,yFromC+175);
	// canvasContext.lineTo(xFromC-21,yFromC+175);
	// canvasContext.lineTo(xFromC-21,yFromC+180);
	// canvasContext.lineTo(xFromC-16,yFromC+180);
	// canvasContext.lineTo(xFromC-16,yFromC+183);
	// canvasContext.lineTo(xFromC-21,yFromC+183);
	// canvasContext.lineTo(xFromC-21,yFromC+188);
	// canvasContext.lineTo(xFromC-14,yFromC+188);
	// canvasContext.lineTo(xFromC-14,yFromC+191);
	// canvasContext.lineTo(xFromC-26,yFromC+191);
	// canvasContext.moveTo(xFromC-26,yFromC+172);
	// canvasContext.stroke();
	// canvasContext.fill();
	
	// //Leafs "A"
	// canvasContext.beginPath();
	// canvasContext.moveTo(xFromC-8,yFromC+191); 
	// canvasContext.lineTo(xFromC-3,yFromC+172);
	// canvasContext.lineTo(xFromC+3,yFromC+172);
	// canvasContext.lineTo(xFromC+8,yFromC+191);
	// canvasContext.lineTo(xFromC+4,yFromC+191);
	// canvasContext.lineTo(xFromC+2.5,yFromC+186);
	// canvasContext.lineTo(xFromC-2.5,yFromC+186);
	// canvasContext.lineTo(xFromC-4,yFromC+191);
	// canvasContext.lineTo(xFromC-8,yFromC+191); 
	// canvasContext.stroke();
	// canvasContext.fill();
	
	// canvasContext.fillStyle = tmlBlue; //Change to tmlBlue to fill in the center of "A"
	
	// //Leafs "A" Blue Center
	// canvasContext.beginPath();
	// canvasContext.moveTo(xFromC-1.8,yFromC+182.5); 
	// canvasContext.lineTo(xFromC,yFromC+176);
	// canvasContext.lineTo(xFromC+1.8,yFromC+182.5);
	// canvasContext.lineTo(xFromC-1.8,yFromC+182.5);
	// canvasContext.stroke();
	// canvasContext.fill();
	
	// canvasContext.fillStyle = 'white'; //Change back to white for the next letters
	
	// //Leafs "F"
	// canvasContext.beginPath();
	// canvasContext.moveTo(xFromC+14,yFromC+191); 
	// canvasContext.lineTo(xFromC+14,yFromC+172);
	// canvasContext.lineTo(xFromC+26,yFromC+172);
	// canvasContext.lineTo(xFromC+26,yFromC+175);
	// canvasContext.lineTo(xFromC+19,yFromC+175);
	// canvasContext.lineTo(xFromC+19,yFromC+180);
	// canvasContext.lineTo(xFromC+24,yFromC+180);
	// canvasContext.lineTo(xFromC+24,yFromC+183);
	// canvasContext.lineTo(xFromC+19,yFromC+183);
	// canvasContext.lineTo(xFromC+19,yFromC+191);
	// canvasContext.lineTo(xFromC+14,yFromC+191);
	// canvasContext.stroke();
	// canvasContext.fill();
}

function drawLeafLogo(xFromCenter,yFromCenter){
	var XPosition = canvas.width/2-xFromCenter;
	var YPosition = canvas.height/4+yFromCenter;
	canvasContext.fillStyle = tmlBlue;
	canvasContext.beginPath();
	canvasContext.moveTo(XPosition,YPosition);
	canvasContext.lineTo(XPosition+15/2.8,28/2.8+YPosition); //Top of leaf
	canvasContext.lineTo(XPosition+29/2.8,56/2.8+YPosition);
	canvasContext.lineTo(XPosition+49/2.8,47/2.8+YPosition);
	canvasContext.lineTo(XPosition+54/2.8,72/2.8+YPosition);
	canvasContext.lineTo(XPosition+56/2.8,92/2.8+YPosition);
	canvasContext.lineTo(XPosition+56/2.8,105/2.8+YPosition);
	canvasContext.lineTo(XPosition+85/2.8,92/2.8+YPosition);
	canvasContext.lineTo(XPosition+88/2.8,112/2.8+YPosition);
	canvasContext.lineTo(XPosition+88/2.8,133/2.8+YPosition);
	canvasContext.lineTo(XPosition+86/2.8,155/2.8+YPosition);
	canvasContext.lineTo(XPosition+93/2.8,153/2.8+YPosition);
	canvasContext.lineTo(XPosition+118/2.8,150/2.8+YPosition);
	canvasContext.lineTo(XPosition+114/2.8,167/2.8+YPosition);
	canvasContext.lineTo(XPosition+106/2.8,193/2.8+YPosition);
	canvasContext.lineTo(XPosition+95/2.8,220/2.8+YPosition);
	canvasContext.lineTo(XPosition+112/2.8,223/2.8+YPosition);
	canvasContext.lineTo(XPosition+103/2.8,245/2.8+YPosition);
	canvasContext.lineTo(XPosition+83/2.8,299/2.8+YPosition); //Top Right Leaf indent
	canvasContext.lineTo(XPosition+103/2.8,281/2.8+YPosition);
	canvasContext.lineTo(XPosition+131/2.8,256/2.8+YPosition);
	canvasContext.lineTo(XPosition+164/2.8,220/2.8+YPosition);
	canvasContext.lineTo(XPosition+180/2.8,232/2.8+YPosition);
	canvasContext.lineTo(XPosition+225/2.8,196/2.8+YPosition);
	canvasContext.lineTo(XPosition+239/2.8,225/2.8+YPosition);
	canvasContext.lineTo(XPosition+290/2.8,205/2.8+YPosition); //Right side upper Leaf tip
	canvasContext.lineTo(XPosition+279/2.8,239/2.8+YPosition);
	canvasContext.lineTo(XPosition+272/2.8,254/2.8+YPosition);
	canvasContext.lineTo(XPosition+299/2.8,264/2.8+YPosition);
	canvasContext.lineTo(XPosition+284/2.8,288/2.8+YPosition);
	canvasContext.lineTo(XPosition+264/2.8,309/2.8+YPosition);
	canvasContext.lineTo(XPosition+279/2.8,324/2.8+YPosition);
	canvasContext.lineTo(XPosition+252/2.8,350/2.8+YPosition);
	canvasContext.lineTo(XPosition+221/2.8,372/2.8+YPosition);
	canvasContext.lineTo(XPosition+239/2.8,394/2.8+YPosition);
	canvasContext.lineTo(XPosition+216/2.8,411/2.8+YPosition);
	canvasContext.lineTo(XPosition+185/2.8,428/2.8+YPosition);
	canvasContext.lineTo(XPosition+207/2.8,447/2.8+YPosition);
	canvasContext.lineTo(XPosition+176/2.8,458/2.8+YPosition);
	canvasContext.lineTo(XPosition+152/2.8,465/2.8+YPosition); //Right Side leaf indent
	canvasContext.lineTo(XPosition+178/2.8,476/2.8+YPosition);
	canvasContext.lineTo(XPosition+207/2.8,488/2.8+YPosition);
	canvasContext.lineTo(XPosition+218/2.8,494/2.8+YPosition);
	canvasContext.lineTo(XPosition+193/2.8,511/2.8+YPosition);
	canvasContext.lineTo(XPosition+168/2.8,525/2.8+YPosition);
	canvasContext.lineTo(XPosition+191/2.8,548/2.8+YPosition);
	canvasContext.lineTo(XPosition+216/2.8,574/2.8+YPosition);
	canvasContext.lineTo(XPosition+233/2.8,592/2.8+YPosition);
	canvasContext.lineTo(XPosition+196/2.8,589/2.8+YPosition); //Right side lower Leaf tip
	canvasContext.lineTo(XPosition+164/2.8,584/2.8+YPosition); 
	canvasContext.lineTo(XPosition+173/2.8,611/2.8+YPosition);
	canvasContext.lineTo(XPosition+135/2.8,607/2.8+YPosition);
	canvasContext.lineTo(XPosition+113/2.8,605/2.8+YPosition);
	canvasContext.lineTo(XPosition+121/2.8,623/2.8+YPosition);
	canvasContext.lineTo(XPosition+128/2.8,638/2.8+YPosition); //Bottom 1st leaf tip on right side
	canvasContext.lineTo(XPosition+95/2.8,631/2.8+YPosition);
	canvasContext.lineTo(XPosition+56/2.8,620/2.8+YPosition);
	canvasContext.lineTo(XPosition+31/2.8,610/2.8+YPosition);
	canvasContext.lineTo(XPosition+16/2.8,606/2.8+YPosition);
	canvasContext.lineTo(XPosition+11/2.8,614/2.8+YPosition);
	canvasContext.lineTo(XPosition+14/2.8,627/2.8+YPosition);
	canvasContext.lineTo(XPosition+22/2.8,641/2.8+YPosition);
	canvasContext.lineTo(XPosition+31/2.8,652/2.8+YPosition);
	canvasContext.lineTo(XPosition+9/2.8,672/2.8+YPosition);
	canvasContext.lineTo(XPosition+(-2/2.8),659/2.8+YPosition); //Bottom of Leaf Stem
	canvasContext.lineTo(XPosition+(-12/2.8),638/2.8+YPosition);
	canvasContext.lineTo(XPosition+(-19/2.8),607/2.8+YPosition);
	canvasContext.lineTo(XPosition+(-48/2.8),618/2.8+YPosition); 
	canvasContext.lineTo(XPosition+(-95/2.8),632/2.8+YPosition);
	canvasContext.lineTo(XPosition+(-127/2.8),638/2.8+YPosition); //Left side Lower Leaf Tip
	canvasContext.lineTo(XPosition+(-115/2.8),605/2.8+YPosition);
	canvasContext.lineTo(XPosition+(-145/2.8),609/2.8+YPosition);
	canvasContext.lineTo(XPosition+(-174/2.8),611/2.8+YPosition);
	canvasContext.lineTo(XPosition+(-164/2.8),584/2.8+YPosition);
	canvasContext.lineTo(XPosition+(-235/2.8),591/2.8+YPosition); //Left side lower Leaf tip
	canvasContext.lineTo(XPosition+(-207/2.8),559/2.8+YPosition);
	canvasContext.lineTo(XPosition+(-171/2.8),526/2.8+YPosition);
	canvasContext.lineTo(XPosition+(-199/2.8),509/2.8+YPosition);
	canvasContext.lineTo(XPosition+(-221/2.8),494/2.8+YPosition);
	canvasContext.lineTo(XPosition+(-185/2.8),476/2.8+YPosition);
	canvasContext.lineTo(XPosition+(-152/2.8),465/2.8+YPosition); //Left Side Leaf indent
	canvasContext.lineTo(XPosition+(-185/2.8),455/2.8+YPosition);
	canvasContext.lineTo(XPosition+(-205/2.8),449/2.8+YPosition);
	canvasContext.lineTo(XPosition+(-185/2.8),429/2.8+YPosition);
	canvasContext.lineTo(XPosition+(-217/2.8),412/2.8+YPosition);
	canvasContext.lineTo(XPosition+(-241/2.8),395/2.8+YPosition);
	canvasContext.lineTo(XPosition+(-221/2.8),372/2.8+YPosition);
	canvasContext.lineTo(XPosition+(-257/2.8),345/2.8+YPosition);
	canvasContext.lineTo(XPosition+(-282/2.8),324/2.8+YPosition);
	canvasContext.lineTo(XPosition+(-264/2.8),311/2.8+YPosition);
	canvasContext.lineTo(XPosition+(-286/2.8),284/2.8+YPosition);
	canvasContext.lineTo(XPosition+(-302/2.8),264/2.8+YPosition);
	canvasContext.lineTo(XPosition+(-273/2.8),255/2.8+YPosition);
	canvasContext.lineTo(XPosition+(-282/2.8),225/2.8+YPosition);
	canvasContext.lineTo(XPosition+(-287/2.8),205/2.8+YPosition);
	canvasContext.lineTo(XPosition+(-264/2.8),214/2.8+YPosition);
	canvasContext.lineTo(XPosition+(-239/2.8),223/2.8+YPosition);
	canvasContext.lineTo(XPosition+(-226/2.8),192/2.8+YPosition);
	canvasContext.lineTo(XPosition+(-203/2.8),210/2.8+YPosition);
	canvasContext.lineTo(XPosition+(-181/2.8),230/2.8+YPosition);
	canvasContext.lineTo(XPosition+(-167/2.8),216/2.8+YPosition);
	canvasContext.lineTo(XPosition+(-140/2.8),246/2.8+YPosition);
	canvasContext.lineTo(XPosition+(-111/2.8),275/2.8+YPosition);
	canvasContext.lineTo(XPosition+(-84/2.8),295/2.8+YPosition);
	canvasContext.lineTo(XPosition+(-97/2.8),261/2.8+YPosition);
	canvasContext.lineTo(XPosition+(-113/2.8),221/2.8+YPosition);
	canvasContext.lineTo(XPosition+(-95/2.8),218/2.8+YPosition);
	canvasContext.lineTo(XPosition+(-115/2.8),183/2.8+YPosition);
	canvasContext.lineTo(XPosition+(-127/2.8),148/2.8+YPosition);
	canvasContext.lineTo(XPosition+(-102/2.8),151/2.8+YPosition);
	canvasContext.lineTo(XPosition+(-86/2.8),155/2.8+YPosition);
	canvasContext.lineTo(XPosition+(-91/2.8),128/2.8+YPosition);
	canvasContext.lineTo(XPosition+(-86/2.8),90/2.8+YPosition);
	canvasContext.lineTo(XPosition+(-56/2.8),106/2.8+YPosition);
	canvasContext.lineTo(XPosition+(-57/2.8),78/2.8+YPosition);
	canvasContext.lineTo(XPosition+(-52/2.8),45/2.8+YPosition);
	canvasContext.lineTo(XPosition+(-30/2.8),56/2.8+YPosition);
	canvasContext.lineTo(XPosition+(-16/2.8),27/2.8+YPosition);
	
	canvasContext.stroke();
	canvasContext.fill();
	
	drawLeafLogoDetails(XPosition,YPosition); //Lettering and Veins
}

function randomInt(min,max){
	var number = Math.floor((Math.random() * max)) + min;
	return number;
}