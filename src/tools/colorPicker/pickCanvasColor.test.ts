/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** pickCanvasColor.test.ts
 */

import { describe, expect, it } from 'vitest'

import { getDisplayedColor } from './pickCanvasColor'

describe('getDisplayedColor', () => {
  it('returns opaque pixels unchanged', () => {
    expect(getDisplayedColor([255, 0, 0, 255])).toBe('#ff0000')
  })

  it('blends semi-transparent pixels over the white document background', () => {
    expect(getDisplayedColor([255, 0, 0, 128])).toBe('#ff7f7f')
    expect(getDisplayedColor([0, 0, 0, 51])).toBe('#cccccc')
  })

  it('returns null for fully transparent pixels', () => {
    expect(getDisplayedColor([12, 34, 56, 0])).toBeNull()
  })
})
