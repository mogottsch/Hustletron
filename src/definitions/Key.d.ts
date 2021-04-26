type Key = {
  name: string;
  id: string;
  code: number;
  type: string;
};

type KeyGroups = {
  groups: Key[][];
  currentGroup: Key[];
  groupMasterCode: number | null;
};
