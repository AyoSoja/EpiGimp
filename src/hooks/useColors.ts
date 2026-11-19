/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** useColors.ts
 */

import { useState } from 'react'

import { normalizeHex } from '../colors/colorConversion'
import type { ColorState, ColorTarget } from '../colors/types'
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_FOREGROUND_COLOR } from '../constants/colors'

const DEFAULT_COLORS: ColorState = {
  foreground: DEFAULT_FOREGROUND_COLOR,
  background: DEFAULT_BACKGROUND_COLOR,
}

export function useColors() {
  const [colors, setColors] = useState<ColorState>(DEFAULT_COLORS)

  const setColor = (target: ColorTarget, color: string): void => {
    const normalized = normalizeHex(color)

    if (!normalized) {
      return
    }

    setColors((current) => ({ ...current, [target]: normalized }))
  }

  const setForegroundColor = (color: string): void => setColor('foreground', color)

  const setBackgroundColor = (color: string): void => setColor('background', color)

  const swapColors = (): void => {
    setColors((current) => ({ foreground: current.background, background: current.foreground }))
  }

  const resetColors = (): void => {
    setColors(DEFAULT_COLORS)
  }

  return {
    colors,
    setColor,
    setForegroundColor,
    setBackgroundColor,
    swapColors,
    resetColors,
  }
}
