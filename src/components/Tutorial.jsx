import React from "react";

export default function Tutorial({ closeTutorial }) {
  return (
    <div className="tutorial study-area">
      <h1>User Study Tutorial</h1>
      <p>You are likely familiar with bar graphs.</p>
      <img src="https://placecats.com/640/360" alt="" srcset="" />
      <p>
        These track water levels in two reservoirs, A and B, over several years.
        If you want to choose a reservoir with the best supply best on its
        minimum or maximum, you will likely be able to do so. But what if you
        want to choose based on its median? Or based on how likely it is o get
        at least 60 TAF?
      </p>
      <p>
        To more easily find that information, you can use two types of graphs
        called exceedance plots and bottle glyphs. To understand how to read
        these types of graphs, let us first reorder the bars from the previous
        bar graphs from highest to lowest.
      </p>
      <img src="https://placecats.com/640/360" alt="" />
      <h2>Exceedance Plots</h2>
      <p>When we simplify the bars to a line, we get an exceedance plot.</p>
      <img src="https://placecats.com/640/360" alt="" />
      <p>
        You can find minimum, maximum, and other characteristics of the datasets
        as shown above by the graph annotations.
      </p>
      <h2>Bottle Glyphs</h2>
      <p>
        When we overlap the bars and color the more overlapped areas darker, we
        get a bottle glyph. We will simplify by only using the minimum, 25th
        percentile, median, 75th percentile, and maximum values.
      </p>
      <img src="https://placecats.com/640/360" alt="" />
      <p>
        You can find minimum, maximum, and other characteristics of the datasets
        as shown above.
      </p>
      <h2>Instructions for Study</h2>
      <p>
        Feel free to reread this tutorial to familiarize yourself with
        exceedance plots and bottle glyphs. Once you feel you are ready, click
        the "Continue" button below to proceed to the questions portion of this
        user study. For each step, you will be asked asked a question; it will
        only let you proceed to the next question when you get the answer(s)
        correct. Please think thoroughly but promptly!
      </p>
      <button onClick={closeTutorial}>Continue</button>
    </div>
  );
}
