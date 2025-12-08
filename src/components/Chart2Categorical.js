import React, { Component } from "react";
import * as d3 from "d3";
import { getCategoricalFactors } from "../utils/dataLoader";
import { categoryColorScale } from "../utils/colorScales";

class Chart2Categorical extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFactor: "Parental_Involvement",
    };
    this.factors = getCategoricalFactors();
  }

  componentDidMount() {
    this.drawCharts();
  }

  componentDidUpdate() {
    this.drawCharts();
  }

  groupByCategory(dataArray, factor) {
    const grouped = {};
    dataArray.forEach((d) => {
      const category = d[factor];
      grouped[category] = (grouped[category] || 0) + 1;
    });
    return Object.keys(grouped).map((category) => ({
      category,
      count: grouped[category],
    }));
  }

  createPieChart(containerId, data, title) {
    const container = document.getElementById(containerId);
    if (!container || !data || data.length === 0) return;

    // Clear previous
    d3.select(container).selectAll("*").remove();

    const containerWidth = container.offsetWidth;
    const containerHeight = 300;
    const size = Math.min(containerWidth, containerHeight);
    const radius = size / 2 - 60;
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;

    // Create SVG
    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", containerWidth)
      .attr("height", containerHeight);

    // Create pie generator
    const pieGenerator = d3
      .pie()
      .value((d) => d.count)
      .sort(null);

    // Create arc generator
    const arcGenerator = d3
      .arc()
      .innerRadius(0)
      .outerRadius(radius)
      .padAngle(0.01);

    // Generate arc data
    const arcData = pieGenerator(data);

    // Create group for pie chart
    const g = svg
      .append("g")
      .attr("transform", `translate(${centerX}, ${centerY})`);

    // Draw pie slices
    g.selectAll("path")
      .data(arcData)
      .join("path")
      .attr("d", (d) => arcGenerator(d))
      .attr("fill", (d) => categoryColorScale(d.data.category))
      .attr("stroke", "#fff")
      .attr("stroke-width", 3)
      .style("cursor", "pointer")
      .on("mouseover", (event, d) => {
        d3.select(event.currentTarget)
          .attr("opacity", 0.8)
          .attr("stroke-width", 4);
        if (this.props.onCategorySelect) {
          this.props.onCategorySelect({
            factor: this.state.selectedFactor,
            category: d.data.category,
          });
        }
      })
      .on("mouseout", (event) => {
        d3.select(event.currentTarget)
          .attr("opacity", 1)
          .attr("stroke-width", 3);
      });

    // Add percentage labels
    const total = data.reduce((sum, d) => sum + d.count, 0);
    g.selectAll("text")
      .data(arcData)
      .join("text")
      .attr("x", (d) => arcGenerator.centroid(d)[0])
      .attr("y", (d) => arcGenerator.centroid(d)[1])
      .text((d) => {
        const percentage = ((d.data.count / total) * 100).toFixed(1);
        return parseFloat(percentage) > 3 ? `${percentage}%` : "";
      })
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("font-weight", "600")
      .attr("fill", "#fff")
      .style("text-shadow", "2px 2px 4px rgba(0,0,0,0.8)");

    // Add title
    svg
      .append("text")
      .attr("x", containerWidth / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .text(title);
  }

  drawCharts() {
    const { data } = this.props;
    if (!data || data.length === 0) return;

    const { selectedFactor } = this.state;

    // Filter data by performance levels
    const highScores = data.filter((d) => d.Exam_Score >= 75);
    const mediumScores = data.filter(
      (d) => d.Exam_Score >= 65 && d.Exam_Score < 75
    );
    const lowScores = data.filter((d) => d.Exam_Score < 65);

    const highData = this.groupByCategory(highScores, selectedFactor);
    const mediumData = this.groupByCategory(mediumScores, selectedFactor);
    const lowData = this.groupByCategory(lowScores, selectedFactor);

    // Create the three pie charts
    this.createPieChart("pie-high", highData, "High Scores (≥75)");
    this.createPieChart("pie-medium", mediumData, "Medium Scores (65-74)");
    this.createPieChart("pie-low", lowData, "Low Scores (<65)");

    // Get all unique categories for legend
    const allCategories = [
      ...new Set([
        ...highData.map((d) => d.category),
        ...mediumData.map((d) => d.category),
        ...lowData.map((d) => d.category),
      ]),
    ].sort();

    // Create legend
    const legendContainer = document.getElementById("legend-container");
    if (legendContainer) {
      d3.select(legendContainer).selectAll("*").remove();
      const padding = 20;
      const itemHeight = 28;
      const itemSpacing = 8;
      const legendWidth = 300;
      const legendHeight =
        allCategories.length * (itemHeight + itemSpacing) + padding * 2 + 30;

      const legendSvg = d3
        .select(legendContainer)
        .append("svg")
        .attr("width", legendWidth)
        .attr("height", legendHeight);

      // Background rectangle with rounded corners
      const bg = legendSvg
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .attr("rx", 8)
        .attr("ry", 8)
        .attr("fill", "#f8f9fa")
        .attr("stroke", "#e2e8f0")
        .attr("stroke-width", 2);

      // Title
      legendSvg
        .append("text")
        .attr("x", legendWidth / 2)
        .attr("y", 25)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("font-weight", "600")
        .attr("fill", "#2d3748")
        .text("Categories");

      const legend = legendSvg
        .append("g")
        .attr("transform", `translate(${padding}, ${padding + 30})`);

      allCategories.forEach((category, i) => {
        const yPos = i * (itemHeight + itemSpacing);
        const legendItem = legend
          .append("g")
          .attr("transform", `translate(0, ${yPos})`);

        // Item background
        legendItem
          .append("rect")
          .attr("x", 0)
          .attr("y", 0)
          .attr("width", legendWidth - padding * 2)
          .attr("height", itemHeight)
          .attr("rx", 4)
          .attr("ry", 4)
          .attr("fill", "white")
          .attr("stroke", "#e2e8f0")
          .attr("stroke-width", 1);

        // Color square
        legendItem
          .append("rect")
          .attr("x", 12)
          .attr("y", 6.5)
          .attr("width", 18)
          .attr("height", 18)
          .attr("rx", 3)
          .attr("ry", 3)
          .attr("fill", categoryColorScale(category))
          .attr("stroke", "#fff")
          .attr("stroke-width", 2);

        // Category text
        legendItem
          .append("text")
          .attr("x", 40)
          .attr("y", itemHeight / 2)
          .attr("dy", "0.35em")
          .attr("font-size", "13px")
          .attr("font-weight", "500")
          .attr("fill", "#2d3748")
          .text(category);
      });
    }
  }

  render() {
    const { selectedFactor } = this.state;

    return (
      <div>
        <div
          style={{
            marginBottom: "15px",
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <label style={{ marginRight: "10px" }}>Factor:</label>
          <select
            value={selectedFactor}
            onChange={(e) => this.setState({ selectedFactor: e.target.value })}
            style={{ padding: "5px", marginRight: "20px" }}
          >
            {this.factors.map((f) => (
              <option key={f.key} value={f.key}>
                {f.key.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "20px",
            }}
          >
            <div id="pie-high"></div>
            <div id="pie-medium"></div>
            <div id="pie-low"></div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "20px",
            padding: "0 20px",
          }}
        >
          <div
            id="legend-container"
            style={{
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              borderRadius: "8px",
            }}
          ></div>
        </div>
      </div>
    );
  }
}

export default Chart2Categorical;
