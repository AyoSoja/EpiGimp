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

export function useKeyboardShortcuts(actions: KeyboardShortcutActions): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (!(event.ctrlKey || event.metaKey)) {
        return
      }

      if (isEditableElement(event.target)) {
        return
      }

      if (runShortcut(event, actions)) {
        event.preventDefault()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [actions])
}
