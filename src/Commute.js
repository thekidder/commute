import React, { Component } from 'react';
import moment from 'moment';
import throttle from 'lodash.throttle';

import Chart from './Chart';
import DatePicker from './DatePicker';
import DirectionsLoader from './DirectionsLoader';

const intervalMinutes = 30;

function getDuration(response) {
  return response.routes[0].legs[0].duration_in_traffic.value;
}

export default class Commute extends Component {
  constructor(props) {
    super(props);

    this.directionsLoader = new DirectionsLoader(new this.props.GoogleMaps.DirectionsService);

    this.state = {
      currentDate: moment(),
      directionsResults: {}
    };

    this.loadForDate(this.state.currentDate);
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.currentDate.isSame(this.state.currentDate)) {
      this.directionsLoader.clear();
      this.setState({ directionsResults: {} });
      this.loadForDate(this.state.currentDate);
    }
  }

  loadForDate(date) {
    // queue loading all data for the given date. ensures we don't load anything before the current
    // time, which is not allowed by the google maps api for obvious reasons

    const now = moment();
    const remainder = intervalMinutes - now.minute() % intervalMinutes;
    now.add(remainder, 'minutes');

    let beginOfDay = date.clone().set({
      hour: 6,
      minute: 0
    });

    const endOfDay = date.clone().set({
      hour: 20,
      minute: 0
    });

    let middleOfDay = date.clone().set({
      hour: 13,
      minute: 0
    });

    if(now.isBefore(middleOfDay)) {
      beginOfDay = moment.max(now, beginOfDay);
      this.load(beginOfDay, middleOfDay, true);
    }

    middleOfDay.add(intervalMinutes, 'minutes');
    middleOfDay = moment.max(now, middleOfDay);
    if (middleOfDay.isBefore(endOfDay)) {
      this.load(middleOfDay, endOfDay, false);
    }
  }

  load(startDate, endDate, navigateToWork) {
    for (var date = startDate; date <= endDate; date.add(intervalMinutes, 'minutes')) {
      this.directionsLoader.loadRouteAtDate(date.toDate(), navigateToWork, this.loaded.bind(this));
    }
  }

  loaded(date, trafficModel, response, status) {
    if (status === 'OK') {
      const model = this.state.directionsResults[date] || {};
      model[trafficModel] = response;
      console.log(`Duration for ${date} for ${trafficModel} is ${response.routes[0].legs[0].duration_in_traffic.text}`);
      this.setState({directionsResults: {...this.state.directionsResults, [date]: model}});
    } else {
      console.log(`loading error: ${status}!`);
    }
  }

  render() {
    const data = [];
    for (const date in this.state.directionsResults) {
      const raw = this.state.directionsResults[date];
      const datum = {
        date: date
      };

      if (raw.pessimistic) {
        datum.pessimistic = getDuration(raw.pessimistic);
      }

      if (raw.optimistic) {
        datum.optimistic = getDuration(raw.optimistic);
      }

      if (raw.bestguess) {
        datum.bestguess = getDuration(raw.bestguess);
      }

      data.push(datum);
    }

    const setDate = date => this.setState({ currentDate: date });

    return (
      <div>
        <DatePicker setDate={setDate} defaultDate={moment()} />
        <Chart data={data} />
      </div>
    );
  }
};
