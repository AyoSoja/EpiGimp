/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** useKeyboardShortcuts.ts
 */

import { useEffect } from 'react'

interface KeyboardShortcutActions {
  onNewDocument: () => void
  onOpenImage: () => void
  onUndo: () => void
  onRedo: () => void
  onExportPng: () => void
  onExportJpeg: () => void
  onSwapColors: () => void
  onResetColors: () => void
}

function isEditableElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    target.isContentEditable
  )
}

function runShortcut(event: KeyboardEvent, actions: KeyboardShortcutActions): boolean {
  const key = event.key.toLowerCase()

  if (key === 'n' && !event.shiftKey) {
    actions.onNewDocument()
    return true
  }

  if (key === 'o' && !event.shiftKey) {
    actions.onOpenImage()
    return true
  }

  if (key === 'z' && !event.shiftKey) {
    actions.onUndo()
    return true
  }

  if (key === 'z' && event.shiftKey) {
    actions.onRedo()
    return true
  }

  if (key === 'p' && event.shiftKey) {
    actions.onExportPng()
    return true
  }

  if (key === 'j' && event.shiftKey) {
    actions.onExportJpeg()
    return true
  }

  return false
}

// Single-key shortcuts (no modifier), as in GIMP: X swaps, D resets the colors.
function runToolShortcut(event: KeyboardEvent, actions: KeyboardShortcutActions): boolean {
  const isInDialog = event.target instanceof Element && event.target.closest('[role="dialog"]')

  if (event.altKey || event.shiftKey || isInDialog) {
    return false
  }

  const key = event.key.toLowerCase()

  if (key === 'x') {
    actions.onSwapColors()
    return true
  }

  if (key === 'd') {
    actions.onResetColors()
    return true
  }

  return false
}

export function useKeyboardShortcuts(actions: KeyboardShortcutActions): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (isEditableElement(event.target)) {
        return
      }

      const hasCommandModifier = event.ctrlKey || event.metaKey
      const handled = hasCommandModifier
        ? runShortcut(event, actions)
        : runToolShortcut(event, actions)

      if (handled) {
        event.preventDefault()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [actions])
}
