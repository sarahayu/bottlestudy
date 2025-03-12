import React, { useCallback, useEffect, useState } from "react";
import * as d3 from "d3";
import generateVEQ from "utils/generateVEQ";

export default function SurveyVEQ({ recordAnswers, setCanProceed }) {
  const [questions, setQuestions] = useState(generateVEQ());

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
    <div className="survey">
      <h2>Closing Survey</h2>
      <p>
        Please answer the following questions based on your experience during{" "}
        <u>the entire user study</u>.
      </p>
      <ol className="survey-questions">
        {questions.map(({ q, id, range, selected }) => {
          return (
            <li key={id}>
              <p>{q}</p>
              <ul className="survey-opts">
                {d3.range(7).map((i) => {
                  return (
                    <li key={i}>
                      <input
                        type="radio"
                        name={id}
                        value={7 - i}
                        checked={selected == 7 - i}
                        onChange={() => handleOptnChanged(id, 7 - i)}
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
    </div>
  );
}
