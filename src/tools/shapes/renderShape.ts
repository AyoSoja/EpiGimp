/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** renderShape.ts
 */

import { createImageDataCanvas, readCanvasImageData } from '../../canvas/createImageDataCanvas'
import type { RectangleSelection } from '../selection/types'
import { getEditableBounds } from '../selection/selectionBounds'
import type { ShapeToolId } from '../types'
import { constrainLineEnd, getShapeBounds } from './constrainShape'
import type { ShapeBounds, ShapePoint } from './constrainShape'
import type { ShapeOptions } from './types'

interface ShapeDrawing {
  tool: ShapeToolId
  start: ShapePoint
  end: ShapePoint
  constrain: boolean
  options: ShapeOptions
  strokeColor: string
  fillColor: string
  selection: RectangleSelection | null
}

function clipToSelection(context: CanvasRenderingContext2D, drawing: ShapeDrawing): void {
  const { width, height } = context.canvas
  const bounds = getEditableBounds(drawing.selection, width, height)

  context.beginPath()
  context.rect(
    bounds.startX,
    bounds.startY,
    bounds.endX - bounds.startX,
    bounds.endY - bounds.startY,
  )
  context.clip()
}

function traceClosedShape(
  context: CanvasRenderingContext2D,
  tool: ShapeToolId,
  bounds: ShapeBounds,
): void {
  context.beginPath()

  if (tool === 'ellipse') {
    context.ellipse(
      bounds.x + bounds.width / 2,
      bounds.y + bounds.height / 2,
      bounds.width / 2,
      bounds.height / 2,
      0,
      0,
      Math.PI * 2,
    )
  } else {
    context.rect(bounds.x, bounds.y, bounds.width, bounds.height)
  }
}

// Keeps a centered outline inside the dragged box (never inset past the center).
function insetForStroke(bounds: ShapeBounds, drawing: ShapeDrawing): ShapeBounds {
  if (drawing.options.style === 'fill') {
    return bounds
  }

  const inset = Math.min(drawing.options.strokeWidth / 2, bounds.width / 2, bounds.height / 2)

  return {
    x: bounds.x + inset,
    y: bounds.y + inset,
    width: bounds.width - inset * 2,
    height: bounds.height - inset * 2,
  }
}

function paintClosedShape(context: CanvasRenderingContext2D, drawing: ShapeDrawing): boolean {
  const bounds = getShapeBounds(drawing.start, drawing.end, drawing.constrain)
  const { style } = drawing.options

  if (bounds.width === 0 || bounds.height === 0) {
    return false
  }

  const hasOutline = style !== 'fill'
  const strokeWidth = drawing.options.strokeWidth

  // The outline alone covers a box thinner than the stroke: paint the box itself.
  if (hasOutline && (bounds.width <= strokeWidth || bounds.height <= strokeWidth)) {
    traceClosedShape(context, drawing.tool, bounds)
    context.fillStyle = drawing.strokeColor
    context.fill()
    return true
  }

  traceClosedShape(context, drawing.tool, insetForStroke(bounds, drawing))

  if (style === 'fill' || style === 'stroke-fill') {
    context.fillStyle = drawing.fillColor
    context.fill()
  }

  if (style === 'stroke' || style === 'stroke-fill') {
    context.strokeStyle = drawing.strokeColor
    context.lineJoin = 'miter'
    context.stroke()
  }

  return true
}

function paintLine(context: CanvasRenderingContext2D, drawing: ShapeDrawing): boolean {
  const end = drawing.constrain ? constrainLineEnd(drawing.start, drawing.end) : drawing.end

  if (end.x === drawing.start.x && end.y === drawing.start.y) {
    return false
  }

  context.beginPath()
  context.moveTo(drawing.start.x, drawing.start.y)
  context.lineTo(end.x, end.y)
  context.strokeStyle = drawing.strokeColor
  context.lineCap = 'round'
  context.stroke()

  return true
}

// Draws the shape over a copy of the layer pixels, clipped to the active selection.
// Returns null when the drag is too small to produce a shape.
export function renderShape(imageData: ImageData, drawing: ShapeDrawing): ImageData | null {
  const target = createImageDataCanvas(imageData)
  const { context } = target

  context.save()
  clipToSelection(context, drawing)
  context.lineWidth = drawing.options.strokeWidth

  const painted =
    drawing.tool === 'line' ? paintLine(context, drawing) : paintClosedShape(context, drawing)

  context.restore()

  return painted ? readCanvasImageData(target) : null
}
