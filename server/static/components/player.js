// TODO: find or create more accessible player
function updatePlayer({
  url = null,
  urls = [],
  title = 'example',
  disabled = false,
  target = 'preview', // TODO: remove this if/when we move the logic of selecting components outside (AKA start working with true "components")
}) {
  // hook up player
  const player = document.querySelector(`[data-id=${target}]`);
  const label = document.querySelector(`[data-id=${target}-label`);
  label.innerHTML = `${title}`;

  // player.src = url; // TODO: alternative to below; which is better?
  player.innerHTML = `
    <source src="${url}" type="audio/mpeg"/>
  `;
  player.load();

  if (disabled) {
    player.setAttribute('disabled', 'disabled');
  } else {
    player.removeAttribute('disabled');
  }
}

// TODO: find or create more accessible player
function renderPlayer({
  id = 0,
  url = null,
  title = 'example',
  disabled = false,
}) {
  const template = `
    <div class="Player">
      <!-- TODO: convert to accessible custom controls -->
      <label class="Player-label" data-id="player-label-${id}" for="player-main-${id}">${title}</label>
      <audio class="Player-main" id="player-main-${id}" data-id="player-main-${id}" controls=""${ disabled ? ' disabled' : '' }>
        ${ url !== null ? `<source src="${url}" type="audio/mpeg"/>` : '' }
      </audio>
    </div>
  `;

  // player.src = url; // TODO: alternative to below; which is better?

  // load player
  // const player = document.querySelector(`[data-id=${target}]`);
  // player.load();
  return template;
}

export { updatePlayer, renderPlayer };
