# TODOS

## FEATURES

### IN PROGRESS

### PLANNED
  - [ ] add support for FLAC (e.g., https://github.com/mmig/speech-to-flac)
  - [ ] show user visual indicator that they can't change noises while recording
  - [ ] add wizard (easy sequential navigation)
  - [ ] simple text "pacing" timeline
    - [ ] change noises data structure to allow for pauses and prompts
    - [ ] show user a timeline for visual prompts
    - [ ] show user basic visual prompts for recording a noise
    - [ ] integrate new sample sounds

### ICEBOX
  - [ ] complex graphic timeline
    - [ ] show user an animated timeline a la rhythm games
  - [ ] accessibility
    - [ ] add simple keyboard shortcuts for accessibility
    - [ ] replace built-in audio controls with custom ones for accessibility (e.g., https://developer.mozilla.org/en-US/docs/Learn/Accessibility/Multimedia#Creating_custom_audio_and_video_controls)
  - [ ] allow user to review and submit
  - [ ] allow user to select mic ("zero; browsers have that ui")

### DONE
  - [x] prevent user from changing noises while recording
  - [x] get basic happy path working
  - [x] allow user to record multiple noises
  - [x] load data
  - [x] update UI when done recording, and uploading
  - [x] load noise info from data json
  - [x] add navigation arrows as a precursor to the wizard



## TECHNICAL HEALTH

### IN PROGRESS

### PLANNED
  - [ ] split out CSS by "component"
  - [ ] add development web server for automatically reloading on save of static files
  - [ ] add build step so that we can use packages more easily, minify, etc

### ICEBOX
  - [ ] test scenarios
  - [ ] fallback to <input>
  - [ ] add debouncing
  - [ ] add polyfills and fallbacks
  - [ ] productionize
  - [ ] test supported desktop browsers
  - [ ] smoke test and fix mobile browsers

### DONE
  - [x] refactor into modules
