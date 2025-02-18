import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import BottleGlyph from "./BottleGlyph";
import createInterpsFromDelivs from "utils/createInterpsFromDelivs";

export default function QuestionSummarize({
  id,
  prompt,
  data,
  metadata,
  possibleAns,
  correctAns,
  setResponseTime,
  setAnswerCorrect,
}) {
  const [selected, setSelected] = useState([]);
  const startTimeRef = useRef(0);

  useEffect(
    function initNewQuestion() {
      setAnswerCorrect(false);
      setSelected([]);
      startTimeRef.current = Date.now();
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
          setResponseTime(Date.now() - startTimeRef.current);
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
          <div>
            <BottleGlyph
              key={i}
              levelInterp={createInterpsFromDelivs(pa, 0, 100)}
              width={100}
              height={200}
            />
            <span>{metadata[i].map((x) => Math.round(x)).join(",")}</span>
          </div>
        ))}
      </div>

      <div className="possible-ans">
        {possibleAns.map((pa, i) => (
          <span key={i} className={correctAns.includes(i) ? "correctans" : ""}>
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
