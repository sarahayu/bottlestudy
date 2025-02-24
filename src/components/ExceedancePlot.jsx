import * as d3 from "d3";
import { useLayoutEffect, useRef } from "react";

import ticksExact from "utils/ticksExact";

const RESOLUTION = 100;

export default function ExceedancePlot({
  levelInterp,
  maxValue = 100,
  width = 200,
  height = 400,
}) {
  const CHART_MARGIN = {
    top: 30,
    right: 30,
    bottom: 30,
    left: 30,
  };

  const svgElement = useRef();

  useLayoutEffect(function initialize() {
    const svgContainer = svgElement.current
      .attr("width", width + CHART_MARGIN.left + CHART_MARGIN.right)
      .attr("height", height + CHART_MARGIN.top + CHART_MARGIN.bottom)
      .append("g")
      .attr("class", "exceedance-plot")
      .attr("transform", `translate(${CHART_MARGIN.left},${CHART_MARGIN.top})`);

    svgContainer.append("path").attr("class", "chart-line");

    svgContainer
      .append("g")
      .attr("class", "chart-axis-x")
      .attr("transform", `translate(0, ${height})`);
    svgContainer.append("g").attr("class", "chart-axis-y");
    svgContainer
      .append("g")
      .attr("class", "chart-grid-x")
      .attr("transform", `translate(0, ${height})`);
    svgContainer.append("g").attr("class", "chart-grid-y");
  }, []);

  useLayoutEffect(
    function onDataChange() {
      // const maxHeight = 0.95;
      // const minHeight = 0.05;
      const liquidLevels = ticksExact(0, 1, RESOLUTION).map(
        (d) => levelInterp(d) * maxValue
      );

      const x = d3.scaleLinear().domain([0, 100]).range([0, width]);

      const y = d3.scaleLinear().domain([0, maxValue]).range([height, 0]);

      svgElement.current
        .select(".chart-axis-x")
        .call(d3.axisBottom(x).ticks(5).tickSizeInner(-height));

      // svgElement.current
      //   .select(".chart-grid-x")
      //   .call(d3.axisBottom(x).ticks(5).tickSizeInner(-width));

      svgElement.current
        .select(".chart-axis-y")
        .call(d3.axisLeft(y).ticks(4).tickSizeInner(-width));
      // svgElement.current
      //   .select(".chart-grid-y")
      //   .call(d3.axisLeft(y).ticks(5).tickSizeInner(-height));

      svgElement.current
        .select(".chart-line")
        .datum(liquidLevels)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 3)
        .attr(
          "d",
          d3
            .line()
            .x(function (d, i) {
              return x(i);
            })
            .y(function (d) {
              return y(d);
            })
        );
    },
    [levelInterp]
  );

  return (
    <div className="ep-wrapper">
      <svg ref={(e) => void (svgElement.current = d3.select(e))}></svg>
    </div>
  );
}
