/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** CanvasWorkspace.tsx
 */

import { useEffect, useRef } from 'react'

import { createImageDataCanvas, readCanvasImageData } from '../createImageDataCanvas'
import type { ImageDataCanvas } from '../createImageDataCanvas'
import { getCanvasCoordinates } from '../getCanvasCoordinates'
import type { CanvasCoordinates } from '../getCanvasCoordinates'
import { hexToRgb } from '../../colors/colorConversion'
import { compositeLayers } from '../../layers/compositeLayers'
import type { Layer } from '../../layers/types'
import { applyDragTool } from '../../tools/applyDragTool'
import { setColorSample } from '../../tools/colorPicker/colorSample'
import { pickCanvasColor } from '../../tools/colorPicker/pickCanvasColor'
import { drawStroke } from '../../tools/drawStroke'
import { floodFill } from '../../tools/fill/floodFill'
import type { RectangleSelection } from '../../tools/selection/types'
import { hasArea } from '../../tools/selection/selectionBounds'
import { isDragTool } from '../../tools/toolDefinitions'
import type { ToolSettings } from '../../tools/toolSettings'
import type { ToolId } from '../../tools/types'
import type { RasterDocument } from '../../types/RasterDocument'

import './CanvasWorkspace.css'

interface CanvasWorkspaceProps {
  document: RasterDocument | null
  zoom: number
  activeTool: ToolId
  toolSettings: ToolSettings
  selection: RectangleSelection | null
  onImageDataChange: (imageData: ImageData) => void
  onForegroundColorChange: (color: string) => void
  onBackgroundColorChange: (color: string) => void
  onSelectionChange: (selection: RectangleSelection | null) => void
  onEditStart: () => void
}

interface DragState {
  start: CanvasCoordinates
  baseImageData: ImageData
  result: ImageData | null
  pendingEnd: { point: CanvasCoordinates; constrain: boolean } | null
  frameId: number | null
}

// The picker reads pixels back on every hover move: keep the display canvas CPU-readable.
function getDisplayContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
  return canvas.getContext('2d', { willReadFrequently: true })
}

function CanvasWorkspace({
  document,
  zoom,
  activeTool,
  toolSettings,
  selection,
  onImageDataChange,
  onForegroundColorChange,
  onBackgroundColorChange,
  onSelectionChange,
  onEditStart,
}: CanvasWorkspaceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const strokeCanvasRef = useRef<ImageDataCanvas | null>(null)
  const lastPointRef = useRef<CanvasCoordinates | null>(null)

  const selectionStartRef = useRef<CanvasCoordinates | null>(null)

  const dragRef = useRef<DragState | null>(null)

  // Document the current stroke/drag started from: any other document change while
  // the pointer is down (undo, redo…) invalidates the pixels being edited.
  const interactionDocumentRef = useRef<RasterDocument | null>(null)

  const activeSelection = hasArea(selection) ? selection : null

  const getActiveLayer = (): Layer | null => {
    if (!document) {
      return null
    }

    return document.layers.find((layer) => layer.id === document.activeLayerId) ?? null
  }

  const renderDocument = (temporaryActiveLayer?: ImageData): void => {
    if (!document || !canvasRef.current) {
      return
    }

    const context = getDisplayContext(canvasRef.current)

    if (!context) {
      return
    }

    const layers = temporaryActiveLayer
      ? document.layers.map((layer) =>
          layer.id === document.activeLayerId
            ? {
                ...layer,
                imageData: temporaryActiveLayer,
              }
            : layer,
        )
      : document.layers

    compositeLayers(context, layers, document.width, document.height)
  }

  const cancelPixelInteraction = (): void => {
    const drag = dragRef.current

    if (drag?.frameId != null) {
      cancelAnimationFrame(drag.frameId)
    }

    dragRef.current = null
    strokeCanvasRef.current = null
    lastPointRef.current = null
    interactionDocumentRef.current = null
  }

  useEffect(() => {
    if (interactionDocumentRef.current && interactionDocumentRef.current !== document) {
      cancelPixelInteraction()
    }

    if (!document || !canvasRef.current) {
      return
    }

    const context = getDisplayContext(canvasRef.current)

    if (!context) {
      return
    }

    compositeLayers(context, document.layers, document.width, document.height)
  }, [document])

  useEffect(() => {
    setColorSample(null)
  }, [activeTool])

  const commitImageData = (imageData: ImageData): void => {
    onEditStart()
    onImageDataChange(imageData)
  }

  const drawActiveStroke = (from: CanvasCoordinates, to: CanvasCoordinates): void => {
    if (!strokeCanvasRef.current) {
      return
    }

    drawStroke(strokeCanvasRef.current.context, {
      from,
      to,
      size: activeTool === 'brush' ? toolSettings.brush.size : toolSettings.eraser.size,
      color: toolSettings.colors.foreground,
      erase: activeTool === 'eraser',
    })

    renderDocument(readCanvasImageData(strokeCanvasRef.current))
  }

  const createSelection = (
    start: CanvasCoordinates,
    end: CanvasCoordinates,
  ): RectangleSelection => {
    return {
      x: Math.min(start.x, end.x),
      y: Math.min(start.y, end.y),
      width: Math.abs(end.x - start.x),
      height: Math.abs(end.y - start.y),
    }
  }

  const pickColor = (event: React.PointerEvent<HTMLCanvasElement>, point: CanvasCoordinates) => {
    const context = getDisplayContext(event.currentTarget)
    const color = context ? pickCanvasColor(context, point) : null

    if (!color) {
      return
    }

    if (event.ctrlKey || event.metaKey) {
      onBackgroundColorChange(color)
    } else {
      onForegroundColorChange(color)
    }
  }

  const fillAt = (point: CanvasCoordinates): void => {
    const activeLayer = getActiveLayer()

    if (!activeLayer) {
      return
    }

    const result = floodFill(activeLayer.imageData, {
      x: point.x,
      y: point.y,
      color: hexToRgb(toolSettings.colors.foreground),
      tolerance: toolSettings.fill.tolerance,
      selection: activeSelection,
    })

    if (result) {
      commitImageData(result)
    }
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>): void => {
    const canvas = event.currentTarget
    const point = getCanvasCoordinates(event, canvas)

    if (activeTool === 'color-picker') {
      pickColor(event, point)
      return
    }

    if (activeTool === 'rectangle-select') {
      canvas.setPointerCapture(event.pointerId)
      selectionStartRef.current = point
      onSelectionChange({ x: point.x, y: point.y, width: 0, height: 0 })
      return
    }

    // Fill and drag tools only react to the primary button (no accidental right-click fill).
    const isPrimaryButton = event.button === 0

    if (activeTool === 'bucket-fill') {
      if (isPrimaryButton) {
        fillAt(point)
      }
      return
    }

    const activeLayer = getActiveLayer()

    if (!activeLayer || (isDragTool(activeTool) && !isPrimaryButton)) {
      return
    }

    canvas.setPointerCapture(event.pointerId)
    interactionDocumentRef.current = document

    if (isDragTool(activeTool)) {
      dragRef.current = {
        start: point,
        baseImageData: activeLayer.imageData,
        result: null,
        pendingEnd: null,
        frameId: null,
      }
      return
    }

    onEditStart()
    strokeCanvasRef.current = createImageDataCanvas(activeLayer.imageData)
    lastPointRef.current = point
    drawActiveStroke(point, point)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>): void => {
    const canvas = event.currentTarget
    const point = getCanvasCoordinates(event, canvas)

    if (activeTool === 'color-picker') {
      const context = getDisplayContext(canvas)

      setColorSample(context ? pickCanvasColor(context, point) : null)
      return
    }

    if (selectionStartRef.current) {
      onSelectionChange(createSelection(selectionStartRef.current, point))
      return
    }

    const drag = dragRef.current

    if (drag) {
      drag.pendingEnd = { point, constrain: event.shiftKey }
      drag.frameId ??= requestAnimationFrame(() => updateDragPreview(drag))
      return
    }

    if (strokeCanvasRef.current && lastPointRef.current) {
      drawActiveStroke(lastPointRef.current, point)
      lastPointRef.current = point
    }
  }

  const finishStroke = (): void => {
    const strokeCanvas = strokeCanvasRef.current

    strokeCanvasRef.current = null
    lastPointRef.current = null
    interactionDocumentRef.current = null

    if (strokeCanvas) {
      onImageDataChange(readCanvasImageData(strokeCanvas))
    }
  }

  // Recomputes the drag result at most once per frame (gradients cover the whole image).
  const updateDragPreview = (drag: DragState): void => {
    drag.frameId = null

    if (!drag.pendingEnd || !isDragTool(activeTool)) {
      return
    }

    drag.result = applyDragTool(
      activeTool,
      drag.baseImageData,
      { start: drag.start, end: drag.pendingEnd.point, constrain: drag.pendingEnd.constrain },
      toolSettings,
      activeSelection,
    )
    drag.pendingEnd = null

    if (dragRef.current === drag) {
      renderDocument(drag.result ?? drag.baseImageData)
    }
  }

  const finishDrag = (commit: boolean): void => {
    const drag = dragRef.current

    dragRef.current = null
    interactionDocumentRef.current = null

    if (!drag) {
      return
    }

    if (drag.frameId !== null) {
      cancelAnimationFrame(drag.frameId)
    }

    if (drag.pendingEnd) {
      updateDragPreview(drag)
    }

    if (commit && drag.result) {
      commitImageData(drag.result)
    } else {
      renderDocument()
    }
  }

  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>): void => {
    selectionStartRef.current = null

    // Honor Shift pressed or released after the last move.
    if (dragRef.current) {
      dragRef.current.pendingEnd = {
        point: getCanvasCoordinates(event, event.currentTarget),
        constrain: event.shiftKey,
      }
    }

    finishDrag(true)
    finishStroke()
  }

  const handlePointerCancel = (): void => {
    selectionStartRef.current = null
    finishDrag(false)
    finishStroke()
  }

  const handlePointerLeave = (): void => {
    if (activeTool === 'color-picker') {
      setColorSample(null)
    }
  }

  const zoomScale = zoom / 100

  return (
    <main className="canvas-workspace">
      {document ? (
        <div
          className="canvas-workspace__document"
          style={{
            width: `${document.width * zoomScale}px`,
            height: `${document.height * zoomScale}px`,
          }}
        >
          <canvas
            ref={canvasRef}
            className={`canvas-workspace__canvas canvas-workspace__canvas--${activeTool}`}
            width={document.width}
            height={document.height}
            style={{
              width: `${document.width * zoomScale}px`,
              height: `${document.height * zoomScale}px`,
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            onPointerLeave={handlePointerLeave}
          />

          {activeSelection && (
            <div
              className="canvas-workspace__selection"
              style={{
                left: `${activeSelection.x * zoomScale}px`,
                top: `${activeSelection.y * zoomScale}px`,
                width: `${activeSelection.width * zoomScale}px`,
                height: `${activeSelection.height * zoomScale}px`,
              }}
            />
          )}
        </div>
      ) : (
        <p className="canvas-workspace__empty">No document open</p>
      )}
    </main>
  )
}

export default CanvasWorkspace
