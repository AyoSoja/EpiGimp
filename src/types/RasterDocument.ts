/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** RasterDocument.ts
 */

import type { Layer } from '../layers/types'

export interface RasterDocument {
  id: string
  name: string
  width: number
  height: number
  layers: Layer[]
  activeLayerId: string
}
