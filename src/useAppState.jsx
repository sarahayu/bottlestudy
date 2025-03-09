import { useState, useMemo, useEffect, useCallback } from "react";
import * as d3 from "d3";

import QuestionSummarize from "components/QuestionSummarize";
import QuestionSearch from "components/QuestionSearch";

import generateQuestions from "utils/generateQuestions";
import SurveyTLX from "components/SurveyTLX";
import ExceedancePlot from "components/ExceedancePlot";
import BottleGlyph from "components/BottleGlyph";

const questionsData = generateQuestions();

console.log(questionsData);

export default function useAppState() {
  const [isStartStudy, setIsStartStudy] = useState(false);
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [canProceed, setCanProceed] = useState(true);
  const [answerCorrect, setAnswerCorrect] = useState(true);

  const recordTLX = useCallback(function (questions, testType) {
    console.log(testType, questions);
    // TODO record tlx answers somewhere
  }, []);

  const questions = useMemo(function createQuestions() {
    const _questions = [];

    d3.shuffle(questionsData.groups).forEach(({ type, qs }, i) => {
      if (type.includes("search")) {
        _questions.push(
          ...qs.map((q, j) => (
            <QuestionSearch
              id={i + j}
              prompt={q.prompt}
              possibleAns={q.possibleAns}
              correctAns={q.correctAns}
              setAnswerCorrect={setAnswerCorrect}
              setResponseTime={() => {}}
              VisComponent={type.includes("ep") ? ExceedancePlot : BottleGlyph}
            />
          ))
        );
      } else if (type.includes("explore"))
        _questions.push(
          ...qs.map((q, j) => (
            <QuestionSummarize
              id={i + j}
              prompt={q.prompt}
              data={q.data}
              possibleAns={q.possibleAns}
              correctAns={q.correctAns}
              setAnswerCorrect={setAnswerCorrect}
              setResponseTime={() => {}}
              VisComponent={type.includes("ep") ? ExceedancePlot : BottleGlyph}
            />
          ))
        );

      _questions.push(
        <SurveyTLX
          recordAnswers={(a) => void recordTLX(a, type)}
          setCanProceed={setCanProceed}
        />
      );
    });

    return _questions;
  }, []);

  const closeTutorial = useCallback(function () {
    setIsStartStudy(true);
  }, []);

  return {
    questions,
    currentSlideIdx,
    setCurrentSlideIdx,
    maxSlides: questionsData.num_qs + questionsData.groups.length,
    canProceed,
    answerCorrect,
    isStartStudy,
    closeTutorial,
  };
}
