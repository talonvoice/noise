// TODO: find or create more accessible player
function renderPlayer({
  id = 0, // TODO: autogenerate these as static counter ... one day ...
  url = null,
  title = 'example',
  mediaType = 'audio', // or "video"
  disabled = false,
}) {
  const type = mediaType === 'audio' ? 'audio/mpeg' : 'video/mp4';
  const template = `
    <div class="Player">
      <!-- TODO: convert to accessible custom controls -->
        <${mediaType} class="Player-main" id="player-main-${id}" data-id="player-main-${id}" controls=""${ disabled ? ' disabled' : '' }>
        ${ url !== null ? `<source src="${url}" type="${type}">` : '' }
        </${mediaType}>
    </div>
  `;

  // player.src = url; // TODO: alternative to below; which is better?

  // load player
  // const player = document.querySelector(`[data-id=${target}]`);
  // player.load();
  return template;
}

export { renderPlayer };
