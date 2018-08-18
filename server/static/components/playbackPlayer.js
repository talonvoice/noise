import { renderPlayer } from './player.js';

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

export { updatePlaybackPlayer };
