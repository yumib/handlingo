import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as handpose from '@tensorflow-models/handpose';
import { drawHand } from '../utils/drawHand';
import { getLandmarkData } from '../utils/getLandmarkData';

export default function CameraFeed({ targetLetter, onNext }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [model, setModel] = useState(null);
  const [landmarks, setLandmarks] = useState([]);
  const [status, setStatus] = useState('red'); // 'red', 'yellow', 'green'
  const [holdTime, setHoldTime] = useState(0);
  const [timerId, setTimerId] = useState(null);

  useEffect(() => {
    const loadModel = async () => {
      const handposeModel = await handpose.load();
      setModel(handposeModel);
    };

    loadModel();
    startVideo();
  }, []);

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => console.error(err));
  };

  const detect = async () => {
    if (!model || !videoRef.current || !videoRef.current.readyState === 4) return;

    const video = videoRef.current;
    const predictions = await model.estimateHands(video);

    if (predictions.length > 0) {
      const lm = getLandmarkData(predictions[0].landmarks);
      setLandmarks(lm);

      // 👉 Here you call your ASL model to classify the sign
      const prediction = await classifySign(lm);

      if (prediction === targetLetter) {
        if (status === 'red') {
          setStatus('yellow');
          startHoldTimer();
        }
      } else {
        resetHoldTimer();
        setStatus('red');
      }
    }

    drawHand(predictions, canvasRef.current);
  };

  const classifySign = async (landmarkData) => {
    // 🚀 This is where you integrate your TensorFlow.js ASL model
    // Mocking it for now
    const isCorrect = Math.random() > 0.5;
    return isCorrect ? targetLetter : 'wrong';
  };

  const startHoldTimer = () => {
    setHoldTime(0);

    const id = setInterval(() => {
      setHoldTime((prevTime) => {
        if (prevTime >= 2) {
          clearInterval(id);
          setStatus('green');
          return prevTime;
        }
        return prevTime + 1;
      });
    }, 1000);

    setTimerId(id);
  };

  const resetHoldTimer = () => {
    if (timerId) clearInterval(timerId);
    setHoldTime(0);
    setStatus('red');
  };

  const handleNext = () => {
    resetHoldTimer();
    onNext();
  };

  useEffect(() => {
    const interval = setInterval(detect, 100);
    return () => clearInterval(interval);
  }, [model]);

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline muted />
      <canvas ref={canvasRef} />
      <div>
        <h2>Status: {status.toUpperCase()}</h2>
        {status === 'yellow' && <p>Hold for {2 - holdTime}s...</p>}
        {status === 'green' && (
          <button onClick={handleNext}>Next</button>
        )}
      </div>
    </div>
  );
}