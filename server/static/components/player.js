// TODO: find or create more accessible player
function updateSamplePlayer({
  url = null,
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

export { updateSamplePlayer };
