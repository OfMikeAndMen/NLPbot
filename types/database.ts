export type perm = {
  steam_id: string;
  admin: boolean;
  staff: boolean;
  creator: boolean;
  host: boolean;
  special: boolean;
  director: boolean;
  racer: boolean;
  regularplus: boolean;
  regular: boolean;
  rookie: boolean;
  registered: boolean;
  tester: boolean;
  licensed: boolean;
  allow: boolean;
  deny: boolean;
  ban: boolean;
  tempban: number;
  kicked: number;
  spammer: number;
  troll: boolean;
  current: boolean;
  frozen: boolean;
  promoted: number;

}

export type DBInsert = {
  affectedRows: number;
  insertId: number;
};
export type DBDelete = {
  affectedRows: number;
};
export type DBUpdate = {
  affectedRows: number;
};
