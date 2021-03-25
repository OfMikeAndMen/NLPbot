import { Member, User } from "eris";

export type Command = {
  register: CreateAppCommand;
  respond: Function;
};

export type CreateAppCommand = {
  guild?: string;
  name: string;
  description: string;
  options?: ApplicationCommandOption[];
};

export type ApplicationCommand = {
  id: string;
  application_id: string;
  name: string;
  description: string;
  options?: ApplicationCommandOption[];
};

export type ApplicationCommandOption = {
  type: ApplicationCommandOptionType;
  name: string;
  description: string;
  required?: boolean;
  choices?: ApplicationCommandOptionChoice;
  options?: ApplicationCommandOption[];
};

type ApplicationCommandOptionChoice = {
  name: string;
  value: string | number;
};

enum ApplicationCommandOptionType {
  SUB_COMMAND = 1,
  SUB_COMMAND_GROUP = 2,
  STRING = 3,
  INTEGER = 4,
  BOOLEAN = 5,
  USER = 6,
  CHANNEL = 7,
  ROLE = 8,
}

export type Interaction = {
  id: string;
  type: 0 | 1 | 2;
  data: ApplicationCommandInteractionData;
  guild_id?: string;
  channel_id?: string;
  member?: Member;
  user?: User;
  token: string;
  version: number;
};

type ApplicationCommandInteractionData = {
  id: string;
  name: string;
  options: ApplicationCommandInteractionDataOption[];
};

type ApplicationCommandInteractionDataOption = {
  name: string;
  value?: string;
  options?: ApplicationCommandInteractionDataOption;
};
