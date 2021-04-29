import path from 'path';
import { ipcMain, app } from 'electron';
import regedit from 'regedit';
import { exec } from 'child_process';
import { getAhkKey } from './keyCodeMap';

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
#SingleInstance Force
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
    triggerKeys: triggerKeys.map((key) => getAhkKey(key.code)),
    macroKeyStrokes: macroKeys.map(
      (key) =>
        `${getAhkKey(key.code)} ${key.type === 'keydown' ? 'down' : 'up'}`
    ),
  };
};

const getAhkExecPath = async (): Promise<string> => {
  let ahkRegistryEntry: any;
  try {
    ahkRegistryEntry = await new Promise<any>((resolve, reject) => {
      regedit
        .list('HKLM\\SOFTWARE\\AutoHotkey')
        .on('data', ({ data }: any) => resolve(data))
        .on('finish', () => reject());
    });
  } catch (error) {
    throw new Error('Error reading registry. Autorun will not work.');
  }

  const installDir = ahkRegistryEntry?.values?.InstallDir?.value;

  if (!installDir) {
    throw new Error('Error reading registry. Autorun will not work.');
  }
  return `${installDir}\\AutoHotkey.exe`;
};

const initGenerator = () => {
  ipcMain.handle('generate-ahk-file', async (_event, macroData: MacroData) => {
    const desktopPath = app.getPath('desktop');
    const ahkDirPath = path.join(desktopPath, 'hustletron');
    const AhkFilePath = path.join(ahkDirPath, `${macroData.name}.ahk`);

    if (!fs.existsSync(ahkDirPath)) {
      fs.mkdirSync(ahkDirPath);
    }
    const { triggerKeys, macroKeyStrokes } = convertData(macroData);

    try {
      await fsPromises.writeFile(
        AhkFilePath,
        generateAhkScriptAsString(triggerKeys, macroKeyStrokes),
        { flag: 'w' }
      );
    } catch (error) {
      return { success: false, error };
    }

    const errors: any = [];
    if (macroData.autoRunScript) {
      let ahkExecPath = '';

      try {
        ahkExecPath = await getAhkExecPath();
        exec(`${ahkExecPath} ${AhkFilePath}`);
      } catch (error) {
        errors.append(error);
      }
    }

    return { success: true, errors };
  });
};

export default initGenerator;
