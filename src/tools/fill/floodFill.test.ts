/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** floodFill.test.ts
 */

import { describe, expect, it } from 'vitest'

import { floodFill } from './floodFill'

const RED = { red: 255, green: 0, blue: 0 }

// Builds an image from rows of single-character pixel codes.
const PALETTE: Record<string, number[]> = {
  '.': [255, 255, 255, 255],
  '#': [0, 0, 0, 255],
  g: [240, 240, 240, 255],
  _: [0, 0, 0, 0],
}

function imageFrom(rows: string[]): ImageData {
  const width = rows[0].length
  const data = new Uint8ClampedArray(
    rows.flatMap((row) => row.split('').flatMap((c) => PALETTE[c])),
  )

  return new ImageData(data, width, rows.length)
}

// Returns one row string per image row: 'R' for filled red pixels, '-' otherwise.
function filledMap(image: ImageData): string[] {
  const rows: string[] = []

  for (let y = 0; y < image.height; y += 1) {
    let row = ''

    for (let x = 0; x < image.width; x += 1) {
      const i = (y * image.width + x) * 4
      const isRed = image.data[i] === 255 && image.data[i + 1] === 0 && image.data[i + 3] === 255
      row += isRed ? 'R' : '-'
    }

    rows.push(row)
  }

  return rows
}

describe('floodFill', () => {
  const walled = ['..#..', '..#..', '..#..']

  it('fills only the contiguous region, stopping at different colors', () => {
    const result = floodFill(imageFrom(walled), {
      x: 0,
      y: 0,
      color: RED,
      tolerance: 0,
      selection: null,
    })

    expect(filledMap(result as ImageData)).toEqual(['RR---', 'RR---', 'RR---'])
  })

  it('does not leak through diagonal gaps (4-connectivity)', () => {
    const diagonal = ['.#', '#.']
    const result = floodFill(imageFrom(diagonal), {
      x: 0,
      y: 0,
      color: RED,
      tolerance: 0,
      selection: null,
    })

    expect(filledMap(result as ImageData)).toEqual(['R-', '--'])
  })

  it('includes similar colors only when tolerance covers the difference', () => {
    const shaded = ['.g.']

    const strict = floodFill(imageFrom(shaded), {
      x: 0,
      y: 0,
      color: RED,
      tolerance: 14,
      selection: null,
    })
    const loose = floodFill(imageFrom(shaded), {
      x: 0,
      y: 0,
      color: RED,
      tolerance: 15,
      selection: null,
    })

    expect(filledMap(strict as ImageData)).toEqual(['R--'])
    expect(filledMap(loose as ImageData)).toEqual(['RRR'])
  })

  it('compares alpha too: transparent black is not opaque black', () => {
    const result = floodFill(imageFrom(['_#']), {
      x: 0,
      y: 0,
      color: RED,
      tolerance: 254,
      selection: null,
    })

    expect(filledMap(result as ImageData)).toEqual(['R-'])
  })

  it('treats fully transparent pixels as identical whatever their hidden RGB', () => {
    // Imported PNGs often keep arbitrary RGB values under alpha 0.
    const data = new Uint8ClampedArray([0, 0, 0, 0, 255, 255, 255, 0, 10, 200, 30, 0])
    const result = floodFill(new ImageData(data, 3, 1), {
      x: 0,
      y: 0,
      color: RED,
      tolerance: 0,
      selection: null,
    })

    expect(filledMap(result as ImageData)).toEqual(['RRR'])
  })

  it('fills transparent areas and writes an opaque color', () => {
    const result = floodFill(imageFrom(['__#']), {
      x: 1,
      y: 0,
      color: RED,
      tolerance: 0,
      selection: null,
    })

    expect(filledMap(result as ImageData)).toEqual(['RR-'])
  })

  it('stays inside the active selection', () => {
    const blank = ['.....', '.....', '.....']
    const selection = { x: 1, y: 0.5, width: 2.2, height: 1 }
    const result = floodFill(imageFrom(blank), {
      x: 1.5,
      y: 1,
      color: RED,
      tolerance: 0,
      selection,
    })

    expect(filledMap(result as ImageData)).toEqual(['-RRR-', '-RRR-', '-----'])
  })

  it('does nothing when clicking outside the selection', () => {
    const selection = { x: 0, y: 0, width: 1, height: 1 }
    const result = floodFill(imageFrom(walled), { x: 4, y: 2, color: RED, tolerance: 0, selection })

    expect(result).toBeNull()
  })

  it('leaves the source image untouched', () => {
    const source = imageFrom(walled)
    const before = Array.from(source.data)

    floodFill(source, { x: 0, y: 0, color: RED, tolerance: 0, selection: null })

    expect(Array.from(source.data)).toEqual(before)
  })
})
