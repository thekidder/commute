import * as d3 from 'd3';

import React, { Component } from 'react';
import ReactFauxDOM from 'react-faux-dom';

import './chart.css';

const width = 1200;
const height = 600;

const margins = { left: 50, right: 25, bottom: 50, top: 25 };

export default class Chart extends Component {
  maxRange(data) {
    let max = 0;

    for (const d of data) {
      if (d.pessimistic && d.pessimistic > max) {
        max = d.pessimistic;
      }
    }

    return parseInt(max / 60 / 30 + 1) * 30;
  }

  addGradientWithColors(defsElement, id, topColor, bottomColor) {
    const opacity = 0.5;

    const gradient = defsElement
      .append('linearGradient')
        .attr('id', id)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%')
        .attr('spreadMethod', 'pad');

    gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', topColor)
        .attr('stop-opacity', opacity);

    gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', bottomColor)
        .attr('stop-opacity', opacity);
  }

  createPathSampler(path, numSamples) {
    const length = path.getTotalLength();
    const step = length / numSamples;
    let distance = 0.0;
    return function* samplePath() {
      while(distance < length) {
        yield path.getPointAtLength(distance);
        distance += step;
      }
    }
  }

  render() {
    const el = ReactFauxDOM.createElement('svg');

    const defs = d3.select(el)
      .append('defs');

    const xScale = d3.scaleTime()
        .domain([this.props.beginDate, this.props.endDate])
        .range([0, width - margins.left - margins.right]);

    const xAxis = d3.axisBottom(xScale)
        .ticks(d3.timeMinute.every(30));

    const yScale = d3.scaleLinear()
        .domain([this.maxRange(this.props.data), 0])
        .range([0, height - margins.top - margins.bottom]);

    const yAxis = d3.axisLeft(yScale)
        .tickFormat(time => `${time} min`);

    const line = d3.line()
        .x(d => xScale(new Date(d.date)))
        .y(d => yScale(d.bestguess / 60))
        .curve(d3.curveMonotoneX);

    const lineTop = d3.line()
        .x (d => xScale(new Date(d.date)))
        .y(d => yScale(d.pessimistic / 60))
        .curve(d3.curveMonotoneX);

    const lineBottom = d3.line()
        .x (d => xScale(new Date(d.date)))
        .y(d => yScale(d.optimistic / 60))
        .curve(d3.curveMonotoneX);

    d3.select(el)
        .attr('width', width)
        .attr('height', height);

    const pessimisticGradient = this.addGradientWithColors(defs, 'pessimisticGradient', '#ff7300', '#8884d8');
    const optimisticGradient = this.addGradientWithColors(defs, 'optimisticGradient', '#8884d8', '#82ca9d' );

    d3.select(el)
      .append('g')
        .attr('transform', `translate(${margins.left}, ${height - margins.bottom})`)
        .call(xAxis);

    d3.select(el)
      .append('g')
        .attr('transform', `translate(${margins.left}, ${margins.top})`)
        .call(yAxis);

    const chart = d3.select(el)
      .append('g')
        .attr('transform', `translate(${margins.left}, ${margins.top})`);

    const bestguessPath = chart.append('path')
        .attr('class', 'line')
        .style('stroke', '#8884d8')
        .data([this.props.data.filter(d => !!d.bestguess)])
        .attr('d', line)
    const pessimisticPath = chart.append('path')
        .attr('class', 'line')
        .style('stroke', '#ff7300')
        .data([this.props.data.filter(d => !!d.bestguess && !!d.pessimistic)])
        .attr('d', lineTop);
    const optimisticPath = chart.append('path')
        .attr('class', 'line')
        .style('stroke', '#82ca9d')
        .data([this.props.data.filter(d => !!d.bestguess && !!d.optimistic)])
        .attr('d', lineBottom);

    debugger;
    const n = 200;
    const bestguessSampler = this.createPathSampler(bestguessPath.node(), n);
    const pessimisticSampler = this.createPathSampler(pessimisticPath.node(), n);
    const optimisticSampler = this.createPathSampler(optimisticPath.node(), n);


    return el.toReact();
  }
};
