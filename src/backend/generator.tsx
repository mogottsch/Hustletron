import path from 'path';
import { ipcMain, app } from 'electron';
import { keyCodeMap } from './keyCodeMap';

const fs = require('fs').promises;

const generateAhkScriptAsString = (
  triggerKeys: string[],
  macroKeyStrokes: string[]
): string => {
  const firstTrigger = triggerKeys[0];
  const otherTriggers = triggerKeys.slice(1);

  const waitForOtherTriggers = otherTriggers
    .map((trigger) => `    KeyWait, ${trigger}, D T1`)
    .join('\n');
  const sendKeys = macroKeyStrokes
    .map((key) => `        Send {${key}}`)
    .join('\n');

  return `;Scriptname
~${firstTrigger}::
	Send {${firstTrigger}}
${waitForOtherTriggers}
    if (ErrorLevel = 0)
    {
${sendKeys}
    }
return
`;
};

const convertData = (macroData: MacroData) => {
  const { triggerKeys, macroKeys } = macroData;
  return {
    triggerKeys: triggerKeys.map((key) => keyCodeMap[key.code]),
    macroKeyStrokes: macroKeys.map(
      (key) =>
        `${keyCodeMap[key.code]} ${key.type === 'keydown' ? 'down' : 'up'}`
    ),
  };
};

const initGenerator = () => {
  ipcMain.handle('generate-ahk-file', async (event, macroData: MacroData) => {
    const desktopPath = app.getPath('desktop');
    const ahkPath = path.join(desktopPath, 'genemater.ahk');
    const { triggerKeys, macroKeyStrokes } = convertData(macroData);
    // await new Promise((r) => setTimeout(r, 2000));

    try {
      await fs.appendFile(
        ahkPath,
        generateAhkScriptAsString(triggerKeys, macroKeyStrokes)
      );
    } catch (error) {
      return { success: false, error };
    }

    return { success: true };
  });
};

export default initGenerator;
