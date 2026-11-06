/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** toolDefinitions.ts
 */

import type { ToolDefinition, ToolId } from './types'

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    id: 'rectangle-select',
    label: 'Select',
  },
  {
    id: 'brush',
    label: 'Brush',
  },
  {
    id: 'eraser',
    label: 'Eraser',
  },
  {
    id: 'color-picker',
    label: 'Picker',
  },
]

export const DEFAULT_TOOL: ToolId = 'brush'
