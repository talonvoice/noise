function initializeRecorder({
  stream,
  onRecordStart,
  onDataAvailable,
  onRecordStop,
  onRecordError,
}) {
  /*
    async I/O (recorder)
  */
  const options = { mimeType: 'audio/webm' };
  let mediaRecorder;

  try {
    // TODO: set up audio context instead?
    mediaRecorder = new MediaRecorder(stream, options);
  } catch (err) {
    console.log('ERROR:' + err.name);
    return err.name; /* return the error name */
    // TODO: let user know there was an error initializing the recorder
  }

  // TODO: return a reference to this so that we can use it outside
  function startRecorder() {
    try {
      /*
         async I/O (recorder)
       */
      // start recording
      mediaRecorder.start(1000); // NOTE: if an argument is not provided, the "dataavailable" event will not fire until the media recorder is stopped
    } catch (e) {
      console.error(e);
      // TODO: reset UI
    }
  }

  // TODO: return a reference to this so that we can use it outside
  function stopRecorder() {
    try {
      /*
       async I/O (recorder)
     */
      // stop recording
      mediaRecorder.stop();
    } catch (e) {
      console.error(e);
      // TODO: reset UI
    }
  }

  mediaRecorder.addEventListener('dataavailable', onDataAvailable);
  mediaRecorder.addEventListener('start', onRecordStart);
  mediaRecorder.addEventListener('stop', onRecordStop);
  mediaRecorder.onerror = onRecordError; // TODO: why not just use addEventListener here too?

  return {
    startRecorder,
    stopRecorder,
  };
}

export { initializeRecorder };
