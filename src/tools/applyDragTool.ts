/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** applyDragTool.ts
 */

import { hexToRgb } from '../colors/colorConversion'
import { renderGradient } from './gradient/renderGradient'
import type { RectangleSelection } from './selection/types'
import { constrainLineEnd } from './shapes/constrainShape'
import type { ShapePoint } from './shapes/constrainShape'
import { renderShape } from './shapes/renderShape'
import type { ToolSettings } from './toolSettings'
import type { DragToolId } from './types'

export interface ToolDrag {
  start: ShapePoint
  end: ShapePoint
  constrain: boolean
}

// Result of a press-drag-release tool (gradient, line, rectangle, ellipse) applied
// to the given layer pixels, or null when the drag produces nothing.
export function applyDragTool(
  tool: DragToolId,
  imageData: ImageData,
  drag: ToolDrag,
  settings: ToolSettings,
  selection: RectangleSelection | null,
): ImageData | null {
  const { foreground, background } = settings.colors

  if (tool === 'gradient') {
    return renderGradient(imageData, {
      type: settings.gradient.type,
      start: drag.start,
      end: drag.constrain ? constrainLineEnd(drag.start, drag.end) : drag.end,
      from: hexToRgb(foreground),
      to: hexToRgb(background),
      selection,
    })
  }

  return renderShape(imageData, {
    tool,
    start: drag.start,
    end: drag.end,
    constrain: drag.constrain,
    options: settings.shape,
    strokeColor: foreground,
    fillColor: background,
    selection,
  })
}
