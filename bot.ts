require("dotenv").config();

if (
  !(
    process.env.d_TOKEN &&
    process.env.DB_HOST &&
    process.env.DB_PORT &&
    process.env.DB_PW &&
    process.env.DB_DB
  )
) {
  throw new Error("no discord token set");
}

import { Client, FileContent } from "eris";
import fs, { readFileSync, writeFileSync } from "fs";
// import {
//   PorterStemmer,
//   LogisticRegressionClassifier,
//   BayesClassifier,
// } from "natural";
// import { respond } from "./slashCommands/slashCommandHandler";
import { storeImageFromFile } from "./utils/utils";

// TYPES
import { command, location, stickies } from "types/nlp";
// import { Interaction } from "types/slashCommands";

import getPool from "./utils/db";
import { PoolConnection } from "mariadb";
import { DBUpdate, perm } from "types/database";

const PROJECT_HOMECOMING = "388742985619079188";

// ROLES
const MANAGEMENT = "388785025686175744";

// CHANNELS
const SIN_BINNED = "820276170871930900";
const TEST_CHANNEL = "735315394151055491";

let cmds: { [key: string]: command } = require("./cmds.json");

let recording = false;
let locs: {
  locations: location[];
} = { locations: [] };

let stickyMsg: stickies = {};

let openSins: { [key: string]: NodeJS.Timeout } = {};

const bot = new Client(process.env.d_TOKEN, {
  // "allowedMentions": { "everyone": true },
  autoreconnect: true,
  intents: 1539,
});

let parkerCD = 0;

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

bot.on("ready", async () => {
  console.log(new Date() + " - bot ready");
  bot.guilds.get(PROJECT_HOMECOMING)?.fetchAllMembers();
});

bot.on("error", (err) => {
  console.log(err.message);
});

bot.on("messageCreate", async (msg) => {
  let channelID = msg.channel.id;
  let message = msg.content;

  if (msg.webhookID && channelID === "761844501069037578" && recording) {
    try {
      let obj: location = JSON.parse(message);
      locs.locations.push(obj);
      msg.addReaction("✅");
    } catch (err) {
      bot.createMessage(channelID, "Invalid format");
    }
    // @ts-ignore
  } else if (msg.channel.type === 0) {
    if (channelID === SIN_BINNED) {
      if (msg.webhookID && msg.content.includes("SIN-BINNED")) {
        // HANDLE SIN-BINS
        let u = msg.embeds[0]?.description;
        openSins[msg.id] = setTimeout(
          () => sinReminder(u, msg.id),
          30 * 60 * 1000
        );
      } else if (
        msg.messageReference &&
        msg.member &&
        openSins[msg.messageReference.messageID || ""]
      ) {
        clearTimeout(openSins[msg.messageReference.messageID || ""]);
        delete openSins[msg.messageReference.messageID || ""];
        // HANDLE RESPONSES
      }
    }
    if (msg.member && !msg.author.bot) {
      let userID = msg.member.id;

      if (message.substring(0, 1) === "!") {
        let args = message.substring(1).split(" ");
        let cmd = args.shift();

        switch (cmd) {
          case "sticky":
            if (msg.member.roles.includes(MANAGEMENT)) {
              try {
                bot.deleteMessage(msg.channel.id, msg.id);
              } catch (err) {
                console.log(err);
              }
              if (!stickyMsg[msg.channel.id]) {
                let messText = args.join(" ");
                stickyMsg[msg.channel.id] = {
                  text: messText,
                };
              } else {
                delete stickyMsg[msg.channel.id];
              }
            }
            break;

          case "parker":
            let d = new Date().getTime();
            if (parkerCD + 60000 < d) {
              try {
                // @ts-ignore
                msg.channel.sendTyping();
                let files = fs.readdirSync("./parker");
                let file = files[Math.floor(Math.random() * files.length)];
                let body = fs.readFileSync("./parker/" + file);
                bot.createMessage(channelID, "", { file: body, name: file });
                parkerCD = d;
              } catch (err) {
                console.log(err);
              }
            }
            break;
          case "cmds": //lists all commands in cmds.json
            bot.createMessage(channelID, Object.keys(cmds).join(" "));
            break;

          case "addcmd":
            if (
              channelID === TEST_CHANNEL &&
              args[0] &&
              (args[1] || msg.attachments[0])
            ) {
              //only allow adding commands from #test
              try {
                const newCmd = args.shift();
                if (newCmd && cmds[newCmd] === undefined) {
                  //dont add command if it exists already

                  cmds[newCmd] = { text: args.join(" ") };

                  if (msg.attachments[0]) {
                    bot.sendChannelTyping(channelID);

                    let filename = msg.attachments[0].filename;

                    await storeImageFromFile(
                      msg.attachments[0].proxy_url,
                      `./media/${filename}`
                    );

                    cmds[newCmd].media = filename;
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
            if (channelID === TEST_CHANNEL && args[0] && args[1]) {
              //only allow editing commands from #test
              const newCmd = args.shift();
              if (newCmd && cmds[newCmd] !== undefined) {
                //make sure command exists
                cmds[newCmd] = { text: args.join(" ") };
                bot.createMessage(channelID, "Edited command: " + newCmd);
                fs.writeFile(
                  "./cmds.json",
                  JSON.stringify(cmds, null, 2),
                  (err) => {
                    console.log(err);
                  }
                );
              }
            }
            break;

          case "deletecmd":
            if (channelID === TEST_CHANNEL && args[0]) {
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

          case "adminonly":
            if (channelID === TEST_CHANNEL || args[0]) {
              const c = args.shift();
              if (c && cmds[c] !== undefined) {
                cmds[c].adminonly = true;
                msg.addReaction("✔️");
                fs.writeFile(
                  "./cmds.json",
                  JSON.stringify(cmds, null, 2),
                  () => {}
                );
              }
            }
            break;

          case "temphost":
            if (
              channelID === TEST_CHANNEL &&
              msg.member.roles.includes(MANAGEMENT) &&
              args[0]
            ) {
              const steamid = "steam:" + args.shift();

              //Error if date is more than 48hrs in the future or invalid date is provided
              let d: Date | null = new Date(args.join(" "));
              if (isNaN(d.getTime())) {
                bot.createMessage(channelID, "Error: Invalid time format!");
                break;
              }

              let timeFrame = d.getTime() - new Date().getTime();
              if (timeFrame > 172800000 || timeFrame < 0) {
                bot.createMessage(
                  channelID,
                  "Error: Time is too far in the future!" //Or in the past, but management doesn't do stupid I'm sure!
                );
                break;
              }

              let conn: PoolConnection | undefined;
              try {
                conn = await getPool().getConnection();
                await conn.beginTransaction();

                let result: perm[] = await conn.query(
                  "SELECT * FROM perm WHERE steam_id = ?",
                  [steamid]
                );

                //Somethings gone seriously wrong
                if (result.length !== 1) {
                  bot.createMessage(
                    channelID,
                    "Error: Invalid steam ID or no matching user found!"
                  );
                  throw Error;
                }

                console.log(result[0]);
                if (result[0].host == true) {
                  bot.createMessage(
                    channelID,
                    "Error: Target is already host!"
                  );
                  throw Error;
                }

                //Schedule User demotion
                setTimeout(() => demoteHost(steamid), timeFrame);

                //Write timestamp to a file just to be sure!
                let file = JSON.parse(
                  readFileSync("./demoteTimeouts.json").toString()
                );
                file[steamid] = d.getTime();
                writeFileSync(
                  "./demoteTimeouts.json",
                  JSON.stringify(file, null, 2)
                );

                //Update DB
                let affR: DBUpdate = await conn.query(
                  "UPDATE perm SET host = 1 WHERE steam_id = ?",
                  [steamid]
                );
                if (affR.affectedRows !== 1) {
                  bot.createMessage(
                    channelID,
                    "Error: Something went wrong when updating the DB"
                  );
                  throw Error;
                }

                bot.createMessage(
                  channelID,
                  "Success! " +
                    steamid +
                    " will be host until <t:" +
                    Math.floor(d.getTime() / 1000) +
                    ":f>"
                );

                await conn.commit();
              } catch (err) {
                console.log(err);
              } finally {
                conn?.release();
              }
            }
            break;

          case "start":
            if (channelID === "761844501069037578") {
              if (!recording) {
                bot.createMessage(channelID, "Recording start . .");
                recording = true;
              } else {
                bot.createMessage(channelID, "Already recording . .");
              }
            }
            break;

          case "stop":
            if (channelID === "761844501069037578") {
              if (recording) {
                recording = false;
                if (locs.locations.length !== 0) {
                  bot.createMessage(
                    channelID,
                    "Recorded " + locs.locations.length + " locations.",
                    {
                      file: Buffer.from(JSON.stringify(locs, null, 2)),
                      name: "locations.json",
                    }
                  );
                  locs.locations = [];
                } else {
                  bot.createMessage(channelID, "No locations recorded . .");
                }
              } else {
                bot.createMessage(channelID, "Not recording..");
              }
            }
            break;

          case "restart":
            if (userID === "99164237187788800") {
              await bot.createMessage(channelID, "Restarting...");
              process.exit();
            }
            break;

          default:
            if (cmd && cmds[cmd]) {
              const command: command = cmds[cmd];
              if (command.adminonly && !msg.member.roles.includes(MANAGEMENT))
                break;
              let file: FileContent | undefined;
              if (command.media) {
                bot.sendChannelTyping(channelID);
                file = {
                  file: fs.readFileSync("./media/" + command.media),
                  name: command.media,
                };
              }
              bot.createMessage(channelID, command.text, file);
            }
            break;
        }
      }
      if (stickyMsg[msg.channel.id]) {
        let stick = stickyMsg[msg.channel.id];

        if (stick.msgid) {
          try {
            bot.deleteMessage(msg.channel.id, stick.msgid);
          } catch (err) {
            console.log(err);
          }
        }

        let mess = await bot.createMessage(msg.channel.id, {
          embed: {
            description: stick.text + "\n📌",
            color: 0x00ffff,
          },
          allowedMentions: { users: true },
        });
        stick.msgid = mess.id;
      }

      // if (msg.content.includes("@everyone") || msg.content.includes(".ru/") || msg.content) {
      if (/(@everyone|\.ru\/|bit\.ly(?!\/tony_ph_combos))/.test(msg.content)) {
        msg.delete("potential scam");

        bot.createMessage(
          TEST_CHANNEL,
          `<@${msg.author.id}> - Message in <#${channelID}> deleted, potential scam\n\`\`\`\n${msg.content}\n\`\`\``
        );
      }
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
      //       TEST_CHANNEL,
      //       `> ${msg.author.username}: ${message}\n\nLRC: ${(
      //         max.value * 100
      //       ).toFixed(2)}% confident\nBayes: ${(altMax.value * 100).toFixed(
      //         2
      //       )}% confident\n\n${max.label}`
      //     );
      //   }
    }
  }
});

bot.on("guildMemberUpdate", async (g, m, o) => {
  if (m && m.nick !== o?.nick) {
    if (m.roles.includes("763349380165664808")) {
      await bot.removeGuildMemberRole(g.id, m.id, "763349380165664808");
      await bot.editGuildMember(
        g.id,
        m.id,
        { nick: o?.nick || "" },
        "Nick Change Block"
      );
      await bot.addGuildMemberRole(g.id, m.id, "763349380165664808");
    } else if (m.nick?.includes("|")) {
      await bot.editGuildMember(
        g.id,
        m.id,
        { nick: m.nick.split("|")[0] + "| idiot" },
        "Dumb name detected"
      );
    }
  }
});

bot.on("rawWS", (e: any) => {
  if (e.t !== "INTERACTION_CREATE") return;

  // respond(e.d as Interaction, bot);
});

bot.connect(); // Get the bot to connect to Discord

// const getGuildMember = async (guild: Guild, userID: string) => {
//   if (!guild.members.has(userID)) {
//     await guild.fetchMembers({ userIDs: [userID] });
//   }
//   return guild.members.get(userID);
// };

const sinReminder = async (id: string | undefined, mid: string) => {
  bot.createMessage(SIN_BINNED, {
    content: `${id ? `${id} - ` : ""}Please fill in your bin!`,
    messageReferenceID: mid,
  });
};

const demoteHost = async (steamid: string) => {
  let file = JSON.parse(readFileSync("./demoteTimeouts.json").toString());

  let conn: PoolConnection | undefined;
  try {
    conn = await getPool().getConnection();
    await conn.beginTransaction();

    let affR: DBUpdate = await conn.query(
      "UPDATE perm SET host = 0 WHERE steam_id = ?",
      [steamid]
    );
    if (affR.affectedRows !== 1) {
      bot.createMessage(
        TEST_CHANNEL,
        "Error: Something went wrong when updating the DB for " + steamid
      );
      throw Error;
    }

    bot.createMessage(TEST_CHANNEL, steamid + " demoted!");
    await conn.commit();

    delete file[steamid];

    writeFileSync("./demoteTimeouts.json", JSON.stringify(file, null, 2));
  } catch (err) {
  } finally {
    conn?.release();
  }
};

setInterval(async () => {
  let file = JSON.parse(readFileSync("./demoteTimeouts.json").toString());

  let conn: PoolConnection | undefined;
  try {
    conn = await getPool().getConnection();
    await conn.beginTransaction();

    for (const steamid of Object.keys(file)) {
      if (file[steamid] < new Date().getTime()) {
        let affR: DBUpdate = await conn.query(
          "UPDATE perm SET host = 0 WHERE steam_id = ?",
          [steamid]
        );
        if (affR.affectedRows !== 1) {
          bot.createMessage(
            TEST_CHANNEL,
            "Error: Something went wrong when updating the DB for " + steamid
          );
          throw Error;
        }

        bot.createMessage(TEST_CHANNEL, steamid + " demoted!");
        await conn.commit();

        delete file[steamid];
      }
    }

    writeFileSync("./demoteTimeouts.json", JSON.stringify(file, null, 2));
  } catch (err) {
    console.log(err);
  } finally {
    conn?.release();
  }
}, 600000);
