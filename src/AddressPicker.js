import { InputGroup } from "@blueprintjs/core";
import React, { Component } from 'react';

export default class AddressPicker extends Component {
  constructor(props) {
    super(props);

    this.state = {
      homeAddress: props.defaultHomeAddress,
      workAddress: props.defaultWorkAddress
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.homeAddress !== this.state.homeAddress) {
      this.props.setHomeAddress(this.state.homeAddress);
    }

    if (prevState.workAddress !== this.state.workAddress) {
      this.props.setWorkAddress(this.state.workAddress);
    }
  }

  render() {
    const setHomeAddress = e => this.setState({ homeAddress: e.target.value });
    const setWorkAddress = e => this.setState({ workAddress: e.target.value });

    return (
      <div>
        <label className='pt-label pt-inline' style={{float: 'left'}}>
          <InputGroup leftIconName='home' value={this.state.homeAddress} onChange={setHomeAddress} />
        </label>
        <label className='pt-label pt-inline'>
          <InputGroup leftIconName='office' value={this.state.workAddress} onChange={setWorkAddress} />
        </label>
      </div>
    );
  }
};
