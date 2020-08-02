require("dotenv").config();
if (!process.env.d_TOKEN) {
  throw new Error("no discord token set");
}

import { Client } from "eris";
// import fs from 'fs';
import { PorterStemmer, LogisticRegressionClassifier } from "natural";
// import { command } from "types/nlp";
let cmds = require("./cmds.json");

const bot = new Client(process.env.d_TOKEN, {
  // "allowedMentions": { "everyone": true },
  autoreconnect: true,
});

let classifier: LogisticRegressionClassifier;
LogisticRegressionClassifier.load(
  "classifier/classifications.json",
  PorterStemmer,
  (err, _classifier) => {
    if (err) throw err;
    classifier = _classifier;
  }
);

bot.on("ready", () => {
  console.log(new Date() + " - bot ready");
});

bot.on("messageCreate", (msg) => {

  if (msg.channel.type === 0 && msg.member && !msg.author.bot) {
    // let serverID = msg.member.guild.id;
    // let messageID = msg.id;
    // let channelID = msg.channel.id;
    // let userID = msg.member.id;
    let message = msg.content;

    if (message.substring(0, 1) == "!") {
      let args = message.substring(1).split(" ");
      let cmd = args.shift();

      switch (cmd) {
        // case "cmds": //lists all commands in cmds.json
        //     bot.createMessage(channelID, Object.keys(cmds).join(" "));
        //     break;

        // case "addcmd":
        //     if (channelID === "735315394151055491" && args[0] && args[1]) { //only allow adding commands from #test
        //         const newCmd = args.shift();
        //         if (newCmd && cmds[newCmd] === undefined) { //dont add command if it exists already
        //             cmds[newCmd] = args.join(" ");
        //             bot.createMessage(channelID, "Added command: " + newCmd)
        //             fs.writeFile("./cmds.json", JSON.stringify(cmds, null, 2), () => { })
        //         }
        //     }
        //     break;

        // case "editcmd":
        //     if (channelID === "735315394151055491" && args[0] && args[1]) { //only allow editing commands from #test
        //         const newCmd = args.shift();
        //         if (newCmd && cmds[newCmd] !== undefined) { //make sure command exists
        //             cmds[newCmd] = args.join(" ");
        //             bot.createMessage(channelID, "Edited command: " + newCmd)
        //             fs.writeFile("./cmds.json", JSON.stringify(cmds, null, 2), () => { })
        //         }
        //     }
        //     break;

        // case "deletecmd":
        //     if (channelID === "735315394151055491" && args[0]) { //only allow editing commands from #test
        //         const newCmd = args.shift();
        //         if (newCmd && cmds[newCmd] !== undefined) { //make sure command exists
        //             delete cmds[newCmd]; //delete command
        //             bot.createMessage(channelID, "Deleted command: " + newCmd)
        //             fs.writeFile("./cmds.json", JSON.stringify(cmds, null, 2), () => { })
        //         }
        //     }
        //     break;

        default:
          if (cmd && cmds[cmd]) {
            // const toPost: command = cmds[cmd];
            // bot.createMessage(channelID, toPost.text, toPost.file);
            bot.createMessage("500281135226552333", `Command executed: ${cmd}`);
          }
          break;
      }
    } else {
      const classifications = classifier.getClassifications(message);

      const max = classifications.reduce((acc, curr) =>
        acc.value > curr.value ? acc : curr
      );

      if (max.value > 0.8) {
        bot.createMessage(
          "735315394151055491",
          `> ${msg.author.username}: ${message}\n\n${(max.value * 100).toFixed(2)}% confident\n\n${max.label}`
        );
        console.log(classifications);
      }
    }
  }
});

bot.connect(); // Get the bot to connect to Discord
