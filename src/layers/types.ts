/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** types.ts
 */

export interface LayerMask {
  imageData: ImageData
  enabled: boolean
}

export interface Layer {
  id: string
  name: string
  imageData: ImageData
  visible: boolean
  opacity: number
  mask?: LayerMask
}
