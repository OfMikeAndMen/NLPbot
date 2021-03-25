import axios from "axios";
import { Client } from "eris";
import { CreateAppCommand, Interaction } from "types/slashCommands";

// TEST
const GUILD = "500281135226552331";

// PH
// const GUILD = "683026643488735272";

const register: CreateAppCommand = {
  guild: GUILD,
  name: "handling",
  description: "Compare handling of PH Cars to their Vanilla Counterparts!",
  options: [
    {
      name: "compare",
      description: "Compare",
      type: 1,
      options: [
        {
          name: "vehicle_name",
          description: "vehicle name as set in the files",
          type: 3,
        },
      ],
    },
  ],
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

    console.log(data.data.options);
    console.log(data.data.options[0].options);
  } catch (err) {
    // HANDLE ERRORS HERE
    console.log(err);
  }
};

export { register, respond };
