<a id="el1" href="javascript:activate()">static html / template</a>

function activate(e) {
   active = noises[e.target.id]
   container.innerHTML = render_template(active)
}
// okay, so you want space to advance?

STATE_OPEN = 1
STATE_PLAY = 1
STATE_REC = 1

function advance() {
   switch state {
       case open:
           state = play
           // start playing active
       case play:
           state = record
           // start recording active
       case rec:
           state = open
           // activate next
   }
}
// can add two states for highlight before advance
// you'll need to write basically this exact code with or without react
// so you're abusing react as a template engine