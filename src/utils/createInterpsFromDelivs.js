import * as d3 from "d3";
import ticksExact from "./ticksExact";

export default function createInterpsFromDelivs(delivs, minDelivs, maxDelivs) {
  return d3
    .scaleLinear()
    .domain(ticksExact(0, 1, delivs.length))
    .range(
      delivs.map((v) => Math.min(1, (v - minDelivs) / (maxDelivs - minDelivs)))
    )
    .clamp(true);
}
