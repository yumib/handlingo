"use client"; // Specifies that this component runs on the client side

import React, { useRef, useState, useEffect } from "react"; // Import necessary hooks
import Webcam from "react-webcam"; // Import the webcam component

// Define video constraints (resolution and facing mode)
const videoConstraints = {
    width: 640,
    height: 360,
    facingMode: "user", // Uses the front camera
};

const CameraComponent = () => {
    // Refs to store webcam and video elements
    const webcamRef = useRef<Webcam>(null); // Reference to the webcam component
    const videoRef = useRef<HTMLVideoElement>(null); // Reference to the video element

    // State variables to track recording status, media recorder, and video URL
    const [isRecording, setIsRecording] = useState(false); // Tracks if recording is active
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null); // Stores the media recorder instance
    const [videoUrl, setVideoUrl] = useState<string | null>(null); // Stores the recorded video URL

    // Function to start recording
    const startRecording = () => {
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

    return (
        <div>
            <h1>Test Camera</h1>
            
            {/* Webcam component with specified constraints */}
            <Webcam
                ref={webcamRef}
                audio={false}
                width={640}
                height={360}
                videoConstraints={videoConstraints}
                style={{transform: 'scaleX(-1)'}}
            />

            {/* Button to start/stop recording */}
            <div>
                <button onClick={isRecording ? stopRecording : startRecording}>
                    {isRecording ? "Stop Recording" : "Start Recording"}
                </button>
            </div>
        </div>
    );
};

export default CameraComponent; // Export the component for use in other files