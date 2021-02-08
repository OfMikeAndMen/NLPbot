require("dotenv").config();

import axios from "axios";
import { interaction } from "types/interactions";
import { allCommands } from "./slashCommandList.json";

let token = process.env.d_TEST_TOKEN;
let appID = process.env.d_TEST_CLIENT_ID;
let headers = {
  Authorization: `Bot ${token}`,
};

async function registerAll(): Promise<void> {
  for (let c of allCommands) {
    let commandRegisterUrl;
    c.guild
      ? (commandRegisterUrl = `https://discord.com/api/v8/applications/${appID}/guilds/${c.guild}/commands`)
      : (commandRegisterUrl = `https://discord.com/api/v8/applications/${appID}/commands`);

    try {
      await axios.post(commandRegisterUrl, c.post, { headers: headers });
    } catch (e) {
      console.log(e);
    }
  }
}

// async function register(name: string, guild?: string): Promise<void> {}

// async function unregister(name: string, guild?: string): Promise<void> {}

async function respond(d: interaction): Promise<void> {
  let commandRespondUrl = `https://discord.com/api/v8/interactions/${d.id}/${d.token}/callback`;
  if (d.type !== 2) return;

  let c = allCommands.find((e) => e.post.name === d.data?.name);

  if (!c) return;

  let data = {
    type: 3,
    data: c.data,
  };

  try {
    await axios.post(commandRespondUrl, data, { headers: headers });
  } catch (e) {
    console.log(e);
  }
}

//export default registerAll;
export { registerAll, respond };
