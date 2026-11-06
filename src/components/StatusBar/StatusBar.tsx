/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** StatusBar.tsx
 */

import './StatusBar.css'

interface StatusBarProps {
  zoom: number
  documentSize: string
  onZoomIn: () => void
  onZoomOut: () => void
}

function StatusBar({ zoom, documentSize, onZoomIn, onZoomOut }: StatusBarProps) {
  return (
    <footer className="status-bar">
      <span className="status-bar__item">Ready</span>

      <div className="status-bar__info">
        <div className="status-bar__zoom">
          <button type="button" onClick={onZoomOut} aria-label="Zoom out">
            −
          </button>

          <span className="status-bar__item">{zoom}%</span>

          <button type="button" onClick={onZoomIn} aria-label="Zoom in">
            +
          </button>
        </div>

        <span className="status-bar__item">{documentSize}</span>
      </div>
    </footer>
  )
}

export default StatusBar
