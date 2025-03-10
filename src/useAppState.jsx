import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import * as d3 from "d3";

import QuestionSummarize from "components/QuestionSummarize";
import QuestionSearch from "components/QuestionSearch";

import generateQuestions from "utils/generateQuestions";
import SurveyTLX from "components/SurveyTLX";
import ExceedancePlot from "components/ExceedancePlot";
import BottleGlyph from "components/BottleGlyph";

import { initializeApp } from "firebase/app";

const questionsData = generateQuestions();

export default function useAppState() {
  const [isStartStudy, setIsStartStudy] = useState(false);
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [canProceed, setCanProceed] = useState(true);
  const [answerCorrect, setAnswerCorrect] = useState(true);
  const userDataRef = useRef({
    ttiAnswers: [],
    surveyAnswers: [],
  });

  const recordTLX = useCallback(function (questions, testType) {
    userDataRef.current["surveyAnswers"].push({
      type: testType,
      answers: questions,
    });
  }, []);

  const submitData = useCallback(function () {
    console.log(userDataRef.current);
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
    submitData,
  };
}
