/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** useBrushOptions.ts
 */

import { useState } from 'react'

import type { BrushOptions } from '../tools/brush/types'

const DEFAULT_BRUSH_SIZE = 10
const DEFAULT_BRUSH_COLOR = '#000000'

export function useBrushOptions() {
  const [brushOptions, setBrushOptions] = useState<BrushOptions>({
    size: DEFAULT_BRUSH_SIZE,
    color: DEFAULT_BRUSH_COLOR,
  })

  const setBrushSize = (size: number): void => {
    setBrushOptions((current) => ({
      ...current,
      size,
    }))
  }

  const setBrushColor = (color: string): void => {
    setBrushOptions((current) => ({
      ...current,
      color,
    }))
  }

  return {
    brushOptions,
    setBrushSize,
    setBrushColor,
  }
}
