/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** renderGradient.test.ts
 */

import { describe, expect, it } from 'vitest'

import { renderGradient } from './renderGradient'

const BLACK = { red: 0, green: 0, blue: 0 }
const WHITE = { red: 255, green: 255, blue: 255 }

function redAt(image: ImageData, x: number, y: number): number {
  return image.data[(y * image.width + x) * 4]
}

function alphaAt(image: ImageData, x: number, y: number): number {
  return image.data[(y * image.width + x) * 4 + 3]
}

describe('renderGradient', () => {
  it('goes from foreground at the start to background at the end (linear)', () => {
    // 11 px wide; pixel centers at 0.5 … 10.5, gradient from x=0.5 to x=10.5.
    const image = new ImageData(11, 1)
    const result = renderGradient(image, {
      type: 'linear',
      start: { x: 0.5, y: 0.5 },
      end: { x: 10.5, y: 0.5 },
      from: BLACK,
      to: WHITE,
      selection: null,
    }) as ImageData

    expect(redAt(result, 0, 0)).toBe(0)
    expect(redAt(result, 5, 0)).toBe(128)
    expect(redAt(result, 10, 0)).toBe(255)
    expect(alphaAt(result, 5, 0)).toBe(255)
  })

  it('clamps before the start and after the end', () => {
    const image = new ImageData(10, 1)
    const result = renderGradient(image, {
      type: 'linear',
      start: { x: 3.5, y: 0 },
      end: { x: 5.5, y: 0 },
      from: BLACK,
      to: WHITE,
      selection: null,
    }) as ImageData

    expect(redAt(result, 0, 0)).toBe(0)
    expect(redAt(result, 9, 0)).toBe(255)
  })

  it('is constant along lines perpendicular to a vertical gradient', () => {
    const image = new ImageData(4, 4)
    const result = renderGradient(image, {
      type: 'linear',
      start: { x: 0, y: 0 },
      end: { x: 0, y: 4 },
      from: BLACK,
      to: WHITE,
      selection: null,
    }) as ImageData

    expect(redAt(result, 0, 1)).toBe(redAt(result, 3, 1))
    expect(redAt(result, 0, 1)).toBeLessThan(redAt(result, 0, 2))
  })

  it('depends on distance from the center for radial gradients', () => {
    const image = new ImageData(9, 9)
    const result = renderGradient(image, {
      type: 'radial',
      start: { x: 4.5, y: 4.5 },
      end: { x: 8.5, y: 4.5 },
      from: BLACK,
      to: WHITE,
      selection: null,
    }) as ImageData

    expect(redAt(result, 4, 4)).toBe(0)
    expect(redAt(result, 6, 4)).toBe(128)
    expect(redAt(result, 4, 6)).toBe(128)
    expect(redAt(result, 4, 2)).toBe(128)
    expect(redAt(result, 0, 0)).toBe(255)
  })

  it('only paints inside the active selection', () => {
    const image = new ImageData(4, 1)
    const result = renderGradient(image, {
      type: 'linear',
      start: { x: 0, y: 0 },
      end: { x: 4, y: 0 },
      from: WHITE,
      to: WHITE,
      selection: { x: 1, y: 0, width: 2, height: 1 },
    }) as ImageData

    expect([0, 1, 2, 3].map((x) => alphaAt(result, x, 0))).toEqual([0, 255, 255, 0])
  })

  it('returns null for a zero-length drag', () => {
    const image = new ImageData(2, 2)
    const point = { x: 1, y: 1 }

    expect(
      renderGradient(image, { type: 'linear', start: point, end: point, from: BLACK, to: WHITE, selection: null }),
    ).toBeNull()
  })
})
