export default function generateTLX() {
  return [
    {
      q: "How mentally demanding was the task?",
      id: "mental_demand",
      range: ["very low", "very high"],
    },
    {
      q: "How successful were you in accomplishing what you were asked to do?",
      id: "performance",
      range: ["perfect", "failure"],
    },
    {
      q: "How hard did you have to work to accomplish your level of performance",
      id: "effort",
      range: ["very low", "very high"],
    },
    {
      q: "How insecure, discouraged, irritated, stressed, and annoyed were you?",
      id: "frustration",
      range: ["very low", "very high"],
    },
  ];
}
