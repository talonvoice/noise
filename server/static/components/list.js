const noiseTemplate = ({
  selected,
  number,
  name,
  description,
  instructions,
  status,
}) => `
  <li class="RecordingList-item">
    <a class="Recording${
      selected ? ` Recording--selected` : ``
    }" data-id="list-item-${number}">
      <ul class="Recording-container">
        <li class="Recording-item Recording-name" data-id="list-item-${number}-name">${name}</li>
        <li class="Recording-item Recording-description" data-id="list-item-${number}-description">${description}</li>
        <li class="Recording-item Recording-instructions" data-id="list-item-${number}-instructions">${instructions}</li>
        <li class="Recording-item Recording-status" data-id="list-item-${number}-status">${status}</li>
      </ul>
    </a>
  </li>
`;

function renderNoiseList(
  noiseList,
  itemAction,
  selectedNoise,
  render,
  isDisabled,
) {
  // TODO: put our DOM references in a singular location?
  // TODO: prevent rerender if arguments are the same somehow
  const list = document.querySelector('[data-id=list]');
  const container = document.querySelector('[data-id=list-container]');

  container.innerHTML = '';
  noiseList.forEach((noise, index) => {
    // TODO: add selected value to each noise instead of relying on state.selectedNoise
    // TODO: render differently depending on if disabled or not; will need this to be called more frequently by the consumer first, however
    const noiseHtml = noiseTemplate({
      selected: index === selectedNoise,
      number: index + 1,
      name: noise.name,
      description: noise.desc,
      instructions: '',
      status: noise.status.description,
    });
    container.insertAdjacentHTML('beforeend', noiseHtml);
    const item = list.querySelector(`[data-id=list-item-${index + 1}]`);
    item.addEventListener('click', evt => {
      if (!isDisabled()) {
        console.log('selecting...');
        // TODO: put proper hooks in place and then we may not need to pass as function, although we may still want to
        if (itemAction(index)) {
          // relies on modified signal
          render();
        }
      }
    });
  });
}

export { renderNoiseList };
