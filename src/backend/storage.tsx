import log from 'electron-log';
import { app } from 'electron/main';
import fs from 'fs';
import path from 'path';

const storeMacroData = (macroData: MacroData): void => {
  const filename = `${macroData.name}.json`;
  const storagePath = app.getPath('userData');
  const filePath = path.join(storagePath, 'AhkScripts', filename);
  const dataString = JSON.stringify(macroData);

  try {
    log.verbose('writing ahk script to ahk dir');
    fs.writeFileSync(filePath, dataString, { flag: 'w' });
  } catch (error) {
    log.error('failed writing ahk script to hustletron dir', error);
    // errors.push(error);
  }
};

export default storeMacroData;
