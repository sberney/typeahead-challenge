/**
 * Detects whether an event was a tab forward
 * @param {SyntheticEvent} e - React Keyboard Event
 */
export const isTabForward = e => {
  return e.keyCode === 9 && e.shiftKey === false;
};

/**
 * Detects whether an event was a tab backward
 * @param {SyntheticEvent} e - React Keyboard Event
 */
export const isTabBackward = e => {
  return e.keyCode === 9 && e.shiftKey === true;
};

/**
 * Detects whether an event was an escape press
 * @param {SyntheticEvent} e - React Keyboard Event
 */
export const isEscape = e => {
  return e.keyCode === 27;
};

/**
 * Detects whether an event was an enter press
 * @param {SyntheticEvent} e - React Keyboard Event
 */
export const isEnter = e => {
  return e.keyCode === 13;
};
