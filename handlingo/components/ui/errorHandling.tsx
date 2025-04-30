"use client";

import { useEffect, useState } from "react";

// Allow message values to be either string or string[] (for multiple errors)
type RawMessage = { [key: string]: string | string[] | undefined };

export function PopUp({ message }: { message?: RawMessage }) {
  const [visible, setVisible] = useState(true);

  // Extract error or success from searchParams
  const errorText = message?.error;
  const successText = message?.success;

  // No message to show
  if (!errorText && !successText) return null;

  const isError = !!errorText; // boolean (used for styling later)
  const text = errorText || successText || "";

  // whenever text changes and is not empty, set visible to true
  useEffect(() => {
    if (text) setVisible(true);
  }, [text]);

  if (!visible) return null;

  return (
     // 🆕 Center the error message horizontally
     <div className="flex justify-center w-full mt-4">
        <div
       // 🆕 Updated styles: responsive width + consistent layout
       className={`text-sm rounded-md px-4 py-2 border w-[90%] max-w-md font-nunito ${
         isError
           ? "text-red-600 bg-red-50 border-red-400"
           : "text-green-700 bg-green-50 border-green-400"
       }`}
      role="alert"
    >
      {
          // support multiple errors as bullet points
          Array.isArray(text) ? (
            <ul className="list-disc list-inside">
              {text.map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          ) : (
            text
          )
        }
        </div>
    </div>
  );
}