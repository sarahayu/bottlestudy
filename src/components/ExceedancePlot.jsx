import * as d3 from "d3";
import { useLayoutEffect, useRef } from "react";

import ticksExact from "utils/ticksExact";

const RESOLUTION = 100;

export default function ExceedancePlot({
  levelInterp,
  title,
  axisLeft,
  axisBottom,
  maxValue = 100,
  width = 200,
  height = 400,
}) {
  const CHART_MARGIN = {
    top: 30,
    right: 30,
    bottom: 50,
    left: 60,
  };

  const svgElement = useRef();

  useLayoutEffect(function initialize() {
    const svgContainer = svgElement.current
      .attr("width", width + CHART_MARGIN.left + CHART_MARGIN.right)
      .attr("height", height + CHART_MARGIN.top + CHART_MARGIN.bottom)
      .append("g")
      .attr("class", "exceedance-plot")
      .attr("transform", `translate(${CHART_MARGIN.left},${CHART_MARGIN.top})`);

    svgContainer
      .append("g")
      .attr("class", "chart-title")
      .attr("transform", `translate(${width / 2}, ${-10})`)
      .append("text")
      .style("text-anchor", "middle")
      .style("font-weight", "bold")
      .style("font-size", 22);

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

    svgContainer
      .append("g")
      .attr("class", "chart-x-label")
      .attr("transform", `translate(${width / 2}, ${height + 30})`)
      .append("text")
      .style("text-anchor", "middle")
      .style("dominant-baseline", "hanging")
      .style("font-size", 18);

    svgContainer
      .append("g")
      .attr("class", "chart-y-label")
      .attr("transform", `translate(${-40}, ${height / 2}) rotate(-90)`)
      .append("text")
      .style("text-anchor", "middle")
      .style("font-size", 18);
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

      svgElement.current.select(".chart-axis-x").call(
        d3
          .axisBottom(x)
          .ticks(5)
          .tickSizeInner(-height)
          .tickFormat((d) => (d == 0 ? "" : `${d}%`))
      );

      // svgElement.current
      //   .select(".chart-grid-x")
      //   .call(d3.axisBottom(x).ticks(5).tickSizeInner(-width));

      svgElement.current
        .select(".chart-axis-y")
        .call(d3.axisLeft(y).ticks(4).tickSizeInner(-width));
      // svgElement.current
      //   .select(".chart-grid-y")
      //   .call(d3.axisLeft(y).ticks(5).tickSizeInner(-height));

      svgElement.current.select(".chart-x-label text").text(axisBottom);
      svgElement.current.select(".chart-y-label text").text(axisLeft);
      svgElement.current.select(".chart-title text").text(title);
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
    [levelInterp, title, axisLeft, axisBottom, maxValue]
  );

  return (
    <div className="ep-wrapper">
      <svg ref={(e) => void (svgElement.current = d3.select(e))}></svg>
    </div>
  );
}
