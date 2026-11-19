/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** types.ts
 */

export type ShapeToolId = 'line' | 'rectangle' | 'ellipse'

export type DragToolId = 'gradient' | ShapeToolId

export type ToolId =
  'brush' | 'eraser' | 'color-picker' | 'rectangle-select' | 'bucket-fill' | DragToolId

export interface ToolDefinition {
  id: ToolId
  label: string
  description: string
}
