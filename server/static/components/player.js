// TODO: find or create more accessible player
function updateSamplePlayer({ url = null, disabled = false }) {
  // hook up player
  const player = document.querySelector('[data-id=player]');

  player.src = url;
  if (disabled) {
    player.setAttribute('disabled', 'disabled');
  } else {
    player.removeAttribute('disabled');
  }
}

export {
  updateSamplePlayer,
};
