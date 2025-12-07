import React from 'react';
import './FilterPanel.css';

const FilterPanel = ({ filters, onFilterChange, data }) => {
  const handleSchoolTypeChange = (e) => {
    onFilterChange({ ...filters, schoolType: e.target.value });
  };

  const handleGenderChange = (e) => {
    onFilterChange({ ...filters, gender: e.target.value });
  };

  const handleLearningDisabilitiesChange = (e) => {
    onFilterChange({ ...filters, learningDisabilities: e.target.checked });
  };

  const handleScoreRangeChange = (e) => {
    const value = parseInt(e.target.value);
    const currentRange = filters.scoreRange || [55, 101];
    if (e.target.id === 'scoreMin') {
      onFilterChange({ ...filters, scoreRange: [value, currentRange[1]] });
    } else {
      onFilterChange({ ...filters, scoreRange: [currentRange[0], value] });
    }
  };

  const handleReset = () => {
    onFilterChange({
      schoolType: 'All',
      gender: 'All',
      learningDisabilities: false,
      scoreRange: [55, 101]
    });
  };

  const filteredCount = data ? data.length : 0;

  return (
    <div className="filter-panel">
      <h3>Filters</h3>
      <div className="filter-controls">
        <div className="filter-group">
          <label htmlFor="schoolType">School Type:</label>
          <select
            id="schoolType"
            value={filters.schoolType || 'All'}
            onChange={handleSchoolTypeChange}
          >
            <option value="All">All</option>
            <option value="Public">Public</option>
            <option value="Private">Private</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Gender:</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="gender"
                value="All"
                checked={filters.gender === 'All' || !filters.gender}
                onChange={handleGenderChange}
              />
              All
            </label>
            <label>
              <input
                type="radio"
                name="gender"
                value="Male"
                checked={filters.gender === 'Male'}
                onChange={handleGenderChange}
              />
              Male
            </label>
            <label>
              <input
                type="radio"
                name="gender"
                value="Female"
                checked={filters.gender === 'Female'}
                onChange={handleGenderChange}
              />
              Female
            </label>
          </div>
        </div>

        <div className="filter-group">
          <label>
            <input
              type="checkbox"
              checked={filters.learningDisabilities || false}
              onChange={handleLearningDisabilitiesChange}
            />
            Exclude Learning Disabilities
          </label>
        </div>

        <div className="filter-group">
          <label>Score Range:</label>
          <div className="range-inputs">
            <input
              id="scoreMin"
              type="number"
              min="55"
              max="101"
              value={filters.scoreRange ? filters.scoreRange[0] : 55}
              onChange={handleScoreRangeChange}
            />
            <span>to</span>
            <input
              id="scoreMax"
              type="number"
              min="55"
              max="101"
              value={filters.scoreRange ? filters.scoreRange[1] : 101}
              onChange={handleScoreRangeChange}
            />
          </div>
        </div>

        <button className="reset-button" onClick={handleReset}>
          Reset Filters
        </button>
      </div>
      <div className="filter-info">
        <p>Showing: <strong>{filteredCount.toLocaleString()}</strong> students</p>
      </div>
    </div>
  );
};

export default FilterPanel;

