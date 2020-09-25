export type Person = {
  name: string;
  collections?: Array<Collection>;
};

export type Collection = {
  label: string;
  recordings: Array<any>;
};
