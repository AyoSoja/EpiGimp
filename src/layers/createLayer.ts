/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** createLayer.ts
 */

import type { Layer } from './types'

export function createLayer(
  width: number,
  height: number,
  name: string,
  imageData?: ImageData,
): Layer {
  return {
    id: crypto.randomUUID(),
    name,
    imageData: imageData ?? new ImageData(width, height),
    visible: true,
    opacity: 100,
  }
}
