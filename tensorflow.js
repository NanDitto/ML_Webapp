//import * as tf from '@tensorflow/tfjs-node';

const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');

console.log(model);

async function prediction(image1, image2){
  const model = await tf.loadLayersModel('model/model.json');

  //Make a prediction using the model
  const person1_image = tf.fromPixels(image1);
  const person2_image = tf.fromPixels(image2);

  const prediction1 = model.predict(person1_image);
  const prediction2 = model.predict(person2_image);


  //return 'rock' , 'paper' -> Person1, Person2
}
