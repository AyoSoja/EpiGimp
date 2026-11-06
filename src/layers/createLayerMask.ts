/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** createLayerMask.ts
 */

import type { LayerMask } from './types'

function createWhiteMaskImageData(width: number, height: number): ImageData {
  const imageData = new ImageData(width, height)

  for (let index = 0; index < imageData.data.length; index += 4) {
    imageData.data[index] = 255
    imageData.data[index + 1] = 255
    imageData.data[index + 2] = 255
    imageData.data[index + 3] = 255
  }

  return imageData
}

export function createLayerMask(width: number, height: number): LayerMask {
  return {
    imageData: createWhiteMaskImageData(width, height),
    enabled: true,
  }
}
