import GoogleMapsLoader from 'google-maps';
import React, { Component } from 'react';

import bootstrap from 'bootstrap/dist/css/bootstrap.min.css';

import apiKey from './api-key';
import Commute from './Commute'

const defaultData = [
  {"date":"Mon Mar 06 2017 06:00:00 GMT-0800 (PST)","bestguess":1602,"pessimistic":1827,"optimistic":1442},
  {"date":"Mon Mar 06 2017 06:30:00 GMT-0800 (PST)","bestguess":1721,"pessimistic":2052,"optimistic":1511},
  {"date":"Mon Mar 06 2017 07:00:00 GMT-0800 (PST)","bestguess":1909,"pessimistic":2454,"optimistic":1605},
  {"date":"Mon Mar 06 2017 07:30:00 GMT-0800 (PST)","bestguess":2192,"pessimistic":2905,"optimistic":1797},
  {"date":"Mon Mar 06 2017 08:00:00 GMT-0800 (PST)","bestguess":2235,"pessimistic":2997,"optimistic":1801},
  {"date":"Mon Mar 06 2017 08:30:00 GMT-0800 (PST)","bestguess":2294,"pessimistic":3002,"optimistic":1871},
  {"date":"Mon Mar 06 2017 09:00:00 GMT-0800 (PST)","bestguess":2073,"pessimistic":2800,"optimistic":1741},
  {"date":"Mon Mar 06 2017 09:30:00 GMT-0800 (PST)","bestguess":1959,"pessimistic":2491,"optimistic":1666},
  {"date":"Mon Mar 06 2017 10:00:00 GMT-0800 (PST)","bestguess":1712,"pessimistic":2116,"optimistic":1491},
  {"date":"Mon Mar 06 2017 10:30:00 GMT-0800 (PST)","bestguess":1639,"pessimistic":1978,"optimistic":1441},
  {"date":"Mon Mar 06 2017 11:00:00 GMT-0800 (PST)","bestguess":1603,"pessimistic":1936,"optimistic":1410},
  {"date":"Mon Mar 06 2017 11:30:00 GMT-0800 (PST)","bestguess":1613,"pessimistic":1940,"optimistic":1414},
  {"date":"Mon Mar 06 2017 12:00:00 GMT-0800 (PST)","bestguess":1619,"pessimistic":1951,"optimistic":1419},
  {"date":"Mon Mar 06 2017 12:30:00 GMT-0800 (PST)","bestguess":1621,"pessimistic":1953,"optimistic":1423},
  {"date":"Mon Mar 06 2017 13:00:00 GMT-0800 (PST)","bestguess":1628,"pessimistic":1959,"optimistic":1418},
  {"date":"Mon Mar 06 2017 13:30:00 GMT-0800 (PST)","bestguess":1608,"pessimistic":1966,"optimistic":1403},
  {"date":"Mon Mar 06 2017 14:00:00 GMT-0800 (PST)","bestguess":1623,"pessimistic":2024,"optimistic":1415},
  {"date":"Mon Mar 06 2017 14:30:00 GMT-0800 (PST)","bestguess":1842,"pessimistic":2453,"optimistic":1523},
  {"date":"Mon Mar 06 2017 15:00:00 GMT-0800 (PST)","bestguess":1879,"pessimistic":2485,"optimistic":1585},
  {"date":"Mon Mar 06 2017 15:30:00 GMT-0800 (PST)","bestguess":2037,"pessimistic":2765,"optimistic":1717},
  {"date":"Mon Mar 06 2017 16:00:00 GMT-0800 (PST)","bestguess":2141,"pessimistic":3068,"optimistic":1748},
  {"date":"Mon Mar 06 2017 16:30:00 GMT-0800 (PST)","bestguess":2631,"pessimistic":4346,"optimistic":1963},
  {"date":"Mon Mar 06 2017 17:00:00 GMT-0800 (PST)","bestguess":3130,"pessimistic":4494,"optimistic":2288},
  {"date":"Mon Mar 06 2017 17:30:00 GMT-0800 (PST)","bestguess":2848,"pessimistic":3921,"optimistic":2186},
  {"date":"Mon Mar 06 2017 18:00:00 GMT-0800 (PST)","bestguess":2315,"pessimistic":3059,"optimistic":1865},
  {"date":"Mon Mar 06 2017 18:30:00 GMT-0800 (PST)","bestguess":1911,"pessimistic":2368,"optimistic":1633},
  {"date":"Mon Mar 06 2017 19:00:00 GMT-0800 (PST)","bestguess":1717,"pessimistic":2117,"optimistic":1495},
  {"date":"Mon Mar 06 2017 19:30:00 GMT-0800 (PST)","bestguess":1621,"pessimistic":1964,"optimistic":1428},
  {"date":"Mon Mar 06 2017 20:00:00 GMT-0800 (PST)","bestguess":1571,"pessimistic":1842,"optimistic":1398}
];

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      googleApi: null,
      debugData: false,
    };

    GoogleMapsLoader.KEY = apiKey;

    GoogleMapsLoader.load(google => {
      this.setState({googleApi: google, loaded: true});
      console.log('loaded google maps api!')
    });

  }
  render() {
    const debugData = window.location.search.indexOf('debugData') > 0 ? defaultData : null;
    if (this.state.loaded) {
      return (
        <div className='container-fluid'>
          <Commute GoogleMaps={this.state.googleApi.maps} debugData={debugData} />
        </div>
      );
    } else {
      return (<p>Loading...</p>);  
    }
  }
};
