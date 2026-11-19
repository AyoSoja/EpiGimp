/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** constrainShape.ts
 */

export interface ShapePoint {
  x: number
  y: number
}

export interface ShapeBounds {
  x: number
  y: number
  width: number
  height: number
}

const LINE_ANGLE_STEP = Math.PI / 4

// Snaps the end of a line so that its angle is a multiple of 45°.
export function constrainLineEnd(start: ShapePoint, end: ShapePoint): ShapePoint {
  const deltaX = end.x - start.x
  const deltaY = end.y - start.y
  const length = Math.hypot(deltaX, deltaY)
  const angle = Math.round(Math.atan2(deltaY, deltaX) / LINE_ANGLE_STEP) * LINE_ANGLE_STEP
  const projectedLength = Math.abs(Math.cos(angle) * deltaX + Math.sin(angle) * deltaY)

  if (length === 0) {
    return { ...start }
  }

  return {
    x: start.x + Math.cos(angle) * projectedLength,
    y: start.y + Math.sin(angle) * projectedLength,
  }
}

// Bounding box of a dragged rectangle/ellipse. With `constrain`, it becomes a square
// whose side is the larger drag dimension, anchored at the drag start.
export function getShapeBounds(start: ShapePoint, end: ShapePoint, constrain: boolean): ShapeBounds {
  let deltaX = end.x - start.x
  let deltaY = end.y - start.y

  if (constrain) {
    const side = Math.max(Math.abs(deltaX), Math.abs(deltaY))

    deltaX = deltaX < 0 ? -side : side
    deltaY = deltaY < 0 ? -side : side
  }

  return {
    x: Math.min(start.x, start.x + deltaX),
    y: Math.min(start.y, start.y + deltaY),
    width: Math.abs(deltaX),
    height: Math.abs(deltaY),
  }
}
