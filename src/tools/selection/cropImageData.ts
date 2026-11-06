/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** cropImageData.ts
 */

import type { RectangleSelection } from './types'

export function cropImageData(imageData: ImageData, selection: RectangleSelection): ImageData {
  const x = Math.max(0, Math.floor(selection.x))
  const y = Math.max(0, Math.floor(selection.y))

  const width = Math.min(Math.floor(selection.width), imageData.width - x)

  const height = Math.min(Math.floor(selection.height), imageData.height - y)

  if (width <= 0 || height <= 0) {
    throw new Error('Invalid crop selection')
  }

  const sourceCanvas = document.createElement('canvas')
  sourceCanvas.width = imageData.width
  sourceCanvas.height = imageData.height

  const sourceContext = sourceCanvas.getContext('2d')

  if (!sourceContext) {
    throw new Error('Unable to create crop context')
  }

  sourceContext.putImageData(imageData, 0, 0)

  return sourceContext.getImageData(x, y, width, height)
}
