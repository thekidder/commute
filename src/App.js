import GoogleMapsLoader from 'google-maps';
import React, { Component } from 'react';

import blueprintCss from '@blueprintjs/core/dist/blueprint.css';

import apiKey from './api-key';
import Commute from './Commute'

GoogleMapsLoader.KEY = apiKey;
GoogleMapsLoader.LIRARIES = ['directions'];

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      googleApi: null,
    };

    GoogleMapsLoader.load(google => {
      this.setState({googleApi: google, loaded: true});
      console.log('loaded google maps api!')
    });

  }
  render() {
    if (this.state.loaded) {
      return (<Commute GoogleMaps={this.state.googleApi.maps} />);
    } else {
      return (<p>Loading...</p>);  
    }
  }
};
