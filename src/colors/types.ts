/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** types.ts
 */

export type ColorTarget = 'foreground' | 'background'

export interface ColorState {
  foreground: string
  background: string
}
