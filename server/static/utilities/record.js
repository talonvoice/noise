function record(container, { onRecordStart, onRecordStop }) {
  container.audio_context = null;
  container.stream = null;
  container.recording = false;
  container.encoder = null;
  container.ws = null;
  container.input = null;
  container.node = null;
  container.samplerate = 44100;
  container.autoSelectSamplerate = true;
  container.samplerates = [
    8000,
    11025,
    12000,
    16000,
    22050,
    24000,
    32000,
    44100,
    48000,
  ];
  container.compression = 5;
  container.compressions = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  // container.bitrate = 16;
  // container.bitrates = [ 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 192, 224, 256, 320 ];

  // TODO: update UI
  container.recordButtonStyle = 'red-btn';

  container.flacdata = {};
  container.flacdata.bps = 16;
  container.flacdata.channels = 1;
  container.flacdata.compression = 5;
  container.wav_format = false;
  container.outfilename_flac = 'output.flac';
  container.outfilename_wav = 'output.wav';

  container.result_mode = 'file';

  container.recordaswave = function(isUseWavFormat) {
    container.wav_format = isUseWavFormat;
  };

  container.startRecording = function(e) {
    console.log('attempt to start recording ...'); //DEBUG
    if (container.recording) return;

    console.log('start recording'); //DEBUG

    container.encoder = new Worker('static/utilities/encoder.js');

    if (container.wav_format == true) {
      container.encoder.postMessage({ cmd: 'save_as_wavfile' });
    }

    container.encoder.onmessage = function(e) {
      console.log(e.data.cmd);
      
      if (e.data.cmd == 'end') {
        var resultMode = container.result_mode;

        if (resultMode === 'file') {
          var fname = container.wav_format
            ? container.outfilename_wav
            : container.outfilename_flac;
          container.forceDownload(e.data.buf, fname);
        } else {
          console.error(
            'Unknown mode for processing STOP RECORDING event: "' +
              resultMode +
              '"!',
          );
        }

        container.encoder.terminate();
        container.encoder = null;
      } else if (e.data.cmd == 'debug') {
        console.log(e.data);
      } else if (e.data.cmd == 'initialized') {
        console.log('Initialized...');
        onRecordStart(); // TODO: should this be here? seems to take a while before initialization occurs; consider having two callbacks instead, or changing the UI preemptively (e.g., optimistic updates)
      } else if (e.data.cmd == 'initialization_error') {
        console.error('Initialization error from encoder (WebWorker)');
      } else if (e.data.cmd == 'finished') {
        console.log('Finished...');
        onRecordStop(); // TODO: should this be here? might take a while before encoding is complete; consider having two callbacks instead, or changing the UI preemptively (e.g., optimistic updates)
      } else if (e.data.cmd == 'finish_error') {
        console.error('Finish error from encoder (WebWorker)');
      } else {
        console.error(
          'Unknown event from encoder (WebWorker): "' + e.data.cmd + '"!',
        );
      }
    };

    if (navigator.webkitGetUserMedia)
      navigator.webkitGetUserMedia(
        { video: false, audio: true },
        container.gotUserMedia,
        container.userMediaFailed,
      );
    else if (navigator.mozGetUserMedia)
      navigator.mozGetUserMedia(
        { video: false, audio: true },
        container.gotUserMedia,
        container.userMediaFailed,
      );
    else
      navigator.getUserMedia(
        { video: false, audio: true },
        container.gotUserMedia,
        container.userMediaFailed,
      );
  };

  container.userMediaFailed = function(code) {
    console.log('grabbing microphone failed: ' + code);
  };

  container.gotUserMedia = function(localMediaStream) {
    container.recording = true;
    container.recordButtonStyle = '';

    console.log('success grabbing microphone');
    container.stream = localMediaStream;

    var audio_context;
    if (typeof webkitAudioContext !== 'undefined') {
      audio_context = new webkitAudioContext();
    } else if (typeof AudioContext !== 'undefined') {
      audio_context = new AudioContext();
    } else {
      console.error(
        'JavaScript execution environment (Browser) does not support AudioContext interface.',
      );
      alert(
        'Could not start recording audio:\n Web Audio is not supported by your browser!',
      );

      return;
    }
    container.audio_context = audio_context;
    container.input = audio_context.createMediaStreamSource(container.stream);

    if (container.input.context.createJavaScriptNode)
      container.node = container.input.context.createJavaScriptNode(4096, 1, 1);
    else if (container.input.context.createScriptProcessor)
      container.node = container.input.context.createScriptProcessor(
        4096,
        1,
        1,
      );
    else
      console.error(
        'Could not create audio node for JavaScript based Audio Processing.',
      );

    var sampleRate = container.audio_context.sampleRate;
    console.log('audioContext.sampleRate: ' + sampleRate); //DEBUG
    if (container.autoSelectSamplerate) {
      container.samplerate = sampleRate;
    }

    console.log('initializing encoder with:'); //DEBUG
    console.log(' bits-per-sample = ' + container.flacdata.bps); //DEBUG
    console.log(' channels        = ' + container.flacdata.channels); //DEBUG
    console.log(' sample rate     = ' + container.samplerate); //DEBUG
    console.log(' compression     = ' + container.compression); //DEBUG
    container.encoder.postMessage({
      cmd: 'init',
      config: {
        samplerate: container.samplerate,
        bps: container.flacdata.bps,
        channels: container.flacdata.channels,
        compression: container.compression,
      },
    });

    container.node.onaudioprocess = function(e) {
      // TODO: trigger onDataAvailable here

      if (!container.recording) return;
      // see also: http://typedarray.org/from-microphone-to-wav-with-getusermedia-and-web-audio/
      var channelLeft = e.inputBuffer.getChannelData(0);
      // var channelRight = e.inputBuffer.getChannelData(1);
      container.encoder.postMessage({ cmd: 'encode', buf: channelLeft });
    };

    container.input.connect(container.node);
    container.node.connect(audio_context.destination);
  };

  container.stopRecording = function() {
    console.log('attempt to stop recording ...'); //DEBUG
    if (!container.recording) {
      return;
    }
    // onRecordStart(); // TODO: should this be here or inside of startRecording() .onmessage()?

    console.log('stop recording'); //DEBUG
    // TODO: pass this in at the top then uncomment:
    // onStop();
    var tracks = container.stream.getAudioTracks();
    for (var i = tracks.length - 1; i >= 0; --i) {
      tracks[i].stop();
    }
    container.recording = false;
    container.encoder.postMessage({ cmd: 'finish' });

    container.input.disconnect();
    container.node.disconnect();
    container.input = container.node = null;
  };

  //create A-element for data BLOB and trigger download
  container.forceDownload = function(blob, filename) {
    var url = (window.URL || window.webkitURL).createObjectURL(blob);
    var link = window.document.createElement('a');
    link.href = url;
    link.download = filename || 'output.flac';
    //NOTE: FireFox requires a MouseEvent (in Chrome a simple Event would do the trick)
    var click = document.createEvent('MouseEvent');
    click.initMouseEvent(
      'click',
      true,
      true,
      window,
      0,
      0,
      0,
      0,
      0,
      false,
      false,
      false,
      false,
      0,
      null,
    );
    link.dispatchEvent(click);
  };

  container.num = 0;

  return {
    startRecording: container.startRecording,
    stopRecording: container.stopRecording,
  };
}

export { record };
