function initializeRecorder({
  stream,
  onRecordStart,
  onDataAvailable,
  onRecordStop,
  onRecordError,
}) {
  const options = { mimeType: 'audio/webm' };
  let mediaRecorder;

  try {
    mediaRecorder = new MediaRecorder(stream, options);
  } catch (err) {
    return err.name; /* return the error name */
    // TODO: let user know there was an error initializing the recorder
  }

  function startRecording() {
    try {
      // start recording
      mediaRecorder.start(1000); // NOTE: if an argument is not provided, the "dataavailable" event will not fire until the media recorder is stopped
    } catch (e) {
      console.error(e);
      // TODO: reset UI
    }
  }

  function stopRecording() {
    try {
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
  mediaRecorder.addEventListener('error', onRecordError);

  return {
    startRecording,
    stopRecording,
  };
}

export { initializeRecorder };
