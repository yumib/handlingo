"use client";
import React from "react";
import { cn } from "@/lib/utils"; 

type TrafficLightProps = {
  status: "red" | "yellow" | "green";
  holdTime?: number; // only needed if you want to show countdown
};

const TrafficLight: React.FC<TrafficLightProps> = ({ status }) => {
    return (
        <div className="flex flex-col items-center space-y-2">
            {/* Traffic Lights */}
            <div className="flex space-x-4">
                {/* Red */}
                <div
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl font-bold 
                    ${status === "red" ? "bg-red-400 border-black text-black" : "bg-red-100 border-gray-400 text-red-500"}`}
                >
                ✕
                </div>
        
                {/* Yellow */}
                <div
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl font-bold 
                    ${status === "yellow" ? "bg-yellow-200 border-gray-600 text-gray-700" : "bg-yellow-50 border-gray-400 text-yellow-500"}`}
                >
                !
                </div>
        
                {/* Green */}
                <div
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl font-bold 
                    ${status === "green" ? "bg-green-200 border-green-700 text-green-700" : "bg-green-50 border-gray-400 text-green-500"}`}
                >
                ✓
                </div>
            </div>

            {/* Text Prompts */}
            {status === "yellow" && (
                <p className="text-yellow-700 font-medium text-sm mt-1">That's it! Hold it for a sec...!</p>
            )}
            {status === "green" && (
                <p className="text-green-700 font-medium text-sm mt-1">Perfect! Awesome job.</p>
            )}

        </div>
    );
  };

export default TrafficLight;
