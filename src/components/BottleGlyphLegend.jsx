import * as d3 from "d3";
import { useLayoutEffect, useRef } from "react";

import { interpolateWatercolorBlue } from "bucket-lib/utils";
import ticksExact from "utils/ticksExact";

const LEVELS = 4;

export default function BottleGlyphLegend({
  colorInterp = interpolateWatercolorBlue,
  label,
  width = 200,
  height = 400,
  resolution = LEVELS,
}) {
  const CHART_MARGIN = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  };

  const svgElement = useRef();

  useLayoutEffect(function initialize() {
    const svgContainer = svgElement.current
      .attr("width", width + CHART_MARGIN.left + CHART_MARGIN.right)
      .attr("height", height + CHART_MARGIN.top + CHART_MARGIN.bottom)
      .append("g")
      .attr("class", "legend-area")
      .attr("transform", `translate(${CHART_MARGIN.left},${CHART_MARGIN.top})`);

    svgContainer
      .append("g")
      .attr("class", "legend-label")
      .append("text")
      .style("dominant-baseline", "hanging")
      .text(label);

    const squareLen = (height * 0.7) / (resolution + 1);
    svgContainer
      .append("g")
      .attr("class", "legend-swatch")
      .attr("transform", `translate(${0}, ${30})`)
      .selectAll(".square")
      .data(ticksExact(0, 1, resolution + 1).map((d) => colorInterp(d)))
      .join("g")
      .attr("class", "square")
      .attr("transform", (_, i) => `translate(${0}, ${i * squareLen})`)
      .each(function (d, i) {
        d3.select(this)
          .append("rect")
          .attr("width", squareLen)
          .attr("height", squareLen)
          .attr("fill", d);

        d3.select(this)
          .append("text")
          .text(`${i * (100 / resolution)}%`)
          .attr("x", squareLen + 10)
          .attr("y", squareLen / 2)
          .style("dominant-baseline", "middle");
      });
  }, []);

  return (
    <div className="bottle-legend-wrapper">
      <svg ref={(e) => void (svgElement.current = d3.select(e))}></svg>
    </div>
  );
}
