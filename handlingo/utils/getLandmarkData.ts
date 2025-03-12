import { HandLandmarkerResult } from "@mediapipe/tasks-vision";
import * as tf from '@tensorflow/tfjs';

/**
 * Extracts the 2D hand landmark data from the detection result and converts it to a tensor.
 * Returns a tensor representing the landmarks (flattened), as well as the CSV formatted string.
 * 
 * @param result The hand landmarker detection result.
 * @returns An object containing the tensor.
 */

export const getLandmarkData = (result: HandLandmarkerResult): tf.Tensor | null => {
  if (!result.landmarks || result.landmarks.length === 0) {
    return null;
  }

  // Only process the first detected hand (since you only need one)
  const hand = result.landmarks[0];

  // Flatten the [x, y] pairs into a single comma-separated string
  const flattenedData = hand
    .map((point) => [point.x, point.y]) // get x, y values only
    .flat(); // flatten to make it a 1D array

  // Return data as a tensor 
  return tf.tensor([flattenedData]);
};
