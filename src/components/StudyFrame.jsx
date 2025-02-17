import React from "react";

export default function StudyFrame({
  handleNextButton,
  currentIdx,
  maxIdx,
  children,
  canProceed,
}) {
  return (
    <div className="study-area">
      {children}
      <span>
        {currentIdx} / {maxIdx}
      </span>
      {canProceed && <button onClick={handleNextButton}>Next</button>}
      {!canProceed && (
        <span>Please answer all questions before proceeding</span>
      )}
    </div>
  );
}
