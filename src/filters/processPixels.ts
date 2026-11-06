/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** processPixels.ts
 */

import type { Pixel, PixelProcessor } from './types'

function readPixel(data: Uint8ClampedArray, index: number): Pixel {
  return {
    red: data[index],
    green: data[index + 1],
    blue: data[index + 2],
    alpha: data[index + 3],
  }
}

function writePixel(data: Uint8ClampedArray, index: number, pixel: Pixel): void {
  data[index] = pixel.red
  data[index + 1] = pixel.green
  data[index + 2] = pixel.blue
  data[index + 3] = pixel.alpha
}

export function processPixels(imageData: ImageData, processor: PixelProcessor): ImageData {
  const result = new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height,
  )

  for (let index = 0; index < result.data.length; index += 4) {
    const pixel = readPixel(result.data, index)
    const processedPixel = processor(pixel)

    writePixel(result.data, index, processedPixel)
  }

  return result
}
