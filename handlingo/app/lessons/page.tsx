"use client";

import React, { useState } from 'react';
import CameraFeed from '@/components/client/CameraFeed';


export default function AlphabetLesson() {
  const [letter, setLetter] = useState<string | null>(null);

  return (
    <div>
      <h1>ASL Alphabet Lesson</h1>
      <p>Show a sign to your camera, and we'll tell you what letter it is!</p>

      {/* Pass the onPrediction prop to CameraFeed */}
      <CameraFeed 
        targetLetter="A" 
        onNext={() => console.log('Next button clicked')} 
        onPrediction={(predictedLetter) => setLetter(predictedLetter)} 
      />
      
      <div>
        <h2>Prediction:</h2>
        <p>{letter ? `Detected Letter: ${letter}` : "Waiting for prediction..."}</p>
      </div>
    </div>
  );
}
