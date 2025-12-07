import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { calculateImpactScores } from '../utils/dataProcessor';
import { impactColorScale } from '../utils/colorScales';

const Chart4Impact = ({ data, onFactorSelect }) => {
  const chartRef = useRef(null);
  const legendRef = useRef(null);
  const margin = { top: 20, right: 40, bottom: 40, left: 200 };

  useEffect(() => {
    if (!data || data.length === 0 || !chartRef.current) return;

    // Clear previous
    d3.select(chartRef.current).selectAll('*').remove();

    const allFactors = [
      'Hours_Studied',
      'Attendance',
      'Previous_Scores',
      'Sleep_Hours',
      'Tutoring_Sessions',
      'Physical_Activity',
      'Parental_Involvement',
      'Family_Income',
      'Access_to_Resources',
      'Teacher_Quality',
      'School_Type',
      'Motivation_Level'
    ];

    const impacts = calculateImpactScores(data, allFactors);

    const containerWidth = chartRef.current.offsetWidth;
    const containerHeight = Math.max(400, impacts.length * 35);
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    const svg = d3.select(chartRef.current)
      .append('svg')
      .attr('width', containerWidth)
      .attr('height', containerHeight);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const maxImpact = d3.max(impacts.map(d => Math.abs(d.impact)));
    const xScale = d3.scaleLinear()
      .domain([-maxImpact, maxImpact])
      .range([0, width]);

    const yScale = d3.scaleBand()
      .domain(impacts.map(d => d.factor))
      .range([0, height])
      .padding(0.2);

    // Center line
    g.append('line')
      .attr('x1', xScale(0))
      .attr('x2', xScale(0))
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', '#333')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5');

    // Bars
    const bars = g.selectAll('.bar')
      .data(impacts)
      .enter()
      .append('g')
      .attr('class', 'bar');

    bars.append('rect')
      .attr('x', d => d.impact >= 0 ? xScale(0) : xScale(d.impact))
      .attr('y', d => yScale(d.factor))
      .attr('width', d => Math.abs(xScale(d.impact) - xScale(0)))
      .attr('height', yScale.bandwidth())
      .attr('fill', d => impactColorScale(d.impact))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this).attr('opacity', 0.7);
        if (onFactorSelect) onFactorSelect(d.factor);
      })
      .on('mouseout', function() {
        d3.select(this).attr('opacity', 1);
      });

    // Value labels
    bars.append('text')
      .attr('x', d => d.impact >= 0 ? xScale(d.impact) + 5 : xScale(d.impact) - 5)
      .attr('y', d => yScale(d.factor) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', d => d.impact >= 0 ? 'start' : 'end')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('fill', '#333')
      .text(d => d.impact.toFixed(2));

    // Factor labels
    bars.append('text')
      .attr('x', -10)
      .attr('y', d => yScale(d.factor) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .attr('font-size', '12px')
      .text(d => d.factor.replace(/_/g, ' '));

    // X-axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d => d.toFixed(1)));

    g.append('text')
      .attr('transform', `translate(${width / 2}, ${height + margin.bottom - 10})`)
      .style('text-anchor', 'middle')
      .attr('font-size', '14px')
      .text('Impact Score (Top 25% vs Bottom 25%)');

    // Title
    svg.append('text')
      .attr('x', containerWidth / 2)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .text('Factor Impact Ranking');

    // Create legend outside SVG
    if (legendRef.current) {
      d3.select(legendRef.current).selectAll('*').remove();
      const legendSvg = d3.select(legendRef.current)
        .append('svg')
        .attr('width', 150)
        .attr('height', 50);

      const legend = legendSvg.append('g')
        .attr('transform', 'translate(10, 5)');

      legend.append('rect')
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', '#27ae60');

      legend.append('text')
        .attr('x', 20)
        .attr('y', 12)
        .attr('font-size', '12px')
        .text('Positive Impact');

      legend.append('rect')
        .attr('y', 20)
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', '#e74c3c');

      legend.append('text')
        .attr('x', 20)
        .attr('y', 32)
        .attr('font-size', '12px')
        .text('Negative Impact');
    }

  }, [data, onFactorSelect]);

  return (
    <div style={{ position: 'relative' }}>
      <div ref={chartRef}></div>
      <div ref={legendRef} style={{ position: 'absolute', top: '5px', right: '10px', zIndex: 10 }}></div>
    </div>
  );
};

export default Chart4Impact;

