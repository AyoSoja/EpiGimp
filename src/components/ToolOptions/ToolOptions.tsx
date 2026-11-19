/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** ToolOptions.tsx
 */

import type { ColorState } from '../../colors/types'
import { useColorSample } from '../../hooks/useColorSample'
import { MAX_FILL_TOLERANCE, MIN_FILL_TOLERANCE } from '../../tools/fill/floodFill'
import type { GradientType } from '../../tools/gradient/types'
import { MAX_STROKE_WIDTH, MIN_STROKE_WIDTH } from '../../tools/shapes/types'
import type { ShapeStyle } from '../../tools/shapes/types'
import { isShapeTool, TOOL_DEFINITIONS } from '../../tools/toolDefinitions'
import type { ToolSettings } from '../../tools/toolSettings'
import type { ToolId } from '../../tools/types'

import './ToolOptions.css'

interface ToolOptionsProps {
  activeTool: ToolId
  toolSettings: ToolSettings
  onBrushSizeChange: (size: number) => void
  onEraserSizeChange: (size: number) => void
  onFillToleranceChange: (tolerance: number) => void
  onGradientTypeChange: (type: GradientType) => void
  onShapeStrokeWidthChange: (width: number) => void
  onShapeStyleChange: (style: ShapeStyle) => void
  onForegroundColorChange: (color: string) => void
  onBackgroundColorChange: (color: string) => void
  hasSelection: boolean
  canMaskSelection: boolean
  onCrop: () => void
  onMaskSelection: () => void
}

// An emptied number field means "still typing", not 0.
function readNumber(value: string): number {
  return value.trim() === '' ? Number.NaN : Number(value)
}

const SHAPE_STYLES: { value: ShapeStyle; label: string }[] = [
  { value: 'stroke', label: 'Outline' },
  { value: 'fill', label: 'Fill' },
  { value: 'stroke-fill', label: 'Outline + fill' },
]

interface ColorInputProps {
  label: string
  value: string
  onChange: (color: string) => void
}

function ColorInput({ label, value, onChange }: ColorInputProps) {
  return (
    <label className="tool-options__field">
      {label}
      <input type="color" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

interface ColorSampleProps {
  colors: ColorState
}

function ColorSample({ colors }: ColorSampleProps) {
  const sampledColor = useColorSample()

  return (
    <>
      <span className="tool-options__field">
        Under cursor
        <span
          className={`tool-options__swatch${sampledColor ? '' : ' tool-options__swatch--empty'}`}
          style={sampledColor ? { background: sampledColor } : undefined}
          data-testid="picker-sample"
        />
        <code className="tool-options__value">{sampledColor ?? '—'}</code>
      </span>
      <span className="tool-options__field">
        Foreground
        <span className="tool-options__swatch" style={{ background: colors.foreground }} />
        <code className="tool-options__value">{colors.foreground}</code>
      </span>
    </>
  )
}

function ToolOptions({
  activeTool,
  toolSettings,
  onBrushSizeChange,
  onEraserSizeChange,
  onFillToleranceChange,
  onGradientTypeChange,
  onShapeStrokeWidthChange,
  onShapeStyleChange,
  onForegroundColorChange,
  onBackgroundColorChange,
  hasSelection,
  canMaskSelection,
  onCrop,
  onMaskSelection,
}: ToolOptionsProps) {
  const { colors } = toolSettings
  const hint = TOOL_DEFINITIONS.find((tool) => tool.id === activeTool)?.description
  const shapeStyle = toolSettings.shape.style
  const usesOutline = activeTool === 'line' || shapeStyle !== 'fill'
  const usesFill = activeTool !== 'line' && shapeStyle !== 'stroke'

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
              value={toolSettings.brush.size}
              onChange={(event) => onBrushSizeChange(Number(event.target.value))}
            />
          </label>

          <ColorInput label="Color" value={colors.foreground} onChange={onForegroundColorChange} />
        </>
      )}

      {activeTool === 'eraser' && (
        <label className="tool-options__field">
          Size
          <input
            type="number"
            min="1"
            max="200"
            value={toolSettings.eraser.size}
            onChange={(event) => onEraserSizeChange(Number(event.target.value))}
          />
        </label>
      )}

      {activeTool === 'color-picker' && <ColorSample colors={colors} />}

      {activeTool === 'bucket-fill' && (
        <>
          <label className="tool-options__field">
            Tolerance
            <input
              type="range"
              min={MIN_FILL_TOLERANCE}
              max={MAX_FILL_TOLERANCE}
              value={toolSettings.fill.tolerance}
              onChange={(event) => onFillToleranceChange(readNumber(event.target.value))}
            />
            <input
              type="number"
              min={MIN_FILL_TOLERANCE}
              max={MAX_FILL_TOLERANCE}
              value={toolSettings.fill.tolerance}
              aria-label="Tolerance value"
              onChange={(event) => onFillToleranceChange(readNumber(event.target.value))}
            />
          </label>

          <ColorInput label="Color" value={colors.foreground} onChange={onForegroundColorChange} />
        </>
      )}

      {activeTool === 'gradient' && (
        <>
          <label className="tool-options__field">
            Shape
            <select
              value={toolSettings.gradient.type}
              onChange={(event) => onGradientTypeChange(event.target.value as GradientType)}
            >
              <option value="linear">Linear</option>
              <option value="radial">Radial</option>
            </select>
          </label>

          <ColorInput label="From" value={colors.foreground} onChange={onForegroundColorChange} />
          <ColorInput label="To" value={colors.background} onChange={onBackgroundColorChange} />
        </>
      )}

      {isShapeTool(activeTool) && (
        <>
          {activeTool !== 'line' && (
            <label className="tool-options__field">
              Style
              <select
                value={shapeStyle}
                onChange={(event) => onShapeStyleChange(event.target.value as ShapeStyle)}
              >
                {SHAPE_STYLES.map((style) => (
                  <option key={style.value} value={style.value}>
                    {style.label}
                  </option>
                ))}
              </select>
            </label>
          )}

          {usesOutline && (
            <label className="tool-options__field">
              Width
              <input
                type="number"
                min={MIN_STROKE_WIDTH}
                max={MAX_STROKE_WIDTH}
                value={toolSettings.shape.strokeWidth}
                onChange={(event) => onShapeStrokeWidthChange(readNumber(event.target.value))}
              />
            </label>
          )}

          {usesOutline && (
            <ColorInput
              label="Outline"
              value={colors.foreground}
              onChange={onForegroundColorChange}
            />
          )}
          {usesFill && (
            <ColorInput label="Fill" value={colors.background} onChange={onBackgroundColorChange} />
          )}
        </>
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

      {hint && <span className="tool-options__hint">{hint}</span>}
    </section>
  )
}

export default ToolOptions
