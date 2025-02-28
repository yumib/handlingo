const tf = require('@tensorflow/tfjs-node');


async function loadModel() {
    try {
        const model = await tf.loadLayersModel('file://tfjs_model/model.json');
        console.log("Model loaded successfully.");
        printModelSummary(model); // Print model architecture
    } catch (error) {
        console.error("Error loading model:", error);
    }
}


function printModelSummary(model) {
    console.log("Model Summary:");
    console.log("========================");
    model.layers.forEach((layer, index) => {
        console.log(`Layer ${index + 1}: ${layer.name}`);
        console.log(`   Type: ${layer.className}`);
        console.log(`   Output Shape:`, layer.outputShape);
        console.log(`   Parameters: ${layer.countParams()}`);
        console.log("------------------------");
    });
    console.log(`Total Trainable Parameters: ${model.countParams()}`);
}

loadModel();
