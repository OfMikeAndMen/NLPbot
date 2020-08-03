import { LogisticRegressionClassifier, BayesClassifier } from "natural";
import { performance } from "perf_hooks";

console.log(">> Begin training");
const start = performance.now();

let classifier = new LogisticRegressionClassifier();
let altClass = new BayesClassifier();
const phrases = require("./training.json");

for (const key of Object.keys(phrases)) {
  for (const text of phrases[key] as string[]) {
    classifier.addDocument(text, key);
    altClass.addDocument(text, key);
  }
  console.log(key + " done");
}

const classi1 = performance.now();
classifier.train();
classifier.save("./classifier/classifications.json", () => {});
console.log(
  ">> finished training LRC in " +
    (performance.now() - classi1).toFixed(2) +
    " milliseconds"
);

const classi2 = performance.now();
altClass.train();
altClass.save("./classifier/alttraining.json", () => {});
console.log(
  ">> finished training Bayes in " +
    (performance.now() - classi2).toFixed(2) +
    " milliseconds"
);

const fin = performance.now();
console.log(
  ">>> finished training. total time: " +
    (fin - start).toFixed(2) +
    " milliseconds"
);
