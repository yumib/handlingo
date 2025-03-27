import { HandLandmarkerResult } from "@mediapipe/tasks-vision";
import * as tf from '@tensorflow/tfjs';

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

  const minX=Math.min(...hand.map((point)=> point.x));
  const maxX=Math.max(...hand.map((point)=> point.x));
  const minY=Math.min(...hand.map((point)=> point.y));
  const maxY=Math.max(...hand.map((point)=> point.y));
  // Flatten the [x, y] pairs into a single comma-separated string
  //could be an issue here not sure
  const normalizedData = hand
    .map((point) => [
      (point.x - minX) / (maxX - minX), 
      (point.y - minY) / (maxY - minY)
    ]) //normalize using image dimensions
    .flat(); // flatten into a 1D array

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
