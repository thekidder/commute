import * as d3 from 'd3';

import './chart.css';

const margins = { left: 50, right: 25, bottom: 50, top: 25 };

export default class Chart {
  constructor(ref) {
    this.ref = ref;

    this.width = 0;
    this.height = 0;

    this.xScale = d3.scaleTime();
    this.yScale = d3.scaleLinear();

    this.svg = d3.select(this.ref)
      .append('svg')
        .style('width', '100%')
        .style('height', '100%');

    this.xAxisContainer = this.svg
      .append('g');

    this.yAxisContainer = this.svg
      .append('g')
        .attr('transform', `translate(${margins.left}, ${margins.top})`)

    this.chart = this.svg
      .append('g')
        .attr('transform', `translate(${margins.left}, ${margins.top})`);

    this.defs = this.svg
      .append('defs');

    this.bestguessPath = this.chart.append('path')
        .attr('class', 'line')
        .style('stroke', '#8884d8')
    this.pessimisticPath = this.chart.append('path')
        .attr('class', 'line')
        .style('stroke', '#ff7300')
    this.optimisticPath = this.chart.append('path')
        .attr('class', 'line')
        .style('stroke', '#82ca9d')
  }

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

  resize(dimensions) {
    this.svg
        .attr('width', dimensions.width)
        .attr('height', dimensions.height);

    this.xScale
        .range([0, dimensions.width - margins.left - margins.right]);

    this.yScale
        .range([0, dimensions.height - margins.top - margins.bottom]);

    this.xAxisContainer
        .attr('transform', `translate(${margins.left}, ${dimensions.height - margins.bottom})`);
  }

  update(props) {
    this.xScale
        .domain([props.beginDate, props.endDate]);

    const xAxis = d3.axisBottom(this.xScale)
        .ticks(d3.timeMinute.every(30));

    this.yScale
        .domain([this.maxRange(props.data), 0]);

    const yAxis = d3.axisLeft(this.yScale)
        .tickFormat(time => `${time} min`);

    const line = d3.line()
        .x(d => this.xScale(new Date(d.date)))
        .y(d => this.yScale(d.bestguess / 60))
        .curve(d3.curveMonotoneX);

    const lineTop = d3.line()
        .x(d => this.xScale(new Date(d.date)))
        .y(d => this.yScale(d.pessimistic / 60))
        .curve(d3.curveMonotoneX);

    const lineBottom = d3.line()
        .x(d => this.xScale(new Date(d.date)))
        .y(d => this.yScale(d.optimistic / 60))
        .curve(d3.curveMonotoneX);

    this.xAxisContainer.call(xAxis);
    this.yAxisContainer.call(yAxis);

    const pessimisticGradient = this.addGradientWithColors(this.defs, 'pessimisticGradient', '#ff7300', '#8884d8');
    const optimisticGradient = this.addGradientWithColors(this.defs, 'optimisticGradient', '#8884d8', '#82ca9d' );

    this.bestguessPath
        .data([props.data.filter(d => !!d.bestguess)])
        .attr('d', line)
    this.pessimisticPath
        .data([props.data.filter(d => !!d.bestguess && !!d.pessimistic)])
        .attr('d', lineTop);
    this.optimisticPath
        .data([props.data.filter(d => !!d.bestguess && !!d.optimistic)])
        .attr('d', lineBottom);

    const n = 200;
    const bestguessSampler = this.createPathSampler(this.bestguessPath.node(), n);
    const pessimisticSampler = this.createPathSampler(this.pessimisticPath.node(), n);
    const optimisticSampler = this.createPathSampler(this.optimisticPath.node(), n);
  }
};
