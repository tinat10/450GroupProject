import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { calculateTwoFactorInteraction } from '../utils/dataProcessor';
import { categoryColorScale } from '../utils/colorScales';

const Chart3Interactions = ({ data, onCombinationSelect }) => {
  const chartRef = useRef(null);
  const [factor1, setFactor1] = useState('Motivation_Level');
  const [factor2, setFactor2] = useState('Parental_Involvement');
  const margin = { top: 40, right: 40, bottom: 80, left: 80 };

  const factorOptions = [
    'Motivation_Level',
    'Parental_Involvement',
    'Family_Income',
    'Access_to_Resources',
    'Teacher_Quality',
    'School_Type'
  ];

  useEffect(() => {
    if (!data || data.length === 0 || !chartRef.current) return;

    // Clear previous
    d3.select(chartRef.current).selectAll('*').remove();

    const interactionData = calculateTwoFactorInteraction(data, factor1, factor2);
    
    // Get unique values for each factor
    const factor1Values = [...new Set(interactionData.map(d => d.factor1))].sort();
    const factor2Values = [...new Set(interactionData.map(d => d.factor2))].sort();

    const containerWidth = chartRef.current.offsetWidth;
    const containerHeight = 500;
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    const svg = d3.select(chartRef.current)
      .append('svg')
      .attr('width', containerWidth)
      .attr('height', containerHeight);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleBand()
      .domain(factor1Values)
      .range([0, width])
      .padding(0.1);

    const xSubScale = d3.scaleBand()
      .domain(factor2Values)
      .range([0, xScale.bandwidth()])
      .padding(0.05);

    const allScores = interactionData.map(d => d.avgScore);
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(allScores) * 1.1])
      .nice()
      .range([height, 0]);

    // Draw bars
    factor1Values.forEach((f1Val, i) => {
      const groupData = interactionData.filter(d => d.factor1 === f1Val);
      
      groupData.forEach((d, j) => {
        const bar = g.append('rect')
          .attr('x', xScale(f1Val) + xSubScale(d.factor2))
          .attr('y', yScale(d.avgScore))
          .attr('width', xSubScale.bandwidth())
          .attr('height', height - yScale(d.avgScore))
          .attr('fill', categoryColorScale(d.factor2))
          .attr('stroke', '#fff')
          .attr('stroke-width', 1)
          .style('cursor', 'pointer')
          .on('mouseover', function(event, data) {
            d3.select(this).attr('opacity', 0.7);
            if (onCombinationSelect) {
              onCombinationSelect({ factor1, factor2, value1: d.factor1, value2: d.factor2 });
            }
          })
          .on('mouseout', function() {
            d3.select(this).attr('opacity', 1);
          });

        // Value label
        if (d.avgScore > 5) { // Only show if bar is tall enough
          g.append('text')
            .attr('x', xScale(f1Val) + xSubScale(d.factor2) + xSubScale.bandwidth() / 2)
            .attr('y', yScale(d.avgScore) - 5)
            .attr('text-anchor', 'middle')
            .attr('font-size', '10px')
            .attr('font-weight', 'bold')
            .text(d.avgScore.toFixed(1));
        }
      });
    });

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .attr('dx', '-0.5em')
      .attr('dy', '0.5em');

    g.append('g')
      .call(d3.axisLeft(yScale));

    // Labels
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text('Average Exam Score');

    g.append('text')
      .attr('transform', `translate(${width / 2}, ${height + margin.bottom - 10})`)
      .style('text-anchor', 'middle')
      .text(factor1.replace(/_/g, ' '));

    // Title
    svg.append('text')
      .attr('x', containerWidth / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .text(`Interaction: ${factor1.replace(/_/g, ' ')} × ${factor2.replace(/_/g, ' ')}`);

    // Legend - positioned top right, below title
    const legend = svg.append('g')
      .attr('transform', `translate(${containerWidth - 180}, 40)`);

    factor2Values.forEach((val, i) => {
      const legendItem = legend.append('g')
        .attr('transform', `translate(0, ${i * 20})`);

      legendItem.append('rect')
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', categoryColorScale(val));

      legendItem.append('text')
        .attr('x', 20)
        .attr('dy', '0.8em')
        .attr('font-size', '12px')
        .text(val);
    });

  }, [data, factor1, factor2, onCombinationSelect]);

  return (
    <div>
      <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ marginRight: '10px' }}>Factor 1:</label>
        <select 
          value={factor1} 
          onChange={(e) => setFactor1(e.target.value)}
          style={{ padding: '5px', marginRight: '20px' }}
        >
          {factorOptions.map(f => (
            <option key={f} value={f}>{f.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <label style={{ marginRight: '10px' }}>Factor 2:</label>
        <select 
          value={factor2} 
          onChange={(e) => setFactor2(e.target.value)}
          style={{ padding: '5px' }}
        >
          {factorOptions.filter(f => f !== factor1).map(f => (
            <option key={f} value={f}>{f.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>
      <div ref={chartRef}></div>
    </div>
  );
};

export default Chart3Interactions;

