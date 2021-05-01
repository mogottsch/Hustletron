import { ipcMain } from 'electron';
import regedit from 'regedit';

const checkAhkInstalled = async () => {
  let registryEntry: any;
  try {
    registryEntry = await new Promise<never>((resolve, reject) => {
      regedit.list('HKLM\\SOFTWARE', (err: never, result: never) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  } catch (error) {
    throw new Error('Error reading registry. Autorun will not work.');
  }

  const installedPrograms = (registryEntry?.['HKLM\\SOFTWARE']?.keys ??
    []) as Array<string>;

  return installedPrograms.includes('AutoHotkey');
};

const initRequirementsCheck = () => {
  ipcMain.handle('requirements_check', async () => {
    const ahkInstalled = await checkAhkInstalled();
    return { ahkInstalled };
  });
};

export default initRequirementsCheck;
