/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** pickCanvasColor.ts
 */

import type { CanvasCoordinates } from '../../canvas/getCanvasCoordinates'

export function pickCanvasColor(
  context: CanvasRenderingContext2D,
  point: CanvasCoordinates,
): string | null {
  const x = Math.floor(point.x)
  const y = Math.floor(point.y)

  const pixel = context.getImageData(x, y, 1, 1).data
  const alpha = pixel[3]

  if (alpha === 0) {
    return null
  }

  return rgbToHex(pixel[0], pixel[1], pixel[2])
}

function rgbToHex(red: number, green: number, blue: number): string {
  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`
}

function toHex(value: number): string {
  return value.toString(16).padStart(2, '0')
}
