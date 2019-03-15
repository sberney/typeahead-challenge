/**
 * Typeahead Challenge module.
 * @module typeahead-challenge
 *
 * Documentation using JSDoc
 */

import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import { Typeahead } from './Typeahead';
import { StopsPropagation } from './StopsPropagation';

/*
 * Using React create a `Typeahead` component that takes `list` and `classname` props.
 * Be sure that the component utilizes propTypes and any other best practices
 * that you follow. Use the `carBrands` list which is defined below as the
 * value for the `list` prop.
 *
 * Ensure that your component meets the following requirements:
 * 1. As the user types in an input field, a list of options should appear below it.
 *    - The list should only appear when input is not empty. Whitespace is
 *      considered empty.
 *    - The list should contain items from the `list` prop that *start*
 *      with the user entered value. Matching should be case insensitive.
 *    - Every new character typed should filter the list.
 * 2. Clicking on a list item should populate the input with the selected item's
 *    value and hide the list.
 * 3. For visible option strings, style the substring the user has entered as
 *    *bold*.
 * 4. Highlight a list item with gray background and white
 *    text when the user mouses over it.
 * 5. The input and list should be navigable using the keyboard.
 *    - Using `tab` and `shift+tab`, the user should be able to focus the different
 *      list items.
 *        - With the cursor in the input, pressing the `tab` key should focus the
 *          first item with the default browser focus style.
 *        - Subsequent presses of the "tab" key should focus the next item in the list.
 *        - Pressing the `shift+tab` keys should focus the previous item in the list.
 *        - Pressing the `shift+tab` key when the first item is focused should focus
 *          the input again.
 *        - Mousing over other list items should highlight them while the keyboard-
 *          focused item remains focused.
 *        - Pressing the `tab` key when no list is visible should move focus away
 *          from the input.
 *    - Pressing the `return` key when an item is focused should populate the input
 *      with the focused item's value, hide the list, and focus the input
 *      again.
 *    - Pressing the `escape` key should close the list.
 * 6. Clicking outside the input or the list should close the list.
 */

/**
 * Simple demo of Typeahead functionality.
 */
const App = () => (
  <div>
    <p>
      <div>
        <StopsPropagation />
      </div>
      <div>Before typeahead</div>
    </p>
    <Typeahead className="App" list={carBrands} />
    <p tabIndex="0">After typeahead (focusable)</p>
  </div>
);

/*
 * Please don't change the `carBrands` list.
 */
const carBrands = [
  'Alfa Romeo',
  'Audi',
  'BMW',
  'Chevrolet',
  'Chrysler',
  'Dodge',
  'Ferrari',
  'Fiat',
  'Ford',
  'Honda',
  'Hyundai',
  'Jaguar',
  'Jeep',
  'Kia',
  'Mazda',
  'Mercedez-Benz',
  'Mitsubishi',
  'Nissan',
  'Peugeot',
  'Porsche',
  'SAAB',
  'Subaru',
  'Suzuki',
  'Toyota',
  'Volkswagen',
  'Volvo'
];

ReactDOM.render(<App />, document.getElementById('root'));
