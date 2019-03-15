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
 * Detects whether an event was a tab forward
 * @param {SyntheticEvent} e - React Keyboard Event
 */
const isTabForward = e => {
  return e.keyCode === 9 && e.shiftKey === false;
};

/**
 * Detects whether an event was a tab backward
 * @param {SyntheticEvent} e - React Keyboard Event
 */
const isTabBackward = e => {
  return e.keyCode === 9 && e.shiftKey === true;
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

class Suggestion_ extends React.Component {
  constructor(props) {
    super(props);
    this.onKeyDown = this.onKeyDown.bind(this);
  }

  onKeyDown(e) {
    const { onTabForward } = this.props;

    if (isTabForward(e)) {
      onTabForward(e);
    }
  }

  render() {
    const { children, className, innerRef } = this.props;

    // tabIndex makes these divs focusable.
    return (
      <div
        ref={innerRef}
        tabIndex="0"
        className={classnames(className, 'suggestion')}
        onKeyDown={this.onKeyDown}>
        {children}
      </div>
    );
  }
}

/**
 * The only true Typeahead
 */
export class Typeahead extends React.Component {
  constructor(props) {
    super(props);
    this.firstCandidateRef = React.createRef();
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onChange = this.onChange.bind(this);
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
   * Automatically focuses the Typeahead;
   * Binds necessary keypress and click listeners.
   * @ignore
   */
  componentDidMount() {
    this.input.focus();
    // todo -- when clicking outside of the typeahead, we need to close the typeahead (or: it loses focus)
    // We could bind to the document -- document.addEventListener + document.removeEventListener --
    // seeing as we need to monitor clicks everywhere.
    // But, what about manually handled clicks with stopPropagation()?
  }

  onKeyDown(e) {
    // escape -- clears the text entry
    if (e.keyCode === 27) {
      this.setState({ userInput: '' });
    }

    // enter -- accept the highlighted entry
    if (e.keyCode === 13) {
      this.setState({ userInput: 'enter hit' });
    }
  }

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
   * Todo -- ensure that dropdown does not force items below it down on the page.
   * @ignore
   */
  render() {
    const { className } = this.props;
    const { userInput, filteredCandidates } = this.state;

    const firstCandidateRef = this.firstCandidateRef;
    const goodInput = !isEmptyOrWhitespace(userInput);

    return (
      <div>
        <div>Debug output: len {filteredCandidates.length}</div>
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
          {goodInput
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
                  }}>
                  <b>{start}</b>
                  {rest}
                </Suggestion>
              ))
            : null}
        </div>
      </div>
    );
  }
}
