/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** useBrushOptions.ts
 */

import { useState } from 'react'

import type { BrushOptions } from '../tools/brush/types'

const DEFAULT_BRUSH_SIZE = 10

export function useBrushOptions() {
  const [brushOptions, setBrushOptions] = useState<BrushOptions>({
    size: DEFAULT_BRUSH_SIZE,
  })

  const setBrushSize = (size: number): void => {
    setBrushOptions({
      size,
    })
  }

  return {
    brushOptions,
    setBrushSize,
  }
}
