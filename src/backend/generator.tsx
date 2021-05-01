import path from 'path';
import { ipcMain, app } from 'electron';
import regedit from 'regedit';
import fs from 'fs';
import { exec } from 'child_process';
import log from 'electron-log';
import { getAhkKey } from './keyCodeMap';
import storeMacroData from './storage';

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
    ahkRegistryEntry = await new Promise<never>((resolve, reject) => {
      const vbsDirectory = path.join(
        path.dirname(app.getPath('exe')),
        './resources/regedit/vbs'
      );
      regedit.setExternalVBSLocation(vbsDirectory);
      regedit.list(
        'HKLM\\SOFTWARE\\AutoHotkey',
        (err: never, result: never) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(result);
        }
      );
    });
  } catch (error) {
    throw new Error('Error reading registry. Autorun will not work.');
  }

  const installDir =
    ahkRegistryEntry?.['HKLM\\SOFTWARE\\AutoHotkey']?.values?.InstallDir?.value;

  if (!installDir) {
    throw new Error('Error reading registry. Autorun will not work.');
  }
  return `${installDir}\\AutoHotkey.exe`;
};

// const handleStartUpFile()

const initGenerator = () => {
  ipcMain.handle('generate-ahk-file', async (_event, macroData: MacroData) => {
    const errors: unknown[] = [];

    log.info('saving macro date to disk');
    storeMacroData(macroData);

    log.info('starting ahk file generation');

    const { triggerKeys, macroKeyStrokes } = convertData(macroData);

    let ahkScript: string;
    try {
      log.verbose('generating ahk script string');
      ahkScript = generateAhkScriptAsString(triggerKeys, macroKeyStrokes);
    } catch (error: unknown) {
      log.error('failed generating ahk script string', error);
      errors.push(error);
      return { success: false, errors };
    }

    const ahkDirPath = path.join(app.getPath('desktop'), 'hustletron');
    const filename = `${macroData.name}.ahk`;
    const ahkFilePath = path.join(ahkDirPath, filename);

    if (!fs.existsSync(ahkDirPath)) {
      log.verbose('hustletron dir does not exists, creating...');
      fs.mkdirSync(ahkDirPath);
    }

    try {
      log.verbose('writing ahk script to ahk dir');
      fs.writeFileSync(ahkFilePath, ahkScript, { flag: 'w' });
    } catch (error) {
      log.error('failed writing ahk script to hustletron dir', error);
      errors.push(error);
    }

    const startUpDirPath = path.join(
      app.getPath('appData'),
      'Microsoft\\Windows\\Start Menu\\Programs\\Startup'
    );
    const startUpAhkFilePath = path.join(startUpDirPath, filename);

    if (macroData.runScriptOnStartUp) {
      try {
        log.verbose('writing ahk script to startup dir');
        fs.writeFileSync(startUpAhkFilePath, ahkScript, { flag: 'w' });
      } catch (error) {
        log.error('failed writing ahk script to startup dir', error);
        errors.push(error);
      }
    } else {
      try {
        log.verbose('deleting ahk script from startup dir');
        fs.unlinkSync(startUpAhkFilePath);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          log.error('failed deleting ahk script from startup dir', error);
          errors.push(error);
        }
      }
    }

    if (macroData.autoRunScript) {
      let ahkExecPath = '';
      try {
        log.verbose('retrieving ahk exec path from registry');
        ahkExecPath = await getAhkExecPath();
        try {
          log.verbose('executing ahk script');
          exec(`${ahkExecPath} ${ahkFilePath}`);
        } catch (error) {
          log.error('failed exectuting ahk script', error);
          errors.push(error);
        }
      } catch (error) {
        log.error('failed retrieving ahk exec path from registry', error);
        errors.push(error);
      }
    }

    return { success: errors.length === 0, errors };
  });
};

export default initGenerator;
