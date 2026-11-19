/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** useGradientOptions.ts
 */

import { useState } from 'react'

import type { GradientOptions, GradientType } from '../tools/gradient/types'

export function useGradientOptions() {
  const [gradientOptions, setGradientOptions] = useState<GradientOptions>({
    type: 'linear',
  })

  const setGradientType = (type: GradientType): void => {
    setGradientOptions({
      type,
    })
  }

  return {
    gradientOptions,
    setGradientType,
  }
}
