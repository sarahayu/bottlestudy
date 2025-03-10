import React, { useEffect } from "react";

export default function FinishSlide({ handleSubmitData }) {
  useEffect(function submitOnInit() {
    handleSubmitData();
  }, []);

  return <div className="thankyou">Thank you for participating!</div>;
}
