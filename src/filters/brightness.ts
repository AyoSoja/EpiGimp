/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** brightness.ts
 */

import { processPixels } from './processPixels'
import type { Pixel } from './types'

function adjustBrightness(pixel: Pixel, amount: number): Pixel {
  return {
    red: pixel.red + amount,
    green: pixel.green + amount,
    blue: pixel.blue + amount,
    alpha: pixel.alpha,
  }
}

export function applyBrightness(imageData: ImageData, amount: number): ImageData {
  return processPixels(imageData, (pixel) => adjustBrightness(pixel, amount))
}
