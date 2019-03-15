/**
 * Exports the component StopsPropagation
 * @module StopsPropagation
 */

import React from 'react';

/**
 * Creates a button that "stops propagation".
 * Clicking on it should close the typeahead.
 */
export class StopsPropagation extends React.Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  state = {
    nclicks: 0
  };

  onClick(e) {
    e.preventDefault();
    e.stopPropagation(); // The item under test. Will it prevent dropdown close?

    // records this click's occurance
    this.setState(({ nclicks }) => {
      return { nclicks: nclicks + 1 };
    });
  }

  render() {
    const { nclicks } = this.state;
    console.log(nclicks);

    return (
      <button onClick={this.onClick}>
        <span>{`You have clicked this ${nclicks} times (this calls stopPropagation())`}</span>
      </button>
    );
  }
}
