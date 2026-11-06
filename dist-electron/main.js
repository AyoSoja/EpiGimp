"use strict";
/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** main.ts
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const promises_1 = require("node:fs/promises");
const node_path_1 = __importDefault(require("node:path"));
const loadRenderer = (window) => {
    const devServerUrl = process.env.VITE_DEV_SERVER_URL;
    if (devServerUrl) {
        window.loadURL(devServerUrl);
        return;
    }
    window.loadFile(node_path_1.default.join(__dirname, '../dist/index.html'));
};
const createWindow = () => {
    const mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        autoHideMenuBar: true,
        webPreferences: {
            preload: node_path_1.default.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });
    loadRenderer(mainWindow);
};
electron_1.ipcMain.handle('ping', () => {
    return 'pong';
});
electron_1.ipcMain.handle('dialog:openImage', async () => {
    const result = await electron_1.dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            {
                name: 'Images',
                extensions: ['png', 'jpg', 'jpeg'],
            },
        ],
    });
    if (result.canceled || result.filePaths.length === 0) {
        return null;
    }
    return result.filePaths[0];
});
electron_1.ipcMain.handle('file:readImage', async (_event, filePath) => {
    const buffer = await (0, promises_1.readFile)(filePath);
    return {
        name: node_path_1.default.basename(filePath),
        data: Array.from(buffer),
    };
});
electron_1.ipcMain.handle('file:saveImage', async (_event, data, format) => {
    const extension = format === 'jpeg' ? 'jpg' : 'png';
    const result = await electron_1.dialog.showSaveDialog({
        defaultPath: `epigimp-export.${extension}`,
        filters: [
            {
                name: format === 'jpeg' ? 'JPEG Image' : 'PNG Image',
                extensions: [extension],
            },
        ],
    });
    if (result.canceled || !result.filePath) {
        return false;
    }
    await (0, promises_1.writeFile)(result.filePath, Buffer.from(data));
    return true;
});
electron_1.app.whenReady().then(() => {
    createWindow();
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
