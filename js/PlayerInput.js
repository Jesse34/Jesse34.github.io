const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;
const KEY_W = 87;
const KEY_A = 65;
const KEY_S = 83;
const KEY_D = 68;

//Mouse X and Y coordinate values
var mouseX;                                                                  //Initialize a variable to contain the mouse x coordinate
var mouseY;                                                                  //Initialize a variable to contain the mouse y coordinate

function setupInputCollection(){
    c.addEventListener('mousemove',updateMousePosition);                     //Create event listener to track mouse movement
    
    document.addEventListener('keydown', keyPressed);
    document.addEventListener('keyup', keyReleased);

    player_car.setInput(KEY_UP,KEY_RIGHT,KEY_DOWN,KEY_LEFT);
    ai_car.setInput(KEY_W,KEY_D,KEY_S,KEY_A);
}

function keyUpdate(input, car, toggle){
    if(input.keyCode == car.keyUp){
        car.keyHeld_Gas = toggle;
    }
    if(input.keyCode == car.keyRight){
        car.keyHeld_TurnRight = toggle;
    }
    if(input.keyCode == car.keyDown){
        car.keyHeld_Reverse = toggle;
    }
    if(input.keyCode == car.keyLeft){
        car.keyHeld_TurnLeft = toggle;
    }
}

function keyPressed(evt){
    keyUpdate(evt,player_car,true);
    keyUpdate(evt,ai_car,true);
    evt.preventDefault(); 
}

function keyReleased(evt){
    keyUpdate(evt,player_car,false);
    keyUpdate(evt,ai_car,false);
}

function updateMousePosition(evt){
    var canvasArea = c.getBoundingClientRect();                              //Find the bounds of the playing area
    var root = document.documentElement;                                     //Create a variable to store the documentElement
    mouseX = evt.clientX - canvasArea.left - root.scrollLeft;                //Determine x-coordinate value
    mouseY = evt.clientY - canvasArea.top - root.scrollTop;                  //Determine x-coordinate value
    
    //To test tile to car collision, mouse controlls car spawn
    /*carY = mouseY;
    carX = mouseX;

    */
  }