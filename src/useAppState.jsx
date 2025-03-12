import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import * as d3 from "d3";

import QuestionSummarize from "components/QuestionSummarize";
import QuestionSearch from "components/QuestionSearch";

import generateQuestions from "utils/generateQuestions";
import SurveyTLX from "components/SurveyTLX";
import ExceedancePlot from "components/ExceedancePlot";
import BottleGlyph from "components/BottleGlyph";

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import SurveyVEQ from "components/SurveyVEQ";

const questionsData = generateQuestions();

export default function useAppState() {
  const [isStartStudy, setIsStartStudy] = useState(false);
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [canProceed, setCanProceed] = useState(true);
  const [answerCorrect, setAnswerCorrect] = useState(true);
  const userDataRef = useRef({
    answers: [],
    tlx_answers: [],
    veq_answers: [],
  });

  const recordQuestion = useCallback(function (tti, question, type) {
    const unarrayData = {};

    if (question["data"]) {
      let i = 0;
      for (const data of question["data"]) {
        unarrayData[`q${i++}`] = data;
      }
    }

    userDataRef.current["answers"].push({
      ...question,
      data: Object.assign({}, question["data"]),
      possibleAns: Object.assign({}, question["possibleAns"]),
      tti,
      type,
    });
  }, []);

  const recordTLX = useCallback(function (questions, type) {
    userDataRef.current["tlx_answers"].push({
      type,
      answers: questions,
    });
  }, []);

  const recordVEQ = useCallback(function (questions) {
    userDataRef.current["veq_answers"].push(...questions);
  }, []);

  const submitData = useCallback(async function () {
    //console.log(userDataRef.current);

    // Your web app's Firebase configuration
    const firebaseConfig = {
      apiKey: "AIzaSyDjJ6vSy68VWyH5BS8yTpw-1eLeKCK1cHw",
      authDomain: "userstudy-67eff.firebaseapp.com",
      projectId: "userstudy-67eff",
      storageBucket: "userstudy-67eff.firebasestorage.app",
      messagingSenderId: "218201274282",
      appId: "1:218201274282:web:495d91623867395f661dd3",
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);

    const db = getFirestore(app);

    const id = new Date().toString().split(" ").join("-");

    await setDoc(doc(db, "results", id), userDataRef.current);
  }, []);

  const slides = useMemo(function createQuestions() {
    const _slides = [];

    d3.shuffle(questionsData.groups).forEach(({ type, qs }, i) => {
      const epType = type.includes("ep");

      _slides.push(<h1 className="section-intro">Section {i + 1}</h1>);

      if (type.includes("search")) {
        _slides.push(
          ...qs.map((q, j) => (
            <QuestionSearch
              id={i + j}
              prompt={q.prompt}
              possibleAns={q.possibleAns}
              correctAns={q.correctAns}
              setAnswerCorrect={setAnswerCorrect}
              recordTTI={(tti) => void recordQuestion(tti, q, type)}
              VisComponent={epType ? ExceedancePlot : BottleGlyph}
            />
          ))
        );
      } else if (type.includes("explore"))
        _slides.push(
          ...qs.map((q, j) => (
            <QuestionSummarize
              id={i + j}
              prompt={q.prompt}
              data={q.data}
              possibleAns={q.possibleAns}
              correctAns={q.correctAns}
              setAnswerCorrect={setAnswerCorrect}
              recordTTI={(tti) => void recordQuestion(tti, q, type)}
              VisComponent={epType ? ExceedancePlot : BottleGlyph}
            />
          ))
        );

      _slides.push(
        <SurveyTLX
          recordAnswers={(a) => void recordTLX(a, type)}
          setCanProceed={setCanProceed}
          section={i + 1}
        />
      );
    });

    _slides.push(
      <SurveyVEQ
        recordAnswers={(a) => void recordVEQ(a)}
        setCanProceed={setCanProceed}
      />
    );

    return _slides;
  }, []);

  const closeTutorial = useCallback(function () {
    setIsStartStudy(true);
  }, []);

  return {
    slides,
    currentSlideIdx,
    setCurrentSlideIdx,
    maxSlides: questionsData.num_qs + questionsData.groups.length + 4 + 1,
    canProceed,
    answerCorrect,
    isStartStudy,
    closeTutorial,
    submitData,
  };
}
