import React, { Component } from "react";
import * as d3 from "d3";
import { categoryColorScale } from "../utils/colorScales";

class Chart3Interactions extends Component {
  constructor(props) {
    super(props);
    this.margin = { top: 40, right: 40, bottom: 80, left: 80 };
    this.socialFactors = [
      { key: "Distance_From_Home", label: "Distance From Home" },
      { key: "Peer_Influence", label: "Peer Influence" },
      { key: "Motivation_Level", label: "Motivation Level" },
    ];
    this.state = {
      selectedFactor: this.socialFactors[0].key,
    };
  }

  componentDidMount() {
    // Use setTimeout to ensure DOM is fully rendered
    setTimeout(() => {
      this.drawChart();
    }, 100);
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.data !== this.props.data ||
      prevState.selectedFactor !== this.state.selectedFactor
    ) {
      // Use setTimeout to ensure DOM is fully rendered
      setTimeout(() => {
        this.drawChart();
      }, 100);
    }
  }

  // Categorize numeric values into Low, Medium, High
  categorizeValue(value, min, max) {
    const range = max - min;
    const third = range / 3;
    if (value < min + third) return "Low";
    if (value < min + 2 * third) return "Medium";
    return "High";
  }

  // All social factors are categorical
  isCategorical(factorKey) {
    return true; // All social factors are categorical
  }

  createBarChart(containerId, factorName, categoryData, categories) {
    const container = document.getElementById(containerId);
    if (!container || !categoryData || categoryData.length === 0) {
      return;
    }

    // Clear previous
    d3.select(container).selectAll("*").remove();

    // Get container dimensions - force a minimum width
    let containerWidth = container.offsetWidth || container.clientWidth;
    if (!containerWidth || containerWidth === 0) {
      // Try parent element or use default
      containerWidth =
        container.parentElement?.offsetWidth ||
        container.parentElement?.clientWidth ||
        800;
    }

    // Ensure minimum width
    if (containerWidth < 400) {
      containerWidth = 800;
    }

    const containerHeight = 400;
    const width = containerWidth - this.margin.left - this.margin.right;
    const height = containerHeight - this.margin.top - this.margin.bottom;

    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", containerWidth)
      .attr("height", containerHeight);

    const g = svg
      .append("g")
      .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

    // Scales
    const xScale = d3
      .scaleBand()
      .domain(categories)
      .range([0, width])
      .padding(0.2);

    const allScores = categoryData.map((d) => d.avgScore);
    const yScale = d3
      .scaleLinear()
      .domain([d3.min(allScores) * .97 , d3.max(allScores) * 1.01])
      .nice()
      .range([height, 0]);

    // Draw bars
    categoryData.forEach((d) => {
      const bar = g
        .append("rect")
        .attr("x", xScale(d.category))
        .attr("y", yScale(d.avgScore))
        .attr("width", xScale.bandwidth())
        .attr("height", height - yScale(d.avgScore))
        .attr("fill", categoryColorScale(d.category))
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
        .style("cursor", "pointer")
        .on("mouseover", function () {
          d3.select(this).attr("opacity", 0.8);
        })
        .on("mouseout", function () {
          d3.select(this).attr("opacity", 1);
        });

      // Value label on top of bar
      if (d.avgScore > 5) {
        g.append("text")
          .attr("x", xScale(d.category) + xScale.bandwidth() / 2)
          .attr("y", yScale(d.avgScore) - 5)
          .attr("text-anchor", "middle")
          .attr("font-size", "12px")
          .attr("font-weight", "600")
          .attr("fill", "#2d3748")
          .text(d.avgScore.toFixed(1));
      }
    });

    // Axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("font-size", "12px")
      .attr("font-weight", "500");

    g.append("g")
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .attr("font-size", "11px");

    // Axis labels
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - this.margin.left)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("font-weight", "500")
      .text("Average Exam Score");

    g.append("text")
      .attr(
        "transform",
        `translate(${width / 2}, ${height + this.margin.bottom - 10})`
      )
      .style("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("font-weight", "500")
      .text(`${factorName} Category`);

    // Title
    svg
      .append("text")
      .attr("x", containerWidth / 2)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .text(`${factorName} vs Exam Score`);
  }

  drawChart() {
    const { data } = this.props;
    const { selectedFactor } = this.state;
    if (!data || data.length === 0) {
      return;
    }

    const factorInfo = this.socialFactors.find((f) => f.key === selectedFactor);
    if (!factorInfo) {
      return;
    }

    // Check if the column exists in the data
    const sampleRow = data[0];
    if (!sampleRow) {
      return;
    }

    // Try to find the column (case-insensitive)
    const availableKeys = Object.keys(sampleRow);
    const matchingKey = availableKeys.find(
      (k) =>
        k.toLowerCase() === selectedFactor.toLowerCase() ||
        k.replace(/\s+/g, "_") === selectedFactor ||
        k === selectedFactor
    );

    if (!matchingKey) {
      // Show error message in the container
      const container = document.getElementById("social-chart-container");
      if (container) {
        d3.select(container).selectAll("*").remove();
        container.innerHTML = `<div style="padding: 20px; text-align: center; color: #e74c3c; border: 2px solid #e74c3c; border-radius: 8px; background: #fee;">
          <p style="font-weight: bold; margin-bottom: 10px;">Column "${selectedFactor}" not found in data.</p>
          <p style="font-size: 12px;">Available columns: ${availableKeys
            .slice(0, 15)
            .join(", ")}${availableKeys.length > 15 ? "..." : ""}</p>
        </div>`;
      }
      return;
    }

    // Use the matching key instead of selectedFactor
    const actualFactorKey = matchingKey;

    let categoryData = [];
    let categories = [];

    // All social factors are categorical - use existing categories
    const grouped = d3.group(data, (d) => d[actualFactorKey]);
    categories = Array.from(grouped.keys())
      .filter((k) => k !== null && k !== undefined && k !== "")
      .sort((a, b) => {
        // Try to sort by common category orders
        const order = ["Low", "Medium", "High", "Very Low", "Very High"];
        const aIndex = order.indexOf(a);
        const bIndex = order.indexOf(b);
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        // If one is in order and other isn't, prioritize the one in order
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        // Otherwise alphabetical
        return String(a).localeCompare(String(b));
      });

    if (categories.length === 0) {
      return;
    }

    categoryData = categories.map((cat) => {
      const filtered = data.filter((d) => d[actualFactorKey] === cat);
      const avgScore = d3.mean(filtered, (d) => d.Exam_Score);
      return {
        category: cat,
        avgScore: avgScore || 0,
        count: filtered.length,
      };
    });

    if (categoryData.length === 0) {
      return;
    }

    // Create chart directly - container should be ready by now
    this.createBarChart(
      "social-chart-container",
      factorInfo.label,
      categoryData,
      categories
    );
  }

  render() {
    const { selectedFactor } = this.state;

    return (
      <div>
        <div style={{ marginBottom: "30px" }}>
          <h2
            style={{
              textAlign: "center",
              fontSize: "20px",
              fontWeight: "bold",
              marginBottom: "20px",
              color: "#2d3748",
            }}
          >
            How Do Social Factors Affect Overall Performance?
          </h2>
        </div>
        <div
          style={{
            marginBottom: "20px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <label
            htmlFor="social-factor-select"
            style={{
              marginRight: "10px",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Select Social Factor:
          </label>
          <select
            id="social-factor-select"
            value={selectedFactor}
            onChange={(e) => this.setState({ selectedFactor: e.target.value })}
            style={{
              padding: "8px 12px",
              fontSize: "14px",
              borderRadius: "6px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#fff",
              cursor: "pointer",
              minWidth: "200px",
            }}
          >
            {this.socialFactors.map((factor) => (
              <option key={factor.key} value={factor.key}>
                {factor.label}
              </option>
            ))}
          </select>
        </div>
        <div style={{ width: "100%", minHeight: "400px" }}>
          <div
            id="social-chart-container"
            style={{ width: "100%", height: "400px" }}
          ></div>
        </div>
      </div>
    );
  }
}

export default Chart3Interactions;
