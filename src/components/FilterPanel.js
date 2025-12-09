import React, { Component } from 'react';
import './FilterPanel.css';

class FilterPanel extends Component {
  handleSchoolTypeChange = (e) => {
    this.props.onFilterChange({ ...this.props.filters, schoolType: e.target.value });
  }

  handleGenderChange = (e) => {
    this.props.onFilterChange({ ...this.props.filters, gender: e.target.value });
  }

  handleLearningDisabilitiesChange = (e) => {
    this.props.onFilterChange({ ...this.props.filters, learningDisabilities: e.target.checked });
  }

  handleScoreRangeChange = (e) => {
    const value = parseInt(e.target.value);
    const currentRange = this.props.filters.scoreRange || [55, 101];
    if (e.target.id === 'scoreMin') {
      this.props.onFilterChange({ ...this.props.filters, scoreRange: [value, currentRange[1]] });
    } else {
      this.props.onFilterChange({ ...this.props.filters, scoreRange: [currentRange[0], value] });
    }
  }

  handleReset = () => {
    this.props.onFilterChange({
      schoolType: 'All',
      gender: 'All',
      learningDisabilities: false,
      scoreRange: [55, 101]
    });
  }

  render() {
    const { filters, data } = this.props;
    const filteredCount = data ? data.length : 0;

    return (
      <div className="filter-panel">
        <h3>Filters</h3>
        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="schoolType">School Type</label>
            <select
              id="schoolType"
              value={filters.schoolType || 'All'}
              onChange={this.handleSchoolTypeChange}
            >
              <option value="All">All Schools</option>
              <option value="Public">Public</option>
              <option value="Private">Private</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Gender</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="All"
                  checked={filters.gender === 'All' || !filters.gender}
                  onChange={this.handleGenderChange}
                />
                <span>All</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="Male"
                  checked={filters.gender === 'Male'}
                  onChange={this.handleGenderChange}
                />
                <span>Male</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="Female"
                  checked={filters.gender === 'Female'}
                  onChange={this.handleGenderChange}
                />
                <span>Female</span>
              </label>
            </div>
          </div>

          <div className="filter-group">
            <label>
              <input
                type="checkbox"
                checked={filters.learningDisabilities || false}
                onChange={this.handleLearningDisabilitiesChange}
              />
              Exclude Learning Disabilities
            </label>
          </div>

          <div className="filter-group">
            <label>Score Range</label>
            <div className="range-inputs">
              <input
                id="scoreMin"
                type="number"
                min="55"
                max="101"
                value={filters.scoreRange ? filters.scoreRange[0] : 55}
                onChange={this.handleScoreRangeChange}
              />
              <span>to</span>
              <input
                id="scoreMax"
                type="number"
                min="55"
                max="101"
                value={filters.scoreRange ? filters.scoreRange[1] : 101}
                onChange={this.handleScoreRangeChange}
              />
            </div>
          </div>

          <button className="reset-button" onClick={this.handleReset}>
            Reset Filters
          </button>
        </div>
        <div className="filter-info">
          <p>Showing: <strong>{filteredCount.toLocaleString()}</strong> students</p>
        </div>
      </div>
    );
  }
}

export default FilterPanel;
