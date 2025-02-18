import React, { useRef, useState } from "react";

export default function StudyFrame({
  handleNextButton,
  currentIdx,
  maxIdx,
  children,
  canProceed,
  answerCorrect,
}) {
  const [showIsWrong, setShowIsWrong] = useState(false);
  const fnRef = useRef(null);

  const handleOnClick = () => {
    if (answerCorrect) {
      handleNextButton();

      if (fnRef.current) clearTimeout(fnRef.current);
      setShowIsWrong(false);
    } else {
      setShowIsWrong(true);

      if (fnRef.current) clearTimeout(fnRef.current);
      fnRef.current = setTimeout(() => {
        fnRef.current = null;
        setShowIsWrong(false);
      }, 2000);
    }
  };

  return (
    <div className="study-area">
      {children}
      <div className="study-area-footer">
        <span>
          {currentIdx} / {maxIdx}
        </span>
        {canProceed && <button onClick={handleOnClick}>Next</button>}
        {!canProceed && (
          <span>Please answer all questions before proceeding</span>
        )}
        {showIsWrong && <span>Incorrect, try again!</span>}
      </div>
    </div>
  );
}
