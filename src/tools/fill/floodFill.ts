/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** floodFill.ts
 */

import type { RgbColor } from '../../colors/colorConversion'
import type { RectangleSelection } from '../selection/types'
import { getEditableBounds, isInsideBounds } from '../selection/selectionBounds'

export const MIN_FILL_TOLERANCE = 0
export const MAX_FILL_TOLERANCE = 255

interface FloodFillOptions {
  x: number
  y: number
  color: RgbColor
  tolerance: number
  selection: RectangleSelection | null
}

// Channels premultiplied by alpha: fully transparent pixels all read as (0, 0, 0, 0),
// whatever RGB values an imported image kept under them.
function readPremultiplied(data: Uint8ClampedArray, index: number): number[] {
  const alpha = data[index + 3]

  return [
    (data[index] * alpha) / 255,
    (data[index + 1] * alpha) / 255,
    (data[index + 2] * alpha) / 255,
    alpha,
  ]
}

function matchesSeed(data: Uint8ClampedArray, index: number, seed: number[], tolerance: number) {
  const pixel = readPremultiplied(data, index)

  return pixel.every((channel, channelIndex) => Math.abs(channel - seed[channelIndex]) <= tolerance)
}

// Fills the 4-connected region of pixels similar to the seed pixel (max difference
// over premultiplied RGBA channels <= tolerance), restricted to the active selection.
// Returns null when the seed is outside the editable area.
export function floodFill(imageData: ImageData, options: FloodFillOptions): ImageData | null {
  const { width, height } = imageData
  const seedX = Math.floor(options.x)
  const seedY = Math.floor(options.y)
  const bounds = getEditableBounds(options.selection, width, height)

  if (!isInsideBounds(bounds, seedX, seedY)) {
    return null
  }

  const source = imageData.data
  const result = new Uint8ClampedArray(source)
  const seed = readPremultiplied(source, (seedY * width + seedX) * 4)
  const tolerance = Math.max(MIN_FILL_TOLERANCE, Math.min(MAX_FILL_TOLERANCE, options.tolerance))
  const visited = new Uint8Array(width * height)
  const stack = [seedY * width + seedX]

  visited[seedY * width + seedX] = 1

  while (stack.length > 0) {
    const pixel = stack.pop() as number
    const index = pixel * 4

    if (!matchesSeed(source, index, seed, tolerance)) {
      continue
    }

    result[index] = options.color.red
    result[index + 1] = options.color.green
    result[index + 2] = options.color.blue
    result[index + 3] = 255

    const x = pixel % width
    const y = (pixel - x) / width
    const neighbors: [number, number][] = [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
    ]

    neighbors.forEach(([neighborX, neighborY]) => {
      const neighbor = neighborY * width + neighborX

      if (isInsideBounds(bounds, neighborX, neighborY) && !visited[neighbor]) {
        visited[neighbor] = 1
        stack.push(neighbor)
      }
    })
  }

  return new ImageData(result, width, height)
}
