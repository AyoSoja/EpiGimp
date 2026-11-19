/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** useShapeOptions.ts
 */

import { useState } from 'react'

import { MAX_STROKE_WIDTH, MIN_STROKE_WIDTH } from '../tools/shapes/types'
import type { ShapeOptions, ShapeStyle } from '../tools/shapes/types'

const DEFAULT_STROKE_WIDTH = 4

export function useShapeOptions() {
  const [shapeOptions, setShapeOptions] = useState<ShapeOptions>({
    strokeWidth: DEFAULT_STROKE_WIDTH,
    style: 'stroke',
  })

  const setShapeStrokeWidth = (strokeWidth: number): void => {
    if (Number.isNaN(strokeWidth)) {
      return
    }

    setShapeOptions((current) => ({
      ...current,
      strokeWidth: Math.max(MIN_STROKE_WIDTH, Math.min(MAX_STROKE_WIDTH, strokeWidth)),
    }))
  }

  const setShapeStyle = (style: ShapeStyle): void => {
    setShapeOptions((current) => ({
      ...current,
      style,
    }))
  }

  return {
    shapeOptions,
    setShapeStrokeWidth,
    setShapeStyle,
  }
}
