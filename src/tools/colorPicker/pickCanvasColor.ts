/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** pickCanvasColor.ts
 */

import type { CanvasCoordinates } from '../../canvas/getCanvasCoordinates'
import { rgbToHex } from '../../colors/colorConversion'

// Displayed color under the point, or null on a transparent pixel or outside the canvas.
export function pickCanvasColor(
  context: CanvasRenderingContext2D,
  point: CanvasCoordinates,
): string | null {
  const x = Math.floor(point.x)
  const y = Math.floor(point.y)

  if (x < 0 || y < 0 || x >= context.canvas.width || y >= context.canvas.height) {
    return null
  }

  return getDisplayedColor(context.getImageData(x, y, 1, 1).data)
}

// Color the user actually sees: the composite pixel over the white document
// background (the same background JPEG export flattens onto). Null if transparent.
export function getDisplayedColor(pixel: ArrayLike<number>): string | null {
  const alpha = pixel[3] / 255

  if (alpha === 0) {
    return null
  }

  const overWhite = (channel: number): number => channel * alpha + 255 * (1 - alpha)

  return rgbToHex({
    red: overWhite(pixel[0]),
    green: overWhite(pixel[1]),
    blue: overWhite(pixel[2]),
  })
}
