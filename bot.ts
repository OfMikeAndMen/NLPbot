require("dotenv").config();
if (!process.env.d_TOKEN) {
    throw new Error("no discord token set");
}

// import { Client } from "eris";
import { Client, Message } from 'eris'
import fs from 'fs';
import { BayesClassifier } from 'natural';
// import { BayesClassifier, PorterStemmer } from 'natural';
import { phrase } from 'types/nlp';
let cmds = require("./cmds.json");

const bot = new Client(process.env.d_TOKEN, {
    // "allowedMentions": { "everyone": true },
    "autoreconnect": true
});

// let aclassifier: BayesClassifier;
// BayesClassifier.load('classifier/classifications.json', PorterStemmer, (err, classifier) => {
//     if (err) throw err;
//     aclassifier = classifier
// });

let classifier = new BayesClassifier();
require('./classifier/training.json').phrases.forEach((element: phrase) => {
    classifier.addDocument(element.phrase, element.key)
});
classifier.train();
classifier.save('classifier/classifications.json', () => { })

bot.on("ready", () => {
    console.log(new Date() + " - bot ready");
});

bot.on("messageCreate", (msg: Message) => { // When a message is created

    if (msg.channel.type === 0 && msg.member) {

        // let serverID = msg.member.guild.id;
        // let messageID = msg.id;
        let channelID = msg.channel.id;
        // let userID = msg.member.id;
        let message = msg.content;

        if (message.substring(0, 1) == '!') {
            let args = message.substring(1).split(' ');
            let cmd = args.shift();

            switch (cmd) {

                case "cmds": //lists all commands in cmds.json
                    bot.createMessage(channelID, Object.keys(cmds).join(" "));
                    break;

                case "addcmd":
                    if (channelID === "735315394151055491" && args[0] && args[1]) { //only allow adding commands from #test
                        const newCmd = args.shift();
                        if (newCmd && cmds[newCmd] === undefined) { //dont add command if it exists already
                            cmds[newCmd] = args.join(" ");
                            bot.createMessage(channelID, "Added command: " + newCmd)
                            fs.writeFile("./cmds.json", JSON.stringify(cmds, null, 2), () => { })
                        }
                    }
                    break;

                case "editcmd":
                    if (channelID === "735315394151055491" && args[0] && args[1]) { //only allow editing commands from #test
                        const newCmd = args.shift();
                        if (newCmd && cmds[newCmd] !== undefined) { //make sure command exists
                            cmds[newCmd] = args.join(" ");
                            bot.createMessage(channelID, "Edited command: " + newCmd)
                            fs.writeFile("./cmds.json", JSON.stringify(cmds, null, 2), () => { })
                        }
                    }
                    break;

                case "deletecmd":
                    if (channelID === "735315394151055491" && args[0]) { //only allow editing commands from #test
                        const newCmd = args.shift();
                        if (newCmd && cmds[newCmd] !== undefined) { //make sure command exists
                            delete cmds[newCmd]; //delete command
                            bot.createMessage(channelID, "Deleted command: " + newCmd)
                            fs.writeFile("./cmds.json", JSON.stringify(cmds, null, 2), () => { })
                        }
                    }
                    break;

                default:
                    if (cmd && cmds[cmd]) {
                        bot.createMessage(channelID, cmds[cmd])
                    }
                    break;
            }
        } else {
            console.log(classifier.getClassifications(message));
        }
    }
});

bot.connect(); // Get the bot to connect to Discord