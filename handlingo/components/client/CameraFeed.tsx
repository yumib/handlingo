"use client"; //client component

import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import { getLandmarkData } from '@/utils/getLandmarkData';
import * as handpose from '@tensorflow-models/handpose';
import { HandLandmarker, HandLandmarkerResult, HandLandmarkerOptions, WasmFileset, NormalizedLandmark } from '@mediapipe/tasks-vision';


export default function CameraFeed({ targetLetter , onNext, onPrediction }: { targetLetter: string; onNext: () => void; onPrediction: (predictedLetter: string) => void; }) {
  const videoRef = useRef(null);
  const [model, setModel] = useState<tf.LayersModel | null>(null); 
  const [status, setStatus] = useState('red'); // 'red', 'yellow', 'green'
  const [holdTime, setHoldTime] = useState(0);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
  const [handLandmarker, setHandLandmarker] = useState<HandLandmarker | null>(null);
  //const [landmarks, setLandmarks] = useState<NormalizedLandmark[] | any[]>([]);


  // This loads the model + calls camera start function
  useEffect(() => {
    const loadModel = async () => {
      try {
        const loadedModel = await tf.loadLayersModel('file://model/tfjs_model/model.json'); //might need to update model path
        setModel(loadedModel);
      } catch (error) {
        console.error('Error loading model:', error);
      }
    };

    // Initialize the hand landmarker from @mediapipe/tasks-vision
    const loadHandLandmarker = async () => {
      try {
        const wasmFileset = await WasmFileset.load('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/hand_landmarker/hand_landmarker_model.tflite');
        //only detects first detected hand rn. In future, can update to 2 for more complex gestures
        const handLandmarkerOptions: HandLandmarkerOptions = { numHands: 1 }; 
        const landmarker = await HandLandmarker.createFromOptions(wasmFileset, handLandmarkerOptions);
        setHandLandmarker(landmarker);
      } catch (error) {
        console.error('Error loading hand landmarker:', error);
      }
    };

    loadModel();
    loadHandLandmarker();
  }, []);


  // timer to make sure user is actually signing correctly & not just accident
  const startHoldTimer = () => {
    setHoldTime(0);

    const id = setInterval(() => {
      setHoldTime((prevTime) => {
        if (prevTime >= 3) {
          clearInterval(id);
          setStatus('green');
          return prevTime;
        }
        return prevTime + 1;
      });
    }, 1000); // 1 second

    setTimerId(id);
  };

  const resetHoldTimer = () => {
    if (timerId) clearInterval(timerId);
    setHoldTime(0);
    setStatus('red');
  };


  // camera feed -> get landmarks -> converts to input array for model -> gets model prediction
  const processFrame = async () => {
    if (!model || !videoRef.current || !handLandmarker) return;

    // Detect hand landmarks using Mediapipe HandLandmarker
    const video = videoRef.current;
    const result: HandLandmarkerResult = await handLandmarker.detect(video);
    
    // give landmaks to getLandmarkData to get input for model
    if (result && result.landmarks.length > 0) {
      const landmarkData = getLandmarkData(result, 640, 360); //numbers are video dimensions from camera.tsx i was too lazy to grab the variable (cass)
      let prediction = null;
      let predictedLetter = null;

      // give landmarkdata to model (if not null)
      if (landmarkData) {
        // model predict
        prediction = model.predict(landmarkData) as tf.Tensor; 

        // convert output tensor to array
        prediction =  prediction.dataSync() as Float32Array;
        prediction = Array.from(prediction)

        // Index of prediction max value
        const maxIndex = prediction.indexOf(Math.max(...prediction));
        
        // Map the index to a letter (A-Z)
        predictedLetter = String.fromCharCode(65 + maxIndex); // this works for all letters
      }
      
      // Call the onPrediction callback to send the predicted letter to page.tsx
      if (predictedLetter) {
        onPrediction(predictedLetter);
      }

      // traffic light based on if model output = target letter
      if (predictedLetter === targetLetter) {
        if (status === "red") {
          setStatus("yellow");
          startHoldTimer();
        } 
        else if(status == "yellow" && holdTime >= 3){
          setStatus("green");
        }
      } 
      else {
        resetHoldTimer();
        setStatus("red");
      }
    } 


  const handleNext = () => {
    resetHoldTimer();
    onNext();
  };

  useEffect(() => {
    const interval = setInterval(processFrame, 100); //change the 100ms if needed
    return () => clearInterval(interval);
  }, [model, handLandmarker]);

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline muted width={640} height={360} />
      <div>
        <h2>Status: {status.toUpperCase()}</h2>
        {status === 'yellow' && <p>Hold for {3 - holdTime}s...</p>}
        {status === 'green' && <button onClick={onNext}>Next</button>}
      </div>
    </div>
  );
}
}