/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** drawStroke.ts
 */

export interface StrokePoint {
  x: number
  y: number
}

interface DrawStrokeOptions {
  from: StrokePoint
  to: StrokePoint
  size: number
  color?: string
  erase?: boolean
}

export function drawStroke(context: CanvasRenderingContext2D, options: DrawStrokeOptions): void {
  const { from, to, size, color = '#000000', erase = false } = options

  context.save()

  context.globalCompositeOperation = erase ? 'destination-out' : 'source-over'

  context.beginPath()
  context.moveTo(from.x, from.y)
  context.lineTo(to.x, to.y)
  context.lineWidth = size
  context.lineCap = 'round'
  context.lineJoin = 'round'
  context.strokeStyle = color
  context.stroke()

  context.restore()
}
