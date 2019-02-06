var carSprite = document.createElement("img");
var aiCarSprite = document.createElement("img");

var tilePics = new Array();

var NUM_OF_PICS = 0;

function loadImages(){
    var images = [
            {objName: carSprite, filePath: "BlueCar.png"},
        	{objName: aiCarSprite, filePath: "RedCar.png"},
            {tileType: TILE_ROAD, filePath: "Tile (Road).png"},
            {tileType: TILE_WALL, filePath: "Tile (Wall).png"},
            {tileType: TILE_CHECKERED, filePath: "Tile (Checkered).png"},
        	{tileType: TILE_GRASS, filePath: "Tile (Grass).png"},
        	{tileType: TILE_CRATE, filePath: "Tile (Crate).png"},
        	{tileType: TILE_PATH, filePath: "Tile (Path).png"}
        ];

    NUM_OF_PICS = images.length;

    //console.log(images[i].tileType);

    for(var i=0;i<images.length;i++){
        if(images[i].objName != undefined){
        	beginLoadingImage(images[i].objName, images[i].filePath)
    	} else if (images[i].tileType != undefined){
    		loadTileImage(images[i].tileType, images[i].filePath);
    	}
	}
}

function loadTileImage(tileID, filePath){
	tilePics[tileID] = document.createElement("img");
	beginLoadingImage(tilePics[tileID], filePath);
}

function countLoadedImagesAndLaunchWhenFinished(){
    NUM_OF_PICS--;

	console.log(NUM_OF_PICS);

    if(NUM_OF_PICS == 0){
        startGame();
    }
}

function beginLoadingImage(image, fileName){
    image.onload = countLoadedImagesAndLaunchWhenFinished;
    image.src = "images/"+fileName;
}
