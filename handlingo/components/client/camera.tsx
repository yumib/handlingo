/*
    This file will handle the video stream and capture frames
    We then pass the video feed and frames to CameraFeed.tsx for processing
*/

// Specifies that this component runs on the client side
"use client"; 

import React, { useRef, useEffect } from "react"; 
import Webcam from "react-webcam"; 

// Define video constraints (resolution and facing mode)
const videoConstraints = {
    width: 640,
    height: 360,
    facingMode: "user", // Uses the front camera
};

type CameraComponentProps = {
  onFrameCaptured: (frame: HTMLVideoElement) => void; // Callback to send frames up
  width?: number;
  height?: number;
};

const CameraComponent = ({ onFrameCaptured, width = 640, height = 360 }: CameraComponentProps) => {
    // Refs to store webcam and video elements
    const webcamRef = useRef<Webcam>(null); 
    const videoRef = useRef<HTMLVideoElement>(null);

    // start camera
    useEffect(() => {
        const startVideo = async () => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          } catch (err) {
            console.error("Error accessing camera: ", err);
          }
        };
    
        startVideo();

        return () => {
            // Cleanup video stream on component unmount
            if (videoRef.current && videoRef.current.srcObject) {
              const stream = videoRef.current.srcObject as MediaStream;
              const tracks = stream.getTracks();
              tracks.forEach(track => track.stop());
            }
          };
    }, []);

    // capture frames
    useEffect(() => {
        if (videoRef.current) {
          // Capture a frame every 100ms or any interval you'd like
          const interval = setInterval(() => {
            if (videoRef.current) {
              onFrameCaptured(videoRef.current); // Pass video element to parent
            }
          }, 100); // 100ms interval to grab frames
    
          return () => clearInterval(interval); // Cleanup interval on component unmount
        }
      }, [onFrameCaptured]);
    
      return <video ref={videoRef} autoPlay playsInline muted />;
    };

    /*
    // Function to start recordings
    const startVideo = () => {
        // Ensure the webcam is active and has a video source
        if (webcamRef.current?.video?.srcObject) {
            const stream = webcamRef.current.video.srcObject as MediaStream; // Get the webcam stream
            const recorder = new MediaRecorder(stream); // Create a MediaRecorder instance

            const chunks: Blob[] = []; // Array to store recorded video chunks

            // Event listener to collect video data chunks
            recorder.ondataavailable = (e) => chunks.push(e.data);

            // When recording stops, create a video URL from the recorded data
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: "video/webm" }); // Create a Blob from chunks
                setVideoUrl(URL.createObjectURL(blob)); // Generate a URL for playback
            };

            recorder.start(); // Start recording
            setMediaRecorder(recorder); // Store the recorder instance
            setIsRecording(true); // Update recording state
        }
    };
  

    // Function to stop recording
    const stopRecording = () => {
        mediaRecorder?.stop(); // Stop the media recorder if it exists
        setIsRecording(false); // Update recording state
    };
    */
   /*
    return (
        <div>
            <h1>Test Camera</h1>
            
            {/* Webcam component with specified constraints */ /*}
            <Webcam
                ref={webcamRef}
                audio={false}
                width={640}
                height={360}
                videoConstraints={videoConstraints}
                style={{transform: 'scaleX(-1)'}}
            />

            {/* Button to start/stop recording }*/ /*
            <div>
                <button onClick={isRecording ? stopRecording : startRecording}>
                    {isRecording ? "Stop Recording" : "Start Recording"}
                </button>
            </div>
        </div>
    );
};
*/

export default CameraComponent; // Export the component for use in other files