import { HandLandmarkerResult } from "@mediapipe/tasks-vision";
import * as tf from '@tensorflow/tfjs';
import { Noto_Sans_Indic_Siyaq_Numbers } from "next/font/google";

/**
 * Extracts the 2D hand landmark data from the detection result and converts it to a tensor.
 * Returns a tensor representing the landmarks (flattened), as well as the CSV formatted string.
 * 
 * @param result The hand landmarker detection result.
 * @param imageWidth The width of the input image (needed for normalization).
 * @param imageHeight The height of the input image (needed for normalization).
 * @returns A tensor representing the normalized landmarks, or null if invalid.
 */

export const getLandmarkData = (result: HandLandmarkerResult, imageWidth: number, imageHeight: number): tf.Tensor | null => {
  if (!result.landmarks || result.landmarks.length === 0) {
    return null;
  }

  //console.log("Initial Result: ", result);

  // Only process the first detected hand (since you only need one)
  const hand = result.landmarks[0];

  //console.log("Hand Var: ", hand);


  // ensure 21 landmarks (for consistency)
  if (hand.length !== 21) {
    console.warn("Unexpected number of hand landmarks:", hand.length);
    return null;
  }
  // Flatten the [x, y] pairs into a single comma-separated string
  //could be an issue here not sure
  const wrist = hand[0];
  const indexBase = hand[5];
const pinkyBase = hand[17];

// Compute angle of rotation to align index-to-pinky horizontally
const dx = pinkyBase.x - indexBase.x;
const dy = pinkyBase.y - indexBase.y;
const angle = Math.atan2(dy, dx);

function rotate(x: number, y: number, angle: number): [number, number] {
  return [
    x * Math.cos(angle) + y * Math.sin(angle),
    -x * Math.sin(angle) + y * Math.cos(angle)
  ];
}
const refDistance = Math.hypot(hand[12].x - wrist.x, hand[12].y - wrist.y) || 1;
const normalizedData = hand.map(p => {
  const x = (p.x - wrist.x) / refDistance;
  const y = (p.y - wrist.y) / refDistance;
  return rotate(x, y, -angle); // rotate hand to a consistent pose
}).flat();

  //console.log("Normalized Data: ", normalizedData);

  // Create the tensor
  const tensor = tf.tensor(normalizedData).reshape([1,42]);
  //console.log("NonTidied Tensor: ", tensor)

  // Dispose of old tensors to free memory
  // tf.tidy(() => {
  //   tensor.clone();
  // });

  //console.log("Tidied Tensor: ", tensor)

  // Return tensor 
  return tensor;
};
