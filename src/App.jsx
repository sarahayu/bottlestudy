import React, { useMemo } from "react";
import StudyFrame from "components/StudyFrame";

import useAppState from "useAppState";

export default function App() {
  const {
    questions,
    currentSlideIdx,
    setCurrentSlideIdx,
    maxSlides,
    canProceed,
  } = useAppState();

  return (
    <>
      {currentSlideIdx < maxSlides && (
        <StudyFrame
          handleNextButton={() => void setCurrentSlideIdx((csi) => csi + 1)}
          currentIdx={currentSlideIdx + 1}
          maxIdx={maxSlides}
          canProceed={canProceed}
        >
          {questions[currentSlideIdx]}
        </StudyFrame>
      )}
      {currentSlideIdx >= maxSlides && <div>Thank you for participating!</div>}
    </>
  );
}
