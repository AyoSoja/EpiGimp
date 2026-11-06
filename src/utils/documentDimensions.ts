/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** documentDimensions.ts
 */

import { MAX_DOCUMENT_SIZE, MIN_DOCUMENT_SIZE } from '../constants/document'

export function isValidDocumentDimension(value: number): boolean {
  return Number.isInteger(value) && value >= MIN_DOCUMENT_SIZE && value <= MAX_DOCUMENT_SIZE
}

export function areValidDocumentDimensions(width: number, height: number): boolean {
  return isValidDocumentDimension(width) && isValidDocumentDimension(height)
}
