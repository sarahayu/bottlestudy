import * as d3 from "d3";
import randomRange from "./randomRange";
import inverseRandomRange from "./inverseRandomRange";

const NUM_QS_PER_GROUP = 5;

export default function generateQuestions() {
  const questions = {
    num_qs: 0,
    groups: [],
  };

  // [exceedance plot, water bottles] X [searching, exploring]
  epSearch(questions);
  // epExplore(questions);
  // wbSearch(questions);
  // wbExplore(questions);

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
  RANGE_MAX = 20;

function generateSearchQuestion() {
  const chosenType = d3.scaleQuantize().range([
    "medianClosestToX",
    "minClosestToX",
    // "likelyX",
    "consistent",
  ])(d3.randomUniform()());

  if (chosenType == "medianClosestToX") {
    const X = randomRange(RANGE_MIN, RANGE_MAX);
    console.log(X);
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
    const X = randomRange(
      RANGE_MIN,
      RANGE_MIN +
        (RANGE_MAX - RANGE_MIN) /
          2 /* make the largest min be halfway between RANGE_MIN and RANGE_MAX for a better looking distribution */
    );
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
    const isMost = randomRange(2) == 0;

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

  let knownMinimum = null,
    knownMedian = null;

  if (conditions.includes("medianCloser")) {
    let X, Y;
    const minDist = Math.abs(RANGE_MAX - RANGE_MIN) / 3;

    X = randomRange(RANGE_MIN, RANGE_MAX);

    while (1) {
      Y = randomRange(RANGE_MIN + 1, RANGE_MAX);
      if (Math.abs(Y - X) >= minDist) break;
    }

    concatConditions(appliedConds, {
      medianCond: condMedianCloserToXThanY(X, Y),
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
  }

  if (conditions.includes("minCloser")) {
    let actualMinimum, adversarialMinimum;
    const minDist = Math.abs(RANGE_MAX - RANGE_MIN) / 5;

    const upperBoundOfMinimum = knownMedian !== null ? knownMedian : RANGE_MAX;

    actualMinimum = randomRange(RANGE_MIN, upperBoundOfMinimum);

    while (1) {
      adversarialMinimum = randomRange(RANGE_MIN, RANGE_MAX);
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
  }

  if (conditions.includes("moreThan")) {
    const upperBoundOfMinimum =
      knownMinimum !== null
        ? knownMinimum
        : knownMedian !== null
        ? knownMedian
        : RANGE_MAX;
    const exclusiveMinimum = randomRange(RANGE_MIN, upperBoundOfMinimum);

    concatConditions(appliedConds, {
      medianCond: (possibleMedianExact) =>
        exclusiveMinimum < possibleMedianExact,
      minCond: (possibleMinExact) => exclusiveMinimum < possibleMinExact,
      //maxCond: max is calculated after min in generateData, so it's guaranteed to be >= min (and median)
    });

    correctAns.push(possibleAns.length);
    possibleAns.push(`All scenarios get more than ${exclusiveMinimum} TAF`);

    if (!knownMinimum !== null) knownMinimum = exclusiveMinimum + 1;
  }
  // possibly add an incorrect answer
  else if (randomRange(2) == 0) {
    const lowerBoundOfData = knownMinimum !== null ? knownMinimum : RANGE_MIN;
    const falseExclusiveMinimum = randomRange(
      lowerBoundOfData + 1,
      RANGE_MAX + 1
    );

    concatConditions(appliedConds, {
      minCond: (possibleMinExact) => possibleMinExact <= falseExclusiveMinimum,
    });

    possibleAns.push(
      `All scenarios get more than ${falseExclusiveMinimum} TAF`
    );
  }

  if (conditions.includes("lessThan")) {
    const lowerBoundOfMaximum =
      knownMedian !== null
        ? knownMedian
        : knownMinimum !== null
        ? knownMinimum
        : RANGE_MIN;
    const exclusiveMaximum = randomRange(
      lowerBoundOfMaximum + 1,
      RANGE_MAX + 1
    );

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
  else if (randomRange(2) == 0) {
    const upperBoundOfData = RANGE_MAX;
    const falseExclusiveMax = randomRange(RANGE_MIN, upperBoundOfData);

    concatConditions(appliedConds, {
      maxCond: (possibleMaxExact) => falseExclusiveMax <= possibleMaxExact,
    });

    possibleAns.push(`All scenarios get less than ${falseExclusiveMax} TAF`);
  }

  const metadatas = generateMetadatas(appliedConds, NUM_OPTS, [
    RANGE_MIN,
    RANGE_MAX,
  ]);
  const options = generateDatas(metadatas);

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
  const appliedConds = conds.slice(0, randomRange(2, conds.length));

  return appliedConds;
}

// in all of the below cases, correct answer is the first element

// Which scenario has a median closest to X TAF?
function medianClosestToX(X) {
  const otherOptBuffer = (RANGE_MAX - RANGE_MIN) / 4;

  const correct = generateMetadatas(
    {
      medianCond: (x) => Math.abs(x - X) < otherOptBuffer,
    },
    1
  );
  const incorrects = generateMetadatas(
    {
      medianCond: (x) => Math.abs(x - X) > otherOptBuffer,
    },
    NUM_OPTS - 1
  );

  return generateDatas([...correct, ...incorrects]);
}
// Which scenario has a minimum closest to X TAF?
function minClosestToX(X) {
  const otherOptBuffer = (RANGE_MAX - RANGE_MIN) / 10;
  let correct,
    incorrects = [];

  {
    const min = randomRange({
      lowerBound: X - otherOptBuffer,
      upperBound: X + otherOptBuffer,
      min: RANGE_MIN,
      max:
        RANGE_MIN +
        (RANGE_MAX - RANGE_MIN) *
          0.5 /* make the largest min be halfway between RANGE_MIN and RANGE_MAX for a better looking distribution */,
    });
    const median = randomRange(min, RANGE_MAX);
    const max = randomRange(median, RANGE_MAX);

    correct = {
      min,
      median,
      max,
    };
  }

  for (let i = 0; i < NUM_OPTS - 1; i++) {
    const min = inverseRandomRange({
      lowerBound: X - otherOptBuffer,
      upperBound: X + otherOptBuffer,
      min: RANGE_MIN,
      max:
        RANGE_MIN +
        (RANGE_MAX - RANGE_MIN) *
          0.5 /* make the largest min be halfway between RANGE_MIN and RANGE_MAX for a better looking distribution */,
    });
    const median = randomRange(min, RANGE_MAX);
    const max = randomRange(median, RANGE_MAX);

    incorrects.push({
      min,
      median,
      max,
    });
  }
  return [...generateDatas([correct]), ...generateDatas(incorrects)];
}
// // Which scenario is [most, least] likely to get at least X TAF?
// TODO: how
// function likelyX(isMost, X) {
// }
// Which scenario has the [most, least] consistent TAF?
function consistent(isMost) {
  const rangeSize = RANGE_MAX - RANGE_MIN;

  // make correct answer have the smallest sd
  if (isMost) {
    const halfRange = rangeSize / 8;

    let correct,
      incorrects = [];

    {
      const median = randomRange(
        RANGE_MIN + halfRange,
        RANGE_MAX - halfRange + 1
      );
      const min = randomRange(
        Math.max(RANGE_MIN, median - halfRange),
        median + 1
      );
      const max = randomRange(
        median + 1,
        Math.min(RANGE_MAX, median + halfRange)
      );

      correct = { median, min, max };
    }

    for (let i = 0; i < NUM_OPTS - 1; i++) {
      const median = randomRange(
        RANGE_MIN + halfRange,
        RANGE_MAX - halfRange + 1
      );
      const min = randomRange(
        RANGE_MIN,
        Math.max(RANGE_MIN, median - halfRange) + 1
      );
      const max = randomRange(
        Math.min(RANGE_MAX, median + halfRange),
        RANGE_MAX + 1
      );

      incorrects.push({ median, min, max });
    }

    return [...generateDatas([correct]), ...generateDatas(incorrects)];
  }
  // make correct answer have the largest sd
  else {
    const halfRange = (rangeSize * 3) / 4 / 2;

    let correct,
      incorrects = [];

    {
      const median = randomRange(
        RANGE_MIN + halfRange,
        RANGE_MAX - halfRange + 1
      );
      const min = randomRange(
        RANGE_MIN,
        Math.max(RANGE_MIN, median - halfRange) + 1
      );
      const max = randomRange(
        Math.min(RANGE_MAX, median + halfRange),
        RANGE_MAX + 1
      );

      correct = { median, min, max };
    }

    for (let i = 0; i < NUM_OPTS - 1; i++) {
      const median = randomRange(
        RANGE_MIN + halfRange,
        RANGE_MAX - halfRange + 1
      );
      const min = randomRange(
        Math.max(RANGE_MIN, median - halfRange),
        median + 1
      );
      const max = randomRange(
        median + 1,
        Math.min(RANGE_MAX, median + halfRange)
      );

      incorrects.push({ median, min, max });
    }

    return [...generateDatas([correct]), ...generateDatas(incorrects)];
  }
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

function generateMetadatas(conditions, numOpts) {
  let { medianCond = null, minCond = null, maxCond = null } = conditions;

  const metadatas = [];

  const hasMedianCond = medianCond !== null,
    hasMinCond = minCond !== null,
    hasMaxCond = maxCond !== null;

  medianCond = hasMedianCond ? medianCond : () => true;
  minCond = hasMinCond ? minCond : () => true;
  maxCond = hasMaxCond ? maxCond : () => true;

  for (let i = 0; i < numOpts; i++) {
    let median = null,
      min = null,
      max = null;

    if (typeof medianCond === "function")
      while (1) {
        median = randomRange(RANGE_MIN, RANGE_MAX);
        if (medianCond(median)) break;
      }
    else median = medianCond;

    if (typeof minCond === "function")
      while (1) {
        min = randomRange(RANGE_MIN, RANGE_MAX);
        if (minCond(min) && min <= median) break;
      }
    else min = minCond;

    if (typeof maxCond === "function")
      while (1) {
        max = randomRange(RANGE_MIN, RANGE_MAX);
        if (maxCond(max) && max >= median) break;
      }
    else max = maxCond;

    metadatas.push({ median, min, max });
  }

  return metadatas;
}

function generateDatas(metadatas) {
  const datas = [];

  for (const metadata of metadatas) {
    const { median, min, max } = metadata;

    // generate array of 203 numbers with specified conditions
    const numbers = [];

    // guarantee that median, min, and max will be in final dataset
    numbers.push(median, min, max);

    numbers.push(
      ...Array.from({ length: 100 }, () => randomRange(min, median))
    );
    numbers.push(
      ...Array.from({ length: 100 }, () => randomRange(median, max))
    );

    numbers.sort(d3.descending);
    datas.push(numbers);
  }

  return datas;
}

function concatConditions(conditions, newConditions) {
  for (const cond of ["minCond", "maxCond", "medianCond"]) {
    if (
      newConditions[cond] &&
      (conditions[cond] === undefined || typeof conditions[cond] === "function")
    ) {
      const condFn = conditions[cond] || (() => true);
      conditions[cond] = (x) => condFn(x) && newConditions[cond](x);
    }
  }
}
