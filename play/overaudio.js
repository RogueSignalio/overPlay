class OverAudio extends OverPlayScene {
	constructor(config={}) {
	super(config);
	//sound.pauseOnBlur = false;
	// Play an audio asset with optional detune min/max to make the audio more unique per play.
		// Some files work great with -100,100 or -1000,1000 ... play around with this min/max and it
		// will prevent your audio from sounding repetitive.
		//
	}
	audio_play_detune(audio,detune_min=0,detune_max=0,volume=null) {
	  if (this.config.audio_on == true) {
	  let a = this.sound.add(audio)
	  a.detune = getRndInteger(detune_min,detune_max)
	  a.volume = volume != null ? volume : this.config.volume
	  a.play();
		}
	}
}