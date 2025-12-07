import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { calculateCorrelationsWithTarget, binData } from '../utils/dataProcessor';
// Import getNumericFactors from dataLoader (not dataProcessor)
import { getNumericFactors } from '../utils/dataLoader';
import { correlationColorScale, lineColorScale } from '../utils/colorScales';

const Chart1Correlation = ({ data, selectedFactor, onFactorSelect }) => {
  const heatmapRef = useRef(null);
  const lineChartRef = useRef(null);
  const heatmapLegendRef = useRef(null);
  const lineLegendRef = useRef(null);
  const margin = { top: 40, right: 40, bottom: 60, left: 80 };

  useEffect(() => {
    if (!data || data.length === 0 || !heatmapRef.current) return;

    const factors = getNumericFactors();
    const correlations = calculateCorrelationsWithTarget(data, factors);

    // Clear previous
    d3.select(heatmapRef.current).selectAll('*').remove();

    const containerWidth = heatmapRef.current.offsetWidth;
    const containerHeight = 300;
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    // Create heatmap
    const svg = d3.select(heatmapRef.current)
      .append('svg')
      .attr('width', containerWidth)
      .attr('height', containerHeight);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleBand()
      .domain(factors)
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleBand()
      .domain(['Exam_Score'])
      .range([0, height])
      .padding(0.1);

    const colorScale = d3.scaleSequential()
      .domain([-1, 1])
      .interpolator(d3.interpolateRdBu);

    // Draw cells
    const cells = g.selectAll('.cell')
      .data(correlations)
      .enter()
      .append('rect')
      .attr('class', 'cell')
      .attr('x', d => xScale(d.factor))
      .attr('y', 0)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('fill', d => colorScale(d.correlation))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this).attr('stroke', '#333').attr('stroke-width', 3);
        if (onFactorSelect) onFactorSelect(d.factor);
      })
      .on('mouseout', function() {
        d3.select(this).attr('stroke', '#fff').attr('stroke-width', 2);
      });

    // Add text labels
    g.selectAll('.label')
      .data(correlations)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => xScale(d.factor) + xScale.bandwidth() / 2)
      .attr('y', yScale.bandwidth() / 2)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', d => Math.abs(d.correlation) > 0.5 ? '#fff' : '#333')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text(d => d.correlation.toFixed(2));

    // X-axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .attr('dx', '-0.5em')
      .attr('dy', '0.5em');

    // Title
    svg.append('text')
      .attr('x', containerWidth / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .text('Correlation with Exam Score');

    // Create legend outside SVG with improved styling
    if (heatmapLegendRef.current) {
      d3.select(heatmapLegendRef.current).selectAll('*').remove();
      const padding = 20;
      const legendWidth = 300;
      const legendBarHeight = 25;
      const legendHeight = 80;
      
      const legendSvg = d3.select(heatmapLegendRef.current)
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
        .text('Correlation Scale');

      const legend = legendSvg.append('g')
        .attr('transform', `translate(${padding}, ${padding + 30})`);

      const legendBarWidth = legendWidth - padding * 2;
      const legendScale = d3.scaleLinear()
        .domain([-1, 1])
        .range([0, legendBarWidth]);

      const legendAxis = d3.axisBottom(legendScale)
        .ticks(5)
        .tickFormat(d3.format('.1f'));

      const defs = legendSvg.append('defs');
      const gradient = defs.append('linearGradient')
        .attr('id', 'correlation-gradient')
        .attr('x1', '0%')
        .attr('x2', '100%');

      gradient.selectAll('stop')
        .data([
          { offset: '0%', color: d3.interpolateRdBu(0) },
          { offset: '50%', color: d3.interpolateRdBu(0.5) },
          { offset: '100%', color: d3.interpolateRdBu(1) }
        ])
        .enter()
        .append('stop')
        .attr('offset', d => d.offset)
        .attr('stop-color', d => d.color);

      // Gradient bar with rounded corners
      legend.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', legendBarWidth)
        .attr('height', legendBarHeight)
        .attr('rx', 4)
        .attr('ry', 4)
        .attr('fill', 'url(#correlation-gradient)')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);

      legend.append('g')
        .attr('transform', `translate(0,${legendBarHeight + 5})`)
        .call(legendAxis)
        .selectAll('text')
        .attr('font-size', '11px')
        .attr('fill', '#4a5568');
    }

  }, [data, onFactorSelect]);

  useEffect(() => {
    if (!data || data.length === 0 || !lineChartRef.current) return;

    const factors = getNumericFactors();
    const topFactors = factors.slice(0, 3); // Top 3 for line chart

    // Clear previous
    d3.select(lineChartRef.current).selectAll('*').remove();

    const containerWidth = lineChartRef.current.offsetWidth;
    const containerHeight = 300;
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    const svg = d3.select(lineChartRef.current)
      .append('svg')
      .attr('width', containerWidth)
      .attr('height', containerHeight);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create binned data for each factor
    const binnedData = topFactors.map(factor => ({
      factor,
      bins: binData(data, factor, 'Exam_Score', 10)
    }));

    // Scales
    const allBinCenters = binnedData.flatMap(d => d.bins.map(b => b.binCenter));
    const xScale = d3.scaleLinear()
      .domain(d3.extent(allBinCenters))
      .range([0, width]);

    const allScores = binnedData.flatMap(d => d.bins.map(b => b.avgScore));
    const yScale = d3.scaleLinear()
      .domain(d3.extent(allScores))
      .nice()
      .range([height, 0]);

    // Line generator
    const line = d3.line()
      .x(d => xScale(d.binCenter))
      .y(d => yScale(d.avgScore))
      .curve(d3.curveMonotoneX);

    // Draw lines
    binnedData.forEach((factorData, i) => {
      const path = g.append('path')
        .datum(factorData.bins)
        .attr('fill', 'none')
        .attr('stroke', lineColorScale(i))
        .attr('stroke-width', 2)
        .attr('d', line);

      // Add circles for data points
      g.selectAll(`.point-${i}`)
        .data(factorData.bins)
        .enter()
        .append('circle')
        .attr('class', `point-${i}`)
        .attr('cx', d => xScale(d.binCenter))
        .attr('cy', d => yScale(d.avgScore))
        .attr('r', 4)
        .attr('fill', lineColorScale(i))
        .on('mouseover', function(event, d) {
          d3.select(this).attr('r', 6);
        })
        .on('mouseout', function() {
          d3.select(this).attr('r', 4);
        });
    });

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

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
      .text('Factor Value');

    // Create legend outside SVG with improved styling
    if (lineLegendRef.current) {
      d3.select(lineLegendRef.current).selectAll('*').remove();
      const padding = 20;
      const itemHeight = 28;
      const itemSpacing = 8;
      const legendWidth = 300;
      const legendHeight = topFactors.length * (itemHeight + itemSpacing) + padding * 2 + 30;
      
      const legendSvg = d3.select(lineLegendRef.current)
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
        .text('Top Correlated Factors');

      const legend = legendSvg.append('g')
        .attr('transform', `translate(${padding}, ${padding + 30})`);

      topFactors.forEach((factor, i) => {
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

        // Line indicator
        legendItem.append('line')
          .attr('x1', 12)
          .attr('x2', 32)
          .attr('y1', itemHeight / 2)
          .attr('y2', itemHeight / 2)
          .attr('stroke', lineColorScale(i))
          .attr('stroke-width', 3)
          .attr('stroke-linecap', 'round');

        // Factor text
        legendItem.append('text')
          .attr('x', 42)
          .attr('y', itemHeight / 2)
          .attr('dy', '0.35em')
          .attr('font-size', '13px')
          .attr('font-weight', '500')
          .attr('fill', '#2d3748')
          .text(factor.replace(/_/g, ' '));
      });
    }

    // Title
    svg.append('text')
      .attr('x', containerWidth / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .text('Exam Score Trends by Factor Ranges');

  }, [data]);

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <div ref={heatmapRef}></div>
      </div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginTop: '20px',
        padding: '0 20px',
        marginBottom: '30px'
      }}>
        <div 
          ref={heatmapLegendRef} 
          style={{ 
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px'
          }}
        ></div>
      </div>
      <div>
        <div ref={lineChartRef}></div>
      </div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginTop: '20px',
        padding: '0 20px'
      }}>
        <div 
          ref={lineLegendRef} 
          style={{ 
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px'
          }}
        ></div>
      </div>
    </div>
  );
};

export default Chart1Correlation;

