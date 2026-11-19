/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** createImageDataCanvas.ts
 */

export interface ImageDataCanvas {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
}

// Offscreen canvas initialized with a copy of the given pixels.
export function createImageDataCanvas(imageData: ImageData): ImageDataCanvas {
  const canvas = document.createElement('canvas')

  canvas.width = imageData.width
  canvas.height = imageData.height

  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Unable to create canvas context')
  }

  context.putImageData(imageData, 0, 0)

  return { canvas, context }
}

export function readCanvasImageData({ canvas, context }: ImageDataCanvas): ImageData {
  return context.getImageData(0, 0, canvas.width, canvas.height)
}
