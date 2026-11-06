/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** compositeLayers.ts
 */

import type { Layer } from './types'

function createLayerCanvas(layer: Layer): HTMLCanvasElement {
  const canvas = document.createElement('canvas')

  canvas.width = layer.imageData.width
  canvas.height = layer.imageData.height

  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Unable to create layer context')
  }

  context.putImageData(layer.imageData, 0, 0)

  return canvas
}

function applyMask(layerCanvas: HTMLCanvasElement, layer: Layer): void {
  if (!layer.mask?.enabled) {
    return
  }

  const context = layerCanvas.getContext('2d')

  if (!context) {
    throw new Error('Unable to create layer context')
  }

  const layerImageData = context.getImageData(0, 0, layerCanvas.width, layerCanvas.height)

  const maskData = layer.mask.imageData.data
  const pixelData = layerImageData.data

  for (let index = 0; index < pixelData.length; index += 4) {
    const maskValue = maskData[index] / 255

    pixelData[index + 3] *= maskValue
  }

  context.putImageData(layerImageData, 0, 0)
}

function createRenderedLayerCanvas(layer: Layer): HTMLCanvasElement {
  const canvas = createLayerCanvas(layer)

  applyMask(canvas, layer)

  return canvas
}

export function compositeLayers(
  context: CanvasRenderingContext2D,
  layers: Layer[],
  width: number,
  height: number,
): void {
  context.clearRect(0, 0, width, height)

  layers.forEach((layer) => {
    if (!layer.visible) {
      return
    }

    const layerCanvas = createRenderedLayerCanvas(layer)

    context.save()
    context.globalAlpha = layer.opacity / 100
    context.drawImage(layerCanvas, 0, 0)
    context.restore()
  })
}
