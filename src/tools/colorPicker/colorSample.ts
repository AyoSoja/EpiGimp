/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** colorSample.ts
 */

// Color under the picker cursor. It changes on almost every pointer move, so it lives
// in a tiny store read only by the component that shows it, instead of in editor
// state (which would re-render the whole editor on each move).
type Listener = () => void

let sampledColor: string | null = null
const listeners = new Set<Listener>()

export function getColorSample(): string | null {
  return sampledColor
}

export function setColorSample(color: string | null): void {
  if (color === sampledColor) {
    return
  }

  sampledColor = color
  listeners.forEach((listener) => listener())
}

export function subscribeColorSample(listener: Listener): () => void {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}
