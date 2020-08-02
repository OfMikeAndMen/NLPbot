import { LogisticRegressionClassifier } from 'natural';
import { performance } from 'perf_hooks';

console.log(">> Begin training");
const start = performance.now();

let classifier = new LogisticRegressionClassifier();
const phrases = require('./training.json');

for(const key of Object.keys(phrases)) {
    for (const text of phrases[key] as string[]) {
        classifier.addDocument(text, key);
    }
    console.log(key + " done");
};

classifier.train();
classifier.save('./classifier/classifications.json', () => { })

const fin = performance.now();
console.log("finished training. total time: " + (fin - start).toFixed(2) + " milliseconds")