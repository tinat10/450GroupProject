import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { groupByCategory, calculatePerformanceDistribution } from '../utils/dataProcessor';
import { getCategoricalFactors } from '../utils/dataLoader';
import { categoryColorScale } from '../utils/colorScales';

const Chart2Categorical = ({ data, selectedCategory, onCategorySelect }) => {
  const groupedBarRef = useRef(null);
  const stackedBarRef = useRef(null);
  const groupedLegendRef = useRef(null);
  const stackedLegendRef = useRef(null);
  const [viewMode, setViewMode] = useState('grouped');
  const [selectedFactor, setSelectedFactor] = useState('Parental_Involvement');
  const margin = { top: 40, right: 40, bottom: 60, left: 80 };

  const factors = getCategoricalFactors();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const factorData = factors.find(f => f.key === selectedFactor);
    if (!factorData) return;

    // Get container width - use visibility instead of display so width is always available
    let containerWidth = 800; // fallback width
    if (groupedBarRef.current && groupedBarRef.current.offsetWidth > 0) {
      containerWidth = groupedBarRef.current.offsetWidth;
    } else if (stackedBarRef.current && stackedBarRef.current.offsetWidth > 0) {
      containerWidth = stackedBarRef.current.offsetWidth;
    } else if (groupedBarRef.current && groupedBarRef.current.parentElement) {
      // Try to get width from parent container
      const parent = groupedBarRef.current.parentElement;
      if (parent.offsetWidth > 0) {
        containerWidth = parent.offsetWidth;
      }
    }

    // Clear previous
    if (groupedBarRef.current) {
      d3.select(groupedBarRef.current).selectAll('*').remove();
    }
    if (stackedBarRef.current) {
      d3.select(stackedBarRef.current).selectAll('*').remove();
    }

    const containerHeightGrouped = 400;
    const containerHeightStacked = 500; // Taller for stacked view
    const width = containerWidth - margin.left - margin.right;

    // Grouped Bar Chart
    const groupedData = groupByCategory(data, selectedFactor);
    const heightGrouped = containerHeightGrouped - margin.top - margin.bottom;
    
    // Grouped Bar Chart - create SVG if ref exists
    if (groupedBarRef.current) {
      const svg1 = d3.select(groupedBarRef.current)
        .append('svg')
        .attr('width', containerWidth)
        .attr('height', containerHeightGrouped)
        .style('visibility', viewMode === 'grouped' ? 'visible' : 'hidden');

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
    }

    // Create legend outside SVG for grouped view
    if (groupedLegendRef.current) {
      d3.select(groupedLegendRef.current).selectAll('*').remove();
      const uniqueCategories = [...new Set(groupedData.map(d => d.category))];
      const padding = 20;
      const itemHeight = 28;
      const itemSpacing = 8;
      const legendWidth = 300;
      const legendHeight = uniqueCategories.length * (itemHeight + itemSpacing) + padding * 2 + 30;
      
      const legendSvg = d3.select(groupedLegendRef.current)
        .append('svg')
        .attr('width', legendWidth)
        .attr('height', legendHeight);

      // Background rectangle with rounded corners
      const bg = legendSvg.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .attr('rx', 8)
        .attr('ry', 8)
        .attr('fill', '#f8f9fa')
        .attr('stroke', '#e2e8f0')
        .attr('stroke-width', 2);

      // Title
      legendSvg.append('text')
        .attr('x', legendWidth / 2)
        .attr('y', 25)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('font-weight', '600')
        .attr('fill', '#2d3748')
        .text('Categories');

      const legend = legendSvg.append('g')
        .attr('transform', `translate(${padding}, ${padding + 30})`);

      uniqueCategories.forEach((cat, i) => {
        const yPos = i * (itemHeight + itemSpacing);
        const legendItem = legend.append('g')
          .attr('transform', `translate(0, ${yPos})`);

        // Item background
        legendItem.append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', legendWidth - padding * 2)
          .attr('height', itemHeight)
          .attr('rx', 4)
          .attr('ry', 4)
          .attr('fill', 'white')
          .attr('stroke', '#e2e8f0')
          .attr('stroke-width', 1);

        // Color square
        legendItem.append('rect')
          .attr('x', 12)
          .attr('y', 6.5)
          .attr('width', 18)
          .attr('height', 18)
          .attr('rx', 3)
          .attr('ry', 3)
          .attr('fill', categoryColorScale(cat))
          .attr('stroke', '#fff')
          .attr('stroke-width', 2);

        // Category text
        legendItem.append('text')
          .attr('x', 40)
          .attr('y', 20)
          .attr('dy', '0.35em')
          .attr('font-size', '13px')
          .attr('font-weight', '500')
          .attr('fill', '#2d3748')
          .text(cat);
      });
    }

    // Stacked Bar Chart
    const stackedData = calculatePerformanceDistribution(data, selectedFactor);
    const heightStacked = containerHeightStacked - margin.top - margin.bottom;
    
    const svg2 = d3.select(stackedBarRef.current)
      .append('svg')
      .attr('width', containerWidth)
      .attr('height', containerHeightStacked)
      .style('visibility', viewMode === 'stacked' ? 'visible' : 'hidden');

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

    // Create legend outside SVG for stacked view
    if (stackedLegendRef.current) {
      d3.select(stackedLegendRef.current).selectAll('*').remove();
      const padding = 20;
      const itemHeight = 32;
      const itemSpacing = 10;
      const legendWidth = 320;
      const legendHeight = 3 * (itemHeight + itemSpacing) + padding * 2 + 30;
      
      const legendSvg = d3.select(stackedLegendRef.current)
        .append('svg')
        .attr('width', legendWidth)
        .attr('height', legendHeight);

      // Background rectangle with rounded corners
      const bg = legendSvg.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .attr('rx', 8)
        .attr('ry', 8)
        .attr('fill', '#f8f9fa')
        .attr('stroke', '#e2e8f0')
        .attr('stroke-width', 2);

      // Title
      legendSvg.append('text')
        .attr('x', legendWidth / 2)
        .attr('y', 25)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('font-weight', '600')
        .attr('fill', '#2d3748')
        .text('Performance Levels');

      const legend = legendSvg.append('g')
        .attr('transform', `translate(${padding}, ${padding + 30})`);

      ['high', 'medium', 'low'].forEach((level, i) => {
        const yPos = i * (itemHeight + itemSpacing);
        const legendItem = legend.append('g')
          .attr('transform', `translate(0, ${yPos})`);

        // Item background
        legendItem.append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', legendWidth - padding * 2)
          .attr('height', itemHeight)
          .attr('rx', 4)
          .attr('ry', 4)
          .attr('fill', 'white')
          .attr('stroke', '#e2e8f0')
          .attr('stroke-width', 1);

        // Color square
        legendItem.append('rect')
          .attr('x', 12)
          .attr('y', 7)
          .attr('width', 20)
          .attr('height', 20)
          .attr('rx', 3)
          .attr('ry', 3)
          .attr('fill', colorScale(level))
          .attr('stroke', '#fff')
          .attr('stroke-width', 2);

        // Level text
        const levelText = level.charAt(0).toUpperCase() + level.slice(1);
        const scoreText = level === 'high' ? '≥75' : level === 'medium' ? '65-74' : '<65';
        
        legendItem.append('text')
          .attr('x', 42)
          .attr('y', 20)
          .attr('dy', '0.35em')
          .attr('font-size', '13px')
          .attr('font-weight', '600')
          .attr('fill', '#2d3748')
          .text(levelText);

        legendItem.append('text')
          .attr('x', 100)
          .attr('y', 20)
          .attr('dy', '0.35em')
          .attr('font-size', '12px')
          .attr('fill', '#718096')
          .text(`Score: ${scoreText}`);
      });
    }

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
      <div style={{ position: 'relative' }}>
        <div ref={groupedBarRef} style={{ visibility: viewMode === 'grouped' ? 'visible' : 'hidden', position: viewMode === 'grouped' ? 'static' : 'absolute' }}></div>
        <div ref={stackedBarRef} style={{ visibility: viewMode === 'stacked' ? 'visible' : 'hidden', position: viewMode === 'stacked' ? 'static' : 'absolute' }}></div>
      </div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginTop: '20px',
        padding: '0 20px'
      }}>
        <div 
          ref={groupedLegendRef} 
          style={{ 
            display: viewMode === 'grouped' ? 'block' : 'none',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px'
          }}
        ></div>
        <div 
          ref={stackedLegendRef} 
          style={{ 
            display: viewMode === 'stacked' ? 'block' : 'none',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px'
          }}
        ></div>
      </div>
    </div>
  );
};

export default Chart2Categorical;

