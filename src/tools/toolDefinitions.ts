/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** toolDefinitions.ts
 */

import type { DragToolId, ShapeToolId, ToolDefinition, ToolId } from './types'

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  { id: 'rectangle-select', label: 'Select', description: 'Rectangle selection' },
  { id: 'brush', label: 'Brush', description: 'Paint with the foreground color' },
  { id: 'eraser', label: 'Eraser', description: 'Erase to transparency' },
  {
    id: 'color-picker',
    label: 'Picker',
    description: 'Click: foreground color — Ctrl+click: background color',
  },
  { id: 'bucket-fill', label: 'Fill', description: 'Fill a similar-colored area' },
  {
    id: 'gradient',
    label: 'Gradient',
    description: 'Drag: foreground to background — Shift: snap angle',
  },
  { id: 'line', label: 'Line', description: 'Drag to draw a line — Shift: 45° angles' },
  { id: 'rectangle', label: 'Rect', description: 'Drag to draw a rectangle — Shift: square' },
  { id: 'ellipse', label: 'Ellipse', description: 'Drag to draw an ellipse — Shift: circle' },
]

export const DEFAULT_TOOL: ToolId = 'brush'

const SHAPE_TOOLS: ShapeToolId[] = ['line', 'rectangle', 'ellipse']

export function isShapeTool(tool: ToolId): tool is ShapeToolId {
  return (SHAPE_TOOLS as ToolId[]).includes(tool)
}

export function isDragTool(tool: ToolId): tool is DragToolId {
  return tool === 'gradient' || isShapeTool(tool)
}
