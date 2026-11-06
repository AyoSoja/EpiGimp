"use strict";
/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** preload.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    ping: () => electron_1.ipcRenderer.invoke('ping'),
    openImage: () => electron_1.ipcRenderer.invoke('dialog:openImage'),
    readImage: (filePath) => electron_1.ipcRenderer.invoke('file:readImage', filePath),
    saveImage: (data, format) => electron_1.ipcRenderer.invoke('file:saveImage', data, format),
});
