const NEED_PERMISSIONS = 0;
const WAITING = 1;
const RECORDING = 2;
const UPLOADING = 3;
const UPLOADED = 4;

const statuses = [
  { description: 'Waiting to record' }, // TODO: rename this?
  { description: 'Waiting to record' },
  { description: 'Recording' },
  { description: 'Recorded and uploading' },
  { description: 'Recorded and uploaded' },
];

// TODO: combine the above

export { NEED_PERMISSIONS, WAITING, RECORDING, UPLOADING, UPLOADED, statuses };
