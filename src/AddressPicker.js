import { InputGroup } from "@blueprintjs/core";
import React, { Component } from 'react';

export default class AddressPicker extends Component {
  render() {
    return (
      <div>
        <label className='pt-label pt-inline' style={{float: 'left'}}><InputGroup leftIconName='home' /></label>
        <label className='pt-label pt-inline'><InputGroup leftIconName='office' /></label>
      </div>
    );
  }
};
