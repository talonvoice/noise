/* UI */
const noiseTemplate = ({
  selected,
  number,
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

export default noiseTemplate;