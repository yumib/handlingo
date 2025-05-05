// components/client/MultipleChoice.tsx

"use client";
import React from "react";

type Props = {
  choices: string[];
  onAnswer: (answer: string) => void;
  selectedAnswer: string | null;
  correctAnswer: string;
};

const MultipleChoice = ({ choices, onAnswer, selectedAnswer, correctAnswer }: Props) => {
  return (
    <div className="flex gap-10 my-8">
      {choices.map((choice, index) => {
        // Determine styling based on selection and correctness
        let bgClass = "bg-slate-200 hover:bg-blue-100"; // default

        // User selects answer
        if (selectedAnswer) {
          if (choice === correctAnswer && selectedAnswer !== correctAnswer) {
            bgClass = "bg-green-200"; // highlight correct if user was wrong
          } else if (choice === selectedAnswer) {
            bgClass =
              selectedAnswer === correctAnswer ? "bg-green-400" : "bg-red-300";
          } else {
            bgClass = "bg-slate-400"; // other options dim
          }
        }

        return (
          <button
            key={index}
            onClick={() => {
              if (!selectedAnswer) onAnswer(choice);
            }}
            disabled={!!selectedAnswer}
            className={`border px-12 py-2 rounded-md font-semibold ${bgClass} ${
              !selectedAnswer ? "hover:cursor-pointer" : "cursor-not-allowed"
            }`}
          >
            {choice}
          </button>
        );
      })}
    </div>
  );
};

export default MultipleChoice;