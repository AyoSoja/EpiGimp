/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** MenuBar.tsx
 */

import { useState } from 'react'

import './MenuBar.css'

const MENU_ITEMS = ['View'] as const

interface MenuBarProps {
  onNewDocument: () => void
  onOpenImage: () => void
  onExportPng: () => void
  onExportJpeg: () => void
  onUndo: () => void
  onRedo: () => void
  onGrayscale: () => void
  onInvert: () => void
  onBrightnessIncrease: () => void
  onBrightnessDecrease: () => void
  onContrastIncrease: () => void
  onContrastDecrease: () => void
  onBlur: () => void
  canUndo: boolean
  canRedo: boolean
  hasDocument: boolean
}

function MenuBar({
  onNewDocument,
  onOpenImage,
  onExportPng,
  onExportJpeg,
  onUndo,
  onRedo,
  onGrayscale,
  onInvert,
  onBrightnessIncrease,
  onBrightnessDecrease,
  onContrastIncrease,
  onContrastDecrease,
  onBlur,
  canUndo,
  canRedo,
  hasDocument,
}: MenuBarProps) {
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false)
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false)
  const [isFiltersMenuOpen, setIsFiltersMenuOpen] = useState(false)

  const closeMenus = (): void => {
    setIsFileMenuOpen(false)
    setIsEditMenuOpen(false)
    setIsFiltersMenuOpen(false)
  }

  const handleAction = (action: () => void): void => {
    closeMenus()
    action()
  }

  const toggleFileMenu = (): void => {
    setIsFileMenuOpen((isOpen) => !isOpen)
    setIsEditMenuOpen(false)
    setIsFiltersMenuOpen(false)
  }

  const toggleEditMenu = (): void => {
    setIsEditMenuOpen((isOpen) => !isOpen)
    setIsFileMenuOpen(false)
    setIsFiltersMenuOpen(false)
  }

  const toggleFiltersMenu = (): void => {
    setIsFiltersMenuOpen((isOpen) => !isOpen)
    setIsFileMenuOpen(false)
    setIsEditMenuOpen(false)
  }

  return (
    <nav className="menu-bar" aria-label="Application menu">
      <div className="menu-bar__menu">
        <button
          className="menu-bar__item"
          type="button"
          onClick={toggleFileMenu}
          aria-expanded={isFileMenuOpen}
        >
          File
        </button>

        {isFileMenuOpen && (
          <div className="menu-bar__dropdown">
            <button type="button" onClick={() => handleAction(onNewDocument)}>
              <span>New</span>
              <span className="menu-shortcut">Ctrl+N</span>
            </button>

            <button type="button" onClick={() => handleAction(onOpenImage)}>
              <span>Open</span>
              <span className="menu-shortcut">Ctrl+O</span>
            </button>

            <button type="button" disabled={!hasDocument} onClick={() => handleAction(onExportPng)}>
              <span>Export PNG</span>
              <span className="menu-shortcut">Ctrl+Shift+P</span>
            </button>

            <button
              type="button"
              disabled={!hasDocument}
              onClick={() => handleAction(onExportJpeg)}
            >
              <span>Export JPEG</span>
              <span className="menu-shortcut">Ctrl+Shift+J</span>
            </button>
          </div>
        )}
      </div>

      <div className="menu-bar__menu">
        <button
          className="menu-bar__item"
          type="button"
          onClick={toggleEditMenu}
          aria-expanded={isEditMenuOpen}
        >
          Edit
        </button>

        {isEditMenuOpen && (
          <div className="menu-bar__dropdown">
            <button type="button" disabled={!canUndo} onClick={() => handleAction(onUndo)}>
              <span>Undo</span>
              <span className="menu-shortcut">Ctrl+Z</span>
            </button>

            <button type="button" disabled={!canRedo} onClick={() => handleAction(onRedo)}>
              <span>Redo</span>
              <span className="menu-shortcut">Ctrl+Shift+Z</span>
            </button>
          </div>
        )}
      </div>

      <button className="menu-bar__item" type="button">
        Image
      </button>

      <div className="menu-bar__menu">
        <button
          className="menu-bar__item"
          type="button"
          onClick={toggleFiltersMenu}
          aria-expanded={isFiltersMenuOpen}
        >
          Filters
        </button>

        {isFiltersMenuOpen && (
          <div className="menu-bar__dropdown">
            <button type="button" disabled={!hasDocument} onClick={() => handleAction(onGrayscale)}>
              Grayscale
            </button>

            <button type="button" disabled={!hasDocument} onClick={() => handleAction(onInvert)}>
              Invert Colors
            </button>

            <button
              type="button"
              disabled={!hasDocument}
              onClick={() => handleAction(onBrightnessIncrease)}
            >
              Brightness +
            </button>

            <button
              type="button"
              disabled={!hasDocument}
              onClick={() => handleAction(onBrightnessDecrease)}
            >
              Brightness -
            </button>

            <button
              type="button"
              disabled={!hasDocument}
              onClick={() => handleAction(onContrastIncrease)}
            >
              Contrast +
            </button>

            <button
              type="button"
              disabled={!hasDocument}
              onClick={() => handleAction(onContrastDecrease)}
            >
              Contrast -
            </button>

            <button type="button" disabled={!hasDocument} onClick={() => handleAction(onBlur)}>
              Blur
            </button>
          </div>
        )}
      </div>

      {MENU_ITEMS.map((item) => (
        <button className="menu-bar__item" type="button" key={item}>
          {item}
        </button>
      ))}
    </nav>
  )
}

export default MenuBar
