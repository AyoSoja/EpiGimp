/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** types.ts
 */

export type ShapeStyle = 'stroke' | 'fill' | 'stroke-fill'

export interface ShapeOptions {
  strokeWidth: number
  style: ShapeStyle
}

export const MIN_STROKE_WIDTH = 1
export const MAX_STROKE_WIDTH = 200
