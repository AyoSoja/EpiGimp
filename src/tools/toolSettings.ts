/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** toolSettings.ts
 */

import type { ColorState } from '../colors/types'
import type { BrushOptions } from './brush/types'
import type { EraserOptions } from './eraser/types'
import type { FillOptions } from './fill/types'
import type { GradientOptions } from './gradient/types'
import type { ShapeOptions } from './shapes/types'

// Everything the canvas needs to know to apply the active tool.
export interface ToolSettings {
  colors: ColorState
  brush: BrushOptions
  eraser: EraserOptions
  fill: FillOptions
  gradient: GradientOptions
  shape: ShapeOptions
}
