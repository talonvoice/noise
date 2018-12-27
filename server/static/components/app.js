import { renderNoiseList } from './list.js';
import { renderPlayer } from './player.js';
import { updateIsFlac } from './is-flac.js';

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

const createInterstitial = ({ content = '', handleClick = () => {} }) => {
  const template = `
    <div class="Dialog Dialog--introduction" data-id="interstitial">
      <div class="Introduction" data-id="interstitial">
        <div class="Introduction-content">${content}</div>
        <div class="Introduction-controls" data-id="controls">
          <button class="Button" data-id="interstitial-accept">Accept and Continue</button>
          <a class="Link" href="https://talonvoice.com">Nevermind</a>
        </div>
        </div>
      </div>
    </div>
  `;

  const placeholder = document.querySelector(
    '[data-id=interstitial-placeholder]',
  );
  placeholder.innerHTML = template;

  const accept = document.querySelector('[data-id=interstitial-accept]');
  accept.addEventListener('click', handleClick);
};

const renderInterstitial = ({ isShowing = false }) => {
  const placeholder = document.querySelector(
    '[data-id=interstitial-placeholder]',
  );
  placeholder.style.display = isShowing ? 'block' : 'none';
};

// TODO: move everything UI into here eventually from index.js
function updateApp({ isFlac, onFlacClick }) {
  updateIsFlac({ checked: isFlac, disabled: false, onClick: onFlacClick});
}

export {
  updateApp,
  renderPlayer,
  updatePlaybackPlayer,
  updateDownloadLink,
  renderButton,
  renderNoiseList,
  renderRecorder,
  renderRecordingControls,
  renderArrows,
  createInterstitial,
  renderInterstitial,
};
