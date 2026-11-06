/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** useRasterDocument.ts
 */

import { useState } from 'react'

import type { RectangleSelection } from '../tools/selection/types'
import { cropImageData } from '../tools/selection/cropImageData'
import type { RasterDocument } from '../types/RasterDocument'
import { createRasterDocument } from '../utils/createRasterDocument'
import { loadRasterImage } from '../utils/loadRasterImage'
import { createLayer } from '../layers/createLayer'
import { createLayerMask } from '../layers/createLayerMask'
import { maskSelection } from '../layers/maskSelection'

export function useRasterDocument() {
  const [document, setDocument] = useState<RasterDocument | null>(null)
  const [error, setError] = useState<string | null>(null)

  const createDocument = (width: number, height: number): void => {
    setDocument(createRasterDocument(width, height))
    setError(null)
  }

  const openDocument = async (): Promise<void> => {
    try {
      const filePath = await window.electronAPI.openImage()

      if (!filePath) {
        return
      }

      const file = await window.electronAPI.readImage(filePath)
      const rasterDocument = await loadRasterImage(file.name, file.data)

      setDocument(rasterDocument)
      setError(null)
    } catch {
      setError('Unable to open this image.')
    }
  }

  const updateDocumentImageData = (imageData: ImageData): void => {
    setDocument((currentDocument) => {
      if (!currentDocument) {
        return null
      }

      return {
        ...currentDocument,
        layers: currentDocument.layers.map((layer) =>
          layer.id === currentDocument.activeLayerId
            ? {
                ...layer,
                imageData,
              }
            : layer,
        ),
      }
    })
  }

  const cropDocument = (selection: RectangleSelection): void => {
    setDocument((currentDocument) => {
      if (!currentDocument) {
        return null
      }

      const croppedLayers = currentDocument.layers.map((layer) => ({
        ...layer,
        imageData: cropImageData(layer.imageData, selection),
        mask: layer.mask
          ? {
              ...layer.mask,
              imageData: cropImageData(layer.mask.imageData, selection),
            }
          : undefined,
      }))

      const firstLayer = croppedLayers[0]

      if (!firstLayer) {
        return currentDocument
      }

      return {
        ...currentDocument,
        width: firstLayer.imageData.width,
        height: firstLayer.imageData.height,
        layers: croppedLayers,
      }
    })
  }

  const addLayer = (): void => {
    setDocument((currentDocument) => {
      if (!currentDocument) {
        return null
      }

      const layer = createLayer(
        currentDocument.width,
        currentDocument.height,
        `Layer ${currentDocument.layers.length + 1}`,
      )

      return {
        ...currentDocument,
        layers: [...currentDocument.layers, layer],
        activeLayerId: layer.id,
      }
    })
  }

  const deleteLayer = (layerId: string): void => {
    setDocument((currentDocument) => {
      if (!currentDocument || currentDocument.layers.length <= 1) {
        return currentDocument
      }

      const layerIndex = currentDocument.layers.findIndex((layer) => layer.id === layerId)

      if (layerIndex === -1) {
        return currentDocument
      }

      const layers = currentDocument.layers.filter((layer) => layer.id !== layerId)

      const activeLayerId =
        currentDocument.activeLayerId === layerId
          ? layers[Math.max(0, layerIndex - 1)].id
          : currentDocument.activeLayerId

      return {
        ...currentDocument,
        layers,
        activeLayerId,
      }
    })
  }

  const selectLayer = (layerId: string): void => {
    setDocument((currentDocument) => {
      if (!currentDocument || !currentDocument.layers.some((layer) => layer.id === layerId)) {
        return currentDocument
      }

      return {
        ...currentDocument,
        activeLayerId: layerId,
      }
    })
  }

  const renameLayer = (layerId: string, name: string): void => {
    const trimmedName = name.trim()

    if (!trimmedName) {
      return
    }

    setDocument((currentDocument) => {
      if (!currentDocument) {
        return null
      }

      return {
        ...currentDocument,
        layers: currentDocument.layers.map((layer) =>
          layer.id === layerId
            ? {
                ...layer,
                name: trimmedName,
              }
            : layer,
        ),
      }
    })
  }

  const duplicateLayer = (layerId: string): void => {
    setDocument((currentDocument) => {
      if (!currentDocument) {
        return null
      }

      const layerIndex = currentDocument.layers.findIndex((layer) => layer.id === layerId)

      if (layerIndex === -1) {
        return currentDocument
      }

      const sourceLayer = currentDocument.layers[layerIndex]

      const duplicatedLayer = {
        ...sourceLayer,
        id: crypto.randomUUID(),
        name: `${sourceLayer.name} copy`,
        imageData: new ImageData(
          new Uint8ClampedArray(sourceLayer.imageData.data),
          sourceLayer.imageData.width,
          sourceLayer.imageData.height,
        ),
        mask: sourceLayer.mask
          ? {
              ...sourceLayer.mask,
              imageData: new ImageData(
                new Uint8ClampedArray(sourceLayer.mask.imageData.data),
                sourceLayer.mask.imageData.width,
                sourceLayer.mask.imageData.height,
              ),
            }
          : undefined,
      }

      const layers = [...currentDocument.layers]

      layers.splice(layerIndex + 1, 0, duplicatedLayer)

      return {
        ...currentDocument,
        layers,
        activeLayerId: duplicatedLayer.id,
      }
    })
  }

  const toggleLayerVisibility = (layerId: string): void => {
    setDocument((currentDocument) => {
      if (!currentDocument) {
        return null
      }

      return {
        ...currentDocument,
        layers: currentDocument.layers.map((layer) =>
          layer.id === layerId
            ? {
                ...layer,
                visible: !layer.visible,
              }
            : layer,
        ),
      }
    })
  }

  const setLayerOpacity = (layerId: string, opacity: number): void => {
    const clampedOpacity = Math.max(0, Math.min(100, opacity))

    setDocument((currentDocument) => {
      if (!currentDocument) {
        return null
      }

      return {
        ...currentDocument,
        layers: currentDocument.layers.map((layer) =>
          layer.id === layerId
            ? {
                ...layer,
                opacity: clampedOpacity,
              }
            : layer,
        ),
      }
    })
  }

  const moveLayerUp = (layerId: string): void => {
    setDocument((currentDocument) => {
      if (!currentDocument) {
        return null
      }

      const layerIndex = currentDocument.layers.findIndex((layer) => layer.id === layerId)

      if (layerIndex === -1 || layerIndex === currentDocument.layers.length - 1) {
        return currentDocument
      }

      const layers = [...currentDocument.layers]

      ;[layers[layerIndex], layers[layerIndex + 1]] = [layers[layerIndex + 1], layers[layerIndex]]

      return {
        ...currentDocument,
        layers,
      }
    })
  }

  const moveLayerDown = (layerId: string): void => {
    setDocument((currentDocument) => {
      if (!currentDocument) {
        return null
      }

      const layerIndex = currentDocument.layers.findIndex((layer) => layer.id === layerId)

      if (layerIndex <= 0) {
        return currentDocument
      }

      const layers = [...currentDocument.layers]

      ;[layers[layerIndex], layers[layerIndex - 1]] = [layers[layerIndex - 1], layers[layerIndex]]

      return {
        ...currentDocument,
        layers,
      }
    })
  }

  const addLayerMask = (layerId: string): void => {
    setDocument((currentDocument) => {
      if (!currentDocument) {
        return null
      }

      return {
        ...currentDocument,
        layers: currentDocument.layers.map((layer) =>
          layer.id === layerId && !layer.mask
            ? {
                ...layer,
                mask: createLayerMask(layer.imageData.width, layer.imageData.height),
              }
            : layer,
        ),
      }
    })
  }

  const toggleLayerMask = (layerId: string): void => {
    setDocument((currentDocument) => {
      if (!currentDocument) {
        return null
      }

      return {
        ...currentDocument,
        layers: currentDocument.layers.map((layer) =>
          layer.id === layerId && layer.mask
            ? {
                ...layer,
                mask: {
                  ...layer.mask,
                  enabled: !layer.mask.enabled,
                },
              }
            : layer,
        ),
      }
    })
  }

  const removeLayerMask = (layerId: string): void => {
    setDocument((currentDocument) => {
      if (!currentDocument) {
        return null
      }

      return {
        ...currentDocument,
        layers: currentDocument.layers.map((layer) =>
          layer.id === layerId && layer.mask
            ? {
                ...layer,
                mask: undefined,
              }
            : layer,
        ),
      }
    })
  }

  const applySelectionToLayerMask = (layerId: string, selection: RectangleSelection): void => {
    setDocument((currentDocument) => {
      if (!currentDocument) {
        return null
      }

      return {
        ...currentDocument,
        layers: currentDocument.layers.map((layer) =>
          layer.id === layerId && layer.mask
            ? {
                ...layer,
                mask: {
                  ...layer.mask,
                  imageData: maskSelection(layer.mask.imageData, selection),
                },
              }
            : layer,
        ),
      }
    })
  }

  const replaceDocument = (rasterDocument: RasterDocument): void => {
    setDocument(rasterDocument)
    setError(null)
  }

  return {
    document,
    error,
    createDocument,
    openDocument,
    updateDocumentImageData,
    cropDocument,
    addLayer,
    deleteLayer,
    selectLayer,
    renameLayer,
    duplicateLayer,
    toggleLayerVisibility,
    setLayerOpacity,
    moveLayerUp,
    moveLayerDown,
    addLayerMask,
    toggleLayerMask,
    removeLayerMask,
    applySelectionToLayerMask,
    replaceDocument,
  }
}
