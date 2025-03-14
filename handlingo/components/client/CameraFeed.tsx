"use client"; //client component

import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import { getLandmarkData } from '@/utils/getLandmarkData';
import * as handpose from '@tensorflow-models/handpose';
import { HandLandmarker, HandLandmarkerResult, HandLandmarkerOptions, FilesetResolver } from '@mediapipe/tasks-vision';
import CameraComponent from '@/components/client/camera';
import { Fascinate } from 'next/font/google';


export default function CameraFeed({ targetLetter , onNext, onPrediction }: { targetLetter: string; onNext: () => void; onPrediction: (predictedLetter: string) => void; }) {
  let videoElement:HTMLVideoElement|null=null;
  const videoRef = useRef<HTMLVideoElement| null>(videoElement);
  const [model, setModel] = useState<tf.LayersModel | null>(null); 
  const [status, setStatus] = useState('red'); // 'red', 'yellow', 'green'
  const [holdTime, setHoldTime] = useState(0);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
  const [handLandmarker, setHandLandmarker] = useState<HandLandmarker | null>(null);
  const [isVideoReady, setIsVideoReady]= useState(false);//tracks if the video is ready to be used

  
  // This loads the model + calls camera start function
  useEffect(() => {
    const loadModel = async () => {
      try {
        console.log("the model should be loaded");
        const loadedModel = await tf.loadLayersModel('/tfjs_model/model.json'); //might need to update model path
        setModel(loadedModel);
        console.log("the model is loaded");
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
        const landmarker = await HandLandmarker.createFromOptions(fileset,  { 
          baseOptions:{
            modelAssetPath:'https://storage.googleapis.com/mediapipe-assets/hand_landmarker.task',
          },
          runningMode: 'VIDEO',
          numHands: 1});
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
  const processFrame = async (videoElement:HTMLVideoElement|null) => {
    if (!model || !videoElement || !handLandmarker)
      { 
        console.log("the if stops us");
        if(!model)
          {
            console.log("the model stops us");
          }
          if(!videoElement)
          {
            console.log("the video stops us");
          }
          if(!handLandmarker)
          {
            console.log("the handLandmarker stops us");
          }
        return;
      };
    try{
    // Detect hand landmarks using Mediapipe HandLandmarker
    const video = videoElement;
    const result: HandLandmarkerResult = handLandmarker.detectForVideo(video,performance.now()); //issue
    // console.log("HandLandmarker result:", result);
    if (!result.landmarks || result.landmarks.length === 0){
      console.warn("No hands detected, skipping frame.");
      return;// exit early to prevent crashing
    }
    
    
    // give landmaks to getLandmarkData to get input for model
    if (result && result.landmarks.length > 0) {
      const landmarkData = getLandmarkData(result, 640, 360); //numbers are video dimensions from camera.tsx i was too lazy to grab the variable (cass)

      
      let prediction = null;
      let predictedLetter = null;

      // give landmarkdata to model (if not null)
      if (landmarkData && model) {
        // model predict
        const inputArray = Array.isArray(landmarkData) ? landmarkData : landmarkData.arraySync();
        const inputTensor = tf.tensor(inputArray).reshape([42, 3]);
        prediction = model.predict(inputTensor) as tf.Tensor; 

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
  }
  catch(error)
  {
    console.error("Error in processFrame",error);
  } 
  };

  const handleNext = () => {
    resetHoldTimer();
    onNext();
  };
  useEffect(()=>{
    if(videoRef.current)
    {
      const video =videoRef.current;
      video.oncanplay=()=>{setIsVideoReady(true);}
      video.onloadeddata = () => {
        setIsVideoReady(true);
      }
      video.onerror=()=>{
        console.error("Error loading video");
        setIsVideoReady(false);
      }
    }
  },[]);
  useEffect(() => {
    const interval = setInterval(()=>{
      if(handLandmarker&&model&&isVideoReady)
      {
        processFrame(videoRef.current);
      }},100); //change the 100ms if needed
    return () => clearInterval(interval);
  }, [model, handLandmarker,isVideoReady]); //not sure if need or dont need handLandmarker


  return (
    <div>
      {/*<video ref={videoRef} autoPlay playsInline muted width={640} height={360} />*/}
      <CameraComponent onFrameCaptured={(videoElement) => processFrame(videoElement)}/>
      <div>
        <h2>Status: {status.toUpperCase()}</h2>
        {status === 'yellow' && <p>Hold for {3 - holdTime}s...</p>}
        {status === 'green' && <button onClick={onNext}>Next</button>}
      </div>
    </div>
  );

}