

const tf = require('@tensorflow/tfjs');

//WORKING
function prediction(){
  const model = await tf.loadLayersModel('model/model.json');
  // Convert Image to tensorflow Image
  const person1_image = tf.fromPixels(image1);
  const person2_image = tf.fromPixels(image2);

  //Make a prediction using the model
  const prediction1 = model.predict(person1_image);
  const prediction2 = model.predict(person2_image);

  //Returns an array of indexes [n, n]
  return [prediction1.indexOf(Math.max(...prediction1)), prediction2.indexOf(Math.max(...prediction2))]
}
