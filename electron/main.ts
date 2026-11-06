/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** main.ts
 */

import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const loadRenderer = (window: BrowserWindow): void => {
  const devServerUrl = process.env.VITE_DEV_SERVER_URL

  if (devServerUrl) {
    window.loadURL(devServerUrl)
    return
  }

  window.loadFile(path.join(__dirname, '../dist/index.html'))
}

const createWindow = (): void => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  loadRenderer(mainWindow)
}

ipcMain.handle('ping', () => {
  return 'pong'
})

ipcMain.handle('dialog:openImage', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      {
        name: 'Images',
        extensions: ['png', 'jpg', 'jpeg'],
      },
    ],
  })

  if (result.canceled || result.filePaths.length === 0) {
    return null
  }

  return result.filePaths[0]
})

ipcMain.handle('file:readImage', async (_event, filePath: string) => {
  const buffer = await readFile(filePath)

  return {
    name: path.basename(filePath),
    data: Array.from(buffer),
  }
})

ipcMain.handle('file:saveImage', async (_event, data: number[], format: 'png' | 'jpeg') => {
  const extension = format === 'jpeg' ? 'jpg' : 'png'

  const result = await dialog.showSaveDialog({
    defaultPath: `epigimp-export.${extension}`,
    filters: [
      {
        name: format === 'jpeg' ? 'JPEG Image' : 'PNG Image',
        extensions: [extension],
      },
    ],
  })

  if (result.canceled || !result.filePath) {
    return false
  }

  await writeFile(result.filePath, Buffer.from(data))

  return true
})

app.whenReady().then(() => {
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
