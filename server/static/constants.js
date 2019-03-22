const RECORDER_STATUS_VALUES = {
  NEED_PERMISSIONS: { description: 'Ready' },
  WAIT_FOR_CLICK: { description: 'Ready' },
  STARTING: { description: 'Initializing' },
  RECORDING: { description: 'Recording' },
  UPLOADING: { description: 'Uploading' },
  UPLOADED: { description: 'Uploaded' },
  ALREADY_RECORDED: { description: 'Recorded' },
};

// TODO: convert this to boolean
const NOISE_STATUS_VALUES = {
  UNRECORDED: { description: 'Not yet recorded' },
  RECORDED: { description: 'Recorded' },
};

export { RECORDER_STATUS_VALUES, NOISE_STATUS_VALUES };
