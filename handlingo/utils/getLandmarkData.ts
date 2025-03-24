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

  // Only process the first detected hand (since you only need one)
  const hand = result.landmarks[0];

  // ensure 21 landmarks (for consistency)
  if (hand.length !== 21) {
    console.warn("Unexpected number of hand landmarks:", hand.length);
    return null;
  }

  // Flatten the [x, y] pairs into a single comma-separated string
  const normalizedData = hand
    .map((point) => [point.x / imageWidth, point.y / imageHeight]) //normalize using image dimensions
    .flat(); // flatten into a 1D array
  // Create the tensor
  const tensor = tf.tensor([normalizedData]);

  // Dispose of old tensors to free memory
  tf.tidy(() => {
    tensor.clone(); 
  });

  // Return tensor 
  return tensor;
};
