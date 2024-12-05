/*===========================================================================
Authors: BlackRogue01
Copyright: RogueSignal.io, wwww.roguesignal.io, 2023
License: MIT
---------------------------------------------------------------------------

See README
===========================================================================*/
// TODO:
// * Add ability to put OverFx into a container.
//    -- Will need to get container and dimensions of container and use parent config option for phaser.
// * Make timers instance encapsulated so .stop() only stops one OverFx instance scenes.
// * Add asset loader to OverFxScene so as to guarantee unique names.
// * Add some non-particle examples.
//
class OverPlay {
    constructor (config={},ph_config={},engine=null) {
      this.engine = engine
      if (this.engine == null) {
      	this.engine = this.new_engine(ph_config)
      }      
      this.config = {
        debug: false,
        audio_on: true,
        preload: false,
        volume: 0.5,
        z_index: 10000,
        pre_canned: false,
        image_path: 'play/assets/',
        audio_path: 'play/assets/audio',
        ...config
      }
      this.volume(this.config.volume)
      this.engine.sound.pauseOnBlur = false
      this.engine.canvas.style.zIndex = this.config.z_index * -1
      this.counter = 0; // Used to generate unique scene IDs.  Will reset when scene count == 0
    	this.loaded = {}; // Store list of loaded JS scripts
      this.load_play('oversys_timer'); // Base FX setOverTimeouts
      this.load_play('overplay_scene',() => {
        this.load_play('overaudio'); // Base FX scene
      }); // Base FX scene

      this.videos = {};
      this.scenes = {};
      this.sounds = {};

      // Resize is an issue ... this seems to be the most reliable path.
			document.body.onresize = () => {
				this.engine.scale.resize(window.innerWidth, window.innerHeight);
			};
    }

    new_engine(ph_config={}) {
        return new Phaser.Game({
          type: Phaser.AUTO,
          width: window.innerWidth,
          height: window.innerHeight,
          transparent: true, 
          backgroundColor: 'rgba(0,0,0,0)',
          //parent: "gameContainer",
          canvasStyle: "position:absolute;top:0px;left:0px;z-index:-10000;visibility:hidden;",
          ...ph_config
        });
    }

    // Raise or lower to the z-index min or max layer
    to_front(zindex=this.config.z_index) { this.engine.canvas.style.zIndex = zindex; this.engine.canvas.focus(); this.engine.canvas.style.visibility = 'visible'; }
    to_back(zindex=(this.config.z_index*-1)) { this.engine.canvas.style.zIndex = zindex; this.engine.canvas.style.visibility = 'hidden'; this.engine.canvas.blur(); }
    
    // Set volume from 0 to 1
    volume(vol=null) {
      console.log(vol)
      if (vol && vol < 0) { vol = 0 }
      else if (vol && vol > 1) { vol = 1 }
      if (vol >= 0) { 
        this.engine.sound.volume = this.config.volume = vol
        for (var key in this.videos){
          this.videos[key].setVolume(vol)
        };
      }
      return this.engine.sound.volume; 
    }

    // Turns audio back on.
    audio_on() {
      this.config.audio_on = true;
      this.engine.sound.volume = this.config.volume
      for (var key in this.videos){
        this.videos[key].setMute(false)
      };
    }

    // Turns audio off.
    audio_off() {
      this.config.audio_on = false;
      this.engine.sound.volume = 0;
      for (var key in this.videos){
        this.videos[key].setMute(true)
      };
    }

    // Toggles the audio on / off from current state.
    audio_toggle() {
      if (this.config.audio_on == true) { this.audio_off(); }
      else { this.audio_on(); }
    }

    // run_fx_timed(name,cnt=1,config={},delay_min=150,delay_max=150) {
		// 	for(var i=0;i<cnt;i++) {
		// 		setOverTimeout(() => {
    //       if (name.startsWith("canned_")) { this[name](cnt); }
		// 			else { this.run_fx(name,config); }
		// 		},getRndInteger(delay_min,delay_max)*i)
		// 	}      
    // }


    // Load anything in the FX subdir, typically an actual FX plugin.
    // To load and immediately run, use run_fx() instead.
    load_play(name,onload=null) {
      if (this.config.preload) this.loaded[name] = true;
      if (this.loaded[name]) return;
			const script = document.createElement('script');
	    script.id = `${name}.js`;
	    script.src = `./play/${name}.js`;
	    document.body.append(script);
      if (!onload) onload = ()=>{ };
	    script.onload = ()=> { this.loaded[name] = true; onload.call(this); }
      this.config.debug && console.log(`${name} loaded.`)
    }

    // Checks for active FX
    active_check() {
      if (this.engine.scene.scenes.length > 0) { this.to_front(); return true; }
      else {
        this.config.debug && console.log('No scenes.');
        this.to_back(); this.counter = 0; return false;
      }
    }

    // Stop all FX & audio
    // A lil issue with timers firing etc do best to be safe
    stop() {
      this._stop_pass()
      this._stop_pass()
      this._stop_pass()
      this.to_back()
      this._stop_pass()
      this.scenes = []
      this.videos = []
    }

    // Kills the engine, scenes, and canvas.
    // Useful if you want to clean it up.
		kill() {
			this.engine.destroy(true, false)
		}

    add_canned(name,code) {
      this['canned_'+name] = code;
    }

    // Runs a loaded FX scene.
    _run_scene(name,config={}) {
      var config = {
        key: `${name}/${this.counter}`,
        engine: this,
        ...this.config,
        ...config
      }
    	var cname = name[0].toUpperCase() + name.substr(1)
      this.config.debug && console.log("Run " + config.key, config)
      var fxscene = eval(`new ${cname}(config)`)
      this.engine.scene.add(config.key, fxscene, true, {} );
      if (this.counter == 0) {
        this.to_front()
        this._check_timer()
      }
      this.counter++;
    }

    _check_timer() {
      setOverTimeout(() => {
        let ret = this.active_check();
        this.config.debug && console.log('Timer: '+ ret + ':' + this.engine.scene.scenes.length);
        if (ret == true) this._check_timer()
      },300);
    }

    _stop_pass() {
      this.engine.sound.stopAll()
      window.clearAllOverTimers()
      for (var scene of this.engine.scene.scenes) {        
        scene.kill_scene();
      }
      this.counter = 0
    }

    add_background() {
      let sc = this.scenes['background_scene'] = new OverPlayScene({
        key: 'background_scene', engine: this.engine, ...this.config, transparent: false 
      })
      sc.add_background()
      this.engine.scene.start(sc)
    }

    remove_background() {
      this.scenes['background_scene'].remove_background()
      setOverTimeout(()=> {
         this.engine.scene.stop('background_scene')
         this.engine.scene.remove('background_scene')
      },3000)
    }

    sound_scene() {
      return this.engine.scene.getScene('sound_scene')
    }

    sound_load(name,file) {
      var sc = this.sound_scene()
      if (!sc) {
        sc = new OverAudio({key: 'sound_scene', engine: this.engine, ...this.config})
        this.scenes['sound_scene'] = sc
//        this.engine.scene.add('sound_scene', sc)
      }
      sc.load.audio(name, file); 
      sc.load.once('complete', function (e) {
        if (this.sounds[name] == null) {
          this.sounds[name] = e.scene.sound.add(name)
        }
        this.sounds[name].name = name
        this.engine.scene.start(e.scene)
        this.engine.scene.pause(e.scene)        
        console.log(name + ' loaded.');
      }.bind(this));
      sc.load.start();
    }

    sound_play(name,loop=false,clone=false) {
      if (this.audio_on) {
        if (clone) { this.sound_scene().sound.add(name) }
        this.sounds[name].loop = loop
        this.sounds[name].play(); 
      }
      this.engine.scene.run(this.sound_scene())
    }
    sound_pause(name) { }
    sound_stop(name) { this.sounds[name].stop(); }
    sound_play_for(name) { }

    video_load(name,file,now=true) {
      let sc = new OverPlayScene({key: name + '_scene', engine: this.engine, ...this.config},)
      this.scenes[name] = sc
//      this.engine.scene.add(name + '_scene', sc)
      sc.load.video(name, file); 
      sc.load.once('complete', function (e) {
        if (this.videos[name] == null) {
          this.videos[name] = e.scene.add.video(op.engine.canvas.width/2, op.engine.canvas.height/2, name)
        }
        this.videos[name].name = name
        this.videos[name].setVisible(false)
        this.videos[name].seekTo(0)
        this.videos[name].setVolume(this.engine.sound.volume)
        this.engine.scene.start(e.scene)
        this.engine.scene.pause(e.scene)
        console.log(name + ' loaded.');
      }.bind(this));
      sc.load.start();
    }

    video_clone(name,nname) {
      let sc = new OverPlayScene({key: nname + '_scene', engine: this.engine, ...this.config},)
      this.scenes[nname] = sc
      this.engine.scene.add(nname + '_scene', sc)
      let c = this.engine.cache.video.get(name)
      this.engine.cache.video.add(nname,c)
      this.videos[nname] = sc.add.video(op.engine.canvas.width/2, op.engine.canvas.height/2, nname)
      this.videos[nname].name = nname
      this.engine.scene.start(sc)
      this.engine.scene.pause(sc)
    }

    run_load() {
//      this.engine.load.start();
    }

    video_scale(name,perc) {
      this.videos[name].setScale(perc)      
    }

    video_size(name,w,h=null) {
      if (h== null) { h = w; }
      this.videos[name].setDisplaySize(w,h)      
    }

    video_depth(name,zid) {
      this.videos[name].setDepth(zid)
    }

    video_alpha(name,percent=null) {
      if (percent == null) { precent = 1; }
      this.videos[name].setAlpha(percent)
    }

    video_tint(name,color=null) {
      if (color == null) { color = 0x000000; }
      this.videos[name].setTint(color)
    }

    video_play(name,loop=true,zid=10000) {
      this.videos[name].seekTo(0)
      this.to_front(10000)
      var sc = this.scenes[name]
      this.videos[name].setVisible(true)
      this.videos[name].setLoop(loop);
      this.videos[name].play()
      this.engine.scene.resume(this.videos[name].scene) //.start
    }

    video_playMarker(name,mname,loop=true,start=null,end=null) {
      this.videos[name].seekTo(0)
      this.to_front(10000)
      var sc = this.scenes[name]
      this.videos[name].setVisible(true)
      this.videos[name].setLoop(loop);
      this.videos[name].addMarker(mname,start,end) 
      this.videos[name].playMarker(mname)
      this.engine.scene.resume(this.videos[name].scene) //.start
    }

    video_play_for(name,time) {
      window.setOverTimeout(function(){ this.video_stop(name); }.bind(this),time);
      this.video_play(name,true)
    }

    video_pause(name) {
      this.videos[name].stop()      
    }

    video_stop(name) {
      this.videos[name].stop()
      this.videos[name].setVisible(false)
      this.engine.scene.pause(this.videos[name].scene) //.start
    }

    video_seek(name,value) {
      this.videos[name].seekTo(value)      
    }

    video_display(name,enable=true) {
      this.videos[name]
    }

    video_move_x(name,x) {
      this.videos[name].x = this.videos[name].x + x     
    }

    video_move_y(name,y) {
      this.videos[name].y = this.videos[name].y + y     
    }

    video_move_xy(name,x=null,y=null) {
      if (x != null) { this.videos[name].x = this.videos[name].x + x }
      if (y != null) { this.videos[name].y = this.videos[name].y + y }         
    }

    video_goto_xy(name,x=null,y=null) {
      var tx = this.videos[name].x
      var ty = this.videos[name].y
      if (x != null) { tx = tx + x }
      if (y != null) { ty = ty + y }
      this.move_to(name,tx,ty)
    }

    video_xy(name,x=null,y=null) {
      if (x != null) { this.videos[name].setX(x) }
      if (y != null) { this.videos[name].setY(y) }
    }

    move_to(name,x=null,y=null) {
      if (x == null) { x = this.videos[name].x }
      if (y == null) { y = this.videos[name].y }
      // this.videos[name].data.x = x
      // this.videos[name].data.y = y
      var tween = this.videos[name].scene.add.tween({
            targets: this.videos[name],
            x: x,
            y: y,
            duration: 3000,
            yoyo: true,
            ease: 'Linear',
            repeat: -1,
            hold: 2000,
        });
      // this.videos[name].scene.over_update = function(t,d) {
      // }
    }
//      Override the loadComplete callback: You can override the loadComplete callback to execute code after the loader has finished loading all files. This can be useful for loading files dynamically after the initial preload.

  rainbow(name,color) {
    let tc = Phaser.Display.Color.ColorToRGBA(color)
    let ct = Phaser.Display.Color.ColorToRGBA(this.videos[name].tint);
    this.videos[name].red = ct.r;
    this.videos[name].green = ct.g;
    this.videos[name].blue = ct.b;
console.log(ct)
console.log(this.videos[name].red)

    this.videos[name].scene.tweens.addCounter({
        from: this.videos[name].red,
        to: tc.r,
        duration: 2000,
        onUpdate: function (tween) {
          const value = Math.floor(tween.getValue());
//console.log(value, Phaser.Display.Color.GetColor(value, this.videos[name].green, this.videos[name].blue))
          this.videos[name].red = value
          this.videos[name].setTint(Phaser.Display.Color.GetColor(this.videos[name].red, this.videos[name].green, this.videos[name].blue));
        }.bind(this)
    });
    this.videos[name].scene.tweens.addCounter({
        from: this.videos[name].green,
        to: tc.g,
        duration: 2000,
        onUpdate: function (tween) {
          const value = Math.floor(tween.getValue());
//console.log(value, Phaser.Display.Color.GetColor(value, this.videos[name].green, this.videos[name].blue))
          this.videos[name].green = value
          this.videos[name].setTint(Phaser.Display.Color.GetColor(this.videos[name].red, this.videos[name].green, this.videos[name].blue));
        }.bind(this)
    });
    this.videos[name].scene.tweens.addCounter({
        from: this.videos[name].blue,
        to: tc.b,
        duration: 2000,
        onUpdate: function (tween) {
          const value = Math.floor(tween.getValue());
//console.log(value, Phaser.Display.Color.GetColor(value, this.videos[name].green, this.videos[name].blue))
          this.videos[name].blue = value
          this.videos[name].setTint(Phaser.Display.Color.GetColor(this.videos[name].red, this.videos[name].green, this.videos[name].blue));
        }.bind(this)
    });
//     var tween = this.videos[name].scene.add.tween({
//         targets: this.videos[name],
//         tint: { from: 0, to: color },
//         duration: 2000,
//         delay: 0,
// //        yoyo: true,
// //        ease: 'Linear',
// //        repeat: false,
//     });         
  }
// Example:

// game.load.onLoadComplete.add(function() {
//   // Load dynamic files here
//   game.load.image('dynamicImage', 'assets/dynamicImage.png');
// });

  play_max1() {
    this.video_load('max1','play/assets/test4.mp4')
    this.video_load('max2','play/assets/test4.mp4')
    this.video_load('max3','play/assets/test4.mp4')
    this.video_load('max4','play/assets/test4.mp4')
    this.video_load('max5','play/assets/test4.mp4')
    var scale = 1.4
    var x = 270
    var y = 200
    var name = 'max5'
    this.to_front(10000)
    this.add_background()

    setOverTimeout(function(){ 
      this.video_scale('max5',scale);
      this.video_play('max5')

      setOverTimeout(function(){ 
        var name = 'max1' 
        this.video_scale(name,scale);
        this.video_goto_xy(name,-1 * x,-1*y)
        this.videos[name].setTint(0xFF0044)
        this.videos[name].setVolume(0)
        this.videos[name].setBlendMode(3)
        this.video_playMarker(name,'m1',true,180,188)
      }.bind(this),4000)

      setOverTimeout(function(){
        var name = 'max2' 
        this.video_scale(name,scale);
        this.video_goto_xy(name,x,-1*y)
        this.videos[name].setTint(0x0044FF)
        this.videos[name].setVolume(0)
        this.videos[name].setBlendMode(3)
        this.video_playMarker(name,'m1',true,142,149)
       }.bind(this),8000)

      setOverTimeout(function(){ 
        var name = 'max3' 
        this.video_scale(name,scale);
        this.video_goto_xy(name,-1*x,y)
        this.videos[name].setTint(0x00FF44)
        this.videos[name].setVolume(0)
        this.videos[name].setBlendMode(3)
        this.video_playMarker(name,'m1',true,16,26)
      }.bind(this),12000)

      setOverTimeout(function(){ 
        var name = 'max4' 
        this.video_scale(name,scale);
        this.video_goto_xy(name,x,y)
        this.videos[name].setTint(0xBBBB00)
        this.videos[name].setVolume(0)
        this.videos[name].setBlendMode(3)
        this.video_playMarker(name,'m1',true,100,106.5)
      }.bind(this),16000)

      // setOverTimeout(function(){ 
      //   this.video_stop('max1')
      //   this.video_stop('max2')
      //   this.video_stop('max3')
      //   this.video_stop('max4')
      //   this.video_stop('max5')
      //   this.remove_background()
      // }.bind(this),120000)
    }.bind(this),4000)
  }

}

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}

function getInt(num) {
  return Math.floor(num)
}

window.loaded_js = {}
function load_js(name,onload=function(){}) {
  if (window.loaded_js[name]) return;
  const script = document.createElement('script');
  script.id = `${name}`;
  script.src = `${name}`;
  document.body.append(script);
  //if (!onload) onload = ()=>{ window.loaded_js[name] = true; }
  //script.onload = onload;
//  if (!onload) onload = ()=>{ };
  script.onload = ()=> { this.loaded_js[name] = true; onload.call(this); }

  console.log(`${name} loaded.`)
}
