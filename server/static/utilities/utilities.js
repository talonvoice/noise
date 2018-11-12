/*
  Utilities
 */

// TODO: generate on server instead

// copypasta from https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
function generateUUID() {
  // Public Domain/MIT
  let d = new Date().getTime();
  if (
    typeof performance !== 'undefined' &&
    typeof performance.now === 'function'
  ) {
    d += performance.now(); //use high-precision timer ifj available
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    let r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

// shallow merge
function merge(a, b) {
  return {
    ...a,
    ...b
  };
}

// show user notification
function showNotification(message) {
  // TODO: replace with something nicer
  alert(message);
}

function getCookieValue(name) {
  let regexString = `(?:(?:^|.*;\s*)${name}\s*\=\s*([^;]*).*$)|^.*$`;
  let regex = new RegExp(regexString);
  let valuesAsArray = regex.exec(document.cookie)
  let cookieValue = valuesAsArray.length > 0 ? decodeURIComponent(valuesAsArray[1]) : undefined;

  return cookieValue;
}

function setCookieValue(name, value) {
  let newValue = (`${encodeURIComponent(name)}=${encodeURIComponent(value)}`);
  document.cookie = newValue;
}

function resetCookieValue(name) { 
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export { generateUUID, merge, showNotification, getCookieValue, setCookieValue, resetCookieValue };
