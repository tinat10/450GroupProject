import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { calculateCorrelationsWithTarget, binData } from '../utils/dataProcessor';
import { getNumericFactors } from '../utils/dataLoader';
import { correlationColorScale, lineColorScale } from '../utils/colorScales';

const Chart1Correlation = ({ data, selectedFactor, onFactorSelect }) => {
  const heatmapRef = useRef(null);
  const lineChartRef = useRef(null);
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

    // Color legend - positioned top right, just below title, above chart area
    const legendWidth = 200;
    const legendHeight = 20;
    const legend = svg.append('g')
      .attr('transform', `translate(${containerWidth - legendWidth - 20}, 35)`);

    const legendScale = d3.scaleLinear()
      .domain([-1, 1])
      .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
      .ticks(5)
      .tickFormat(d3.format('.1f'));

    const defs = svg.append('defs');
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

    legend.append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .attr('fill', 'url(#correlation-gradient)');

    legend.append('g')
      .attr('transform', `translate(0,${legendHeight})`)
      .call(legendAxis);

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

    // Legend - positioned top right, just below title, above chart area
    const legend = svg.append('g')
      .attr('transform', `translate(${containerWidth - 200}, 35)`);

    topFactors.forEach((factor, i) => {
      const legendItem = legend.append('g')
        .attr('transform', `translate(0, ${i * 20})`);

      legendItem.append('line')
        .attr('x1', 0)
        .attr('x2', 20)
        .attr('stroke', lineColorScale(i))
        .attr('stroke-width', 2);

      legendItem.append('text')
        .attr('x', 25)
        .attr('dy', '0.35em')
        .attr('font-size', '12px')
        .text(factor.replace(/_/g, ' '));
    });

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
      <div ref={heatmapRef} style={{ marginBottom: '20px' }}></div>
      <div ref={lineChartRef}></div>
    </div>
  );
};

export default Chart1Correlation;

