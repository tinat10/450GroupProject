import React, { Component } from 'react';
import * as d3 from 'd3';
import './SummaryPanel.css';

class SummaryPanel extends Component {
  render() {
    const { data } = this.props;
    
    if (!data || data.length === 0) {
      return (
        <div className="summary-panel">
          <p>No data available</p>
        </div>
      );
    }

    const scores = data.map(d => d.Exam_Score).filter(v => !isNaN(v));
    const avgScore = d3.mean(scores);
    const medianScore = d3.median(scores);
    const highPerformers = scores.filter(s => s >= 75).length;
    const lowPerformers = scores.filter(s => s < 65).length;
    const total = scores.length;

    return (
      <div className="summary-panel">
        <h3>Summary Statistics</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{total.toLocaleString()}</div>
            <div className="stat-label">Total Students</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{avgScore.toFixed(1)}</div>
            <div className="stat-label">Average Score</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{medianScore.toFixed(1)}</div>
            <div className="stat-label">Median Score</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{((highPerformers / total) * 100).toFixed(1)}%</div>
            <div className="stat-label">High Performers (≥75)</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{((lowPerformers / total) * 100).toFixed(1)}%</div>
            <div className="stat-label">Low Performers (&lt;65)</div>
          </div>
        </div>
      </div>
    );
  }
}

export default SummaryPanel;
