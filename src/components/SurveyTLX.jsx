import React, { useCallback, useEffect, useState } from "react";
import * as d3 from "d3";
import generateTLX from "utils/generateTLX";

export default function SurveyTLX({ recordAnswers, setCanProceed }) {
  const [questions, setQuestions] = useState(generateTLX());

  useEffect(function mount() {
    setCanProceed(false);
    return function unmount() {
      recordAnswers(questions);
    };
  }, []);

  const handleOptnChanged = useCallback(function (id, val) {
    setQuestions((q) => {
      q.find(({ id: qid }) => qid === id).selected = val;

      if (q.every(({ selected }) => selected !== undefined))
        setCanProceed(true);

      return [...q];
    });
  }, []);

  return (
    <ol className="tlx-questions">
      {questions.map(({ q, id, range, selected }) => {
        return (
          <li>
            <p>{q}</p>
            <ul className="tlx-opts">
              {d3.range(7).map((i) => {
                return (
                  <li>
                    <input
                      type="radio"
                      name={id}
                      value={i}
                      checked={selected == i}
                      onChange={() => handleOptnChanged(id, i)}
                    />
                  </li>
                );
              })}
            </ul>
            <span>{range[0]}</span>
            <span>{range[1]}</span>
          </li>
        );
      })}
    </ol>
  );
}
