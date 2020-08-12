require("dotenv").config();
if (!process.env.d_TOKEN) {
  throw new Error("no discord token set");
}

import { Client, MessageFile } from "eris";
import fs from "fs";
// import {
//   PorterStemmer,
//   LogisticRegressionClassifier,
//   BayesClassifier,
// } from "natural";
import axios from "axios";
import { command } from "types/nlp";
// import { command } from "types/nlp";
let cmds = require("./cmds.json");

const bot = new Client(process.env.d_TOKEN, {
  // "allowedMentions": { "everyone": true },
  autoreconnect: true,
});

// let classifier: LogisticRegressionClassifier;
// LogisticRegressionClassifier.load(
//   "classifier/classifications.json",
//   PorterStemmer,
//   (err, _classifier) => {
//     if (err) throw err;
//     classifier = _classifier;
//   }
// );
// let altClass: BayesClassifier;
// BayesClassifier.load(
//   "classifier/alttraining.json",
//   PorterStemmer,
//   (err, _classifier) => {
//     if (err) throw err;
//     altClass = _classifier;
//   }
// );

bot.on("ready", () => {
  console.log(new Date() + " - bot ready");
});

bot.on("error", (err) => {
  console.log(err.message);
});

bot.on("messageCreate", async (msg) => {
  if (msg.channel.type === 0 && msg.member && !msg.author.bot) {
    // let serverID = msg.member.guild.id;
    // let messageID = msg.id;
    let channelID = msg.channel.id;
    // let userID = msg.member.id;
    let message = msg.content;

    if (message.substring(0, 1) == "!") {
      let args = message.substring(1).split(" ");
      let cmd = args.shift();

      switch (cmd) {
        case "cmds": //lists all commands in cmds.json
          bot.createMessage(channelID, Object.keys(cmds).join(" "));
          break;

        case "addcmd":
          // if (channelID === "735315394151055491" && args[0] && ( args[1] || msg.attachments[0])) {
          //only allow adding commands from #test
          if (args[0] && (args[1] || msg.attachments[0])) {
            try {
              const newCmd = args.shift();
              if (newCmd && cmds[newCmd] === undefined) {
                //dont add command if it exists already

                cmds[newCmd] = { text: args.join(" ") };

                if (msg.attachments[0]) {
                  bot.sendChannelTyping(channelID);

                  const file = await axios.get(msg.attachments[0].proxy_url, {
                    responseType: "stream",
                  });

                  file.data.pipe(
                    fs.createWriteStream(
                      "./media/" + msg.attachments[0].filename
                    )
                  );

                  cmds[newCmd].media = msg.attachments[0].filename;
                }

                bot.createMessage(channelID, "Added command: " + newCmd);

                fs.writeFile(
                  "./cmds.json",
                  JSON.stringify(cmds, null, 2),
                  () => {}
                );
              }
            } catch (err) {
              console.log(err);
            }
          }
          break;

        case "editcmd":
          if (channelID === "735315394151055491" && args[0] && args[1]) {
            //only allow editing commands from #test
            const newCmd = args.shift();
            if (newCmd && cmds[newCmd] !== undefined) {
              //make sure command exists
              cmds[newCmd] = { text: args.join(" ") };
              bot.createMessage(channelID, "Edited command: " + newCmd);
              fs.writeFile(
                "./cmds.json",
                JSON.stringify(cmds, null, 2),
                () => {}
              );
            }
          }
          break;

        case "deletecmd":
          if (channelID === "735315394151055491" && args[0]) {
            //only allow editing commands from #test
            const newCmd = args.shift();
            if (newCmd && cmds[newCmd] !== undefined) {
              //make sure command exists
              delete cmds[newCmd]; //delete command
              bot.createMessage(channelID, "Deleted command: " + newCmd);
              fs.writeFile(
                "./cmds.json",
                JSON.stringify(cmds, null, 2),
                () => {}
              );
            }
          }
          break;

        default:
          if (cmd && cmds[cmd]) {
            const command: command = cmds[cmd];
            let file: MessageFile | undefined;
            if (cmds[cmd].media) {
              bot.sendChannelTyping(channelID);
              file = {
                file: fs.readFileSync("./media/" + command.media),
                name: command.media,
              };
            }
            bot.createMessage("500281135226552333", command.text, file);
          }
          break;
      }
    }
    // } else {
    //   const classifications = classifier.getClassifications(message);

    //   const max = classifications.reduce((acc, curr) =>
    //     acc.value > curr.value ? acc : curr
    //   );

    //   const altClassi = altClass.getClassifications(message);

    //   const altMax = altClassi.reduce((acc, curr) =>
    //     acc.value > curr.value ? acc : curr
    //   );

    //   if (max.value > 0.8 || altMax.value > 0.8) {
    //     bot.createMessage(
    //       "735315394151055491",
    //       `> ${msg.author.username}: ${message}\n\nLRC: ${(
    //         max.value * 100
    //       ).toFixed(2)}% confident\nBayes: ${(altMax.value * 100).toFixed(
    //         2
    //       )}% confident\n\n${max.label}`
    //     );
    //   }
    // }
  }
});

bot.connect(); // Get the bot to connect to Discord
