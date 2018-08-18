import { renderNoiseList } from './list.js';
import { updatePlayer } from './player.js';
import {
  renderRecorder,
  renderRecordingControls,
  renderArrows,
  renderButton,
} from './recorder.js';

// TODO: simplify and investigate if direct DOM manipulation is needed for any of this UI (e.g., rerendering players or recorders may wipe out local stae)
// TODO: merge with render() functions if possible

function updateDownloadLink({ url = null, filename = null, disabled = false }) {
  // hook up download link
  const downloadLink = document.querySelector('[data-id=download]');

  downloadLink.href = url;
  downloadLink.download = filename;

  if (disabled) {
    downloadLink.classList.add('DownloadLink--disabled');
  } else {
    downloadLink.classList.remove('DownloadLink--disabled');
  }
}

export {
  updatePlayer,
  updateDownloadLink,
  renderButton,
  renderNoiseList,
  renderRecorder,
  renderRecordingControls,
  renderArrows,
};
