import path from 'path';
import { ipcMain, app } from 'electron';
import { keyCodeMap } from './keyCodeMap';

const fs = require('fs');
const fsPromises = require('fs').promises;

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
  ipcMain.handle('generate-ahk-file', async (_event, macroData: MacroData) => {
    const desktopPath = app.getPath('desktop');
    const ahkDirPath = path.join(desktopPath, 'hustletron');
    const ahkPath = path.join(ahkDirPath, `${macroData.name}.ahk`);

    if (!fs.existsSync(ahkDirPath)) {
      fs.mkdirSync(ahkDirPath);
    }
    const { triggerKeys, macroKeyStrokes } = convertData(macroData);

    try {
      await fsPromises.writeFile(
        ahkPath,
        generateAhkScriptAsString(triggerKeys, macroKeyStrokes),
        { flag: 'w' }
      );
    } catch (error) {
      return { success: false, error };
    }

    return { success: true };
  });
};

export default initGenerator;
