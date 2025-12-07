import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { groupByCategory, calculatePerformanceDistribution } from '../utils/dataProcessor';
import { getCategoricalFactors } from '../utils/dataLoader';
import { categoryColorScale } from '../utils/colorScales';

const Chart2Categorical = ({ data, selectedCategory, onCategorySelect }) => {
  const groupedBarRef = useRef(null);
  const stackedBarRef = useRef(null);
  const [viewMode, setViewMode] = useState('grouped');
  const [selectedFactor, setSelectedFactor] = useState('Parental_Involvement');
  const margin = { top: 40, right: 40, bottom: 60, left: 80 };

  const factors = getCategoricalFactors();

  useEffect(() => {
    if (!data || data.length === 0 || !groupedBarRef.current || !stackedBarRef.current) return;

    const factorData = factors.find(f => f.key === selectedFactor);
    if (!factorData) return;

    // Clear previous
    d3.select(groupedBarRef.current).selectAll('*').remove();
    d3.select(stackedBarRef.current).selectAll('*').remove();

    const containerWidth = groupedBarRef.current.offsetWidth;
    const containerHeightGrouped = 400;
    const containerHeightStacked = 500; // Taller for stacked view
    const width = containerWidth - margin.left - margin.right;

    // Grouped Bar Chart
    const groupedData = groupByCategory(data, selectedFactor);
    const heightGrouped = containerHeightGrouped - margin.top - margin.bottom;
    
    const svg1 = d3.select(groupedBarRef.current)
      .append('svg')
      .attr('width', containerWidth)
      .attr('height', containerHeightGrouped)
      .style('display', viewMode === 'grouped' ? 'block' : 'none');

    const g1 = svg1.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale1 = d3.scaleBand()
      .domain(groupedData.map(d => d.category))
      .range([0, width])
      .padding(0.2);

    const yScale1 = d3.scaleLinear()
      .domain([0, d3.max(groupedData, d => d.avgScore) * 1.1])
      .nice()
      .range([heightGrouped, 0]);

    // Bars
    g1.selectAll('.bar')
      .data(groupedData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale1(d.category))
      .attr('y', d => yScale1(d.avgScore))
      .attr('width', xScale1.bandwidth())
      .attr('height', d => heightGrouped - yScale1(d.avgScore))
      .attr('fill', d => categoryColorScale(d.category))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this).attr('opacity', 0.7);
        if (onCategorySelect) onCategorySelect({ factor: selectedFactor, category: d.category });
      })
      .on('mouseout', function() {
        d3.select(this).attr('opacity', 1);
      });

    // Value labels
    g1.selectAll('.value-label')
      .data(groupedData)
      .enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('x', d => xScale1(d.category) + xScale1.bandwidth() / 2)
      .attr('y', d => yScale1(d.avgScore) - 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text(d => d.avgScore.toFixed(1));

    // Axes
    g1.append('g')
      .attr('transform', `translate(0,${heightGrouped})`)
      .call(d3.axisBottom(xScale1));

    g1.append('g')
      .call(d3.axisLeft(yScale1));

    g1.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (heightGrouped / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text('Average Exam Score');

    svg1.append('text')
      .attr('x', containerWidth / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .text(`Average Exam Score by ${selectedFactor.replace(/_/g, ' ')}`);

    // Stacked Bar Chart
    const stackedData = calculatePerformanceDistribution(data, selectedFactor);
    const heightStacked = containerHeightStacked - margin.top - margin.bottom;
    
    const svg2 = d3.select(stackedBarRef.current)
      .append('svg')
      .attr('width', containerWidth)
      .attr('height', containerHeightStacked)
      .style('display', viewMode === 'stacked' ? 'block' : 'none');

    const g2 = svg2.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale2 = d3.scaleBand()
      .domain(stackedData.map(d => d.category))
      .range([0, width])
      .padding(0.2);

    const yScale2 = d3.scaleLinear()
      .domain([0, 100])
      .range([heightStacked, 0]);

    const stack = d3.stack()
      .keys(['low', 'medium', 'high'])
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetExpand);

    const stacked = stack(stackedData.map(d => ({
      category: d.category,
      low: d.low.percentage,
      medium: d.medium.percentage,
      high: d.high.percentage
    })));

    const colorScale = d3.scaleOrdinal()
      .domain(['high', 'medium', 'low'])
      .range(['#27ae60', '#f39c12', '#e74c3c']);

    const layers = g2.selectAll('.layer')
      .data(stacked)
      .enter()
      .append('g')
      .attr('class', 'layer')
      .attr('fill', d => colorScale(d.key));

    layers.selectAll('rect')
      .data(d => d)
      .enter()
      .append('rect')
      .attr('x', d => xScale2(d.data.category))
      .attr('y', d => yScale2(d[1]))
      .attr('height', d => yScale2(d[0]) - yScale2(d[1]))
      .attr('width', xScale2.bandwidth())
      .attr('stroke', '#fff')
      .attr('stroke-width', 1);

    // Axes
    g2.append('g')
      .attr('transform', `translate(0,${heightStacked})`)
      .call(d3.axisBottom(xScale2));

    g2.append('g')
      .call(d3.axisLeft(yScale2).tickFormat(d => d + '%'));

    g2.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (heightStacked / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text('Percentage of Students');

    svg2.append('text')
      .attr('x', containerWidth / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .text(`Performance Distribution by ${selectedFactor.replace(/_/g, ' ')}`);

    // Legend for stacked - positioned top right, below title
    const legend2 = svg2.append('g')
      .attr('transform', `translate(${containerWidth - 250}, 40)`);

    ['high', 'medium', 'low'].forEach((level, i) => {
      const legendItem = legend2.append('g')
        .attr('transform', `translate(0, ${i * 20})`);

      legendItem.append('rect')
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', colorScale(level));

      legendItem.append('text')
        .attr('x', 20)
        .attr('dy', '0.8em')
        .attr('font-size', '12px')
        .text(level.charAt(0).toUpperCase() + level.slice(1) + ' (≥75/65-74/<65)');
    });

  }, [data, selectedFactor, viewMode, onCategorySelect]);

  return (
    <div>
      <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <label style={{ marginRight: '10px' }}>Factor:</label>
        <select 
          value={selectedFactor} 
          onChange={(e) => setSelectedFactor(e.target.value)}
          style={{ padding: '5px', marginRight: '20px' }}
        >
          {factors.map(f => (
            <option key={f.key} value={f.key}>{f.key.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <label style={{ marginRight: '10px' }}>View:</label>
        <button 
          onClick={() => setViewMode('grouped')}
          style={{ 
            padding: '5px 15px', 
            backgroundColor: viewMode === 'grouped' ? '#667eea' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Grouped
        </button>
        <button 
          onClick={() => setViewMode('stacked')}
          style={{ 
            padding: '5px 15px', 
            backgroundColor: viewMode === 'stacked' ? '#667eea' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Stacked
        </button>
      </div>
      <div ref={groupedBarRef}></div>
      <div ref={stackedBarRef}></div>
    </div>
  );
};

export default Chart2Categorical;

