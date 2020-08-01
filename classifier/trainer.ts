import { BayesClassifier } from 'natural';

let classifier = new BayesClassifier();
const phrases = require('./training.json');

for(const key of Object.keys(phrases)) {
    for (const text of phrases[key]) {
        classifier.addDocument(text, key);
    }
};

classifier.train();
classifier.save('./classifier/classifications.json', () => { })