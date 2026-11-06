/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** createRasterDocument.ts
 */

import { createLayer } from '../layers/createLayer'
import type { RasterDocument } from '../types/RasterDocument'
import { areValidDocumentDimensions } from './documentDimensions'

export function createRasterDocument(
  width: number,
  height: number,
  name = 'Untitled',
): RasterDocument {
  if (!areValidDocumentDimensions(width, height)) {
    throw new Error('Invalid document dimensions')
  }

  const layer = createLayer(width, height, 'Background')

  return {
    id: crypto.randomUUID(),
    name,
    width,
    height,
    layers: [layer],
    activeLayerId: layer.id,
  }
}
