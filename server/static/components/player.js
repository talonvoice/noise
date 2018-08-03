// TODO: find or create more accessible player
// TODO: seems like this is duplicating functionality from recorder.js renderRecorder()
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
