import React, { useState, useEffect } from 'react';
import { loadData } from '../utils/dataLoader';
import { applyFilters } from '../utils/dataProcessor';
import FilterPanel from './FilterPanel';
import Chart1Correlation from './Chart1Correlation';
import Chart2Categorical from './Chart2Categorical';
import Chart3Interactions from './Chart3Interactions';
import Chart4Impact from './Chart4Impact';
import SummaryPanel from './SummaryPanel';
import './Dashboard.css';

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({
    schoolType: 'All',
    gender: 'All',
    learningDisabilities: false,
    scoreRange: [55, 101]
  });
  const [loading, setLoading] = useState(true);
  const [selectedFactor, setSelectedFactor] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const loadedData = await loadData();
        setData(loadedData);
        setFilteredData(loadedData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      const filtered = applyFilters(data, filters);
      setFilteredData(filtered);
    }
  }, [data, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleFactorSelect = (factor) => {
    setSelectedFactor(factor);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleCombinationSelect = (combination) => {
    // Could filter data based on combination
    console.log('Selected combination:', combination);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading data...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Student Performance Factors Analysis</h1>
        <p>Exploring What Drives Academic Success</p>
      </div>

      <FilterPanel 
        filters={filters} 
        onFilterChange={handleFilterChange}
        data={filteredData}
      />

      <div className="charts-grid">
        <div className="chart-container">
          <div className="chart-title">Chart 1: Correlation Analysis</div>
          <div className="chart-subtitle">
            Which factors have the strongest relationships with exam performance?
          </div>
          <Chart1Correlation 
            data={filteredData}
            selectedFactor={selectedFactor}
            onFactorSelect={handleFactorSelect}
          />
        </div>

        <div className="chart-container">
          <div className="chart-title">Chart 2: Performance Across Categories</div>
          <div className="chart-subtitle">
            How do different student backgrounds and resources affect performance?
          </div>
          <Chart2Categorical 
            data={filteredData}
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
          />
        </div>

        <div className="chart-container">
          <div className="chart-title">Chart 3: Factor Interactions</div>
          <div className="chart-subtitle">
            How do combinations of factors create different performance profiles?
          </div>
          <Chart3Interactions 
            data={filteredData}
            onCombinationSelect={handleCombinationSelect}
          />
        </div>

        <div className="chart-container">
          <div className="chart-title">Chart 4: Impact Ranking</div>
          <div className="chart-subtitle">
            What are the most impactful factors?
          </div>
          <Chart4Impact 
            data={filteredData}
            onFactorSelect={handleFactorSelect}
          />
        </div>
      </div>

      <SummaryPanel data={filteredData} />
    </div>
  );
};

export default Dashboard;

