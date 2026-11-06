/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** useZoom.ts
 */

import { useState } from 'react'
import { DEFAULT_ZOOM, MAX_ZOOM, MIN_ZOOM, ZOOM_STEP } from '../constants/document'

export function useZoom() {
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)

  const zoomIn = (): void => {
    setZoom((currentZoom) => Math.min(currentZoom + ZOOM_STEP, MAX_ZOOM))
  }

  const zoomOut = (): void => {
    setZoom((currentZoom) => Math.max(currentZoom - ZOOM_STEP, MIN_ZOOM))
  }

  const resetZoom = (): void => {
    setZoom(DEFAULT_ZOOM)
  }

  return {
    zoom,
    zoomIn,
    zoomOut,
    resetZoom,
  }
}
