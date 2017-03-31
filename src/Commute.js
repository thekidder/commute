import React, { Component } from 'react';
import moment from 'moment';
import throttle from 'lodash.throttle';

import AddressPicker from './AddressPicker';
import Chart from './Chart';
import D3Wrapper from './D3Wrapper';
import DatePicker from './DatePicker';
import DirectionsLoader from './DirectionsLoader';

const intervalMinutes = 30;

function getDuration(response) {
  return response.routes[0].legs[0].duration_in_traffic.value;
}

export default class Commute extends Component {
  constructor(props) {
    super(props);

    let defaultDate = moment();

    const endOfDay = defaultDate.clone().set({
      hour: 20,
      minute: 0
    });

    if (defaultDate.isAfter(endOfDay)) {
      defaultDate.add('days', 1);
    }

    this.state = {
      enableToday: moment().isBefore(endOfDay),
      homeAddress: localStorage.homeAddress,
      workAddress: localStorage.workAddress,
      currentDate: defaultDate,
      beginDate: new Date(),
      endDate: new Date(),
      directionsResults: {}
    };

    this.directionsLoader = new DirectionsLoader(new this.props.GoogleMaps.DirectionsService);
    this.directionsLoader.setAddresses(this.state.homeAddress, this.state.workAddress);
  }

  componentDidMount() {
    if (!this.props.debugData) {
      this.loadForDate(this.state.currentDate);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.debugData) return;

    if (!prevState.currentDate.isSame(this.state.currentDate) ||
        prevState.homeAddress !== this.state.homeAddress ||
        prevState.workAddress !== this.state.workAddress) {
      this.directionsLoader.clear();
      this.setState({ directionsResults: {} });
      this.directionsLoader.setAddresses(this.state.homeAddress, this.state.workAddress);
      this.loadForDate(this.state.currentDate);

      localStorage.setItem('homeAddress', this.state.homeAddress || '');
      localStorage.setItem('workAddress', this.state.workAddress || '');
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
      minute: 1
    });

    let middleOfDay = date.clone().set({
      hour: 13,
      minute: 0
    });

    if(now.isBefore(middleOfDay)) {
      beginOfDay = moment.max(now, beginOfDay);
      this.setState({ beginDate: beginOfDay.clone() });

      this.load(beginOfDay, middleOfDay, true);
    }

    middleOfDay.add(intervalMinutes, 'minutes');
    middleOfDay = moment.max(now, middleOfDay);

    if(!now.isBefore(middleOfDay)) {
      beginOfDay = middleOfDay.clone();
      this.setState({ beginDate: beginOfDay });
    }

    if (middleOfDay.isBefore(endOfDay)) {
      this.load(middleOfDay, endOfDay, false);
    }

    this.setState({ endDate: endOfDay });
  }

  load(startDate, endDate, navigateToWork) {
    for (var date = startDate; !date.isAfter(endDate); date.add(intervalMinutes, 'minutes')) {
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

  getData() {
    if (this.props.debugData) return this.props.debugData;

    const data = [];
    for (const date in this.state.directionsResults) {
      const raw = this.state.directionsResults[date];
      if (raw.bestguess && raw.pessimistic && raw.optimistic) {
        const datum = {
          date: date
        };

        datum.bestguess = getDuration(raw.bestguess);
        datum.pessimistic = getDuration(raw.pessimistic);
        datum.optimistic = getDuration(raw.optimistic);

        data.push(datum);
      }
    }

    return data;
  }

  render() {
    const data = this.getData();
    const beginDate = this.props.debugData ? new Date(this.props.debugData[0].date) : this.state.beginDate;
    const endDate = this.props.debugData ? new Date(this.props.debugData[this.props.debugData.length - 1].date) : this.state.endDate;

    const setDate = date => this.setState({ currentDate: date });
    const setHomeAddress = address => this.setState({ homeAddress: address });
    const setWorkAddress = address => this.setState({ workAddress: address });

    return (
      <div>
        <div className='row mx-2 mt-2'>
          <form className='form form-inline'>
            <DatePicker enableToday={this.state.enableToday} setDate={setDate} defaultDate={this.state.currentDate} />
            <AddressPicker
                name='Home'
                defaultAddress={this.state.homeAddress}
                setAddress={setHomeAddress} />
            <AddressPicker
                name='Work'
                defaultAddress={this.state.workAddress}
                setAddress={setWorkAddress} />
          </form>
        </div>
        <div className='row'>
          <D3Wrapper
              chart={Chart}
              height={600}
              beginDate={beginDate}
              endDate={endDate}
              data={data} />
      </div>
      </div>
    );
  }
};
