import React from "react";
import waterLevels from "data/water_levels";
import BarGraph from "./BarGraph";
import ExceedancePlot from "./ExceedancePlot";
import createInterpsFromDelivs from "utils/createInterpsFromDelivs";
import BottleGlyph from "./BottleGlyph";
import BottleGlyphLegend from "./BottleGlyphLegend";

export default function Tutorial({ closeTutorial }) {
  return (
    <div className="tutorial study-area">
      <h1>User Study Tutorial</h1>
      <p>You are likely familiar with bar graphs.</p>
      <div className="img-group">
        <BarGraph
          data={waterLevels.A}
          title={"Reservoir A"}
          axisLeft={"Thousand-Acre Feet (TAF)"}
          axisBottom={"Year"}
          maxValue={400}
          width={350}
        />
        <BarGraph
          data={waterLevels.B}
          title={"Reservoir B"}
          axisLeft={"Thousand-Acre Feet (TAF)"}
          axisBottom={"Year"}
          maxValue={400}
          width={350}
        />
        <span>Fig. 1</span>
      </div>
      <p>
        These track water supply in two reservoirs, A and B, over several years.
        If you want to choose a reservoir with the best supply based on its
        minimum or maximum, you will likely be able to do so. But what if you
        want to choose based on its median? Or based on how likely it is to get
        at least 200 TAF?
      </p>
      <p>
        To more easily find that information, you can use two types of graphs
        called exceedance plots and bottle glyphs. To understand how to read
        these types of graphs, let us first reorder the bars from the previous
        bar graphs from highest to lowest.
      </p>
      <div className="img-group">
        <BarGraph
          data={waterLevels.A.toSorted((a, b) => b - a)}
          title={"Reservoir A"}
          axisLeft={"Thousand-Acre Feet (TAF)"}
          maxValue={400}
          width={350}
        />
        <BarGraph
          data={waterLevels.B.toSorted((a, b) => b - a)}
          title={"Reservoir B"}
          axisLeft={"Thousand-Acre Feet (TAF)"}
          maxValue={400}
          width={350}
        />
        <span>Fig. 2</span>
      </div>
      <h2>Exceedance Plots</h2>
      <p>When we simplify the bars to a line, we get an exceedance plot.</p>
      <div className="img-group">
        <ExceedancePlot
          levelInterp={createInterpsFromDelivs(
            waterLevels.A.toSorted((a, b) => b - a),
            0,
            400
          )}
          title={"Reservoir A"}
          axisLeft={"Thousand-Acre Feet (TAF)"}
          axisBottom={"% Chance of Exceeding"}
          width={200}
          height={200}
          maxValue={400}
        />
        <ExceedancePlot
          levelInterp={createInterpsFromDelivs(
            waterLevels.B.toSorted((a, b) => b - a),
            0,
            400
          )}
          title={"Reservoir B"}
          axisLeft={"Thousand-Acre Feet (TAF)"}
          axisBottom={"% Chance of Exceeding"}
          width={200}
          height={200}
          maxValue={400}
        />
        <span>Fig. 3</span>
      </div>
      <div className="img-group">
        <img src="annot_ep.png" />
        <span>Fig. 4</span>
      </div>
      <p>
        You can find minimum, maximum, and other characteristics of the datasets
        as shown by the annotations in Fig. 4.
      </p>
      <h2>Bottle Glyphs</h2>
      <p>
        When we overlap the bars and color the more overlapped areas darker, we
        get a bottle glyph. We will simplify by only using the minimum, 25th
        percentile, median, 75th percentile, and maximum values.
      </p>
      <div className="img-group">
        <BottleGlyph
          levelInterp={createInterpsFromDelivs(
            waterLevels.A.toSorted((a, b) => b - a),
            0,
            400
          )}
          title={"Reservoir A"}
          axisLeft={"Thousand-Acre Feet (TAF)"}
          width={200}
          height={200}
          maxValue={400}
        />
        <BottleGlyph
          levelInterp={createInterpsFromDelivs(
            waterLevels.B.toSorted((a, b) => b - a),
            0,
            400
          )}
          title={"Reservoir B"}
          axisLeft={"Thousand-Acre Feet (TAF)"}
          width={200}
          height={200}
          maxValue={400}
        />
        <BottleGlyphLegend
          label={"% Chance of Exceeding"}
          width={250}
          height={200}
        />
        <span>Fig. 5</span>
      </div>
      <div className="img-group">
        <img src="annot_bg.png" />
        <span>Fig. 6</span>
      </div>
      <p>
        You can find minimum, maximum, and other characteristics of the datasets
        as shown by the annotations in Fig. 6.
      </p>
      <h2>Instructions for Study</h2>
      <p>
        Feel free to reread this tutorial to familiarize yourself with
        exceedance plots and bottle glyphs. Once you feel you are ready, click
        the "Continue" button below to proceed to the questions portion of this
        user study. For each step, you will be asked a question; it will only
        let you proceed to the next question when you get the answer(s) correct.
        Please think thoroughly but promptly!
      </p>
      <button onClick={closeTutorial}>Continue</button>
    </div>
  );
}
