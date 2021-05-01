/* eslint global-require: off, no-console: off */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { app, BrowserWindow } from 'electron';

import initGenerator from './backend/generator';
import initUpdater from './backend/updater';
import { initBackendServices, createWindow } from './backend/bootstrap';
import { checkAhkInstalled } from './backend/requirements';

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

initBackendServices();

app
  .whenReady()
  .then(createWindow)
  .then((createdWindow) => {
    mainWindow = createdWindow;
    mainWindow.on('closed', () => {
      mainWindow = null;
    });
    return createdWindow;
  })
  .then((createdWindow) => {
    initUpdater(createdWindow);
    return createdWindow;
  })
  .catch(console.log);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});
