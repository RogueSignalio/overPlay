class OverPlayScene extends Phaser.Scene {
  constructor(config={}) {
    super(config);
    this.config = {
      audio_on: true,
      debug: false,
      image_path: 'play/assets/',
      audio_path: 'play/assets/audio/',
      volume: 0.8,
      ...config
    }
    this.key = this.config.key
    this.engine = this.config.engine
    if (this.engine) {
      this.engine.scene.add(this.key, this)
    }

    //this.color = this.config.color ? this.config.color : 0xFFDD99;
    //this.hold = this.config.hold ? this.config.hold : 10000;
    //this.fade = this.config.fade ? this.config.fade : 600;
    //this.bg_on = this.config.bg_on !== undefined ? this.config.bg_on : false;

//    this.movies = [] // Store movie names
    // // TODO Remove scene_ref...
    // this.scene_ref = undefined

    this.enable_cleanup = true; // Sometimes we need to disable auto cleanup, but it needs to be run at some point. 
    this.active = true; // Setting active == false and enable_cleanup == true, will break down the scene.
  }

  preload() {
    this.w = this.game.canvas.width; //window.innerWidth
    this.h = this.game.canvas.height; //window.innerHeight
    this.over_preload()
//    if (this.bg_on) this.engine.run_fx('background',{ bgcolor: 0x000000, hold: (this.hold + (this.fade * 5)), fade: this.fade/2})
  }

  over_preload() {  }

  create() {
    if (this.config.shake) { this.cameras.main.shake(this.hold || 5000, this.config.shake || 0.003) }
    if (this.config.flash) { this.cameras.main.flash(5000, 100, 100, 100) }

    this.over_create()
  }
  over_create() {  }

  // Play an audio asset with optional detune min/max to make the audio more unique per play.
  // Some files work great with -100,100 or -1000,1000 ... play around with this min/max and it
  // will prevent your audio from sounding repetitive.
  //
  audio_play_detune(audio,detune_min=0,detune_max=0,volume=null) {
	  if (this.config.audio_on == true) {
      let a = this.sound.add(audio)
      a.detune = getRndInteger(detune_min,detune_max)
      a.volume = volume != null ? volume : this.config.volume
      a.play();
    }
  }

  // add_emitter(particle,config) {
  //   let mypart = particle.type == 'ParticleEmitterManager' ? particle : this.add.particles(particle);
  //   if (this.scene_ref == undefined) { this.scene_ref = mypart; }
  //   this.emitters.push(mypart.createEmitter(config));
  //   return mypart;
  // }

  // stop_emitters() {
  //   this.emitters.forEach(function (item,idx) { item.stop() })
  // }

  kill_scene() {
console.log('!!!!')
    this.config.debug && console.log(this.constructor.name + ' cleanup...') 
//    this.scene_ref.scene.scene.remove()
    try {
      this.scene.remove()
    } catch {
    }
  }

  update(t,d) {
    this.over_update(t,d)
//    if (this.enable_cleanup == false) { return; }
//    if (this.scene_ref == undefined) { return; }
//    this.active = this.over_check_alive()
    
//    if (!this.active) { this.kill_scene() }
  }
  over_update(t,d) {  }

  over_check_alive() {
     var emit_alive = false
  //   this.emitters.forEach(function (item,idx) {
  //     if (item.getParticleCount() == item.getDeadParticleCount()) {
  //       item.stop();
  //       item.running = false;
  //     } else {
  //        emit_alive = true; // If any are active still, make sure we don't trigger cleanup.
  //     }
  //   })
     return emit_alive
  }

  add_background() {
    // this.color = 0x000000; //this.config.color || 0x000000;
    // this.hold = this.config.hold || 5000;
    // this.fade = this.config.fade || 600;
    this.scene.sendToBack(this.key)
    this.background = this.add.rectangle(500, 400, 2000, 2000, 0x0000);
//    var bg = this.add.rectangle(this.w/2, this.h/2, this.w, this.h, this.color);
    this.background.alpha = 0;
//console.log('!!!',bg)
    this.tweens.add({
       targets: this.background,
       duration: 2000,
       alpha: 1,
    //   yoyo: true,
    //   repeat: 0,
    //   hold: this.hold
    });

//    setOverTimeout(()=> { this.kill_scene(); }, (this.hold + (this.fade*4)))
  }

  remove_background() {
//    this.background = this.add.rectangle(500, 400, 2000, 2000, 0x0000);
//    var bg = this.add.rectangle(this.w/2, this.h/2, this.w, this.h, this.color);
//    this.background.alpha = 0;
//console.log('!!!',bg)
    this.tweens.add({
       targets: this.background,
       duration: 2000,
       alpha: 0,
    //   yoyo: true,
    //   repeat: 0,
    //   hold: this.hold
    });
  }
}
