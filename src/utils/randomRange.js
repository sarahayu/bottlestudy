import * as d3 from "d3";

// inclusive range
export default function randomRange(
  lowerBound,
  upperBound,
  min = lowerBound,
  max = upperBound
) {
  if (typeof lowerBound !== "number") {
    const {
      lowerBound: _lowerBound,
      upperBound: _upperBound,
      min: _min = _lowerBound,
      max: _max = _upperBound,
    } = lowerBound;

    lowerBound = _lowerBound;
    upperBound = _upperBound;
    min = _min;
    max = _max;
  }

  return d3.randomInt(
    Math.max(min, lowerBound),
    Math.min(max, upperBound) + 1
  )();
}
