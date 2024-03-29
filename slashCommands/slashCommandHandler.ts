require("dotenv").config();

import axios, { AxiosRequestConfig } from "axios";
import { Client } from "eris";
import { ApplicationCommand, Command, Interaction } from "types/slashCommands";

const token = process.env.d_TEST_TOKEN;
const appID = process.env.d_TEST_CLIENT_ID;

const options: AxiosRequestConfig = {
  headers: {
    Authorization: `Bot ${token}`,
  },
};

import * as report from "./commands/report";
import * as handling from "./commands/handling";
let cmdList: {
  [key: string]: Command;
} = {
  report: report,
  handling: handling
};

const baseAPIURL = `https://discord.com/api/v8`;

// const getGuildURL = (gid: string): string => {
//   return `${baseAPIURL}/applications/${appID}/guilds/${gid}/commands`;
// };

const getGlobalURL = (): string => {
  return `${baseAPIURL}/applications/${appID}/commands`;
};

// Cannot use Top-level awaits, so wrapping module setup in an anonymus function
(async function () {
  try {
    let registeredGlobalCommands: {
      data: ApplicationCommand[];
    } = await axios(getGlobalURL(), options);

    let registeredGlobalCommandMap = new Map<string, ApplicationCommand>(
      registeredGlobalCommands.data.map((e) => [e.name, e])
    );

    for (let k in cmdList) {
      let cmd = cmdList[k].register;

      // TO-DO stop re-registering guild commands every time
      if (!(cmd.guild && !registeredGlobalCommandMap.has(k))) {
        // let url: string;

        if (cmd.guild) {
          // url = getGuildURL(cmd.guild);
          delete cmd.guild;
        } else {
          // url = getGlobalURL();
        }

        // let newCommand: {
        //   data: ApplicationCommand[];
        // } = await axios.post(url, cmd, options);
        // await axios.post(url, cmd, options);
      }
    }
  } catch (err) {
    console.log(err);
  }
})();

const respond = async (data: Interaction, bot: Client) => {
  let int = cmdList[data.data.name];
  if (int) {
    int.respond(data, bot);
  }
};

export { respond };
