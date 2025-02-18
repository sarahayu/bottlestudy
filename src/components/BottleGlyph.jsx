import * as d3 from "d3";
import { useLayoutEffect, useRef } from "react";

import {
  bucketGlyph,
  bucketShape,
  transitionSway,
} from "bucket-lib/bucket-glyph";
import { interpolateWatercolorBlue } from "bucket-lib/utils";
import ticksExact from "utils/ticksExact";

const LEVELS = 4;

function drawBottle(context, width, height) {
  const bottleWidth = height / 2;
  const capWidth = (bottleWidth * 2) / 3;
  const capHeight = capWidth / 2;
  const cornerRad = capHeight / 3;
  const capCornerRad = cornerRad / 2;

  context.moveTo(capWidth / 2, -height / 2);
  context.lineTo(-bottleWidth / 2 + cornerRad, -height / 2);
  context.arc(
    -bottleWidth / 2 + cornerRad,
    -height / 2 + cornerRad,
    cornerRad,
    (Math.PI * 3) / 2,
    Math.PI,
    true
  );
  context.lineTo(-bottleWidth / 2, height / 2 - cornerRad);
  context.arc(
    -bottleWidth / 2 + cornerRad,
    height / 2 - cornerRad,
    cornerRad,
    Math.PI,
    Math.PI / 2,
    true
  );
  context.lineTo(bottleWidth / 2 - cornerRad, height / 2);
  context.arc(
    bottleWidth / 2 - cornerRad,
    height / 2 - cornerRad,
    cornerRad,
    Math.PI / 2,
    0,
    true
  );
  context.lineTo(bottleWidth / 2, -height / 2 + cornerRad);
  context.arc(
    bottleWidth / 2 - cornerRad,
    -height / 2 + cornerRad,
    cornerRad,
    0,
    (Math.PI * 3) / 2,
    true
  );
  context.lineTo(capWidth / 2, -height / 2);
  context.lineTo(capWidth / 2, -height / 2 - capHeight + capCornerRad);
  context.arc(
    capWidth / 2 - capCornerRad,
    -height / 2 - capHeight + capCornerRad,
    capCornerRad,
    0,
    (Math.PI * 3) / 2,
    true
  );
  context.lineTo(-capWidth / 2 + capCornerRad, -height / 2 - capHeight);
  context.arc(
    -capWidth / 2 + capCornerRad,
    -height / 2 - capHeight + capCornerRad,
    capCornerRad,
    (Math.PI * 3) / 2,
    Math.PI,
    true
  );
  context.lineTo(-capWidth / 2, -height / 2);
}

function drawBottleCap(context, width, bottleHeight) {
  const bottleWidth = bottleHeight / 2;
  const capWidth = (bottleWidth * 2) / 3;
  const capHeight = capWidth / 2;
  const cornerRad = capHeight / 3;
  const capCornerRad = cornerRad / 2;

  context.moveTo(capWidth / 2, -bottleHeight / 2);
  context.lineTo(capWidth / 2, -bottleHeight / 2 - capHeight + capCornerRad);
  context.arc(
    capWidth / 2 - capCornerRad,
    -bottleHeight / 2 - capHeight + capCornerRad,
    capCornerRad,
    0,
    (Math.PI * 3) / 2,
    true
  );
  context.lineTo(-capWidth / 2 + capCornerRad, -bottleHeight / 2 - capHeight);
  context.arc(
    -capWidth / 2 + capCornerRad,
    -bottleHeight / 2 - capHeight + capCornerRad,
    capCornerRad,
    (Math.PI * 3) / 2,
    Math.PI,
    true
  );
  context.lineTo(-capWidth / 2, -bottleHeight / 2);
  context.closePath();
}

export default function BottleGlyph({
  levelInterp,
  maxValue = 100,
  colorInterp = interpolateWatercolorBlue,
  width = 200,
  height = 400,
  resolution = LEVELS,
}) {
  const LINE_WIDTH = 3;
  const GLYPH_MARGIN = {
    top: LINE_WIDTH / 2 + height / 6,
    right: LINE_WIDTH / 2,
    bottom: LINE_WIDTH / 2,
    left: LINE_WIDTH / 2,
  };

  const svgElement = useRef();

  useLayoutEffect(function initialize() {
    const svgContainer = svgElement.current
      .attr("width", width + GLYPH_MARGIN.left + GLYPH_MARGIN.right)
      .attr("height", height + GLYPH_MARGIN.top + GLYPH_MARGIN.bottom)
      .append("g")
      .attr("class", "bucket")
      .attr("transform", `translate(${GLYPH_MARGIN.left},${GLYPH_MARGIN.top})`);

    svgContainer.call(bucketShape(width, height, drawBottle));

    const path = d3.path();
    drawBottleCap(path, width, height);

    svgContainer
      .append("path")
      .attr("class", "bottlecap")
      .attr("transform", `translate(${width / 2}, ${height / 2})`)
      .attr("stroke", "none")
      .attr("fill", "lightgray")
      .attr("d", path.toString());

    svgContainer
      .append("g")
      .attr("class", "bottle-axis")
      .attr("transform", `translate(${width / 2 - height / 8}, ${height / 2})`);
  }, []);

  useLayoutEffect(
    function onDataChange() {
      const maxHeight = 0.95;
      const minHeight = 0.05;
      const liquidLevels = ticksExact(0, 1, resolution + 1).map((d) =>
        levelInterp(d)
      );

      const glyph = bucketGlyph(width, height * (maxHeight - minHeight));

      const x = d3
        .scaleLinear()
        .domain([0, maxValue])
        .range([
          height / 2 - height * (1 - maxHeight),
          height / 2 - height * maxHeight,
        ]);

      svgElement.current
        .select(".bottle-axis")
        .call(
          d3.axisRight(x).ticks(4).tickSize(12).tickFormat(d3.format(".2s"))
        );

      const liquids = svgElement.current
        .select(".masked-area")
        .selectAll(".bucket-box")
        .data(glyph(liquidLevels))
        .join("rect")
        .attr("class", "bucket-box")
        .attr("width", (d) => d.width)
        .attr("height", (d) => d.height)
        .attr("x", (d) => d.x)
        .attr("fill", (_, i) => colorInterp(i / resolution));

      transitionSway(liquids, 200 / height).attr("y", (d) => d.y + minHeight);
    },
    [levelInterp]
  );

  return (
    <div className="bottle-wrapper">
      <svg ref={(e) => void (svgElement.current = d3.select(e))}></svg>
    </div>
  );
}
