/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** ToolOptions.tsx
 */

import type { BrushOptions } from '../../tools/brush/types'
import type { EraserOptions } from '../../tools/eraser/types'
import type { ToolId } from '../../tools/types'

import './ToolOptions.css'

interface ToolOptionsProps {
  activeTool: ToolId
  brushOptions: BrushOptions
  eraserOptions: EraserOptions
  onBrushSizeChange: (size: number) => void
  onBrushColorChange: (color: string) => void
  onEraserSizeChange: (size: number) => void
  hasSelection: boolean
  canMaskSelection: boolean
  onCrop: () => void
  onMaskSelection: () => void
}

function ToolOptions({
  activeTool,
  brushOptions,
  eraserOptions,
  onBrushSizeChange,
  onBrushColorChange,
  onEraserSizeChange,
  hasSelection,
  canMaskSelection,
  onCrop,
  onMaskSelection,
}: ToolOptionsProps) {
  return (
    <section className="tool-options">
      <span className="tool-options__label">Tool Options</span>

      {activeTool === 'brush' && (
        <>
          <label className="tool-options__field">
            Size
            <input
              type="number"
              min="1"
              max="200"
              value={brushOptions.size}
              onChange={(event) => onBrushSizeChange(Number(event.target.value))}
            />
          </label>

          <label className="tool-options__field">
            Color
            <input
              type="color"
              value={brushOptions.color}
              onChange={(event) => onBrushColorChange(event.target.value)}
            />
          </label>
        </>
      )}

      {activeTool === 'eraser' && (
        <label className="tool-options__field">
          Size
          <input
            type="number"
            min="1"
            max="200"
            value={eraserOptions.size}
            onChange={(event) => onEraserSizeChange(Number(event.target.value))}
          />
        </label>
      )}

      {activeTool === 'rectangle-select' && (
        <>
          <button type="button" disabled={!hasSelection} onClick={onCrop}>
            Crop
          </button>

          <button
            type="button"
            disabled={!hasSelection || !canMaskSelection}
            onClick={onMaskSelection}
          >
            Mask Selection
          </button>
        </>
      )}
    </section>
  )
}

export default ToolOptions
