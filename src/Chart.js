import React, { Component } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default class Commute extends Component {
  render() {
    return (
      <div style={{height: "500px"}}>
        <ResponsiveContainer>
          <LineChart data={this.props.data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <XAxis dataKey="date" tickFormatter={date => {
              date = new Date(date);
              return `${date.getHours()}:${date.getMinutes()}`;
            }} />
            <YAxis tickFormatter={seconds => Math.round(seconds / 60)} tickCount={17} />
            <Line type="monotone" dataKey="optimistic" stroke="#82ca9d" />
            <Line type="monotone" dataKey="bestguess" stroke="#8884d8" />
            <Line type="monotone" dataKey="pessimistic" stroke="#ff7300" />
            <CartesianGrid />
            <Tooltip formatter={seconds => `${Math.round(seconds / 60)} minutes`} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }
};
