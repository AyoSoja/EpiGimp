/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** CanvasWorkspace.tsx
 */

import { useEffect, useRef } from 'react'

import { getCanvasCoordinates } from '../getCanvasCoordinates'
import { compositeLayers } from '../../layers/compositeLayers'
import type { Layer } from '../../layers/types'
import type { BrushOptions } from '../../tools/brush/types'
import { pickCanvasColor } from '../../tools/colorPicker/pickCanvasColor'
import { drawStroke } from '../../tools/drawStroke'
import type { EraserOptions } from '../../tools/eraser/types'
import type { RectangleSelection } from '../../tools/selection/types'
import type { ToolId } from '../../tools/types'
import type { RasterDocument } from '../../types/RasterDocument'

import './CanvasWorkspace.css'

interface CanvasWorkspaceProps {
  document: RasterDocument | null
  zoom: number
  activeTool: ToolId
  brushOptions: BrushOptions
  eraserOptions: EraserOptions
  selection: RectangleSelection | null
  onImageDataChange: (imageData: ImageData) => void
  onForegroundColorChange: (color: string) => void
  onSelectionChange: (selection: RectangleSelection | null) => void
  onEditStart: () => void
}

function CanvasWorkspace({
  document,
  zoom,
  activeTool,
  brushOptions,
  eraserOptions,
  selection,
  onImageDataChange,
  onForegroundColorChange,
  onSelectionChange,
  onEditStart,
}: CanvasWorkspaceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const editingCanvasRef = useRef<HTMLCanvasElement | null>(null)

  const isDrawingRef = useRef(false)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)

  const isSelectingRef = useRef(false)
  const selectionStartRef = useRef<{ x: number; y: number } | null>(null)

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

    const context = canvasRef.current.getContext('2d')

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

  useEffect(() => {
    if (!document || !canvasRef.current) {
      return
    }

    const context = canvasRef.current.getContext('2d')

    if (!context) {
      return
    }

    compositeLayers(context, document.layers, document.width, document.height)
  }, [document])

  const createEditingCanvas = (layer: Layer): HTMLCanvasElement => {
    const canvas = window.document.createElement('canvas')

    canvas.width = layer.imageData.width
    canvas.height = layer.imageData.height

    const context = canvas.getContext('2d')

    if (!context) {
      throw new Error('Unable to create editing context')
    }

    context.putImageData(layer.imageData, 0, 0)

    return canvas
  }

  const drawActiveStroke = (
    context: CanvasRenderingContext2D,
    from: { x: number; y: number },
    to: { x: number; y: number },
  ): void => {
    drawStroke(context, {
      from,
      to,
      size: activeTool === 'brush' ? brushOptions.size : eraserOptions.size,
      color: brushOptions.color,
      erase: activeTool === 'eraser',
    })
  }

  const createSelection = (
    start: { x: number; y: number },
    end: { x: number; y: number },
  ): RectangleSelection => {
    const x = Math.min(start.x, end.x)
    const y = Math.min(start.y, end.y)

    return {
      x,
      y,
      width: Math.abs(end.x - start.x),
      height: Math.abs(end.y - start.y),
    }
  }

  const updateEditingPreview = (): void => {
    const editingCanvas = editingCanvasRef.current

    if (!editingCanvas) {
      return
    }

    const context = editingCanvas.getContext('2d')

    if (!context) {
      return
    }

    const imageData = context.getImageData(0, 0, editingCanvas.width, editingCanvas.height)

    renderDocument(imageData)
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>): void => {
    const canvas = event.currentTarget
    const context = canvas.getContext('2d')

    if (!context) {
      return
    }

    const point = getCanvasCoordinates(event, canvas)

    if (activeTool === 'color-picker') {
      const color = pickCanvasColor(context, point)

      if (color) {
        onForegroundColorChange(color)
      }

      return
    }

    if (activeTool === 'rectangle-select') {
      canvas.setPointerCapture(event.pointerId)

      isSelectingRef.current = true
      selectionStartRef.current = point

      onSelectionChange({
        x: point.x,
        y: point.y,
        width: 0,
        height: 0,
      })

      return
    }

    if (activeTool !== 'brush' && activeTool !== 'eraser') {
      return
    }

    const activeLayer = getActiveLayer()

    if (!activeLayer) {
      return
    }

    onEditStart()

    const editingCanvas = createEditingCanvas(activeLayer)
    const editingContext = editingCanvas.getContext('2d')

    if (!editingContext) {
      return
    }

    editingCanvasRef.current = editingCanvas

    canvas.setPointerCapture(event.pointerId)

    isDrawingRef.current = true
    lastPointRef.current = point

    drawActiveStroke(editingContext, point, point)
    updateEditingPreview()
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>): void => {
    const canvas = event.currentTarget

    if (activeTool === 'rectangle-select' && isSelectingRef.current && selectionStartRef.current) {
      const point = getCanvasCoordinates(event, canvas)

      onSelectionChange(createSelection(selectionStartRef.current, point))

      return
    }

    if (
      (activeTool !== 'brush' && activeTool !== 'eraser') ||
      !isDrawingRef.current ||
      !lastPointRef.current ||
      !editingCanvasRef.current
    ) {
      return
    }

    const editingContext = editingCanvasRef.current.getContext('2d')

    if (!editingContext) {
      return
    }

    const point = getCanvasCoordinates(event, canvas)
    const previousPoint = lastPointRef.current

    drawActiveStroke(editingContext, previousPoint, point)

    lastPointRef.current = point

    updateEditingPreview()
  }

  const handlePointerEnd = (): void => {
    if (isSelectingRef.current) {
      isSelectingRef.current = false
      selectionStartRef.current = null
      return
    }

    if (!isDrawingRef.current || !editingCanvasRef.current) {
      return
    }

    const editingCanvas = editingCanvasRef.current
    const context = editingCanvas.getContext('2d')

    isDrawingRef.current = false
    lastPointRef.current = null
    editingCanvasRef.current = null

    if (!context) {
      return
    }

    const imageData = context.getImageData(0, 0, editingCanvas.width, editingCanvas.height)

    onImageDataChange(imageData)
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
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
          />

          {selection && selection.width > 0 && selection.height > 0 && (
            <div
              className="canvas-workspace__selection"
              style={{
                left: `${selection.x * zoomScale}px`,
                top: `${selection.y * zoomScale}px`,
                width: `${selection.width * zoomScale}px`,
                height: `${selection.height * zoomScale}px`,
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
