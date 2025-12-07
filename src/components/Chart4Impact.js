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

    // Create legend outside SVG with improved styling
    if (legendRef.current) {
      d3.select(legendRef.current).selectAll('*').remove();
      const padding = 20;
      const itemHeight = 32;
      const itemSpacing = 10;
      const legendWidth = 280;
      const legendHeight = 2 * (itemHeight + itemSpacing) + padding * 2 + 30;
      
      const legendSvg = d3.select(legendRef.current)
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
        .text('Impact Direction');

      const legend = legendSvg.append('g')
        .attr('transform', `translate(${padding}, ${padding + 30})`);

      const impactTypes = [
        { label: 'Positive Impact', color: '#27ae60', description: 'Higher values improve performance' },
        { label: 'Negative Impact', color: '#e74c3c', description: 'Higher values decrease performance' }
      ];

      impactTypes.forEach((type, i) => {
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
          .attr('fill', type.color)
          .attr('stroke', '#fff')
          .attr('stroke-width', 2);

        // Label text
        legendItem.append('text')
          .attr('x', 42)
          .attr('y', 20)
          .attr('dy', '0.35em')
          .attr('font-size', '13px')
          .attr('font-weight', '600')
          .attr('fill', '#2d3748')
          .text(type.label);

        // Description text
        legendItem.append('text')
          .attr('x', 180)
          .attr('y', 20)
          .attr('dy', '0.35em')
          .attr('font-size', '11px')
          .attr('fill', '#718096')
          .text(type.description);
      });
    }

  }, [data, onFactorSelect]);

  return (
    <div>
      <div ref={chartRef}></div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginTop: '20px',
        padding: '0 20px'
      }}>
        <div 
          ref={legendRef} 
          style={{ 
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px'
          }}
        ></div>
      </div>
    </div>
  );
};

export default Chart4Impact;

