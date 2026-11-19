/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** colorConversion.ts
 */

export interface RgbColor {
  red: number
  green: number
  blue: number
}

export interface HsvColor {
  hue: number
  saturation: number
  value: number
}

const HEX_PATTERN = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i

function clampChannel(value: number): number {
  return Math.round(Math.max(0, Math.min(255, value)))
}

function toHexChannel(value: number): string {
  return clampChannel(value).toString(16).padStart(2, '0')
}

export function isValidHex(hex: string): boolean {
  return HEX_PATTERN.test(hex.trim())
}

export function normalizeHex(hex: string): string | null {
  const match = HEX_PATTERN.exec(hex.trim())

  if (!match) {
    return null
  }

  const digits = match[1].toLowerCase()
  const fullDigits =
    digits.length === 3
      ? digits
          .split('')
          .map((digit) => digit + digit)
          .join('')
      : digits

  return `#${fullDigits}`
}

export function rgbToHex({ red, green, blue }: RgbColor): string {
  return `#${toHexChannel(red)}${toHexChannel(green)}${toHexChannel(blue)}`
}

export function hexToRgb(hex: string): RgbColor {
  const normalized = normalizeHex(hex)

  if (!normalized) {
    throw new Error(`Invalid hex color: ${hex}`)
  }

  return {
    red: parseInt(normalized.slice(1, 3), 16),
    green: parseInt(normalized.slice(3, 5), 16),
    blue: parseInt(normalized.slice(5, 7), 16),
  }
}

function computeHue(red: number, green: number, blue: number, max: number, delta: number): number {
  if (delta === 0) {
    return 0
  }

  let hue: number

  if (max === red) {
    hue = ((green - blue) / delta) % 6
  } else if (max === green) {
    hue = (blue - red) / delta + 2
  } else {
    hue = (red - green) / delta + 4
  }

  return (hue * 60 + 360) % 360
}

export function rgbToHsv({ red, green, blue }: RgbColor): HsvColor {
  const r = red / 255
  const g = green / 255
  const b = blue / 255
  const max = Math.max(r, g, b)
  const delta = max - Math.min(r, g, b)

  return {
    hue: computeHue(r, g, b, max, delta),
    saturation: max === 0 ? 0 : (delta / max) * 100,
    value: max * 100,
  }
}

export function hsvToRgb({ hue, saturation, value }: HsvColor): RgbColor {
  const s = Math.max(0, Math.min(100, saturation)) / 100
  const v = Math.max(0, Math.min(100, value)) / 100
  const h = (((hue % 360) + 360) % 360) / 60
  const chroma = v * s
  const x = chroma * (1 - Math.abs((h % 2) - 1))
  const m = v - chroma

  const sectors: [number, number, number][] = [
    [chroma, x, 0],
    [x, chroma, 0],
    [0, chroma, x],
    [0, x, chroma],
    [x, 0, chroma],
    [chroma, 0, x],
  ]
  const [r, g, b] = sectors[Math.floor(h) % 6]

  return {
    red: clampChannel((r + m) * 255),
    green: clampChannel((g + m) * 255),
    blue: clampChannel((b + m) * 255),
  }
}
