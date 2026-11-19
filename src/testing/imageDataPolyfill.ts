/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** imageDataPolyfill.ts
 */

// Minimal ImageData for unit tests running under Node (no DOM).
class TestImageData {
  readonly data: Uint8ClampedArray
  readonly width: number
  readonly height: number
  readonly colorSpace = 'srgb'

  constructor(dataOrWidth: Uint8ClampedArray | number, widthOrHeight: number, height?: number) {
    if (typeof dataOrWidth === 'number') {
      this.width = dataOrWidth
      this.height = widthOrHeight
      this.data = new Uint8ClampedArray(dataOrWidth * widthOrHeight * 4)
      return
    }

    this.data = dataOrWidth
    this.width = widthOrHeight
    this.height = height ?? dataOrWidth.length / 4 / widthOrHeight
  }
}

if (typeof globalThis.ImageData === 'undefined') {
  globalThis.ImageData = TestImageData as unknown as typeof ImageData
}
