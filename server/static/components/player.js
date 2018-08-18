// TODO: find or create more accessible player
function updateSamplePlayer({
  url = null,
  title = 'example',
  disabled = false,
}) {
  // hook up player
  const player = document.querySelector('[data-id=preview]');
  const label = document.querySelector('[data-id=preview-label');
  label.innerHTML = `${title}:`;

  // player.src = url; // TODO: alternative to below; which is better?
  player.innerHTML = `
    <source src="${url}" type="audio/mpeg"/>
  `;
  player.load();
  player.style.display = 'block';

  if (disabled) {
    player.setAttribute('disabled', 'disabled');
  } else {
    player.removeAttribute('disabled');
  }
}

export { updateSamplePlayer };
