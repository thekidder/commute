import { Button } from "@blueprintjs/core";
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
      <div className="pt-button-group" style={{float: 'left'}}>
        <Button className={isToday ? 'pt-active' : ''} text="Today" onClick={setToday} />
        <Button className={!isToday ? 'pt-active' : ''} text="Tomorrow" onClick={setTomorrow} />
      </div>
    );
  }
};
