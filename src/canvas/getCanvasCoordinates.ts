/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** getCanvasCoordinates.ts
 */

export interface CanvasCoordinates {
  x: number
  y: number
}

export function getCanvasCoordinates(
  event: React.PointerEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement,
): CanvasCoordinates {
  const rect = canvas.getBoundingClientRect()

  return {
    x: ((event.clientX - rect.left) * canvas.width) / rect.width,
    y: ((event.clientY - rect.top) * canvas.height) / rect.height,
  }
}
