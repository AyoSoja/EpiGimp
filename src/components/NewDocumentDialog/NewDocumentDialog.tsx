/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** NewDocumentDialog.tsx
 */

import { useState } from 'react'
import {
  DEFAULT_DOCUMENT_HEIGHT,
  DEFAULT_DOCUMENT_WIDTH,
  MAX_DOCUMENT_SIZE,
  MIN_DOCUMENT_SIZE,
} from '../../constants/document'
import { areValidDocumentDimensions } from '../../utils/documentDimensions'
import './NewDocumentDialog.css'

interface NewDocumentDialogProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (width: number, height: number) => void
}

function NewDocumentDialog({ isOpen, onClose, onCreate }: NewDocumentDialogProps) {
  const [width, setWidth] = useState(DEFAULT_DOCUMENT_WIDTH)
  const [height, setHeight] = useState(DEFAULT_DOCUMENT_HEIGHT)

  if (!isOpen) {
    return null
  }

  const isValid = areValidDocumentDimensions(width, height)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault()

    if (!isValid) {
      return
    }

    onCreate(width, height)
    onClose()
  }

  return (
    <div className="new-document-dialog__backdrop">
      <section
        className="new-document-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-document-title"
      >
        <h2 id="new-document-title">New Document</h2>

        <form onSubmit={handleSubmit}>
          <label className="new-document-dialog__field">
            <span>Width</span>

            <input
              type="number"
              min={MIN_DOCUMENT_SIZE}
              max={MAX_DOCUMENT_SIZE}
              value={width}
              onChange={(event) => setWidth(Number(event.target.value))}
            />
          </label>

          <label className="new-document-dialog__field">
            <span>Height</span>

            <input
              type="number"
              min={MIN_DOCUMENT_SIZE}
              max={MAX_DOCUMENT_SIZE}
              value={height}
              onChange={(event) => setHeight(Number(event.target.value))}
            />
          </label>

          {!isValid && (
            <p className="new-document-dialog__error">
              Width and height must be between {MIN_DOCUMENT_SIZE} and {MAX_DOCUMENT_SIZE} pixels.
            </p>
          )}

          <div className="new-document-dialog__actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>

            <button type="submit" disabled={!isValid}>
              Create
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default NewDocumentDialog
