// components/client/MultipleChoice.tsx

"use client";
import React from "react";

type Props = {
  choices: string[];
  onAnswer: (answer: string) => void;
  selectedAnswer: string | null;
};

const MultipleChoice = ({ choices, onAnswer, selectedAnswer }: Props) => {
  return (
    <div className="flex flex-col gap-2 mt-4">
      {choices.map((choice, index) => (
        <button
          key={index}
          onClick={() => onAnswer(choice)}
          className={`border px-4 py-2 rounded-md ${
            selectedAnswer === choice ? "bg-blue-200" : "bg-white"
          } hover:bg-blue-100`}
        >
          {choice}
        </button>
      ))}
    </div>
  );
};

export default MultipleChoice;
