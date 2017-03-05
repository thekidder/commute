import * as d3 from 'd3';
import flatten from 'lodash.flatten';
import zip from 'lodash.zip';

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

    this.addGradientWithColors(this.defs, 'pessimisticGradient', '#ff7300', '#8884d8');
    this.addGradientWithColors(this.defs, 'optimisticGradient', '#8884d8', '#82ca9d' );

    this.optimisticGradient = this.svg
      .append('g')
        .attr('id', 'optimisticGradient')
        .attr('transform', `translate(${margins.left}, ${margins.top})`);

    this.pessimisticGradient = this.svg
      .append('g')
        .attr('id', 'pessimisticGradient')
        .attr('transform', `translate(${margins.left}, ${margins.top})`);

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
    return function* samplePath() {
      for(let i = 0; i < numSamples; i++) {
        yield path.getPointAtLength(i * step);
      }
      yield path.getPointAtLength(length);
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

    this.numGradientSegments = (dimensions.width - margins.left - margins.right) / 2;
  }

  createCurve(attrName) {
    return d3.line()
        .x(d => this.xScale(new Date(d.date)))
        .y(d => this.yScale(d[attrName] / 60))
        .curve(d3.curveMonotoneX);
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

    const line = this.createCurve('bestguess');
    const lineTop = this.createCurve('pessimistic');
    const lineBottom = this.createCurve('optimistic');

    this.xAxisContainer.call(xAxis);
    this.yAxisContainer.call(yAxis);

    this.bestguessPath
        .data([props.data])
        .attr('d', line)
    this.pessimisticPath
        .data([props.data])
        .attr('d', lineTop);
    this.optimisticPath
        .data([props.data])
        .attr('d', lineBottom);

    const bestguessSampler = this.createPathSampler(this.bestguessPath.node(), this.numGradientSegments);
    const pessimisticSampler = this.createPathSampler(this.pessimisticPath.node(), this.numGradientSegments);
    const optimisticSampler = this.createPathSampler(this.optimisticPath.node(), this.numGradientSegments);

    this.renderGradient(this.optimisticGradient, '#optimisticGradient', bestguessSampler, optimisticSampler);    
    this.renderGradient(this.pessimisticGradient, '#pessimisticGradient', pessimisticSampler, bestguessSampler);    
  }

  renderGradient(container, gradient, topLine, bottomLine) {
    const data = zip([...topLine()], [...bottomLine()]);

    // round all x coords to whole numbers to avoid rendering artifacts. Don't do this for the first and last
    // points to ensure the gradient bounds map exactly to the start and end of the spline.
    if (data.length > 2) {
      for (let i = 1; i < data.length - 1; ++i) {
        data[i][0].x = Math.round(data[i][0].x);
        data[i][1].x = Math.round(data[i][1].x);

        data[i][0].y = Math.round(data[i][0].y);
        data[i][1].y = Math.round(data[i][1].y);
      }
    }

    if (data.length > 1) {
      const quads = d3.range(data.length - 1).map(i => {
        return flatten([data[i], data[i + 1]]);
      });

      function printPoint(p) {
        return `${p.x},${p.y}`;
      }

      function createPath(quad) {
        return `M${printPoint(quad[0])}L${printPoint(quad[2])}L${printPoint(quad[3])}L${printPoint(quad[1])}Z`;
      }

      const selection = container
        .selectAll('path')
          .data(quads)
          .style('fill', `url(${gradient})`)
          .attr('d', d => createPath(d));

      selection
        .enter()
        .append('path')
          .style('fill', `url(${gradient})`)
          .attr('d', d => createPath(d));

      selection
        .exit()
          .remove();

    }
  }
};
