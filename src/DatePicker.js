import React, { Component } from 'react';
import moment from 'moment';

export default class DatePicker extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentDate: props.defaultDate.startOf('date')
    };

    this.today = moment().startOf('date');
    this.tomorrow = this.today.clone().add(1, 'days');
  }

  setDate(date) {
    this.setState({ currentDate: date });
    this.props.setDate(date);
  }

  render() {
    const setToday = () => this.setDate(this.today);
    const setTomorrow = () => this.setDate(this.tomorrow);

    const isToday = this.state.currentDate.isSame(this.today);

    return (
      <div className='btn-group mr-2 mb-2' role='group' ariaLabel='Choose date'>
        <button
            onClick={setToday}
            type='button'
            className={isToday ? 'btn btn-secondary active' : 'btn btn-secondary'}
            disabled={!this.props.enableToday}>
          Today
        </button>
        <button
            onClick={setTomorrow}
            type='button'
            className={!isToday ? 'btn btn-secondary active' : 'btn btn-secondary'}>
          Tomorrow
        </button>
      </div>
    );
  }
};
