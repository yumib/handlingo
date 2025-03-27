import numpy as np
import tensorflow as tf
import tensorflowjs as tfjs


class KeyPointClassifier(object):
    def __init__(self,
        model_path= "model/keypoint_classifier/tfjs_model/model.json",
        ):
        #load model
        self.model = tfjs.converters.load_keras_model(model_path)


    def __call__(self,landmark_list):
        # Convert the input into a format suitable for the model
        input_data = np.array([landmark_list], dtype=np.float32)

        # Run inference on the model and get the result
        result = self.model.predict(input_data)

        # Get the index of the max value from the result (same as np.argmax)
        result_index = np.argmax(np.squeeze(result))

        return result_index
