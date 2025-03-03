// this file is cass testing that the model architecture loads back correctly after conversion + that the model still works
// tested it with a sample input from the data

const tf = require('@tensorflow/tfjs-node');

// Example row of data from dataset
const inputData = [
    0.0, 0.0, 0.2459016393442623, -0.18032786885245902, 0.4262295081967213, -0.5081967213114754,
    0.45901639344262296, -0.7868852459016393, 0.4426229508196721, -1.0, 0.2459016393442623, -0.7377049180327869,
    0.2459016393442623, -0.9344262295081968, 0.19672131147540983, -0.7377049180327869, 0.19672131147540983,
    -0.5245901639344263, 0.04918032786885246, -0.7049180327868853, 0.04918032786885246, -0.9016393442622951,
    0.03278688524590164, -0.639344262295082, 0.04918032786885246, -0.4098360655737705, -0.13114754098360656,
    -0.6557377049180327, -0.13114754098360656, -0.8032786885245902, -0.11475409836065574, -0.5245901639344263,
    -0.08196721311475409, -0.32786885245901637, -0.3114754098360656, -0.5737704918032787, -0.3114754098360656,
    -0.7049180327868853, -0.26229508196721313, -0.5245901639344263, -0.22950819672131148, -0.36065573770491804
  ];

// Convert data to a tensor
const inputTensor = tf.tensor([inputData]);

// Load model
async function loadModel() {
    try {
        const model = await tf.loadLayersModel('file://tfjs_model/model.json');
        console.log("Model loaded successfully.");
        // Print model architecture
        //printModelSummary(model); 

        // prediction with sample input
        const output = model.predict(inputTensor);
        
        // Print the output (convert the tensor to a JavaScript array so we can print all of it)
        output.array().then(array => {
            console.log('Full output array:', array);
        });
    } 
    catch (error) {
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
