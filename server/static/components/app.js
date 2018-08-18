import { renderNoiseList } from './list.js';
import { renderPlayer } from './player.js';
import {
  renderRecorder,
  renderRecordingControls,
  renderArrows,
  renderButton,
} from './recorder.js';

const updatePlaybackPlayer = ({ url = null, disabled, title }) => {
  const player = renderPlayer({
    id: 999, // TODO: workaround b/c we're not autogenerating IDs
    url,
    disabled,
    title,
  });

  const reviewsList = document.querySelector('[data-id=review-player-list]');

  reviewsList.innerHTML = player;
};

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
  renderPlayer,
  updatePlaybackPlayer,
  updateDownloadLink,
  renderButton,
  renderNoiseList,
  renderRecorder,
  renderRecordingControls,
  renderArrows,
};
