import axios from "axios";
import { Client } from "eris";
import { CreateAppCommand, Interaction } from "types/slashCommands";

// TEST
// const reportParent = "703968707998908448";
// const GUILD = "500281135226552331";

// PH
const reportParent = "388742985619079188";
const GUILD = "683026643488735272";

const register: CreateAppCommand = {
  name: "report",
  description: "Use this to report naughty bois",
  guild: GUILD,
};

const respond = async (data: Interaction, bot: Client) => {
  try {
    let url = `https://discord.com/api/v8/interactions/${data.id}/${data.token}/callback`;

    // await axios.post(url, { type: 5 });

    // member or user is guaranteed to exist
    let uID = (data.member?.user.id || data.user?.id) as string;
    let chan = await bot.createChannel(
      GUILD,
      `report-${data.member?.user.username || data.user?.username}`,
      0,
      {
        parentID: reportParent,
        permissionOverwrites: [
          {
            id: "99164237187788800",
            type: "member",
            allow: 0x400,
            deny: 0,
          },
        ],
      }
    );

    await chan.createMessage(
      `<@${uID}> - Use this channel to file your report with the management`
    );

    // let patchUrl = `https://discord.com/api/v8/webhooks/${cid}/${data.token}/messages/@original`;

    await axios.post(url, {
      type: 4,
      data: {
        content: "Success!",
        // For some reason, i cant get posting embeds here to work..
        // embeds: [{ title: "Success!", color: 0x00FFFF }],
        flags: 64,
      },
    });
  } catch (err) {
    // HANDLE ERRORS HERE
    console.log(err);
  }
};

export { register, respond };
