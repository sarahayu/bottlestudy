import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import BottleGlyph from "./BottleGlyph";
import createInterpsFromDelivs from "utils/createInterpsFromDelivs";
import BottleGlyphLegend from "./BottleGlyphLegend";

export default function QuestionSummarize({
  id,
  prompt,
  data,
  possibleAns,
  correctAns,
  setAnswerCorrect,
  recordTTI,
  VisComponent,
}) {
  const [selected, setSelected] = useState([]);
  const startTimeRef = useRef(0);

  useEffect(
    function initNewQuestion() {
      setAnswerCorrect(false);
      setSelected([]);
      startTimeRef.current = Date.now();

      return function exitQuestion() {
        //console.log("end summ ", Date.now() - startTimeRef.current);
        recordTTI(Date.now() - startTimeRef.current);
      };
    },
    [id]
  );

  const handleOptnChanged = useCallback(
    function (val, checked) {
      setSelected((s) => {
        if (checked) s.push(val);
        else s.splice(s.indexOf(val), 1);

        const eqArr = (a1, a2) =>
          a1.every((a) => a2.includes(a)) && a2.every((a) => a1.includes(a));

        if (eqArr(s, correctAns)) {
          setAnswerCorrect(true);
        } else {
          setAnswerCorrect(false);
        }

        return [...s];
      });
    },
    [id]
  );
  return (
    <div className="prompt prompt-summarize">
      <p>{prompt}</p>

      <div className="data-to-summarize">
        {data.map((pa, i) => (
          <div key={i}>
            <VisComponent
              key={i}
              levelInterp={createInterpsFromDelivs(pa, 0, 20)}
              width={200}
              height={200}
              maxValue={20}
            />
          </div>
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

      <div className="possible-ans">
        {possibleAns.map((pa, i) => (
          <span key={i}>
            <input
              type="checkbox"
              checked={selected.includes(i)}
              name={i}
              id={i}
              onChange={(e) => handleOptnChanged(i, e.target.checked)}
            />
            <label htmlFor={i}>{pa}</label>
          </span>
        ))}
      </div>
    </div>
  );
}
