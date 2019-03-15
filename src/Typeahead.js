/**
 * Typeahead implementation module
 * @module typeahead
 */

import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import set from 'lodash/fp/set';
import update from 'lodash/fp/update';
import compose from 'lodash/fp/compose';
import add from 'lodash/fp/add';

import { isTabForward, isEscape, isEnter } from './detectKeys';
import './styles.css';

const isEmptyOrWhitespace = text => {
  return text === '' || /^\s+$/.test(text);
};

/**
 * Case insensitively check if candidate begins with "start"
 * @param {string} start - substring to search for
 * @param {string} candidate - string to search
 */
const startsWithCaseInsensitive = (start, candidate) => {
  return candidate.toUpperCase().startsWith(start.toUpperCase());
};

/**
 * A matching, parsed typeahead candidate.
 * @typedef {Object} Candidate
 * @property {string} start - the matching portion
 * @property {string} rest - the non-matching portion
 */

/**
 * Creates parsed list containing candidates which start with the user input.
 * Bad user input (empty or all whitespace) is treated as non-match,
 *
 * @param {string[]} candidates - list of strings to filter
 * @param {string} userInput - search string
 * @returns {Candidate} - list of matching candidates
 */
const filterCandidates = (candidates, userInput) => {
  const filtered = candidates.filter(item => {
    return (
      !isEmptyOrWhitespace(userInput) &&
      startsWithCaseInsensitive(userInput, item)
    );
  });

  return filtered.map(item => ({
    start: item.substring(0, userInput.length),
    rest: item.substring(userInput.length)
  }));
};

/**
 * Represents a typeahead suggestion.
 * Wraps Suggestion_, allowing Suggestion ref property name
 * to be "ref" as normal, instead of "innerRef".
 *
 * @param {Function} onTabForward - callback fired when a forward tab press is observed
 */
const Suggestion = React.forwardRef((props, ref) => (
  <Suggestion_ innerRef={ref} {...props} />
));

/**
 * @see Suggestion
 */
class Suggestion_ extends React.Component {
  constructor(props) {
    super(props);
    this.onKeyDown = this.onKeyDown.bind(this);
  }

  onKeyDown(e) {
    const { onTabForward, onEscape, onSelect } = this.props;
    if (isTabForward(e)) onTabForward(e);
    if (isEscape(e)) onEscape(e);
    if (isEnter(e)) onSelect();
  }

  render() {
    const { children, className, innerRef, onSelect } = this.props;

    // tabIndex makes these divs focusable.
    return (
      <div
        ref={innerRef}
        tabIndex="0"
        className={classnames(className, 'suggestion')}
        onKeyDown={this.onKeyDown}
        onClick={onSelect}>
        {children}
      </div>
    );
  }
}

/**
 * The only true Typeahead.
 *
 * @param {string[]} list - typeahead completion candidates
 * @param {string} className - css class to apply on this typeahead
 */
export class Typeahead extends React.Component {
  constructor(props) {
    super(props);
    this.firstCandidateRef = React.createRef();

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onChange = this.onChange.bind(this);
    this.documentClickHandler = this.documentClickHandler.bind(this);
  }

  static propTypes = {
    /** A list of entries to match input against */
    list: PropTypes.arrayOf(PropTypes.string).isRequired,
    /** Css class decorators */
    className: PropTypes.string
  };

  state = {
    /** @type {string} - Current value of the Typeahead input */
    userInput: '',
    /** @type {Candidate[]} - Candidate matches for current input */
    filteredCandidates: [],
    /** @type {boolean} - Whether user has pressed escape key to close suggestions */
    escaped: false
  };

  /**
   * Closes the suggestion box when any clicks occur.
   * @param {MouseEvent} e - Click Event
   * @this Document
   */
  documentClickHandler(e) {
    this.setState({ escaped: true });
  }

  /**
   * Automatically focuses the Typeahead;
   * Binds document click listeners.
   */
  componentDidMount() {
    this.input.focus();
    document.addEventListener('click', this.documentClickHandler);
  }

  /**
   * Unbinds document click listeners
   */
  componentWillUnmount() {
    document.removeEventListener('click', this.documentClickHandler);
  }

  /**
   * Closes the suggestion box when Escape is pressed (while input is focused).
   * @param {SyntheticEvent} e - React Keyboard event
   */
  onKeyDown(e) {
    if (isEscape(e)) {
      this.setState({ escaped: true });
    }
  }

  /**
   * Updates the Typeahead state when the user changes the input.
   * @param {SyntheticEvent} e - input change event
   */
  onChange(e) {
    const { list } = this.props;
    const userInput = e.target.value;

    this.setState({
      userInput,
      filteredCandidates: filterCandidates(list, userInput),
      escaped: false // the user can never escape auto-complete for more than heartbeat, as pioneered by chrome
    });
  }

  /**
   * Renders an input box, followed by a dropdown list of matching options.
   */
  render() {
    const { className } = this.props;
    const { userInput, filteredCandidates, escaped } = this.state;

    const firstCandidateRef = this.firstCandidateRef;
    const goodInput = !isEmptyOrWhitespace(userInput);

    return (
      <div className={classnames(className, 'suggestion-box')}>
        <input
          value={userInput}
          ref={input => {
            this.input = input;
          }}
          onChange={this.onChange}
          onKeyDown={this.onKeyDown}
          type="text"
        />
        {goodInput && !escaped
          ? filteredCandidates.map(({ start, rest }, idx) => (
              <Suggestion
                key={idx}
                ref={idx === 0 ? this.firstCandidateRef : null}
                onTabForward={e => {
                  const isLast = idx === filteredCandidates.length - 1;
                  if (isLast && firstCandidateRef.current) {
                    // cycle back to the beginning of the list
                    e.preventDefault();
                    firstCandidateRef.current.focus();
                  }
                }}
                onEscape={e => {
                  this.setState({ escaped: true });
                  this.input.focus();
                }}
                onSelect={() => {
                  this.setState({ userInput: start + rest, escaped: true });
                  this.input.focus();
                }}>
                <b>{start}</b>
                {rest}
              </Suggestion>
            ))
          : null}
      </div>
    );
  }
}
