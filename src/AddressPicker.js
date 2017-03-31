import React, { Component } from 'react';
import Octicon from 'react-octicon'

export default class AddressPicker extends Component {
  constructor(props) {
    super(props);

    this.state = {
      address: props.defaultAddress
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.address !== this.state.address) {
      this.props.setAddress(this.state.address);
    }
  }

  octiconName(name) {
    if (name === 'Work') {
      return 'briefcase';
    } else if (name === 'Home') {
      return 'home';
    } else {
      return '';
    }
  }

  render() {
    const setAddress = e => this.setState({ address: e.target.value });

    return (
      <div className='input-group mr-2 mb-2' style={{minWidth: 320}}>
        <div className='input-group-addon'>
          <Octicon name={this.octiconName(this.props.name)} />
        </div>
        <input type='text' className='form-control' placeholder={this.props.name} value={this.state.address} onChange={setAddress} />
      </div>
    );
  }
};
