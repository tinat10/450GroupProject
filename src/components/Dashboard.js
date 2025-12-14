import React, { Component } from "react";
import { loadData } from "../utils/dataLoader";
import { applyFilters } from "../utils/dataProcessor";
import FilterPanel from "./FilterPanel";
import Chart1Correlation from "./Chart1Correlation";
import Chart2Categorical from "./Chart2Categorical";
import Chart3Interactions from "./Chart3Interactions";
import Chart4Impact from "./Chart4Impact";
import SummaryPanel from "./SummaryPanel";
import "./Dashboard.css";

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      filteredData: [],
      filters: {
        schoolType: "All",
        gender: "All",
        learningDisabilities: false,
        scoreRange: [55, 101],
      },
      loading: true,
      selectedFactor: null,
      selectedCategory: null,
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps, prevState) {
    // Apply filters when data changes (but not when filters change, handled in handleFilterChange)
    if (prevState.data !== this.state.data && this.state.data.length > 0) {
      const filtered = applyFilters(this.state.data, this.state.filters);
      this.setState({ filteredData: filtered });
    }
  }

  fetchData = async () => {
    try {
      this.setState({ loading: true });
      const loadedData = await loadData();
      const filtered = applyFilters(loadedData, this.state.filters);
      this.setState({
        data: loadedData,
        filteredData: filtered,
        loading: false,
      });
    } catch (error) {
      console.error("Error loading data:", error);
      this.setState({ loading: false });
    }
  };

  handleFilterChange = (newFilters) => {
    this.setState({ filters: newFilters }, () => {
      // Apply filters after state update
      if (this.state.data.length > 0) {
        const filtered = applyFilters(this.state.data, newFilters);
        this.setState({ filteredData: filtered });
      }
    });
  };

  handleFactorSelect = (factor) => {
    this.setState({ selectedFactor: factor });
  };

  handleCategorySelect = (category) => {
    this.setState({ selectedCategory: category });
  };

  handleCombinationSelect = (combination) => {
    // Could filter data based on combination
    console.log("Selected combination:", combination);
  };

  render() {
    const { loading, filteredData, filters, selectedFactor, selectedCategory } =
      this.state;

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
          onFilterChange={this.handleFilterChange}
          data={filteredData}
        />

        <div style={{ marginBottom: "40px" }}>
          <SummaryPanel data={filteredData} />
        </div>

        <div className="charts-grid">
          <div className="chart-container">
            <div className="chart-header-box">
              <div className="chart-title">Chart 1: Academic Behaviors</div>
              <div className="chart-subtitle">
                How are key academic behaviors and habits associated with exam performance?
              </div>
            </div>
            <Chart1Correlation
              data={filteredData}
              selectedFactor={selectedFactor}
              onFactorSelect={this.handleFactorSelect}
            />
          </div>

          <div className="chart-container">
            <div className="chart-header-box">
              <div className="chart-title">
                Chart 2: Performance Across Categories
              </div>
              <div className="chart-subtitle">
                How are student background and resource factors distributed across performance groups?
              </div>
            </div>
            <Chart2Categorical
              data={filteredData}
              filters={filters}
              selectedCategory={selectedCategory}
              onCategorySelect={this.handleCategorySelect}
            />
          </div>

          <div className="chart-container">
            <div className="chart-header-box">
              <div className="chart-title">Chart 3: Social & Environmental Factors</div>
              <div className="chart-subtitle">
                How does exam performance differ across levels of social and environmental factors?
              </div>
            </div>
            <Chart3Interactions
              data={filteredData}
              onCombinationSelect={this.handleCombinationSelect}
            />
          </div>

          <div className="chart-container">
            <div className="chart-header-box">
              <div className="chart-title">Chart 4: Most Impactful Factors</div>
              <div className="chart-subtitle">
                Which factors show the strongest relationships with exam performance?
              </div>
            </div>
            <Chart4Impact
              data={filteredData}
              onFactorSelect={this.handleFactorSelect}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default Dashboard;
