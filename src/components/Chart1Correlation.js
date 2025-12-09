import React, { Component } from "react";
import * as d3 from "d3";
import { binData } from "../utils/dataProcessor";
import { getNumericFactors } from "../utils/dataLoader";

class Chart1Correlation extends Component {
  constructor(props) {
    super(props);
    this.factors = getNumericFactors();
    this.state = {
      selectedFactor: this.factors[0] || "",
    };
    this.margin = { top: 40, right: 40, bottom: 60, left: 80 };
  }

  componentDidMount() {
    this.drawChart();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.data !== this.props.data ||
      prevState.selectedFactor !== this.state.selectedFactor
    ) {
      this.drawChart();
    }
  }

  drawChart() {
    const { data } = this.props;
    const { selectedFactor } = this.state;
    const container = document.getElementById("chart1-container");

    if (!data || data.length === 0 || !container || !selectedFactor) return;

    // Clear previous
    d3.select(container).selectAll("*").remove();

    const containerWidth = container.offsetWidth;
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

    // Create binned data for the selected factor
    const binnedData = binData(data, selectedFactor, "Exam_Score", 10);

    // Scales - use actual factor values, not normalized
    const binCenters = binnedData.map((b) => b.binCenter);
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(binCenters))
      .nice()
      .range([0, width]);

    const scores = binnedData.map((b) => b.avgScore);
    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(scores))
      .nice()
      .range([height, 0]);

    // Line generator
    const line = d3
      .line()
      .x((d) => xScale(d.binCenter))
      .y((d) => yScale(d.avgScore))
      .curve(d3.curveMonotoneX);

    // Draw line
    g.append("path")
      .datum(binnedData)
      .attr("fill", "none")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 3)
      .attr("d", line);

    // Add circles for data points
    g.selectAll(".point")
      .data(binnedData)
      .enter()
      .append("circle")
      .attr("class", "point")
      .attr("cx", (d) => xScale(d.binCenter))
      .attr("cy", (d) => yScale(d.avgScore))
      .attr("r", 5)
      .attr("fill", "#3b82f6")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .on("mouseover", function (event, d) {
        d3.select(this).attr("r", 7);
      })
      .on("mouseout", function () {
        d3.select(this).attr("r", 5);
      });

    // Axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(8))
      .selectAll("text")
      .attr("font-size", "13px");

    g.append("g")
      .call(d3.axisLeft(yScale).ticks(8))
      .selectAll("text")
      .attr("font-size", "13px");

    // Axis labels
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - this.margin.left)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .attr("font-size", "16px")
      .attr("font-weight", "500")
      .text("Average Exam Score");

    g.append("text")
      .attr(
        "transform",
        `translate(${width / 2}, ${height + this.margin.bottom - 10})`
      )
      .style("text-anchor", "middle")
      .attr("font-size", "16px")
      .attr("font-weight", "500")
      .text(selectedFactor.replace(/_/g, " "));

    // Title
    svg
      .append("text")
      .attr("x", containerWidth / 2)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .attr("font-size", "20px")
      .attr("font-weight", "bold")
      .text(`Correlation: ${selectedFactor.replace(/_/g, " ")} vs Exam Score`);
  }

  render() {
    const { selectedFactor } = this.state;

    return (
      <div>
        <div
          style={{
            marginBottom: "20px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <label
            htmlFor="factor-select"
            style={{
              marginRight: "10px",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Select Factor:
          </label>
          <select
            id="factor-select"
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
            {this.factors.map((factor) => (
              <option key={factor} value={factor}>
                {factor.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div id="chart1-container"></div>
        </div>
      </div>
    );
  }
}

export default Chart1Correlation;
