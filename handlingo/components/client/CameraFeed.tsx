"use client"; //client component

import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import { getLandmarkData } from '@/utils/getLandmarkData';
import * as handpose from '@tensorflow-models/handpose';
import { HandLandmarker, HandLandmarkerResult, HandLandmarkerOptions, FilesetResolver } from '@mediapipe/tasks-vision';
import CameraComponent from '@/components/client/camera';
import { letter_A, letter_R } from '@/model/predefined_letters';

export default function CameraFeed({ 
  targetLetter, 
  onNext, 
  onPrediction, 
  status, 
  setStatus 
  }: { 
  targetLetter: string; 
  onNext: () => void; 
  onPrediction: (predictedLetter: string) => void; 
  status: string;
  setStatus: React.Dispatch<React.SetStateAction<'red' | 'yellow' | 'green'>>;
  }) {

  //const videoRef = useRef<HTMLVideoElement| null>(null);
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const [holdTime, setHoldTime] = useState(0);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
  const [handLandmarker, setHandLandmarker] = useState<HandLandmarker | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);//tracks if the video is ready to be used
  const [pointsAwarded, setPointsAwarded] = useState(false);// tracks if we've given points for the question already

  // This loads the model + calls camera start function
  useEffect(() => {
    const loadModel = async () => {
      try {
        console.log("the model should be loaded");
        const loadedModel = await tf.loadLayersModel('/tfjs_model/model.json'); //might need to update model path
        setModel(loadedModel);
        console.log("the model is loaded", loadedModel);
      } catch (error) {
        console.error('Error loading model:', error);
      }
    };


    // Initialize the hand landmarker from @mediapipe/tasks-vision
    const loadHandLandmarker = async () => {
      try {
        console.log("Loading HandLandmarker...");
        const fileset = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        //only detects first detected hand rn. In future, can update to 2 for more complex gestures
        const landmarker = await HandLandmarker.createFromOptions(fileset, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-assets/hand_landmarker.task',
          },
          runningMode: 'VIDEO',
          numHands: 1
        });
        setHandLandmarker(landmarker);
        console.log("It worked");
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
  //recheck this area to make sure data is being properly read/fed
  //data could not be getting read correctly with how it is getting flattended/processed in getlandmark but unsure
  //recheck to make sure data is getting properly read 
  const processFrame = async (videoElement: HTMLVideoElement) => {
    if (!model || !handLandmarker) {
      console.log("Model:", model ? "Loaded" : "Not loaded");
      //console.log("Video Reference:", videoRef.current ? "Loaded" : "Not loaded");
      console.log("HandLandmarker:", handLandmarker ? "Loaded" : "Not loaded");
      return;
    };
    if (!videoElement || videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
      console.warn("Video not ready yet.");
      return;
    }
    if (videoElement.readyState < 2) {
      console.error("Video not ready yet.");
      return;
    }
    try {
      // Detect hand landmarks using Mediapipe HandLandmarker
      //const video = videoElement;
      const result: HandLandmarkerResult = handLandmarker.detectForVideo(videoElement, performance.now()); //issue
      //console.log("HandLandmarker result:", result);
      if (!result.landmarks || result.landmarks.length === 0) {
        console.warn("No hands detected, skipping frame.");
        return;// exit early to prevent crashing
      }
      // give landmaks to getLandmarkData to get input for model
      if (result && result.landmarks.length > 0) {
        const landmarkData = getLandmarkData(result, 640, 360); //numbers are video dimensions from camera.tsx i was too lazy to grab the variable (cass)
        if (!landmarkData) {
          console.warn("LandmarkData is empty");
          return;
        }
        // console.log("Landmark Data: ", landmarkData);
        const controlledVar = letter_A;

        console.log("Landmark Data: ", controlledVar);
        let prediction = null;
        let predictedLetter = null;

        // give landmarkdata to model (if not null)
        if (landmarkData && model) {
          // model predict
          // const inputArray = Array.isArray(landmarkData) ? landmarkData : landmarkData.arraySync();
          const inputArray = Array.isArray(landmarkData) ? landmarkData : landmarkData.arraySync();
          console.log("InputArray Data: ", inputArray);
          // const inputArray=landmarkData;
          const inputTensor = tf.tensor(inputArray).reshape([1, 42]);
          console.log("InputTensor Data: ", inputTensor);
          prediction = model.predict(inputTensor) as tf.Tensor;
          const output = prediction.dataSync();
          // convert output tensor to array
          prediction = prediction.dataSync() as Float32Array;
          prediction = Array.from(prediction)

          console.log("Output: ", output);

          // Index of prediction max value
          const maxIndex = prediction.indexOf(Math.max(...prediction));
          console.log("Max Index: ", maxIndex);

          // Map the index to a letter (A-Z)
          predictedLetter = String.fromCharCode(65 + maxIndex); // this works for all letters
          console.log("Predicted Letter: ", predictedLetter);
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
          else if (status == "yellow" && holdTime >= 3) {
            setStatus("green");
            setPointsAwarded(true);
          }
        }
        else {
          resetHoldTimer();
          setStatus("red");
        }
      }
    }
    catch (error) {
      console.error("Error in processFrame", error);
    }
  };

  const handleNext = async () => {
    if (status === "green" && !pointsAwarded) {
      try {
        const res = await fetch("/api/points", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // this is how many points we're giving when we use their camera(during an exam) and they get the sign right
          body: JSON.stringify({ amount: 5 }), 
        });
  
        if (!res.ok) {
          const error = await res.json();
          console.error("Failed to give points:", error);
        } else {
          console.log("The points worked");
        }
      } catch (error) {
        console.error("Error giving points:", error);
      }
    }
    resetHoldTimer();
    setPointsAwarded(false);
    onNext();
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (handLandmarker && model && isVideoReady) {
        const video = document.querySelector("video")
        if (video) {
          processFrame(video);
        }
      }
    },500); //change the 100ms if needed
    //we changed it to 500ms since it made it more accurate
    return () => clearInterval(interval);
  }, [model, handLandmarker, isVideoReady]); //not sure if need or dont need handLandmarker

  return (
    <div className="flex justify-center items-center p-0 m-0 overflow-hidden">
      {/*<video ref={videoRef} autoPlay playsInline muted width={640} height={360} />*/}
      <CameraComponent onFrameCaptured={processFrame} />
      {/*<div>
        <h2>Status: {status.toUpperCase()}</h2>
        {status === 'yellow' && <p>Hold for {3 - holdTime}s...</p>}
        {status === 'green' && <button onClick={onNext}>Next</button>}
      </div>*/}
    </div>
  );

}