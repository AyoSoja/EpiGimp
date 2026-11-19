/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** colorConversion.test.ts
 */

import { describe, expect, it } from 'vitest'

import { hexToRgb, hsvToRgb, isValidHex, normalizeHex, rgbToHex, rgbToHsv } from './colorConversion'

describe('hex conversion', () => {
  it('parses six- and three-digit hex, with or without #', () => {
    expect(hexToRgb('#ff8000')).toEqual({ red: 255, green: 128, blue: 0 })
    expect(hexToRgb('0a0')).toEqual({ red: 0, green: 170, blue: 0 })
    expect(normalizeHex(' #ABC ')).toBe('#aabbcc')
  })

  it('rejects malformed hex', () => {
    expect(isValidHex('#12345')).toBe(false)
    expect(isValidHex('#gggggg')).toBe(false)
    expect(isValidHex('')).toBe(false)
    expect(normalizeHex('red')).toBeNull()
    expect(() => hexToRgb('#12')).toThrow()
  })

  it('formats RGB as lowercase padded hex and clamps channels', () => {
    expect(rgbToHex({ red: 1, green: 171, blue: 255 })).toBe('#01abff')
    expect(rgbToHex({ red: -20, green: 300, blue: 127.6 })).toBe('#00ff80')
  })
})

describe('HSV conversion', () => {
  it('converts reference colors from RGB to HSV', () => {
    expect(rgbToHsv({ red: 255, green: 0, blue: 0 })).toEqual({ hue: 0, saturation: 100, value: 100 })
    expect(rgbToHsv({ red: 0, green: 0, blue: 255 })).toEqual({ hue: 240, saturation: 100, value: 100 })
    expect(rgbToHsv({ red: 0, green: 0, blue: 0 })).toEqual({ hue: 0, saturation: 0, value: 0 })

    const magenta = rgbToHsv({ red: 255, green: 0, blue: 128 })
    expect(magenta.hue).toBeCloseTo(329.88, 1)
  })

  it('converts reference colors from HSV to RGB', () => {
    expect(hsvToRgb({ hue: 120, saturation: 100, value: 100 })).toEqual({ red: 0, green: 255, blue: 0 })
    expect(hsvToRgb({ hue: 60, saturation: 50, value: 50 })).toEqual({ red: 128, green: 128, blue: 64 })
    expect(hsvToRgb({ hue: 360, saturation: 100, value: 100 })).toEqual({ red: 255, green: 0, blue: 0 })
    expect(hsvToRgb({ hue: 200, saturation: 0, value: 100 })).toEqual({ red: 255, green: 255, blue: 255 })
  })

  it('round-trips RGB → HSV → RGB', () => {
    const colors = ['#123456', '#fedcba', '#7f7f7f', '#00ff99', '#ff0080']

    colors.forEach((hex) => {
      expect(rgbToHex(hsvToRgb(rgbToHsv(hexToRgb(hex))))).toBe(hex)
    })
  })
})
