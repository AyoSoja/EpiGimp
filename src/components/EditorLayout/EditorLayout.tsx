/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** EditorLayout.tsx
 */

import { useState } from 'react'

import CanvasWorkspace from '../../canvas/CanvasWorkspace/CanvasWorkspace'
import { useBrushOptions } from '../../hooks/useBrushOptions'
import { useEraserOptions } from '../../hooks/useEraserOptions'
import { useHistory } from '../../hooks/useHistory'
import { useRasterDocument } from '../../hooks/useRasterDocument'
import { useSelection } from '../../hooks/useSelection'
import { useToolManager } from '../../hooks/useToolManager'
import { useZoom } from '../../hooks/useZoom'
import LayersPanel from '../LayersPanel/LayersPanel'
import MenuBar from '../MenuBar/MenuBar'
import NewDocumentDialog from '../NewDocumentDialog/NewDocumentDialog'
import StatusBar from '../StatusBar/StatusBar'
import Toolbar from '../Toolbar/Toolbar'
import ToolOptions from '../ToolOptions/ToolOptions'

import { applyBlur } from '../../filters/blur'
import { applyBrightness } from '../../filters/brightness'
import { applyContrast } from '../../filters/contrast'
import { applyGrayscale } from '../../filters/grayscale'
import { applyInvert } from '../../filters/invert'

import { exportJpeg, exportPng } from '../../export/exportImage'

import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'

import './EditorLayout.css'

function EditorLayout() {
  const [isNewDocumentOpen, setIsNewDocumentOpen] = useState(false)

  const {
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
  } = useRasterDocument()

  const { zoom, zoomIn, zoomOut } = useZoom()
  const { activeTool, selectTool } = useToolManager()
  const { brushOptions, setBrushSize, setBrushColor } = useBrushOptions()
  const { eraserOptions, setEraserSize } = useEraserOptions()
  const { selection, setSelection, clearSelection } = useSelection()

  const { pushHistory, undo, redo, clearHistory, canUndo, canRedo } = useHistory()

  const handleCreateDocument = (width: number, height: number): void => {
    createDocument(width, height)
    clearSelection()
    clearHistory()
    setIsNewDocumentOpen(false)
  }

  const handleEditStart = (): void => {
    if (!document) {
      return
    }

    pushHistory(document)
  }

  const handleCrop = (): void => {
    if (!document || !selection) {
      return
    }

    pushHistory(document)
    cropDocument(selection)
    clearSelection()
  }

  const handleAddLayer = (): void => {
    if (!document) {
      return
    }

    pushHistory(document)
    addLayer()
  }

  const handleDeleteLayer = (layerId: string): void => {
    if (!document || document.layers.length <= 1) {
      return
    }

    pushHistory(document)
    deleteLayer(layerId)
  }

  const handleRenameLayer = (layerId: string, name: string): void => {
    const layer = document?.layers.find((currentLayer) => currentLayer.id === layerId)
    const trimmedName = name.trim()

    if (!document || !layer || !trimmedName || layer.name === trimmedName) {
      return
    }

    pushHistory(document)
    renameLayer(layerId, trimmedName)
  }

  const handleDuplicateLayer = (layerId: string): void => {
    if (!document) {
      return
    }

    pushHistory(document)
    duplicateLayer(layerId)
  }

  const handleToggleLayerVisibility = (layerId: string): void => {
    if (!document) {
      return
    }

    pushHistory(document)
    toggleLayerVisibility(layerId)
  }

  const handleLayerOpacityEditStart = (): void => {
    if (!document) {
      return
    }

    pushHistory(document)
  }

  const handleLayerOpacityChange = (layerId: string, opacity: number): void => {
    setLayerOpacity(layerId, opacity)
  }

  const handleMoveLayerUp = (layerId: string): void => {
    if (!document) {
      return
    }

    const layerIndex = document.layers.findIndex((layer) => layer.id === layerId)

    if (layerIndex === -1 || layerIndex === document.layers.length - 1) {
      return
    }

    pushHistory(document)
    moveLayerUp(layerId)
  }

  const handleMoveLayerDown = (layerId: string): void => {
    if (!document) {
      return
    }

    const layerIndex = document.layers.findIndex((layer) => layer.id === layerId)

    if (layerIndex <= 0) {
      return
    }

    pushHistory(document)
    moveLayerDown(layerId)
  }

  const handleAddLayerMask = (layerId: string): void => {
    const layer = document?.layers.find((currentLayer) => currentLayer.id === layerId)

    if (!document || !layer || layer.mask) {
      return
    }

    pushHistory(document)
    addLayerMask(layerId)
  }

  const handleToggleLayerMask = (layerId: string): void => {
    const layer = document?.layers.find((currentLayer) => currentLayer.id === layerId)

    if (!document || !layer?.mask) {
      return
    }

    pushHistory(document)
    toggleLayerMask(layerId)
  }

  const handleRemoveLayerMask = (layerId: string): void => {
    const layer = document?.layers.find((currentLayer) => currentLayer.id === layerId)

    if (!document || !layer?.mask) {
      return
    }

    pushHistory(document)
    removeLayerMask(layerId)
  }

  const handleMaskSelection = (): void => {
    if (!document || !selection) {
      return
    }

    const activeLayer = document.layers.find((layer) => layer.id === document.activeLayerId)

    if (!activeLayer?.mask) {
      return
    }

    pushHistory(document)
    applySelectionToLayerMask(activeLayer.id, selection)
    clearSelection()
  }

  const handleFilter = (filter: (imageData: ImageData) => ImageData): void => {
    if (!document) {
      return
    }

    const activeLayer = document.layers.find((layer) => layer.id === document.activeLayerId)

    if (!activeLayer) {
      return
    }

    pushHistory(document)
    updateDocumentImageData(filter(activeLayer.imageData))
  }

  const handleGrayscale = (): void => {
    handleFilter(applyGrayscale)
  }

  const handleInvert = (): void => {
    handleFilter(applyInvert)
  }

  const handleBrightnessIncrease = (): void => {
    handleFilter((imageData) => applyBrightness(imageData, 20))
  }

  const handleBrightnessDecrease = (): void => {
    handleFilter((imageData) => applyBrightness(imageData, -20))
  }

  const handleContrastIncrease = (): void => {
    handleFilter((imageData) => applyContrast(imageData, 20))
  }

  const handleContrastDecrease = (): void => {
    handleFilter((imageData) => applyContrast(imageData, -20))
  }

  const handleBlur = (): void => {
    handleFilter((imageData) => applyBlur(imageData, 3))
  }

  const handleUndo = (): void => {
    if (!document) {
      return
    }

    const previousDocument = undo(document)

    if (!previousDocument) {
      return
    }

    replaceDocument(previousDocument)
    clearSelection()
  }

  const handleRedo = (): void => {
    if (!document) {
      return
    }

    const nextDocument = redo(document)

    if (!nextDocument) {
      return
    }

    replaceDocument(nextDocument)
    clearSelection()
  }

  const handleExportPng = async (): Promise<void> => {
    if (!document) {
      return
    }

    try {
      await exportPng(document)
    } catch (exportError) {
      console.error('Unable to export PNG:', exportError)
    }
  }

  const handleExportJpeg = async (): Promise<void> => {
    if (!document) {
      return
    }

    try {
      await exportJpeg(document)
    } catch (exportError) {
      console.error('Unable to export JPEG:', exportError)
    }
  }

  useKeyboardShortcuts({
    onNewDocument: () => setIsNewDocumentOpen(true),
    onOpenImage: openDocument,
    onUndo: handleUndo,
    onRedo: handleRedo,
    onExportPng: handleExportPng,
    onExportJpeg: handleExportJpeg,
  })

  const activeLayer = document?.layers.find((layer) => layer.id === document.activeLayerId)

  const canMaskSelection = Boolean(activeLayer?.mask)

  return (
    <div className="editor-layout">
      <MenuBar
        onNewDocument={() => setIsNewDocumentOpen(true)}
        onOpenImage={openDocument}
        onExportPng={handleExportPng}
        onExportJpeg={handleExportJpeg}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onGrayscale={handleGrayscale}
        onInvert={handleInvert}
        onBrightnessIncrease={handleBrightnessIncrease}
        onBrightnessDecrease={handleBrightnessDecrease}
        onContrastIncrease={handleContrastIncrease}
        onContrastDecrease={handleContrastDecrease}
        onBlur={handleBlur}
        canUndo={canUndo}
        canRedo={canRedo}
        hasDocument={document !== null}
      />

      <ToolOptions
        activeTool={activeTool}
        brushOptions={brushOptions}
        eraserOptions={eraserOptions}
        onBrushSizeChange={setBrushSize}
        onBrushColorChange={setBrushColor}
        onEraserSizeChange={setEraserSize}
        hasSelection={selection !== null && selection.width > 0 && selection.height > 0}
        canMaskSelection={canMaskSelection}
        onCrop={handleCrop}
        onMaskSelection={handleMaskSelection}
      />

      {error && <p className="editor-layout__error">{error}</p>}

      <div className="editor-layout__workspace">
        <Toolbar activeTool={activeTool} onToolSelect={selectTool} />

        <CanvasWorkspace
          document={document}
          zoom={zoom}
          activeTool={activeTool}
          brushOptions={brushOptions}
          eraserOptions={eraserOptions}
          selection={selection}
          onImageDataChange={updateDocumentImageData}
          onForegroundColorChange={setBrushColor}
          onSelectionChange={setSelection}
          onEditStart={handleEditStart}
        />

        <LayersPanel
          layers={document?.layers ?? []}
          activeLayerId={document?.activeLayerId ?? null}
          onAddLayer={handleAddLayer}
          onDeleteLayer={handleDeleteLayer}
          onSelectLayer={selectLayer}
          onRenameLayer={handleRenameLayer}
          onDuplicateLayer={handleDuplicateLayer}
          onToggleVisibility={handleToggleLayerVisibility}
          onOpacityChange={handleLayerOpacityChange}
          onOpacityEditStart={handleLayerOpacityEditStart}
          onMoveLayerUp={handleMoveLayerUp}
          onMoveLayerDown={handleMoveLayerDown}
          onAddMask={handleAddLayerMask}
          onToggleMask={handleToggleLayerMask}
          onRemoveMask={handleRemoveLayerMask}
        />
      </div>

      <StatusBar
        zoom={zoom}
        documentSize={document ? `${document.width} × ${document.height} px` : 'No document'}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
      />

      <NewDocumentDialog
        isOpen={isNewDocumentOpen}
        onClose={() => setIsNewDocumentOpen(false)}
        onCreate={handleCreateDocument}
      />
    </div>
  )
}

export default EditorLayout
