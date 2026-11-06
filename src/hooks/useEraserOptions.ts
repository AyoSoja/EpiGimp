/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** useEraserOptions.ts
 */

import { useState } from 'react'

import type { EraserOptions } from '../tools/eraser/types'

const DEFAULT_ERASER_SIZE = 20

export function useEraserOptions() {
  const [eraserOptions, setEraserOptions] = useState<EraserOptions>({
    size: DEFAULT_ERASER_SIZE,
  })

  const setEraserSize = (size: number): void => {
    setEraserOptions({
      size,
    })
  }

  return {
    eraserOptions,
    setEraserSize,
  }
}
