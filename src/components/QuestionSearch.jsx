import React from "react";
import BottleGlyph from "./BottleGlyph";
import createInterpsFromDelivs from "utils/createInterpsFromDelivs";

export default function QuestionSearch({ prompt, possibleAns }) {
  return (
    <div className="prompt">
      <p>{prompt}</p>

      <div className="possible-ans">
        {possibleAns.map((pa) => (
          <BottleGlyph
            levelInterp={createInterpsFromDelivs(pa, 0, 100)}
            width={100}
            height={200}
          />
        ))}
      </div>
    </div>
  );
}
