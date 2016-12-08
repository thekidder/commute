import React, { Component } from 'react';
import throttle from 'lodash.throttle';

import Chart from './Chart';
import DirectionsLoader from './DirectionsLoader';

function getDuration(response) {
  return response.routes[0].legs[0].duration_in_traffic.value;
}

export default class Commute extends Component {
  constructor(props) {
    super(props);

    this.directionsLoader = new DirectionsLoader(new this.props.GoogleMaps.DirectionsService);

    this.state = {
      directionsResults: {}
    };

    this.load(new Date('December 8 2016 06:00:00'), new Date('December 8 2016 13:00:00'), true);
    this.load(new Date('December 8 2016 13:30:00'), new Date('December 8 2016 20:00:00'), false);
  }

  load(startDate, endDate, navigateToWork) {
    const intervalMinutes = 30;

    for (var date = startDate; date <= endDate; date = new Date(date.getTime() + intervalMinutes * 60 * 1000)) {
      this.directionsLoader.loadRouteAtDate(date, navigateToWork, this.loaded.bind(this));
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

    return (<Chart data={data} />);
  }
};
