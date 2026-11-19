/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** renderGradient.ts
 */

import type { RgbColor } from '../../colors/colorConversion'
import type { RectangleSelection } from '../selection/types'
import { getEditableBounds } from '../selection/selectionBounds'
import type { ShapePoint } from '../shapes/constrainShape'
import type { GradientType } from './types'

interface GradientOptions {
  type: GradientType
  start: ShapePoint
  end: ShapePoint
  from: RgbColor
  to: RgbColor
  selection: RectangleSelection | null
}

function createPositionFunction(type: GradientType, start: ShapePoint, end: ShapePoint) {
  const deltaX = end.x - start.x
  const deltaY = end.y - start.y
  const lengthSquared = deltaX * deltaX + deltaY * deltaY
  const length = Math.sqrt(lengthSquared)

  if (type === 'radial') {
    return (x: number, y: number) => Math.hypot(x - start.x, y - start.y) / length
  }

  return (x: number, y: number) => ((x - start.x) * deltaX + (y - start.y) * deltaY) / lengthSquared
}

function mix(from: number, to: number, ratio: number): number {
  return Math.round(from + (to - from) * ratio)
}

// Paints a gradient from `from` (at start) to `to` (at end) over the editable area.
// Pixels are sampled at their centers. Returns null for a zero-length gradient.
export function renderGradient(imageData: ImageData, options: GradientOptions): ImageData | null {
  const { start, end, from, to } = options

  if (start.x === end.x && start.y === end.y) {
    return null
  }

  const { width, height } = imageData
  const result = new Uint8ClampedArray(imageData.data)
  const bounds = getEditableBounds(options.selection, width, height)
  const positionAt = createPositionFunction(options.type, start, end)

  for (let y = bounds.startY; y < bounds.endY; y += 1) {
    for (let x = bounds.startX; x < bounds.endX; x += 1) {
      const ratio = Math.max(0, Math.min(1, positionAt(x + 0.5, y + 0.5)))
      const index = (y * width + x) * 4

      result[index] = mix(from.red, to.red, ratio)
      result[index + 1] = mix(from.green, to.green, ratio)
      result[index + 2] = mix(from.blue, to.blue, ratio)
      result[index + 3] = 255
    }
  }

  return new ImageData(result, width, height)
}
