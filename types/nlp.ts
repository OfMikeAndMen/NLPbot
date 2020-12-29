export type command = {
  text: string;
  media: string;
};

export type location = {
  x: number;
  y: number;
  z: number;
  h: number;
};

export type stickies = {
  [channelid: string]: {
    text: string;
    msgid?: string;
  };
};
