ALPHA RELEASE - not ready for consumption


README overPlay

The goals of overPlay are to make a JS controlled display client to control playback of movies, sounds, and other animation elements.  This could be used as a library for other JS apps, but ultimately the goal is to allow remote control from an HTTP server via websockets (optionally using overSocket as the glue).


OverPlay is actually the conglomeration of overMedia, overAudio, overFX, overSprite, and others.  These libraries are predominantly based on PhaserJS, which is required, and brings a power house of functionality to game and media capability to the browser.  These libraries are just a means by which to skip over the nuances of PhaserJS and get right to being able to trigger media and animations.

The goal is to create a JS interface that is more amiable to non-programmers as well as remote triggering via websockets.  All assets (movies, sprites, audio) have an id, rather than an external object (you can also get that for more intesive programming), but if you are looking for a low level API, just go use PhaserJS directly or use something else.

Config Issues:
* Auto play media (optional)
* CORS for local files (optional)
* Fullscreen
  -- Type “full” in the search bar, and toggle “full-screen-api.enabled” to “false”:


overMedia:

om = overMedia.new
om.background(color)
om.fullscreen(bool)
om.load(id,file)
om.play(id,loop,start,stop,[speed])
om.stop(id,hide)
om.pause(id,hide)
om.volume(id,0-100)
om.window(id,x,y,w,h,z)
om.move(id,x,y,z,steps)
om.display(id,hide)
om.object(id)
om.filter(id,filter)

overAudio:

oa = overAudio.new
oa.load(id,file)
oa.play(id,loop,start,stop,[speed_min],[speed_max])
oa.stop(id,hide)
oa.pause(id,hide)
oa.volume(id,0-100)
oa.object(id)

overAudio Visualization
  oa.visualization(name)
  oa.fullscreen(bool)
  oa.window(id,x,y,w,h,z)
  oa.move(id,x,y,z,steps)
  oa.display(id,hide)



