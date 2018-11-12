// TODO: only for debugging purposes; remove in production
function updateIsFlac({
  checked = true,
  disabled = false,
  onClick = () => {},
}) {
  // get rid of original event handler by replacing button element
  // TODO: look into other ways of doing this, including using the original reference to the handler
  const oldCheckbox = document.querySelector('[data-id=is-flac-checkbox]');
  const checkbox = oldCheckbox.cloneNode(true);
  const label = document.querySelector('[data-id=is-flac-label]');

  checkbox.checked = checked;
  if (disabled) {
    checkbox.setAttribute('disabled', 'disabled');
    label.classList.add('IsFlac-label--disabled');
  } else {
    checkbox.removeAttribute('disabled');
    label.classList.remove('IsFlac-label--disabled');
  }

  checkbox.addEventListener('click', onClick);

  // get rid of original event handler by replacing button element
  // TODO: look into other ways of doing this, including using the original reference to the handler
  oldCheckbox.parentNode.replaceChild(checkbox, oldCheckbox);
}

export { updateIsFlac };
