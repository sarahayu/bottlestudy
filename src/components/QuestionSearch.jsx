import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import BottleGlyph from "./BottleGlyph";
import createInterpsFromDelivs from "utils/createInterpsFromDelivs";

export default function QuestionSearch({
  id,
  prompt,
  possibleAns,
  correctAns,
  setResponseTime,
  setAnswerCorrect,
}) {
  const [selected, setSelected] = useState(-1);
  const startTimeRef = useRef(0);

  useEffect(
    function initNewQuestion() {
      setSelected(-1);
      setAnswerCorrect(false);
      startTimeRef.current = Date.now();
    },
    [id]
  );

  const handleOptnChanged = useCallback(
    function (val) {
      setSelected(val);

      if (correctAns === val) {
        setResponseTime(Date.now() - startTimeRef.current);
        setAnswerCorrect(true);
      } else {
        setAnswerCorrect(false);
      }
    },
    [id]
  );

  return (
    <div className="prompt">
      <p>{prompt}</p>

      <div className="possible-ans">
        {possibleAns.map((pa, i) => (
          <span className={i == correctAns ? "correctans" : ""}>
            <input
              type="radio"
              name={id}
              id={i}
              checked={selected === i}
              onChange={() => handleOptnChanged(i)}
            />
            <label htmlFor={i}>
              <BottleGlyph
                levelInterp={createInterpsFromDelivs(pa, 0, 20)}
                width={100}
                height={200}
                maxValue={20}
              />
            </label>
          </span>
        ))}
      </div>
    </div>
  );
}
