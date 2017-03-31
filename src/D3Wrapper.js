import throttle from 'lodash.throttle';

import { findDOMNode } from 'react-dom';
import Measure from 'react-measure';
import React, { Component } from 'react';

class D3Wrapper extends React.Component {
  constructor(props) {
    super(props);

    this.resizeDebounced = throttle(this.resize.bind(this), 500);
    this.chartRef = null;
    this.chart = null;
    this.state = {
      dimensions: { width: 0, height: 0 }
    };
  }

  resize(dimensions) {
    this.setState({dimensions});
  }

  componentWillUpdate(nextProps, nextState) {
    if (!this.chart) {
      return;
    }

    if (nextState.dimensions.width !== this.state.dimensions.width ||
        nextState.dimensions.height !== this.state.dimensions.height) {
      this.chart.resize(nextState.dimensions);
    }

    if (nextState.dimensions.height !== 0 && nextState.dimensions.width !== 0) {
      this.chart.update(nextProps);
    }
  }

  componentWillUnmount() {
    if (this.chart && this.chart.unmount) {
      this.chart.unmount();
    }
  }

  getChartRef(ref) {
    this.chartRef = ref;
    this.create();
  }

  create() {
    if (this.chart || !this.chartRef) {
      return;
    }

    this.chart = new this.props.chart(this.chartRef);
    if (this.state.dimensions.height !== 0 && this.state.dimensions.width !== 0) {
      this.chart.resize(this.state.dimensions);
      this.chart.update(this.props);
    }
  }

  render() {
    return (
      <Measure
          whitelist={['width', 'height']}
          onMeasure={this.resizeDebounced.bind(this)}>
        <div className='chart' style={{height: this.props.height, width: '100%'}} ref={this.getChartRef.bind(this)}></div>
      </Measure>
    );
  }
}

export default D3Wrapper;
