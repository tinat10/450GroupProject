import * as d3 from 'd3';

// Correlation color scale (diverging)
export const correlationColorScale = d3.scaleDiverging()
  .domain([-1, 0, 1])
  .interpolator(d3.interpolateRdBu);

// Category color scales
export const categoryColorScale = d3.scaleOrdinal()
  .domain(['Low', 'Medium', 'High', 'Public', 'Private', 'Male', 'Female'])
  .range(['#e74c3c', '#f39c12', '#27ae60', '#3498db', '#9b59b6', '#3498db', '#e91e63']);

// Performance level colors
export const performanceColorScale = d3.scaleOrdinal()
  .domain(['High', 'Medium', 'Low'])
  .range(['#27ae60', '#f39c12', '#e74c3c']);

// Impact color scale (green for positive, red for negative)
export const impactColorScale = (value) => {
  return value >= 0 ? '#27ae60' : '#e74c3c';
};

// Line chart color scale
export const lineColorScale = d3.scaleOrdinal()
  .range(['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b']);

