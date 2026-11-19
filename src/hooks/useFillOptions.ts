/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** useFillOptions.ts
 */

import { useState } from 'react'

import { MAX_FILL_TOLERANCE, MIN_FILL_TOLERANCE } from '../tools/fill/floodFill'
import type { FillOptions } from '../tools/fill/types'

const DEFAULT_FILL_TOLERANCE = 32

export function useFillOptions() {
  const [fillOptions, setFillOptions] = useState<FillOptions>({
    tolerance: DEFAULT_FILL_TOLERANCE,
  })

  const setFillTolerance = (tolerance: number): void => {
    if (Number.isNaN(tolerance)) {
      return
    }

    setFillOptions({
      tolerance: Math.max(MIN_FILL_TOLERANCE, Math.min(MAX_FILL_TOLERANCE, Math.round(tolerance))),
    })
  }

  return {
    fillOptions,
    setFillTolerance,
  }
}
