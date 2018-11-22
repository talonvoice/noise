# Remaining MVP TODOs

Using GitHub Markdown task list syntax (https://help.github.com/articles/about-task-lists/)

## @here the merge is done, if you want to help
- [x] correct README (context: the readme seems wrong, I had to `cd server; python app.py`, also you need to `pip install -r requirements.txt` in server/ if you don't have flask)
- [x] remove extraneous right arrow (context: there's an extra right arrow that doesn't seem to do anything)
- [x] make player opaque and the width of the screen (context: the transparent overlay is just a distraction, should probably be opaque and the width of the screen)
- [ ] users should probably be able to re-record sounds; it's not useful to fully disable them
   - [ ] for allowing users to re-record, need to use unique filenames (take uuid out of filename, add a counter)
- [ ] when you start recording, it needs to pause the sample playback
   - [x] stop the sample playback when user begins recording
   - [ ] pause the sample playback when user begins recording (requires non-native HTML player)
- [ ] "uh" and "oh" should be separate noises (might need to record a new sound)
- [ ] and we should clean up the examples on some of them, like
   - [ ] smooch has double-smooching which will confuse the training, and
   - [ ] each noise should just have one example sound file imo

## besides that, I think just
- [ ] general ui cleanup
- [ ] simplifying the interstitial text
- [ ] and adding some kind of license agreement to the interstitial
should be it and we're ready to publish
- [ ] stop recording should maybe be in a different spot from start recording, because users will be likely to have talon running with the noise recognizers

## other
- [x] "archive" older TODOs and use Github Markdown syntax instead
- [x] nuke misc sound files
- [x] update README and a couple of other minor things
- [x] hide "Is Flac" checkbox