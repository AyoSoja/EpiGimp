/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** selectionBounds.ts
 */

import type { RectangleSelection } from './types'

export interface PixelBounds {
  startX: number
  startY: number
  endX: number
  endY: number
}

export function hasArea(selection: RectangleSelection | null): selection is RectangleSelection {
  return selection !== null && selection.width > 0 && selection.height > 0
}

// Integer pixel bounds (end exclusive) of the editable area: the active selection
// clamped to the image, or the whole image when nothing is selected.
export function getEditableBounds(
  selection: RectangleSelection | null,
  width: number,
  height: number,
): PixelBounds {
  if (!hasArea(selection)) {
    return { startX: 0, startY: 0, endX: width, endY: height }
  }

  return {
    startX: Math.max(0, Math.floor(selection.x)),
    startY: Math.max(0, Math.floor(selection.y)),
    endX: Math.min(width, Math.ceil(selection.x + selection.width)),
    endY: Math.min(height, Math.ceil(selection.y + selection.height)),
  }
}

export function isInsideBounds(bounds: PixelBounds, x: number, y: number): boolean {
  return x >= bounds.startX && x < bounds.endX && y >= bounds.startY && y < bounds.endY
}
