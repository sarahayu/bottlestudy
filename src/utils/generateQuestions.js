import * as d3 from "d3";

const NUM_QS_PER_GROUP = 5;

export default function generateQuestions() {
  const questions = {
    num_qs: 0,
    groups: [],
  };

  // [exceedance plot, water bottles] X [searching, exploring]
  epSearch(questions);
  epExplore(questions);
  wbSearch(questions);
  wbExplore(questions);

  return questions;
}

function epSearch(questions) {
  console.log("fdsa");
  questions.groups.push({
    type: "ep_search",
    qs: Array.from({ length: NUM_QS_PER_GROUP }, generateSearchQuestion),
  });

  questions.num_qs += NUM_QS_PER_GROUP;
}

function epExplore(questions) {
  questions.groups.push({
    type: "ep_explore",
    qs: Array.from({ length: NUM_QS_PER_GROUP }, generateExploreQuestion),
  });

  questions.num_qs += NUM_QS_PER_GROUP;
}

function wbSearch(questions) {
  questions.groups.push({
    type: "wb_search",
    qs: Array.from({ length: NUM_QS_PER_GROUP }, generateSearchQuestion),
  });

  questions.num_qs += NUM_QS_PER_GROUP;
}

function wbExplore(questions) {
  questions.groups.push({
    type: "wb_explore",
    qs: Array.from({ length: NUM_QS_PER_GROUP }, generateExploreQuestion),
  });

  questions.num_qs += NUM_QS_PER_GROUP;
}

const NUM_OPTS = 5,
  RANGE = [0, 100],
  OTHER_OPTN_BUFFER = 5;

function generateSearchQuestion() {
  const chosenType = d3.scaleQuantize().range([
    "medianClosestToX",
    "minClosestToX",
    // "likelyX",
    "consistent",
  ])(d3.randomUniform()());

  if (chosenType == "medianClosestToX") {
    const X = d3.randomInt(RANGE[0], RANGE[1] + 1)();
    const options = medianClosestToX(X);
    console.log(options);

    const shuffledOptionIdxs = d3.shuffle(d3.range(options.length));
    const correctAnswerIdx = shuffledOptionIdxs.indexOf(0);

    return {
      prompt: `Which scenario has a median closest to ${X} TAF?`,
      possibleAns: shuffledOptionIdxs.map((i) => options[i]),
      correctAns: correctAnswerIdx,
    };
  }

  if (chosenType == "minClosestToX") {
    const X = d3.randomInt(RANGE[0], RANGE[1] + 1)();
    const options = minClosestToX(X);

    const shuffledOptionIdxs = d3.shuffle(d3.range(options.length));
    const correctAnswerIdx = shuffledOptionIdxs.indexOf(0);

    return {
      prompt: `Which scenario has a minimum closest to ${X} TAF?`,
      possibleAns: shuffledOptionIdxs.map((i) => options[i]),
      correctAns: correctAnswerIdx,
    };
  }

  if (chosenType == "likelyX") {
    // TODO how
  }

  if (chosenType == "consistent") {
    const isMost = d3.randomInt(2)() == 0;

    const options = consistent(isMost);

    const shuffledOptionIdxs = d3.shuffle(d3.range(options.length));
    const correctAnswerIdx = shuffledOptionIdxs.indexOf(0);

    return {
      prompt: `Which scenario has the ${
        isMost ? "most" : "least"
      } consistent TAF?`,
      possibleAns: shuffledOptionIdxs.map((i) => options[i]),
      correctAns: correctAnswerIdx,
    };
  }

  return {};
}

function generateExploreQuestion() {
  const conditions = pickConditions();
  const appliedConds = {};
  const possibleAns = [];
  const correctAns = [];

  const medianBoundsPadding = Math.abs(RANGE[1] - RANGE[0]) / 5;
  const minBoundsPadding = Math.abs(RANGE[1] - RANGE[0]) / 10;

  let minimumMedian = RANGE[0] + medianBoundsPadding,
    maximumMedian = RANGE[1] - medianBoundsPadding,
    minimumMinimum = RANGE[0] + minBoundsPadding;

  if (conditions.includes("medianCloser")) {
    let X, Y;
    const minDist = Math.abs(RANGE[1] - RANGE[0]) / 3;

    X = d3.randomInt(RANGE[0] + medianBoundsPadding, RANGE[1] + 1)();

    while (1) {
      Y = d3.randomInt(RANGE[0], RANGE[1] + 1)();
      if (Math.abs(Y - X) >= minDist) break;
    }

    appliedConds.medianCond = condMedianCloserToXThanY(
      X,
      Y,
      medianBoundsPadding
    );

    const possibleAnsToThis = [
      `All scenarios have a median closer to ${X} than to ${Y} TAF`,
      `All scenarios have a median closer to ${Y} than to ${X} TAF`,
    ];

    const shuffledAnsIdx = d3.shuffle(d3.range(possibleAnsToThis.length));
    const correctAnsIdx = shuffledAnsIdx.indexOf(0);

    correctAns.push(possibleAns.length + correctAnsIdx);
    possibleAns.push(...shuffledAnsIdx.map((i) => possibleAnsToThis[i]));

    minimumMedian = Math.max(
      RANGE[0] + medianBoundsPadding,
      X - Math.abs(X - Y) / 2
    );
    maximumMedian = Math.min(
      X + Math.abs(X - Y) / 2,
      RANGE[1] - medianBoundsPadding
    );
  }

  if (conditions.includes("minCloser")) {
    let X, Y;
    const minDist = Math.abs(RANGE[1] - RANGE[0]) / 5;

    X = d3.randomInt(
      RANGE[0] + minBoundsPadding,
      Math.floor(minimumMedian) + 1
    )();

    while (1) {
      Y = d3.randomInt(RANGE[0], RANGE[1] + 1)();
      if (Math.abs(Y - X) >= minDist) break;
    }

    appliedConds.minCond = condMinCloserToX(X, Y, minBoundsPadding);

    const possibleAnsToThis = [
      `All scenarios have a minimum closer to ${X} than to ${Y} TAF`,
      `All scenarios have a minimum closer to ${Y} than to ${X} TAF`,
    ];

    const shuffledAnsIdx = d3.shuffle(d3.range(possibleAnsToThis.length));
    const correctAnsIdx = shuffledAnsIdx.indexOf(0);

    correctAns.push(possibleAns.length + correctAnsIdx);
    possibleAns.push(...shuffledAnsIdx.map((i) => possibleAnsToThis[i]));

    minimumMinimum = Math.max(
      RANGE[0] + minBoundsPadding,
      X - Math.abs(X - Y) / 2
    );
  }

  if (conditions.includes("atLeast")) {
    const realMin = d3.randomInt(RANGE[0], Math.floor(minimumMinimum) + 1)();

    if (appliedConds.minCond === undefined) {
      appliedConds.minCond = (x) => x >= realMin;
    }

    correctAns.push(possibleAns.length);
    possibleAns.push(`All scenarios get at least ${realMin} TAF`);
  }
  // possibly add a red herring
  else if (d3.randomInt(2)() == 0) {
    const fakeMin = d3.randomInt(
      Math.floor(minimumMinimum),
      Math.floor(minimumMedian) + 1
    )();

    if (appliedConds.minCond === undefined) {
      appliedConds.minCond = (x) => x < fakeMin;
    }

    possibleAns.push(`All scenarios get at least ${fakeMin} TAF`);
  }

  if (conditions.includes("lessThan")) {
    const realMax = d3.randomInt(Math.floor(maximumMedian), RANGE[1] + 1)();

    appliedConds.maxCond = (x) => x <= realMax;

    correctAns.push(possibleAns.length);
    possibleAns.push(`All scenarios get less than ${realMax} TAF`);
  }
  // possibly add a red herring
  else if (d3.randomInt(2)() == 0) {
    const fakeMax = d3.randomInt(Math.floor(maximumMedian), RANGE[1] + 1)();

    appliedConds.maxCond = (x) => x > fakeMax;

    possibleAns.push(`All scenarios get less than ${fakeMax} TAF`);
  }

  const options = generateData(appliedConds, NUM_OPTS, RANGE);

  return {
    prompt:
      "Which of these statements are true for ALL scenarios? Select ALL that apply.",
    data: options,
    possibleAns: possibleAns,
    correctAns: correctAns,
  };
}

function pickConditions() {
  const conds = d3.shuffle([
    "medianCloser",
    "minCloser",
    "atLeast",
    "lessThan",
  ]);
  const appliedConds = conds.slice(0, d3.randomInt(2, conds.length)());

  return appliedConds;
}

// in all of the below cases, correct answer is the first element

// Which scenario has a median closest to X TAF?
function medianClosestToX(X) {
  return [
    ...generateData({ medianCond: X }, 1, RANGE),
    // make other options have a median some distance away from actual median
    ...generateData(
      {
        medianCond: (x) =>
          x > X + OTHER_OPTN_BUFFER || x < X - OTHER_OPTN_BUFFER,
      },
      NUM_OPTS - 1,
      RANGE
    ),
  ];
}
// Which scenario has a minimum closest to X TAF?
function minClosestToX(X) {
  return [
    ...generateData({ minCond: X }, 1, RANGE),
    // make other options have a min some distance away from actual median
    ...generateData(
      {
        minCond: (x) => x > X + OTHER_OPTN_BUFFER || x < X - OTHER_OPTN_BUFFER,
      },
      NUM_OPTS - 1,
      RANGE
    ),
  ];
}
// // Which scenario is [most, least] likely to get at least X TAF?
// TODO: how
// function likelyX(isMost, X) {
//   return [
//     ...generateData({ minCond: X }, 1, RANGE),
//     ...generateData(
//       { minCond: (x) => x > X + OTHER_OPTN_BUFFER },
//       NUM_OPTS - 1,
//       RANGE
//     ),
//   ];
// }
// Which scenario has the [most, least] consistent TAF?
function consistent(isMost) {
  const rangeSize = RANGE[1] - RANGE[0];

  // make correct answer have the smallest sd
  if (isMost)
    return [
      ...generateData({ sd: rangeSize / 8 }, 1, RANGE),
      ...generateData({ sd: (x) => x > rangeSize / 8 }, NUM_OPTS - 1, RANGE),
    ];
  // make correct answer have the largest sd
  else
    return [
      ...generateData({ sd: rangeSize / 3 }, 1, RANGE),
      ...generateData({ sd: (x) => x < rangeSize / 3 }, NUM_OPTS - 1, RANGE),
    ];
}

// The median is closer to [X, Y] than [Y, X] TAF.
function condMedianCloserToXThanY(X, Y, boudsPadding) {
  const halfDist = Math.abs(Y - X) / 2;

  if (X < Y) {
    return (x) => RANGE[0] + boudsPadding < x && x < X + halfDist;
  } else {
    return (x) => X - halfDist < x && x < RANGE[1] - boudsPadding;
  }
}
// The minimum is closer to [X, Y] than [Y, X] TAF.
function condMinCloserToX(X, Y, boudsPadding) {
  const halfDist = Math.abs(Y - X) / 2;

  if (X < Y) {
    return (x) => RANGE[0] + boudsPadding < x && x < X + halfDist;
  } else {
    return (x) => X - halfDist < x && x < RANGE[1] - boudsPadding;
  }
}
// All scenarios get at least X TAF.
function condAtLeastX(X) {
  return (x) => x >= X;
}
// All scenarios get less than X TAF.
function condLessThan(X) {
  return (x) => x <= X;
}

// to make my life easier, make bounds condition (min max) and sd condition exclusive
// (i.e. if we have bounds, ignore sd. otherwise, use sd if it exists.)
function generateData(
  { _medianCond = null, _minCond = null, _maxCond = null, _sdCond = null },
  numOpts,
  range = [0, 100]
) {
  const datas = [];

  const hasMedianCond = _medianCond === 0 || !!_medianCond,
    hasMinCond = _minCond === 0 || !!_minCond,
    hasMaxCond = _maxCond === 0 || !!_maxCond,
    hasSdCond = _sdCond === 0 || !!_sdCond;

  const medianCond = hasMedianCond ? _medianCond : () => true;
  const minCond = hasMinCond ? _minCond : () => true;
  const maxCond = hasMaxCond ? _maxCond : () => true;
  const sdCond = hasSdCond ? _sdCond : () => true;

  for (let i = 0; i < numOpts; i++) {
    let median, min, max, sd;

    if (typeof medianCond === "function")
      while (1) {
        median = d3.randomInt(range[0], range[1] + 1)();
        if (medianCond(median)) break;
      }
    else median = medianCond;

    if (typeof minCond === "function")
      while (1) {
        min = d3.randomInt(range[0], range[1] + 1)();
        if (minCond(min)) break;
      }
    else min = minCond;

    if (typeof maxCond === "function")
      while (1) {
        max = d3.randomInt(range[0], range[1] + 1)();
        if (maxCond(max)) break;
      }
    else max = maxCond;

    if (typeof sdCond === "function")
      while (1) {
        sd = d3.randomInt(range[0], range[1] + 1)();
        if (sdCond(sd)) break;
      }
    else sd = sdCond;

    // generate array of 203 numbers with specified conditions
    const numbers = [];

    if (hasMinCond || hasMaxCond) {
      // guarantee that median, min, and max will be in final dataset
      numbers.push(median, min, max);

      numbers.push(
        ...Array.from({ length: 100 }, d3.randomUniform(min, median))
      );
      numbers.push(
        ...Array.from({ length: 100 }, d3.randomUniform(median, max))
      );
    } else {
      numbers.push(...Array.from({ length: 203 }, d3.randomNormal(0, sd / 10)));

      const medianActual = d3.median(numbers);

      // guarantee that median will be in final dataset
      for (let i = 0; i < numbers.length; i++) {
        numbers[i] += median - medianActual;
      }
    }

    numbers.sort(d3.descending);
    datas.push(numbers);
  }

  return datas;
}

function clamp(a, x, b) {
  return Math.max(a, Math.min(x, b));
}
