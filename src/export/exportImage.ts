/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** exportImage.ts
 */

import { compositeLayers } from '../layers/compositeLayers'
import type { RasterDocument } from '../types/RasterDocument'

type ExportFormat = 'png' | 'jpeg'

function createCompositionCanvas(rasterDocument: RasterDocument): HTMLCanvasElement {
  const canvas = document.createElement('canvas')

  canvas.width = rasterDocument.width
  canvas.height = rasterDocument.height

  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Unable to create export context')
  }

  compositeLayers(context, rasterDocument.layers, rasterDocument.width, rasterDocument.height)

  return canvas
}

function createJpegCanvas(compositionCanvas: HTMLCanvasElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas')

  canvas.width = compositionCanvas.width
  canvas.height = compositionCanvas.height

  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Unable to create JPEG export context')
  }

  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, canvas.width, canvas.height)

  context.drawImage(compositionCanvas, 0, 0)

  return canvas
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Unable to encode exported image'))
          return
        }

        resolve(blob)
      },
      type,
      quality,
    )
  })
}

async function saveCanvas(
  canvas: HTMLCanvasElement,
  mimeType: string,
  format: ExportFormat,
  quality?: number,
): Promise<boolean> {
  const blob = await canvasToBlob(canvas, mimeType, quality)
  const data = Array.from(new Uint8Array(await blob.arrayBuffer()))

  return window.electronAPI.saveImage(data, format)
}

export async function exportPng(rasterDocument: RasterDocument): Promise<boolean> {
  const canvas = createCompositionCanvas(rasterDocument)

  return saveCanvas(canvas, 'image/png', 'png')
}

export async function exportJpeg(rasterDocument: RasterDocument): Promise<boolean> {
  const compositionCanvas = createCompositionCanvas(rasterDocument)
  const jpegCanvas = createJpegCanvas(compositionCanvas)

  return saveCanvas(jpegCanvas, 'image/jpeg', 'jpeg', 0.92)
}
