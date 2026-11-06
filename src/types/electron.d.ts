/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** electron.d.ts
 */

export {}

interface ImageFileData {
  name: string
  data: number[]
}

declare global {
  interface Window {
    electronAPI: {
      ping: () => Promise<string>
      openImage: () => Promise<string | null>
      readImage: (filePath: string) => Promise<ImageFileData>
      saveImage: (data: number[], format: 'png' | 'jpeg') => Promise<boolean>
    }
  }
}
