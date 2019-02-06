const FRICTION_GROUND = 0.99,
      DRIVE_POWER = 0.04,
      REVERSE_POWER = 0.04,
      TURN_SENSITIVITY = 0.04;
      MIN_TURNING_SPEED_THRESHOLD = 0.01;

function carClass(){
    //Car Graphic Variables
    this.x = 200,                                                              //Car x coordinate starting position (center of car)
    this.y = 200,                                                              //Car y coordinate starting position (center of car)                                                           //Car radius
    //this.carColour = 'lime';                                                      //Car colour
        
    //Car Movement Variables                                      
    this.velocity = 0;                                                         //Car speed values on the x-axis
    this.angle = 4.5; 

    this.carPicture;
    this.name = "Unnamed";

    this.keyHeld_Gas = false;
    this.keyHeld_Reverse = false;
    this.keyHeld_TurnLeft = false;
    this.keyHeld_TurnRight = false;

    this.keyUp;
    this.keyRight;
    this.keyDown;
    this.keyLeft;

    this.Engine_Sound = new Sound("Audio-Effects/car-engine-topspeed-loop");

    this.setInput = function(up, right, down, left){
        this.keyUp = up;
        this.keyRight = right;
        this.keyDown = down;
        this.keyLeft = left;
    }

    this.move = function(){
        
        this.velocity *= FRICTION_GROUND;
        console.log(this.velocity);

        if(this.keyHeld_Gas){
            this.velocity += DRIVE_POWER;
        }
        if(this.keyHeld_Reverse){
            this.velocity -= REVERSE_POWER;
        }

        if(Math.abs(this.velocity) > MIN_TURNING_SPEED_THRESHOLD || this.keyHeld_Gas == true || this.keyHeld_Reverse == true){
            if(this.keyHeld_TurnLeft){
                this.angle -= TURN_SENSITIVITY;
            }
            if(this.keyHeld_TurnRight){
                this.angle += TURN_SENSITIVITY;
            }
        }

        if(Math.abs(this.velocity) < 0.01){
            this.velocity = 0;
        }

        this.x += Math.cos(this.angle)*this.velocity;                                                                                
        this.y += Math.sin(this.angle)*this.velocity;  
        //These lines are also used during tile collision to prevent getting stuck

        if(this.velocity > 1){
            //this.Engine_Sound.loop();
        } 
        if(this.velocity < 1){
            //this.Engine_Sound.stopLoop();
        }

        detectCarTileCollision(this);                                      //Detect collision w/ Car and Tile and react accordingly                                                                              
    }

    this.reset = function(img,playerName){
        this.name = playerName;
        this.carPicture = img;
        this.velocity = 0;

        for(var row=0; row<NUM_OF_ROWS; row++){                                  //Loop NUM_OF_ROWS and carry row id to assign to each tile        
            for(var col=0; col<NUM_OF_COLS; col++){                              //Loop NUM_OF_COLS and carry col id to assign to each tile   
                
                var gridIndex = calcTileGridIndex(col, row);                     //Calculate the id of the current tile being drawn    
                
                if(tiles[gridIndex] == TILE_PLAYER_SPAWN){                       //IF the current tile id == TRUE (visable) 
                    tiles[gridIndex] = TILE_ROAD;
                    this.angle = -Math.PI/2;

                    this.x = col*TILE_WIDTH+TILE_WIDTH/2;
                    this.y = row*TILE_HEIGHT+TILE_HEIGHT/2;
                    return;
                }
            }
        } 
        console.log("No Spawn Found");
    }

    this.draw = function(){
        drawCenteredGraphicWithRotation(this.carPicture, this.x, this.y,this.angle);
        drawText(this.x-17,this.y-20,this.name,"lime")
    }
}