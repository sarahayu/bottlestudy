import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import BottleGlyph from "./BottleGlyph";
import createInterpsFromDelivs from "utils/createInterpsFromDelivs";
import BottleGlyphLegend from "./BottleGlyphLegend";

export default function QuestionSearch({
  id,
  prompt,
  possibleAns,
  correctAns,
  setAnswerCorrect,
  recordTTI,
  VisComponent,
}) {
  const [selected, setSelected] = useState(-1);
  const startTimeRef = useRef(0);

  useEffect(
    function initNewQuestion() {
      setSelected(-1);
      setAnswerCorrect(false);
      startTimeRef.current = Date.now();

      return function exitQuestion() {
        //console.log("end search ", Date.now() - startTimeRef.current);
        recordTTI(Date.now() - startTimeRef.current);
      };
    },
    [id]
  );

  const handleOptnChanged = useCallback(
    function (val) {
      setSelected(val);

      if (correctAns === val) {
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
          <span key={i}>
            <input
              type="radio"
              name={id}
              id={i}
              checked={selected === i}
              onChange={() => handleOptnChanged(i)}
            />
            <label htmlFor={i}>
              <VisComponent
                levelInterp={createInterpsFromDelivs(pa, 0, 20)}
                width={200}
                height={200}
                maxValue={20}
              />
            </label>
          </span>
        ))}

        {VisComponent === BottleGlyph && (
          <div className="legend">
            <h3>Legend</h3>
            <BottleGlyphLegend
              label={"% Chance of Exceeding"}
              width={250}
              height={200}
            />
          </div>
        )}
      </div>
    </div>
  );
}
