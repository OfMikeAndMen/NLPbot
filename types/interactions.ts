import { Member } from "eris";

export type interaction = {
  id: string;
  type: 0 | 1 | 2;
  data?: InteractionData;
  guild_id: string;
  channel_id: string;
  member: Member;
  token: string;
  version: number;
};

type InteractionData = {
  options: InteractionDataOption[];
  name: string;
  id: string;
};

type InteractionDataOption = {
  name: string;
  value: string;
};

export type command = {
  name: string;
  description: string;
};
