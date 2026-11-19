/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** constrainShape.test.ts
 */

import { describe, expect, it } from 'vitest'

import { constrainLineEnd, getShapeBounds } from './constrainShape'

describe('getShapeBounds', () => {
  it('returns the free drag rectangle without constraint, in any direction', () => {
    expect(getShapeBounds({ x: 10, y: 10 }, { x: 40, y: 20 }, false)).toEqual({
      x: 10,
      y: 10,
      width: 30,
      height: 10,
    })
    expect(getShapeBounds({ x: 10, y: 10 }, { x: 0, y: 4 }, false)).toEqual({
      x: 0,
      y: 4,
      width: 10,
      height: 6,
    })
  })

  it('becomes a square anchored at the start when constrained (Shift)', () => {
    expect(getShapeBounds({ x: 10, y: 10 }, { x: 40, y: 20 }, true)).toEqual({
      x: 10,
      y: 10,
      width: 30,
      height: 30,
    })
    expect(getShapeBounds({ x: 10, y: 10 }, { x: 5, y: -10 }, true)).toEqual({
      x: -10,
      y: -10,
      width: 20,
      height: 20,
    })
  })
})

describe('constrainLineEnd', () => {
  const start = { x: 0, y: 0 }

  function rounded(point: { x: number; y: number }) {
    return { x: Math.round(point.x * 1000) / 1000, y: Math.round(point.y * 1000) / 1000 }
  }

  it('snaps nearly horizontal and nearly vertical lines', () => {
    expect(rounded(constrainLineEnd(start, { x: 10, y: 2 }))).toEqual({ x: 10, y: 0 })
    expect(rounded(constrainLineEnd(start, { x: -1, y: -10 }))).toEqual({ x: 0, y: -10 })
  })

  it('snaps to 45° diagonals', () => {
    expect(rounded(constrainLineEnd(start, { x: 10, y: 9 }))).toEqual({ x: 9.5, y: 9.5 })
    expect(rounded(constrainLineEnd(start, { x: -10, y: 8 }))).toEqual({ x: -9, y: 9 })
  })

  it('keeps a zero-length line at the start', () => {
    expect(constrainLineEnd({ x: 3, y: 4 }, { x: 3, y: 4 })).toEqual({ x: 3, y: 4 })
  })
})
