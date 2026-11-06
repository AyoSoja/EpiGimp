/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** invert.ts
 */

import { processPixels } from './processPixels'
import type { Pixel } from './types'

function invertPixel(pixel: Pixel): Pixel {
  return {
    red: 255 - pixel.red,
    green: 255 - pixel.green,
    blue: 255 - pixel.blue,
    alpha: pixel.alpha,
  }
}

export function applyInvert(imageData: ImageData): ImageData {
  return processPixels(imageData, invertPixel)
}
