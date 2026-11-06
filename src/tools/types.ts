/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** types.ts
 */

export type ToolId = 'brush' | 'eraser' | 'color-picker' | 'rectangle-select'

export interface ToolDefinition {
  id: ToolId
  label: string
}
