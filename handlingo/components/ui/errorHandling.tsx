"use client";

import { useEffect, useState } from "react";

type RawMessage = { [key: string]: string | undefined };

export function PopUp({ message }: { message?: RawMessage }) {
  const [visible, setVisible] = useState(true);

  // Extract error or success from searchParams
  const errorText = message?.error;
  const successText = message?.success;

  // No message to show
  if (!errorText && !successText) return null;

  const isError = !!errorText;
  const text = errorText || successText || "";

  useEffect(() => {
    if (text) setVisible(true);
  }, [text]);

  if (!visible) return null;

  return (
    <div
      className={`mt-2 text-sm rounded-md px-4 py-2 border w-[calc(95%-20px)] h-10 flex items-center ${
        isError
          ? "text-red-600 bg-red-50 border-red-400"
          : "text-green-700 bg-green-50 border-green-400"
      }`}
      role="alert"
    >
      {text}
    </div>
  );
}