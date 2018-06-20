const WAITING = 0;
const RECORDING = 1;
const UPLOADING = 2;
const UPLOADED = 3;

const statuses = [
  { description: 'Waiting to record' },
  { description: 'Recording' },
  { description: 'Recorded and uploading' },
  { description: 'Recorded and uploaded' },
];

// TODO: combine the above

export { WAITING, RECORDING, UPLOADING, UPLOADED, statuses };
