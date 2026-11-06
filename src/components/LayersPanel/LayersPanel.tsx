/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** LayersPanel.tsx
 */

import { useState } from 'react'

import type { Layer } from '../../layers/types'

import './LayersPanel.css'

interface LayersPanelProps {
  layers: Layer[]
  activeLayerId: string | null
  onAddLayer: () => void
  onDeleteLayer: (layerId: string) => void
  onSelectLayer: (layerId: string) => void
  onRenameLayer: (layerId: string, name: string) => void
  onDuplicateLayer: (layerId: string) => void
  onToggleVisibility: (layerId: string) => void
  onOpacityChange: (layerId: string, opacity: number) => void
  onOpacityEditStart: () => void
  onMoveLayerUp: (layerId: string) => void
  onMoveLayerDown: (layerId: string) => void
  onAddMask: (layerId: string) => void
  onToggleMask: (layerId: string) => void
  onRemoveMask: (layerId: string) => void
}

function LayersPanel({
  layers,
  activeLayerId,
  onAddLayer,
  onDeleteLayer,
  onSelectLayer,
  onRenameLayer,
  onDuplicateLayer,
  onToggleVisibility,
  onOpacityChange,
  onOpacityEditStart,
  onMoveLayerUp,
  onMoveLayerDown,
  onAddMask,
  onToggleMask,
  onRemoveMask,
}: LayersPanelProps) {
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const startRenaming = (layer: Layer): void => {
    setEditingLayerId(layer.id)
    setEditingName(layer.name)
  }

  const finishRenaming = (layerId: string): void => {
    onRenameLayer(layerId, editingName)
    setEditingLayerId(null)
    setEditingName('')
  }

  const cancelRenaming = (): void => {
    setEditingLayerId(null)
    setEditingName('')
  }

  return (
    <aside className="layers-panel">
      <header className="layers-panel__header">
        <h2 className="layers-panel__title">Layers</h2>

        <button
          className="layers-panel__add"
          type="button"
          onClick={onAddLayer}
          aria-label="Add layer"
          title="Add layer"
        >
          +
        </button>
      </header>

      <div className="layers-panel__content">
        {layers.length === 0 ? (
          <p>No layers yet.</p>
        ) : (
          [...layers].reverse().map((layer) => {
            const layerIndex = layers.findIndex((currentLayer) => currentLayer.id === layer.id)
            const canMoveUp = layerIndex < layers.length - 1
            const canMoveDown = layerIndex > 0
            const isActive = layer.id === activeLayerId
            const isEditing = layer.id === editingLayerId

            return (
              <div
                className={`layers-panel__layer ${isActive ? 'layers-panel__layer--active' : ''}`}
                key={layer.id}
              >
                <div className="layers-panel__layer-main">
                  <button
                    className="layers-panel__visibility"
                    type="button"
                    onClick={() => onToggleVisibility(layer.id)}
                    aria-label={`${layer.visible ? 'Hide' : 'Show'} ${layer.name}`}
                    title={layer.visible ? 'Hide layer' : 'Show layer'}
                  >
                    {layer.visible ? '[x]' : '[ ]'}
                  </button>

                  {isEditing ? (
                    <input
                      className="layers-panel__rename"
                      type="text"
                      value={editingName}
                      autoFocus
                      onChange={(event) => setEditingName(event.target.value)}
                      onBlur={() => finishRenaming(layer.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          finishRenaming(layer.id)
                        }

                        if (event.key === 'Escape') {
                          cancelRenaming()
                        }
                      }}
                    />
                  ) : (
                    <button
                      className="layers-panel__layer-select"
                      type="button"
                      onClick={() => onSelectLayer(layer.id)}
                      onDoubleClick={() => startRenaming(layer)}
                      aria-pressed={isActive}
                    >
                      {layer.name}
                    </button>
                  )}

                  <button
                    className="layers-panel__move"
                    type="button"
                    disabled={!canMoveUp}
                    onClick={() => onMoveLayerUp(layer.id)}
                    aria-label={`Move ${layer.name} up`}
                    title="Move layer up"
                  >
                    ^
                  </button>

                  <button
                    className="layers-panel__move"
                    type="button"
                    disabled={!canMoveDown}
                    onClick={() => onMoveLayerDown(layer.id)}
                    aria-label={`Move ${layer.name} down`}
                    title="Move layer down"
                  >
                    v
                  </button>

                  <button
                    className="layers-panel__duplicate"
                    type="button"
                    onClick={() => onDuplicateLayer(layer.id)}
                    aria-label={`Duplicate ${layer.name}`}
                    title="Duplicate layer"
                  >
                    +
                  </button>

                  <button
                    className="layers-panel__delete"
                    type="button"
                    disabled={layers.length <= 1}
                    onClick={() => onDeleteLayer(layer.id)}
                    aria-label={`Delete ${layer.name}`}
                    title="Delete layer"
                  >
                    x
                  </button>
                </div>

                <div className="layers-panel__opacity">
                  <label htmlFor={`opacity-${layer.id}`}>Opacity</label>

                  <input
                    id={`opacity-${layer.id}`}
                    type="range"
                    min="0"
                    max="100"
                    value={layer.opacity}
                    onPointerDown={onOpacityEditStart}
                    onChange={(event) => onOpacityChange(layer.id, Number(event.target.value))}
                  />

                  <span>{layer.opacity}%</span>
                </div>

                <div className="layers-panel__mask">
                  {layer.mask ? (
                    <>
                      <span className="layers-panel__mask-label">
                        Mask: {layer.mask.enabled ? 'ON' : 'OFF'}
                      </span>

                      <button type="button" onClick={() => onToggleMask(layer.id)}>
                        {layer.mask.enabled ? 'Disable' : 'Enable'}
                      </button>

                      <button type="button" onClick={() => onRemoveMask(layer.id)}>
                        Remove
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="layers-panel__mask-label">No mask</span>

                      <button type="button" onClick={() => onAddMask(layer.id)}>
                        Add Mask
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </aside>
  )
}

export default LayersPanel
