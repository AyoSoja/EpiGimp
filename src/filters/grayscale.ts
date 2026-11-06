/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** grayscale.ts
 */

import { processPixels } from './processPixels'
import type { Pixel } from './types'

function toGrayscale(pixel: Pixel): Pixel {
  const gray = Math.round(pixel.red * 0.299 + pixel.green * 0.587 + pixel.blue * 0.114)

  return {
    red: gray,
    green: gray,
    blue: gray,
    alpha: pixel.alpha,
  }
}

export function applyGrayscale(imageData: ImageData): ImageData {
  return processPixels(imageData, toGrayscale)
}
