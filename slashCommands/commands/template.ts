import axios from "axios";
import { Client } from "eris";
import { CreateAppCommand, Interaction } from "types/slashCommands";

const register: CreateAppCommand = {
  name: "template",
  description: "this is a template",
  guild: "optional guild ID here",
};

const respond = async (data: Interaction, _bot: Client) => {
  try {
    let url = `https://discord.com/api/v8/interactions/${data.id}/${data.token}/callback`;

    await axios.post(url, {
      type: 4,
      data: {
        content: "Success!",
        flags: 64,
      },
    });
  } catch (err) {
    // HANDLE ERRORS HERE
    console.log(err);
  }
};

export { register, respond };
