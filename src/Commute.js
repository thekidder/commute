import React, { Component } from 'react';

import Chart from './Chart';

import location from './location';

function getDuration(response) {
  return response.routes[0].legs[0].duration_in_traffic.value;
}

export default class Commute extends Component {
  constructor(props) {
    super(props);

    this.requestQueue = [];

    this.state = {
      directionsService: new this.props.GoogleMaps.DirectionsService,
      directionsResults: {}
    };

    this.load(new Date('December 5 2016 06:00:00'), new Date('December 5 2016 12:00:00'), true);
    this.load(new Date('December 5 2016 14:00:00'), new Date('December 5 2016 20:00:00'), false);

    setInterval(this.loadRequests.bind(this), 1000);
  }

  load(startDate, endDate, to) {
    const intervalMinutes = 30;

    for (var date = startDate; date <= endDate; date = new Date(date.getTime() + intervalMinutes * 60 * 1000)) {
      console.log(`loading at ${date}`);
      this.loadRouteAtDate(date)
    }
  }

  loadRequests() {
    if (this.requestQueue.length) {
      this.requestQueue[0]();
      this.requestQueue = this.requestQueue.slice(1);
    }
  }

  loadRouteAtDate(date, to) {
    this.requestQueue.push(() => this.loadRoute(date, 'bestguess', to));
    this.requestQueue.push(() => this.loadRoute(date, 'pessimistic', to));
    this.requestQueue.push(() => this.loadRoute(date, 'optimistic', to));
  }

  loadRoute(date, trafficModel, to) {
    const home = location.home;
    const work = location.work;

    const request = {
      origin: to ? home : work,
      destination: to ? work : home,
      travelMode: 'DRIVING',
      drivingOptions: {
        departureTime: date,
        trafficModel: trafficModel
      },
    };

    this.state.directionsService.route(request, (response, status) => this.loaded(date, trafficModel, response, status));
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
      if (raw.pessimistic && raw.optimistic && raw.bestguess) {
        data.push({
          date: date,
          optimistic: getDuration(raw.optimistic),
          bestguess: getDuration(raw.bestguess),
          pessimistic: getDuration(raw.pessimistic)
        });
      }
    }

    return (<Chart data={data} />);
  }
};
