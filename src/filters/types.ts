/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** types.ts
 */

export interface Pixel {
  red: number
  green: number
  blue: number
  alpha: number
}

export type PixelProcessor = (pixel: Pixel) => Pixel
