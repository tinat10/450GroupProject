import * as d3 from 'd3';

export const loadData = async () => {
  try {
    const data = await d3.csv('/StudentPerformanceFactors.csv');
    
    // Convert numeric columns
    const numericColumns = [
      'Hours_Studied', 'Attendance', 'Sleep_Hours', 'Previous_Scores',
      'Tutoring_Sessions', 'Physical_Activity', 'Exam_Score'
    ];
    
    data.forEach(d => {
      numericColumns.forEach(col => {
        d[col] = +d[col] || 0;
      });
    });
    
    return data;
  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  }
};

export const getNumericFactors = () => {
  return [
    'Hours_Studied',
    'Attendance',
    'Sleep_Hours',
    'Previous_Scores',
    'Tutoring_Sessions',
    'Physical_Activity'
  ];
};

export const getCategoricalFactors = () => {
  return [
    { key: 'Parental_Involvement', values: ['Low', 'Medium', 'High'] },
    { key: 'School_Type', values: ['Public', 'Private'] },
    { key: 'Family_Income', values: ['Low', 'Medium', 'High'] },
    { key: 'Teacher_Quality', values: ['Low', 'Medium', 'High'] },
    { key: 'Access_to_Resources', values: ['Low', 'Medium', 'High'] },
    { key: 'Gender', values: ['Male', 'Female'] }
  ];
};

