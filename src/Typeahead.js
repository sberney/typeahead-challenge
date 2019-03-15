/**
 * Typeahead implementation module
 * @module typeahead
 */

import React from 'react';
import ReactDOM from 'react-dom';
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
 * Represents a typeahead suggestion
 */
const Suggestion = ({ children, className, focused }) => {
  // tabIndex makes these divs focusable.
  return (
    <div
      tabIndex="5"
      className={classnames(className, 'suggestion', { focused })}>
      {children}
    </div>
  );
};

/**
 * The only true Typeahead
 */
export class Typeahead extends React.Component {
  constructor(props) {
    super(props);
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
    debug: 'nothing yet!',
    userInput: '',
    filteredCandidates: []
  };

  /**
   * Automatically focuses the Typeahead;
   * Binds necessary keypress and click listeners.
   * @ignore
   */
  componentDidMount() {
    //this.input.focus(); // todo -- enable. codesandbox makes this troublesome for development.
    // todo -- when clicking outside of the typeahead, we need to close the typeahead (or: it loses focus)
    // We could bind to the document -- document.addEventListener + document.removeEventListener --
    // seeing as we need to monitor clicks everywhere.
    // But, what about manually handled clicks with stopPropagation()?
  }

  onTab(e) {
    const hasMatch = !!this.state.filteredCandidates.length;

    // allows default tab focusing behavior when there are no results
    if (false === hasMatch) return;

    //e.preventDefault(); // a match exists -- no shifting focus

    if (e.shiftKey) {
      // backwards through results
      //if ()
      //this.setState(update('focusIndex', add(-1)));
    } else {
      // forwards through the results
      //this.setState(update('focusIndex', add(1)));
    }
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

    // tab key
    if (e.keyCode === 9) {
      this.onTab(e);
    }
  }

  onChange(e) {
    const { list } = this.props;
    const userInput = e.target.value;

    this.setState({
      userInput,
      filteredCandidates: filterCandidates(list, userInput)
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

    const goodInput = !isEmptyOrWhitespace(userInput);

    return (
      <div>
        <div>Debug output: len {filteredCandidates.length}</div>
        <div className={classnames(className, 'suggestion-box')}>
          <input
            tabIndex="5"
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
                <Suggestion key={idx}>
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
