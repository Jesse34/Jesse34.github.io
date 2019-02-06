var audioFormat;

function Sound(filepath) {
	setAudioFormat();
	
	var altSoundTurn = false;
	var mainSound = new Audio(filepath+audioFormat);
	var altSound = new Audio(filepath+audioFormat);


	this.play = function(){
		if(altSoundTurn){
			altSound.currentTime = 0;
			altSound.play();
		} else {
			mainSound.currentTime = 0;
			mainSound.play();
		}
		altSoundTurn = !altSoundTurn;
	}

}

function Music(){
	var music = null;

	this.loopSong = function(filepath){
		setAudioFormat();

		if(music != null){
			music.pause();
			music = null;
		}
		music = new Audio(filepath+audioFormat);
		music.loop = true;
		music.play();
	}

	this.startOrStopMusic = function(){
		if(music.paused()){
			music.play();
		} else {
			music.pause();
		}
	}
}

function setAudioFormat(){
	var audio = new Audio();
	if (audio.canPlayType("audio/mp3")){
		audioFormat = ".mp3";
	} else {
		audioFormat = ".ogg";
	}
}