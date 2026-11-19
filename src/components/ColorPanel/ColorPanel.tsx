/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** ColorPanel.tsx
 */

import { useState } from 'react'

import { hexToRgb, hsvToRgb, normalizeHex, rgbToHex, rgbToHsv } from '../../colors/colorConversion'
import type { HsvColor, RgbColor } from '../../colors/colorConversion'
import type { ColorState, ColorTarget } from '../../colors/types'

import './ColorPanel.css'

interface ColorPanelProps {
  colors: ColorState
  onColorChange: (target: ColorTarget, color: string) => void
  onSwap: () => void
  onReset: () => void
}

interface ChannelFieldProps {
  label: string
  name: string
  value: number
  max: number
  className?: string
  onChange: (value: number) => void
}

function ChannelField({ label, name, value, max, className, onChange }: ChannelFieldProps) {
  const handleChange = (rawValue: string): void => {
    const nextValue = Number(rawValue)

    if (rawValue !== '' && !Number.isNaN(nextValue)) {
      onChange(Math.max(0, Math.min(max, nextValue)))
    }
  }

  return (
    <div className="color-panel__channel">
      <span className="color-panel__channel-label" aria-hidden="true">
        {label}
      </span>
      <input
        className={`color-panel__slider ${className ?? ''}`}
        type="range"
        min="0"
        max={max}
        value={Math.round(value)}
        aria-label={name}
        onChange={(event) => handleChange(event.target.value)}
      />
      <input
        className="color-panel__number"
        type="number"
        min="0"
        max={max}
        value={Math.round(value)}
        aria-label={`${name} value`}
        onChange={(event) => handleChange(event.target.value)}
      />
    </div>
  )
}

// HSV is kept locally so the hue survives when saturation or value reach 0
// (both map to a grey/black hex that has no hue of its own).
function useHsvDraft(color: string) {
  const [draft, setDraft] = useState({ color, hsv: rgbToHsv(hexToRgb(color)) })

  if (draft.color !== color) {
    const resynced = { color, hsv: rgbToHsv(hexToRgb(color)) }

    setDraft(resynced)
    return { hsv: resynced.hsv, setDraft }
  }

  return { hsv: draft.hsv, setDraft }
}

function useHexDraft(color: string) {
  const [draft, setDraft] = useState({ color, text: color })

  if (draft.color !== color) {
    setDraft({ color, text: color })
    return { text: color, setDraft }
  }

  return { text: draft.text, setDraft }
}

function ColorPanel({ colors, onColorChange, onSwap, onReset }: ColorPanelProps) {
  const [target, setTarget] = useState<ColorTarget>('foreground')

  const color = colors[target]
  const rgb = hexToRgb(color)
  const { hsv, setDraft: setHsvDraft } = useHsvDraft(color)
  const { text: hexText, setDraft: setHexDraft } = useHexDraft(color)

  const commitColor = (nextColor: string): void => {
    onColorChange(target, nextColor)
  }

  const updateRgb = (channel: keyof RgbColor, value: number): void => {
    commitColor(rgbToHex({ ...rgb, [channel]: value }))
  }

  const updateHsv = (channel: keyof HsvColor, value: number): void => {
    const nextHsv = { ...hsv, [channel]: value }
    const nextColor = rgbToHex(hsvToRgb(nextHsv))

    setHsvDraft({ color: nextColor, hsv: nextHsv })
    commitColor(nextColor)
  }

  const updateHex = (text: string): void => {
    const normalized = normalizeHex(text)

    setHexDraft({ color: normalized ?? color, text })

    if (normalized) {
      commitColor(normalized)
    }
  }

  const isHexValid = normalizeHex(hexText) !== null
  const hueStyle = { '--color-panel-hue': hsv.hue } as React.CSSProperties

  return (
    <section className="color-panel" aria-label="Colors">
      <header className="color-panel__header">
        <h2 className="color-panel__title">Colors</h2>
        <div className="color-panel__actions">
          <button type="button" onClick={onSwap} title="Swap foreground and background (X)">
            Swap
          </button>
          <button type="button" onClick={onReset} title="Reset to black and white (D)">
            Reset
          </button>
        </div>
      </header>

      <div className="color-panel__swatches">
        <div className="color-panel__swatch-stack">
          <button
            type="button"
            className={`color-panel__swatch color-panel__swatch--background${target === 'background' ? ' color-panel__swatch--active' : ''}`}
            style={{ background: colors.background }}
            aria-pressed={target === 'background'}
            title={`Background color ${colors.background}`}
            aria-label={`Edit background color (${colors.background})`}
            onClick={() => setTarget('background')}
          />
          <button
            type="button"
            className={`color-panel__swatch color-panel__swatch--foreground${target === 'foreground' ? ' color-panel__swatch--active' : ''}`}
            style={{ background: colors.foreground }}
            aria-pressed={target === 'foreground'}
            title={`Foreground color ${colors.foreground}`}
            aria-label={`Edit foreground color (${colors.foreground})`}
            onClick={() => setTarget('foreground')}
          />
        </div>

        <div className="color-panel__preview">
          <span className="color-panel__preview-label">
            {target === 'foreground' ? 'Foreground' : 'Background'}
          </span>
          <span
            className="color-panel__preview-swatch"
            style={{ background: color }}
            data-testid="color-preview"
          />
          <span className="color-panel__preview-value">{color}</span>
        </div>
      </div>

      <fieldset className="color-panel__group">
        <legend>RGB</legend>
        <ChannelField
          label="R"
          name="Red"
          value={rgb.red}
          max={255}
          onChange={(v) => updateRgb('red', v)}
        />
        <ChannelField
          label="G"
          name="Green"
          value={rgb.green}
          max={255}
          onChange={(v) => updateRgb('green', v)}
        />
        <ChannelField
          label="B"
          name="Blue"
          value={rgb.blue}
          max={255}
          onChange={(v) => updateRgb('blue', v)}
        />
      </fieldset>

      <fieldset className="color-panel__group" style={hueStyle}>
        <legend>HSV</legend>
        <ChannelField
          label="H"
          name="Hue"
          value={hsv.hue}
          max={360}
          className="color-panel__slider--hue"
          onChange={(v) => updateHsv('hue', v)}
        />
        <ChannelField
          label="S"
          name="Saturation"
          value={hsv.saturation}
          max={100}
          onChange={(v) => updateHsv('saturation', v)}
        />
        <ChannelField
          label="V"
          name="Value"
          value={hsv.value}
          max={100}
          onChange={(v) => updateHsv('value', v)}
        />
      </fieldset>

      <label className="color-panel__hex">
        Hex
        <input
          type="text"
          value={hexText}
          spellCheck={false}
          maxLength={7}
          aria-invalid={!isHexValid}
          onChange={(event) => updateHex(event.target.value)}
          onBlur={() => setHexDraft({ color, text: color })}
        />
      </label>
      {!isHexValid && <p className="color-panel__error">Use #rgb or #rrggbb</p>}
    </section>
  )
}

export default ColorPanel
