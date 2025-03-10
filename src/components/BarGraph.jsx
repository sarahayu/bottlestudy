import * as d3 from "d3";
import { useLayoutEffect, useRef } from "react";

export default function BarGraph({
  data,
  title,
  sorted = false,
  axisLeft = null,
  axisBottom = null,
  maxValue = 100,
  width = 400,
  height = 200,
}) {
  const CHART_MARGIN = {
    top: 40,
    right: 10,
    bottom: 50,
    left: 60,
  };

  const svgElement = useRef();

  useLayoutEffect(function initialize() {
    const svgContainer = svgElement.current
      .attr("width", width + CHART_MARGIN.left + CHART_MARGIN.right)
      .attr("height", height + CHART_MARGIN.top + CHART_MARGIN.bottom)
      .append("g")
      .attr("class", "bar-graph")
      .attr("transform", `translate(${CHART_MARGIN.left},${CHART_MARGIN.top})`);

    svgContainer
      .append("g")
      .attr("class", "chart-title")
      .attr("transform", `translate(${width / 2}, ${-10})`)
      .append("text")
      .style("text-anchor", "middle")
      .style("font-weight", "bold")
      .style("font-size", 22);

    svgContainer
      .append("g")
      .attr("class", "chart-axis-x")
      .attr("transform", `translate(0, ${height})`);
    svgContainer.append("g").attr("class", "chart-axis-y");

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
      const x = d3
        .scaleBand()
        .range([0, width])
        .domain(d3.range(data.length))
        .padding(0);

      const y = d3.scaleLinear().domain([0, maxValue]).range([height, 0]);
      svgElement.current.select(".chart-title text").text(title);

      if (axisBottom) {
        svgElement.current
          .select(".chart-axis-x")
          .call(
            d3
              .axisBottom(x)
              .tickFormat((_, i) => `${(i + 1) * 10}`)
              .tickValues(
                x.domain().filter(function (_, i) {
                  return !((i + 1) % 10);
                })
              )
          )
          .selectAll("text")
          .style("font-size", 14);

        svgElement.current.select(".chart-x-label text").text(axisBottom);
      }

      if (axisLeft) {
        svgElement.current
          .select(".chart-axis-y")
          .call(d3.axisLeft(y).ticks(4).tickSizeInner(-width))
          .selectAll("text")
          .style("font-size", 14);

        svgElement.current.select(".chart-y-label text").text(axisLeft);
      }

      svgElement.current.selectAll(".bar-graph bars").remove();

      svgElement.current
        .select(".bar-graph")
        .selectAll("bars")
        .data(data)
        .join("rect")
        .attr("x", (d, i) => x(i))
        .attr("y", (d) => y(d))
        .attr("width", x.bandwidth())
        .attr("height", (d) => height - y(d))
        .attr("fill", "steelblue");
    },
    [data, title, sorted, axisLeft, axisBottom, maxValue]
  );

  return (
    <div className="bg-wrapper">
      <svg ref={(e) => void (svgElement.current = d3.select(e))}></svg>
    </div>
  );
}
