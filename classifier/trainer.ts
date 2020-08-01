import { BayesClassifier } from 'natural';

let classifier = new BayesClassifier();
const phrases = require('./training.json');

Object.keys(phrases).forEach(key => {
    for (const text of phrases[key]) {
        classifier.addDocument(text, key);
    }
});

classifier.train();
// classifier.save('./classifications.json', () => { })