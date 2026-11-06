/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** maskSelection.ts
 */

import type { RectangleSelection } from '../tools/selection/types'

export function maskSelection(imageData: ImageData, selection: RectangleSelection): ImageData {
  const result = new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height,
  )

  const startX = Math.max(0, Math.floor(selection.x))
  const startY = Math.max(0, Math.floor(selection.y))
  const endX = Math.min(imageData.width, Math.ceil(selection.x + selection.width))
  const endY = Math.min(imageData.height, Math.ceil(selection.y + selection.height))

  for (let y = startY; y < endY; y += 1) {
    for (let x = startX; x < endX; x += 1) {
      const index = (y * imageData.width + x) * 4

      result.data[index] = 0
      result.data[index + 1] = 0
      result.data[index + 2] = 0
      result.data[index + 3] = 255
    }
  }

  return result
}
