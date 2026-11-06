/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** blur.ts
 */

interface ColorSum {
  red: number
  green: number
  blue: number
  count: number
}

function addPixelToSum(imageData: ImageData, x: number, y: number, sum: ColorSum): void {
  const index = (y * imageData.width + x) * 4

  sum.red += imageData.data[index]
  sum.green += imageData.data[index + 1]
  sum.blue += imageData.data[index + 2]
  sum.count += 1
}

function getAverageColor(
  imageData: ImageData,
  centerX: number,
  centerY: number,
  radius: number,
): ColorSum {
  const sum: ColorSum = {
    red: 0,
    green: 0,
    blue: 0,
    count: 0,
  }

  const startX = Math.max(0, centerX - radius)
  const startY = Math.max(0, centerY - radius)
  const endX = Math.min(imageData.width - 1, centerX + radius)
  const endY = Math.min(imageData.height - 1, centerY + radius)

  for (let y = startY; y <= endY; y += 1) {
    for (let x = startX; x <= endX; x += 1) {
      addPixelToSum(imageData, x, y, sum)
    }
  }

  return sum
}

function blurPixel(
  source: ImageData,
  result: ImageData,
  x: number,
  y: number,
  radius: number,
): void {
  const sum = getAverageColor(source, x, y, radius)
  const index = (y * source.width + x) * 4

  result.data[index] = sum.red / sum.count
  result.data[index + 1] = sum.green / sum.count
  result.data[index + 2] = sum.blue / sum.count
  result.data[index + 3] = source.data[index + 3]
}

export function applyBlur(imageData: ImageData, radius = 1): ImageData {
  const safeRadius = Math.max(1, Math.floor(radius))

  const result = new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height,
  )

  for (let y = 0; y < imageData.height; y += 1) {
    for (let x = 0; x < imageData.width; x += 1) {
      blurPixel(imageData, result, x, y, safeRadius)
    }
  }

  return result
}
