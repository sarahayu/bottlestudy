import * as d3 from "d3";

const NUM_QS_PER_GROUP = 5;

export default function generateQuestions() {
  const questions = {
    num_qs: 0,
    groups: [],
  };

  // [exceedance plot, water bottles] X [searching, exploring]
  // epSearch(questions);
  epExplore(questions);
  // wbSearch(questions);
  wbExplore(questions);

  return questions;
}

function epSearch(questions) {
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
  RANGE_MIN = 0,
  RANGE_MAX = 20,
  OTHER_OPTN_BUFFER = 5;

function generateSearchQuestion() {
  const chosenType = d3.scaleQuantize().range([
    "medianClosestToX",
    "minClosestToX",
    // "likelyX",
    "consistent",
  ])(d3.randomUniform()());

  if (chosenType == "medianClosestToX") {
    const X = d3.randomInt(RANGE_MIN, RANGE_MAX + 1)();
    const options = medianClosestToX(X);

    const shuffledOptionIdxs = d3.shuffle(d3.range(options.length));
    const correctAnswerIdx = shuffledOptionIdxs.indexOf(0);

    return {
      prompt: `Which scenario has a median closest to ${X} TAF? Select the correct answer.`,
      possibleAns: shuffledOptionIdxs.map((i) => options[i]),
      correctAns: correctAnswerIdx,
    };
  }

  if (chosenType == "minClosestToX") {
    const X = d3.randomInt(RANGE_MIN, RANGE_MAX + 1)();
    const options = minClosestToX(X);

    const shuffledOptionIdxs = d3.shuffle(d3.range(options.length));
    const correctAnswerIdx = shuffledOptionIdxs.indexOf(0);

    return {
      prompt: `Which scenario has a minimum closest to ${X} TAF? Select the correct answer.`,
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
      } consistent TAF? Select the correct answer.`,
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

  const medianBoundsPadding = Math.abs(RANGE_MAX - RANGE_MIN) / 5;
  const minBoundsPadding = Math.abs(RANGE_MAX - RANGE_MIN) / 10;

  let minimumMedian = RANGE_MIN + medianBoundsPadding,
    maximumMedian = RANGE_MAX - medianBoundsPadding,
    minimumMinimum = RANGE_MIN + minBoundsPadding;

  let knownMinimum = null,
    knownMedian = null;

  if (conditions.includes("medianCloser")) {
    let X, Y;
    const minDist = Math.abs(RANGE_MAX - RANGE_MIN) / 3;

    X = d3.randomInt(RANGE_MIN, RANGE_MAX + 1)();

    while (1) {
      Y = d3.randomInt(RANGE_MIN + 1, RANGE_MAX)();
      if (Math.abs(Y - X) >= minDist) break;
    }

    concatConditions(appliedConds, {
      medianCond: condMedianCloserToXThanY(X, Y, medianBoundsPadding),
      //minCond: min is calculated after median in generateData, so it's guaranteed to be <= median
      //maxCond: max is calculated after min in generateData, so it's guaranteed to be >= min (and median)
    });

    const possibleAnsToThis = [
      `All scenarios have a median closer to ${X} than to ${Y} TAF`,
      `All scenarios have a median closer to ${Y} than to ${X} TAF`,
    ];

    const shuffledAnsIdx = d3.shuffle(d3.range(possibleAnsToThis.length));
    const correctAnsIdx = shuffledAnsIdx.indexOf(0);

    correctAns.push(possibleAns.length + correctAnsIdx);
    possibleAns.push(...shuffledAnsIdx.map((i) => possibleAnsToThis[i]));

    knownMedian = X;

    minimumMedian = Math.max(
      RANGE_MIN + medianBoundsPadding,
      X - Math.abs(X - Y) / 2
    );
    maximumMedian = Math.min(
      X + Math.abs(X - Y) / 2,
      RANGE_MAX - medianBoundsPadding
    );
  }

  if (conditions.includes("minCloser")) {
    let actualMinimum, adversarialMinimum;
    const minDist = Math.abs(RANGE_MAX - RANGE_MIN) / 5;

    const upperBoundOfMinimum = isNonNull(knownMedian)
      ? knownMedian
      : RANGE_MAX;

    actualMinimum = d3.randomInt(RANGE_MIN, upperBoundOfMinimum + 1)();

    while (1) {
      adversarialMinimum = d3.randomInt(RANGE_MIN, RANGE_MAX + 1)();
      if (Math.abs(adversarialMinimum - actualMinimum) >= minDist) break;
    }

    concatConditions(appliedConds, {
      medianCond: (possibleMedianExact) => actualMinimum <= possibleMedianExact,
      minCond: condMinCloserToX(actualMinimum, adversarialMinimum),
      //maxCond: max is calculated after min in generateData, so it's guaranteed to be >= min (and median)
    });

    const possibleAnsToThis = [
      `All scenarios have a minimum closer to ${actualMinimum} than to ${adversarialMinimum} TAF`,
      `All scenarios have a minimum closer to ${adversarialMinimum} than to ${actualMinimum} TAF`,
    ];

    const shuffledAnsIdx = d3.shuffle(d3.range(possibleAnsToThis.length));
    const correctAnsIdx = shuffledAnsIdx.indexOf(0);

    correctAns.push(possibleAns.length + correctAnsIdx);
    possibleAns.push(...shuffledAnsIdx.map((i) => possibleAnsToThis[i]));

    knownMinimum = actualMinimum;

    minimumMinimum = Math.max(
      RANGE_MIN + minBoundsPadding,
      actualMinimum - Math.abs(actualMinimum - adversarialMinimum) / 2
    );
  }

  if (conditions.includes("moreThan")) {
    const upperBoundOfMinimum = isNonNull(knownMinimum)
      ? knownMinimum
      : isNonNull(knownMedian)
      ? knownMedian
      : RANGE_MAX;
    const exclusiveMinimum = d3.randomInt(RANGE_MIN, upperBoundOfMinimum)();

    concatConditions(appliedConds, {
      medianCond: (possibleMedianExact) =>
        exclusiveMinimum < possibleMedianExact,
      minCond: (possibleMinExact) => exclusiveMinimum < possibleMinExact,
      //maxCond: max is calculated after min in generateData, so it's guaranteed to be >= min (and median)
    });

    correctAns.push(possibleAns.length);
    possibleAns.push(`All scenarios get more than ${exclusiveMinimum} TAF`);

    if (!isNonNull(knownMinimum)) knownMinimum = exclusiveMinimum + 1;
  }
  // possibly add an incorrect answer
  else if (d3.randomInt(2)() == 0) {
    const lowerBoundOfData = isNonNull(knownMinimum) ? knownMinimum : RANGE_MIN;
    const falseExclusiveMinimum = d3.randomInt(
      lowerBoundOfData + 1,
      RANGE_MAX + 1
    )();

    concatConditions(appliedConds, {
      minCond: (possibleMinExact) => possibleMinExact <= falseExclusiveMinimum,
    });

    possibleAns.push(
      `All scenarios get more than ${falseExclusiveMinimum} TAF`
    );
  }

  if (conditions.includes("lessThan")) {
    const lowerBoundOfMaximum = isNonNull(knownMedian)
      ? knownMedian
      : isNonNull(knownMinimum)
      ? knownMinimum
      : RANGE_MIN;
    const exclusiveMaximum = d3.randomInt(
      lowerBoundOfMaximum + 1,
      RANGE_MAX + 1
    )();

    concatConditions(appliedConds, {
      medianCond: (possibleMedianExact) =>
        possibleMedianExact < exclusiveMaximum,
      minCond: (possibleMinExact) => possibleMinExact < exclusiveMaximum,
      maxCond: (possibleMaxExact) => possibleMaxExact < exclusiveMaximum,
    });

    correctAns.push(possibleAns.length);
    possibleAns.push(`All scenarios get less than ${exclusiveMaximum} TAF`);
  }
  // possibly add an incorrect answer
  else if (d3.randomInt(2)() == 0) {
    const upperBoundOfData = RANGE_MAX;
    const falseExclusiveMax = d3.randomInt(RANGE_MIN, upperBoundOfData + 1)();

    concatConditions(appliedConds, {
      maxCond: (possibleMaxExact) => falseExclusiveMax <= possibleMaxExact,
    });

    possibleAns.push(`All scenarios get less than ${falseExclusiveMax} TAF`);
  }

  const options = generateData(appliedConds, NUM_OPTS, [RANGE_MIN, RANGE_MAX]);

  return {
    prompt:
      "Which of these statements are true for ALL scenarios? Select ALL that apply.",
    data: options,
    metadata: options.map((o) => [d3.min(o), d3.median(o), d3.max(o)]),
    possibleAns: possibleAns,
    correctAns: correctAns,
  };
}

function pickConditions() {
  const conds = d3.shuffle([
    "medianCloser",
    "minCloser",
    "moreThan",
    "lessThan",
  ]);
  const appliedConds = conds.slice(0, d3.randomInt(2, conds.length)());

  return appliedConds;
}

// in all of the below cases, correct answer is the first element

// Which scenario has a median closest to X TAF?
function medianClosestToX(X) {
  return [
    ...generateData(
      {
        medianCond: X,
        sdCond: (x) => x < Math.min(RANGE_MAX - X, X - RANGE_MIN) / 3,
      },
      1,
      [RANGE_MIN, RANGE_MAX]
    ),
    // make other options have a median some distance away from actual median
    ...generateData(
      {
        medianCond: (x) =>
          x > X + OTHER_OPTN_BUFFER || x < X - OTHER_OPTN_BUFFER,
        sdCond: (x) => x < Math.min(RANGE_MAX - X, X - RANGE_MIN) / 3,
      },
      NUM_OPTS - 1,
      [RANGE_MIN, RANGE_MAX]
    ),
  ];
}
// Which scenario has a minimum closest to X TAF?
function minClosestToX(X) {
  return [
    ...generateData({ minCond: X }, 1, [RANGE_MIN, RANGE_MAX]),
    // make other options have a min some distance away from actual median
    ...generateData(
      {
        minCond: (x) => x > X + OTHER_OPTN_BUFFER || x < X - OTHER_OPTN_BUFFER,
      },
      NUM_OPTS - 1,
      [RANGE_MIN, RANGE_MAX]
    ),
  ];
}
// // Which scenario is [most, least] likely to get at least X TAF?
// TODO: how
// function likelyX(isMost, X) {
//   return [
//     ...generateData({ minCond: X }, 1, [RANGE_MIN, RANGE_MAX]),
//     ...generateData(
//       { minCond: (x) => x > X + OTHER_OPTN_BUFFER },
//       NUM_OPTS - 1,
//       [RANGE_MIN, RANGE_MAX]
//     ),
//   ];
// }
// Which scenario has the [most, least] consistent TAF?
function consistent(isMost) {
  const rangeSize = RANGE_MAX - RANGE_MIN;

  // make correct answer have the smallest sd
  if (isMost)
    return [
      ...generateData(
        {
          sdCond: rangeSize / 18,
          medianCond: (x) =>
            x > RANGE_MIN + rangeSize / 7 && x < RANGE_MAX - rangeSize / 7,
        },
        1,
        [RANGE_MIN, RANGE_MAX]
      ),
      ...generateData(
        {
          sdCond: (x) => x > rangeSize / 18 && rangeSize / 7 > x,
          medianCond: (x) =>
            x > RANGE_MIN + rangeSize / 7 && x < RANGE_MAX - rangeSize / 7,
        },
        NUM_OPTS - 1,
        [RANGE_MAX, RANGE_MAX]
      ),
    ];
  // make correct answer have the largest sd
  else
    return [
      ...generateData(
        {
          sdCond: rangeSize / 7,
          medianCond: (x) =>
            x > RANGE_MIN + rangeSize / 7 && x < RANGE_MAX - rangeSize / 7,
        },
        1,
        [RANGE_MIN, RANGE_MAX]
      ),
      ...generateData(
        {
          sdCond: (x) => x < rangeSize / 7,
          medianCond: (x) =>
            x > RANGE_MIN + rangeSize / 7 && x < RANGE_MAX - rangeSize / 7,
        },
        NUM_OPTS - 1,
        [RANGE_MIN, RANGE_MAX]
      ),
    ];
}

// The median is closer to [X, Y] than [Y, X] TAF.
function condMedianCloserToXThanY(X, Y) {
  const halfDist = Math.abs(Y - X) / 2;

  if (X < Y) {
    return (x) => RANGE_MIN <= x && x < X + halfDist;
  } else {
    return (x) => X - halfDist < x && x <= RANGE_MAX;
  }
}
// The minimum is closer to [X, Y] than [Y, X] TAF.
function condMinCloserToX(X, Y) {
  const halfDist = Math.abs(Y - X) / 2;

  if (X < Y) {
    return (x) => RANGE_MIN <= x && x < X + halfDist;
  } else {
    return (x) => X - halfDist < x && x <= RANGE_MAX;
  }
}
// All scenarios get at least X TAF.
function condMoreThanX(X) {
  return (x) => x >= X;
}
// All scenarios get less than X TAF.
function condLessThan(X) {
  return (x) => x <= X;
}

// to make my life easier, make bounds condition (min max) and sd condition exclusive
// (i.e. if we have bounds, ignore sd. otherwise, use sd if it exists.)
function generateData(conditions, numOpts, range = [0, 100]) {
  let {
    medianCond = null,
    minCond = null,
    maxCond = null,
    sdCond = null,
  } = conditions;

  const datas = [];

  const hasMedianCond = isNonNull(medianCond),
    hasMinCond = isNonNull(minCond),
    hasMaxCond = isNonNull(maxCond),
    hasSdCond = isNonNull(sdCond);

  medianCond = hasMedianCond ? medianCond : () => true;
  minCond = hasMinCond ? minCond : () => true;
  maxCond = hasMaxCond ? maxCond : () => true;
  sdCond = hasSdCond ? sdCond : () => true;

  for (let i = 0; i < numOpts; i++) {
    let median, min, max, sd;

    if (typeof medianCond === "function")
      while (1) {
        median = d3.randomInt(RANGE_MIN, RANGE_MAX + 1)();
        if (medianCond(median)) break;
      }
    else median = medianCond;

    if (typeof minCond === "function")
      while (1) {
        min = d3.randomInt(RANGE_MIN, RANGE_MAX + 1)();
        if (minCond(min) && min <= median) break;
      }
    else min = minCond;

    if (typeof maxCond === "function")
      while (1) {
        max = d3.randomInt(RANGE_MIN, RANGE_MAX + 1)();
        if (maxCond(max) && max >= median) break;
      }
    else max = maxCond;

    if (!hasMinCond && !hasMaxCond) {
      if (typeof sdCond === "function")
        while (1) {
          sd = d3.randomUniform(RANGE_MIN, RANGE_MAX)();
          if (sdCond(sd)) break;
        }
      else sd = sdCond;
    }

    // generate array of 203 numbers with specified conditions
    const numbers = [];

    if (hasMinCond || hasMaxCond) {
      // guarantee that median, min, and max will be in final dataset
      numbers.push(median, min, max);

      numbers.push(
        ...Array.from({ length: 100 }, d3.randomInt(min, median + 1))
      );
      numbers.push(
        ...Array.from({ length: 100 }, d3.randomInt(median, max + 1))
      );
    } else {
      numbers.push(...Array.from({ length: 203 }, d3.randomNormal(0, sd)));

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

function isNonNull(x) {
  return x == 0 || !!x;
}

function concatConditions(conditions, newConditions) {
  for (const cond of ["minCond", "maxCond", "medianCond", "sdCond"]) {
    if (
      newConditions[cond] &&
      (conditions[cond] === undefined || typeof conditions[cond] === "function")
    ) {
      const condFn = conditions[cond] || (() => true);
      conditions[cond] = (x) => condFn(x) && newConditions[cond](x);
    }
  }
}
