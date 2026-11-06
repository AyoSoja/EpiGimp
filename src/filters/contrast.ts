/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** contrast.ts
 */

import { processPixels } from './processPixels'
import type { Pixel } from './types'

function getContrastFactor(amount: number): number {
  const clampedAmount = Math.max(-255, Math.min(255, amount))

  return (259 * (clampedAmount + 255)) / (255 * (259 - clampedAmount))
}

function adjustChannel(channel: number, factor: number): number {
  return factor * (channel - 128) + 128
}

export function applyContrast(imageData: ImageData, amount: number): ImageData {
  const factor = getContrastFactor(amount)

  return processPixels(imageData, (pixel: Pixel) => ({
    red: adjustChannel(pixel.red, factor),
    green: adjustChannel(pixel.green, factor),
    blue: adjustChannel(pixel.blue, factor),
    alpha: pixel.alpha,
  }))
}
