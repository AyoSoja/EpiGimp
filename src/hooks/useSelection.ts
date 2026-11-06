/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** useSelection.ts
 */

import { useState } from 'react'

import type { RectangleSelection } from '../tools/selection/types'

export function useSelection() {
  const [selection, setSelection] = useState<RectangleSelection | null>(null)

  const clearSelection = (): void => {
    setSelection(null)
  }

  return {
    selection,
    setSelection,
    clearSelection,
  }
}
