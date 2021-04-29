import path from 'path';
import { ipcMain, app } from 'electron';
import regedit from 'regedit';
import fs from 'fs';
import { exec } from 'child_process';
import { getAhkKey } from './keyCodeMap';

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

// const handleStartUpFile()

const initGenerator = () => {
  const errors: any = [];

  ipcMain.handle('generate-ahk-file', async (_event, macroData: MacroData) => {
    const ahkDirPath = path.join(app.getPath('desktop'), 'hustletron');
    const filename = `${macroData.name}.ahk`;
    const ahkFilePath = path.join(ahkDirPath, filename);

    if (!fs.existsSync(ahkDirPath)) {
      fs.mkdirSync(ahkDirPath);
    }
    const { triggerKeys, macroKeyStrokes } = convertData(macroData);

    let ahkScript: string;
    try {
      ahkScript = generateAhkScriptAsString(triggerKeys, macroKeyStrokes);
    } catch (error) {
      errors.push(error);
      return { success: false, errors };
    }

    try {
      fs.writeFileSync(ahkFilePath, ahkScript, { flag: 'w' });
    } catch (error) {
      errors.push(error);
    }

    const startUpDirPath = path.join(
      app.getPath('appData'),
      'Microsoft\\Windows\\Start Menu\\Programs\\Startup'
    );
    const startUpAhkFilePath = path.join(startUpDirPath, filename);

    if (macroData.runScriptOnStartUp) {
      console.log(startUpAhkFilePath);
      try {
        fs.writeFileSync(startUpAhkFilePath, ahkScript, { flag: 'w' });
      } catch (error) {
        errors.push(error);
      }
    } else {
      try {
        fs.unlinkSync(startUpAhkFilePath);
      } catch (error) {
        if (error.code !== 'ENOENT') errors.push(error);
      }
    }

    if (macroData.autoRunScript) {
      let ahkExecPath = '';

      try {
        ahkExecPath = await getAhkExecPath();
        exec(`${ahkExecPath} ${ahkFilePath}`);
      } catch (error) {
        errors.append(error);
      }
    }

    return { success: true, errors };
  });
};

export default initGenerator;
