import * as d3 from "d3";

export default function inverseRandomRange({
  lowerBound,
  upperBound,
  min = lowerBound,
  max = upperBound,
}) {
  lowerBound = Math.max(lowerBound, min);
  upperBound = Math.min(upperBound, max);
  const choices = max - upperBound + lowerBound - min;
  if (choices === 0) console.error("Invalid range");

  let delta = d3.randomInt(0, choices + 1)() - (lowerBound - min);

  if (delta < 0) {
    return lowerBound + delta;
  } else {
    delta += 1;
    return upperBound + delta;
  }
}
