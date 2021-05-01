/* eslint-disable @typescript-eslint/no-unused-vars */
type MacroData = {
  triggerKeys: Key[];
  macroKeys: Key[];
  name: string;
  autoRunScript: boolean;
  runScriptOnStartUp: boolean;
};

type TriggerObject = {
  mode: 'general' | 'modifier';
  string: string;
};
