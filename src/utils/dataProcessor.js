import * as d3 from 'd3';

// Calculate correlation between two numeric arrays
export const calculateCorrelation = (x, y) => {
  const n = x.length;
  const sumX = d3.sum(x);
  const sumY = d3.sum(y);
  const sumXY = d3.sum(x.map((xi, i) => xi * y[i]));
  const sumX2 = d3.sum(x.map(xi => xi * xi));
  const sumY2 = d3.sum(y.map(yi => yi * yi));
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  return denominator === 0 ? 0 : numerator / denominator;
};

// Calculate correlation matrix for numeric factors
export const calculateCorrelationMatrix = (data, factors, targetFactor = 'Exam_Score') => {
  const matrix = [];
  
  factors.forEach(factor1 => {
    const row = [];
    factors.forEach(factor2 => {
      if (factor1 === factor2) {
        row.push(1);
      } else {
        const values1 = data.map(d => d[factor1]).filter(v => !isNaN(v));
        const values2 = data.map(d => d[factor2]).filter(v => !isNaN(v));
        const corr = calculateCorrelation(values1, values2);
        row.push(corr);
      }
    });
    matrix.push(row);
  });
  
  return matrix;
};

// Calculate correlations with Exam_Score
export const calculateCorrelationsWithTarget = (data, factors, targetFactor = 'Exam_Score') => {
  const correlations = [];
  const targetValues = data.map(d => d[targetFactor]).filter(v => !isNaN(v));
  
  factors.forEach(factor => {
    const factorValues = data.map(d => d[factor]).filter(v => !isNaN(v));
    const corr = calculateCorrelation(factorValues, targetValues);
    correlations.push({
      factor,
      correlation: corr
    });
  });
  
  return correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
};

// Bin numeric data for line charts
export const binData = (data, factor, targetFactor = 'Exam_Score', bins = 10) => {
  const values = data.map(d => d[factor]).filter(v => !isNaN(v));
  const min = d3.min(values);
  const max = d3.max(values);
  const binWidth = (max - min) / bins;
  
  const binned = [];
  for (let i = 0; i < bins; i++) {
    const binStart = min + i * binWidth;
    const binEnd = min + (i + 1) * binWidth;
    const binData = data.filter(d => {
      const val = d[factor];
      return !isNaN(val) && val >= binStart && (i === bins - 1 ? val <= binEnd : val < binEnd);
    });
    
    if (binData.length > 0) {
      const avgScore = d3.mean(binData, d => d[targetFactor]);
      binned.push({
        binStart,
        binEnd,
        binCenter: (binStart + binEnd) / 2,
        avgScore: avgScore || 0,
        count: binData.length
      });
    }
  }
  
  return binned;
};

// Group data by categorical factor
export const groupByCategory = (data, factor, targetFactor = 'Exam_Score') => {
  const grouped = d3.group(data, d => d[factor]);
  const result = [];
  
  grouped.forEach((values, key) => {
    const scores = values.map(d => d[targetFactor]).filter(v => !isNaN(v));
    result.push({
      category: key,
      avgScore: d3.mean(scores),
      medianScore: d3.median(scores),
      count: scores.length,
      scores: scores
    });
  });
  
  return result.sort((a, b) => {
    // Sort by category order if it's ordinal
    const order = ['Low', 'Medium', 'High', 'Public', 'Private', 'Male', 'Female'];
    const aIndex = order.indexOf(a.category);
    const bIndex = order.indexOf(b.category);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    return a.category.localeCompare(b.category);
  });
};

// Calculate performance distribution (High/Medium/Low)
export const calculatePerformanceDistribution = (data, factor, targetFactor = 'Exam_Score') => {
  const grouped = d3.group(data, d => d[factor]);
  const result = [];
  
  grouped.forEach((values, category) => {
    const scores = values.map(d => d[targetFactor]).filter(v => !isNaN(v));
    const high = scores.filter(s => s >= 75).length;
    const medium = scores.filter(s => s >= 65 && s < 75).length;
    const low = scores.filter(s => s < 65).length;
    const total = scores.length;
    
    result.push({
      category,
      high: { count: high, percentage: (high / total) * 100 },
      medium: { count: medium, percentage: (medium / total) * 100 },
      low: { count: low, percentage: (low / total) * 100 },
      total
    });
  });
  
  return result;
};

// Calculate two-factor interactions
export const calculateTwoFactorInteraction = (data, factor1, factor2, targetFactor = 'Exam_Score') => {
  const grouped = d3.group(data, d => d[factor1], d => d[factor2]);
  const result = [];
  
  grouped.forEach((level2Map, level1) => {
    level2Map.forEach((values, level2) => {
      const scores = values.map(d => d[targetFactor]).filter(v => !isNaN(v));
      if (scores.length > 0) {
        result.push({
          factor1: level1,
          factor2: level2,
          avgScore: d3.mean(scores),
          count: scores.length
        });
      }
    });
  });
  
  return result;
};

// Calculate impact scores (top 25% vs bottom 25%)
export const calculateImpactScores = (data, factors, targetFactor = 'Exam_Score') => {
  const scores = data.map(d => d[targetFactor]).filter(v => !isNaN(v));
  const sorted = [...scores].sort((a, b) => a - b);
  const top25Threshold = sorted[Math.floor(sorted.length * 0.75)];
  const bottom25Threshold = sorted[Math.floor(sorted.length * 0.25)];
  
  const impacts = [];
  
  factors.forEach(factor => {
    const top25 = data.filter(d => d[targetFactor] >= top25Threshold);
    const bottom25 = data.filter(d => d[targetFactor] <= bottom25Threshold);
    
    // Check if factor is numeric by trying to convert first value
    const sampleValue = data.find(d => d[factor] !== undefined && d[factor] !== null && d[factor] !== '');
    const isNumeric = sampleValue && !isNaN(+sampleValue[factor]) && typeof sampleValue[factor] !== 'string';
    
    if (isNumeric) {
      // For numeric factors, compare averages
      const top25Avg = d3.mean(top25.map(d => +d[factor]).filter(v => !isNaN(v)));
      const bottom25Avg = d3.mean(bottom25.map(d => +d[factor]).filter(v => !isNaN(v)));
      const impact = (top25Avg || 0) - (bottom25Avg || 0);
      impacts.push({ factor, impact, type: 'numeric' });
    } else {
      // For categorical factors, compare average scores by category
      const top25ByCat = groupByCategory(top25, factor, targetFactor);
      const bottom25ByCat = groupByCategory(bottom25, factor, targetFactor);
      
      // Find the category with highest average in top 25% and lowest in bottom 25%
      const top25Max = top25ByCat.length > 0 ? d3.max(top25ByCat, d => d.avgScore) : 0;
      const bottom25Min = bottom25ByCat.length > 0 ? d3.min(bottom25ByCat, d => d.avgScore) : 0;
      const impact = (top25Max || 0) - (bottom25Min || 0);
      
      impacts.push({ factor, impact, type: 'categorical' });
    }
  });
  
  return impacts.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
};

// Apply filters to data
export const applyFilters = (data, filters) => {
  let filtered = [...data];
  
  if (filters.schoolType && filters.schoolType !== 'All') {
    filtered = filtered.filter(d => d.School_Type === filters.schoolType);
  }
  
  if (filters.gender && filters.gender !== 'All') {
    filtered = filtered.filter(d => d.Gender === filters.gender);
  }
  
  if (filters.learningDisabilities !== undefined && filters.learningDisabilities === true) {
    // Exclude students with learning disabilities (only show 'No')
    // Also handle empty/null values by excluding them
    filtered = filtered.filter(d => {
      const ld = d.Learning_Disabilities;
      return ld === 'No' || ld === 'no' || ld === 'NO';
    });
  }
  
  if (filters.scoreRange) {
    filtered = filtered.filter(d => {
      const score = d.Exam_Score;
      return score >= filters.scoreRange[0] && score <= filters.scoreRange[1];
    });
  }
  
  return filtered;
};

