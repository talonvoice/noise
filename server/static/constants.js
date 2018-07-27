const RECORDER_STATUS_VALUES = {
  'NEED_PERMISSIONS': { description: 'Waiting to record' },
  'WAITING': { description: 'Waiting to record' },
  'RECORDING': { description: 'Recording' },
  'UPLOADING': { description: 'Uploading' },
  'UPLOADED': { description: 'Done uploading' },
  'ALREADY_RECORDED': { description: 'Already recorded' },
};

// TODO: convert this to boolean
const NOISE_STATUS_VALUES = {
  'UNRECORDED': { description: 'Not yet recorded' },
  'RECORDED': { description: 'Recorded' },
};

export { RECORDER_STATUS_VALUES, NOISE_STATUS_VALUES };
