import React, { useMemo } from "react";
import StudyFrame from "components/StudyFrame";

import useAppState from "useAppState";
import Tutorial from "components/Tutorial";
import FinishSlide from "components/FinishSlide";

export default function App() {
  const {
    questions,
    currentSlideIdx,
    setCurrentSlideIdx,
    maxSlides,
    canProceed,
    answerCorrect,
    isStartStudy,
    closeTutorial,
    submitData,
  } = useAppState();

  return (
    <>
      {!isStartStudy ? (
        <Tutorial closeTutorial={closeTutorial} />
      ) : (
        <>
          {currentSlideIdx < maxSlides && (
            <StudyFrame
              handleNextButton={() => void setCurrentSlideIdx((csi) => csi + 1)}
              currentIdx={currentSlideIdx + 1}
              maxIdx={maxSlides}
              canProceed={canProceed}
              answerCorrect={answerCorrect}
            >
              {questions[currentSlideIdx]}
            </StudyFrame>
          )}
          {currentSlideIdx >= maxSlides && (
            <FinishSlide handleSubmitData={submitData} />
          )}
        </>
      )}
    </>
  );
}
