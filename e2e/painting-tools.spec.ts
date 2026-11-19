/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** painting-tools.spec.ts
 */

import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

type Point = [number, number]
type Rgba = [number, number, number, number]

const FOREGROUND: Rgba = [0, 128, 255, 255]
const BACKGROUND: Rgba = [255, 255, 0, 255]

// Thin helpers over the real editor UI. Coordinates are document pixels (zoom 100%).
function editor(page: Page) {
  const canvas = page.locator('canvas')
  const hexInput = page.locator('.color-panel__hex input')

  const screenPoint = async ([x, y]: Point) => {
    const box = await canvas.boundingBox()

    if (!box) {
      throw new Error('Canvas is not visible')
    }

    return { x: box.x + x, y: box.y + y }
  }

  return {
    hexInput,

    async newDocument(width: number, height: number) {
      await page.goto('/')
      await page.getByRole('button', { name: /^File$/ }).click()
      await page.getByRole('button', { name: /^New/ }).click()
      await page.locator('form input[type=number]').nth(0).fill(String(width))
      await page.locator('form input[type=number]').nth(1).fill(String(height))
      await page.locator('form button[type=submit]').click()
    },

    async selectTool(label: string) {
      await page.locator('.toolbar button', { hasText: new RegExp(`^${label}$`) }).click()
    },

    async setColor(target: 'foreground' | 'background', hex: string) {
      await page.getByLabel(new RegExp(`Edit ${target} color`)).click()
      await hexInput.fill(hex)
      await hexInput.blur()
    },

    async pixel([x, y]: Point): Promise<Rgba> {
      return page.evaluate(
        ([px, py]) => {
          const context = document.querySelector('canvas')?.getContext('2d')
          return Array.from(context?.getImageData(px, py, 1, 1).data ?? []) as Rgba
        },
        [x, y],
      )
    },

    async drag(from: Point, to: Point, options: { shift?: boolean } = {}) {
      const start = await screenPoint(from)
      const end = await screenPoint(to)

      await page.mouse.move(start.x, start.y)
      await page.mouse.down()
      if (options.shift) await page.keyboard.down('Shift')
      await page.mouse.move(end.x, end.y, { steps: 5 })
      await page.mouse.up()
      if (options.shift) await page.keyboard.up('Shift')
    },

    async click(point: Point, options: { ctrl?: boolean } = {}) {
      const target = await screenPoint(point)

      if (options.ctrl) await page.keyboard.down('Control')
      await page.mouse.click(target.x, target.y)
      if (options.ctrl) await page.keyboard.up('Control')
    },

    async hover(point: Point) {
      const target = await screenPoint(point)
      await page.mouse.move(target.x, target.y)
    },

    screenPoint,
  }
}

test.beforeEach(async ({ page }) => {
  const app = editor(page)

  await app.newDocument(400, 300)
  await app.setColor('background', '#ffff00')
  await app.setColor('foreground', '#0080ff')
})

test.describe('colors', () => {
  test('RGB, HSV and hex editors stay in sync, X swaps and D resets', async ({ page }) => {
    const app = editor(page)

    await expect(page.getByLabel('Red value')).toHaveValue('0')
    await expect(page.getByLabel('Green value')).toHaveValue('128')
    await page.getByLabel('Hue value').fill('0')
    await expect(app.hexInput).toHaveValue('#ff0000')
    await expect(page.getByTestId('color-preview')).toHaveCSS('background-color', 'rgb(255, 0, 0)')

    await app.hexInput.fill('#12')
    await expect(page.locator('.color-panel__error')).toBeVisible()
    await app.hexInput.blur() // restores the current color; shortcuts are ignored while typing
    await expect(app.hexInput).toHaveValue('#ff0000')

    await page.locator('canvas').hover()
    await page.keyboard.press('x')
    await expect(app.hexInput).toHaveValue('#ffff00')
    await page.keyboard.press('x')
    await expect(app.hexInput).toHaveValue('#ff0000')
    await page.keyboard.press('d')
    await expect(app.hexInput).toHaveValue('#000000')
  })

  test('picker previews on hover, click = foreground, Ctrl+click = background', async ({
    page,
  }) => {
    const app = editor(page)

    await app.selectTool('Rect')
    await page.locator('.tool-options select').selectOption('fill')
    await app.drag([10, 10], [60, 60])

    await app.selectTool('Picker')
    await app.hover([30, 30])
    await app.hover([31, 30])
    await expect(page.getByTestId('picker-sample')).toHaveCSS(
      'background-color',
      'rgb(255, 255, 0)',
    )

    await app.click([31, 30])
    await expect(app.hexInput).toHaveValue('#ffff00')

    await app.setColor('foreground', '#0080ff')
    await app.click([31, 30], { ctrl: true })
    await expect(page.getByLabel(/Edit background color/)).toHaveAttribute('aria-label', /#ffff00/)
  })
})

test.describe('shapes', () => {
  test('Shift constrains a rectangle to a square, outline inside the dragged box', async ({
    page,
  }) => {
    const app = editor(page)

    await app.selectTool('Rect')
    await page.locator('.tool-options select').selectOption('stroke-fill')
    await page.locator('.tool-options input[type=number]').fill('6')
    await app.drag([20, 20], [120, 60], { shift: true })

    expect(await app.pixel([70, 110])).toEqual(BACKGROUND) // square, not 100×40
    expect(await app.pixel([21, 70])).toEqual(FOREGROUND) // outline
    expect((await app.pixel([17, 70]))[3]).toBe(0) // outline does not spill outside
    expect((await app.pixel([70, 125]))[3]).toBe(0)
  })

  test('Shift pressed after the last move still constrains on release', async ({ page }) => {
    const app = editor(page)

    await app.selectTool('Ellipse')
    await page.locator('.tool-options select').selectOption('fill')

    const start = await app.screenPoint([100, 20])
    const end = await app.screenPoint([200, 60])
    await page.mouse.move(start.x, start.y)
    await page.mouse.down()
    await page.mouse.move(end.x, end.y, { steps: 4 })
    await page.keyboard.down('Shift')
    await page.mouse.up()
    await page.keyboard.up('Shift')

    expect(await app.pixel([150, 110])).toEqual(BACKGROUND) // circle of diameter 100
  })

  test('a box thinner than the outline is painted solid, not overflowing', async ({ page }) => {
    const app = editor(page)

    await app.selectTool('Rect')
    await page.locator('.tool-options input[type=number]').fill('20')
    await app.drag([50, 50], [54, 150])

    expect(await app.pixel([52, 100])).toEqual(FOREGROUND)
    expect((await app.pixel([60, 100]))[3]).toBe(0)
  })

  test('Shift snaps a line to 45° steps', async ({ page }) => {
    const app = editor(page)

    await app.selectTool('Line')
    await page.locator('.tool-options input[type=number]').fill('3')
    await app.drag([20, 20], [120, 28], { shift: true })

    expect((await app.pixel([110, 20]))[3]).toBe(255)
    expect((await app.pixel([110, 27]))[3]).toBe(0)
  })
})

test.describe('fill and gradients', () => {
  test('linear gradient goes foreground → background inside the selection only', async ({
    page,
  }) => {
    const app = editor(page)

    await app.selectTool('Select')
    await app.drag([20, 100], [220, 200])
    await app.selectTool('Gradient')
    await app.drag([20, 150], [220, 150])

    const start = await app.pixel([22, 150])
    const end = await app.pixel([218, 150])
    expect(start[2]).toBeGreaterThan(240)
    expect(end[0]).toBeGreaterThan(240)
    expect((await app.pixel([240, 150]))[3]).toBe(0)
    expect((await app.pixel([100, 90]))[3]).toBe(0)
  })

  test('radial gradient is symmetric around its center', async ({ page }) => {
    const app = editor(page)

    await app.selectTool('Gradient')
    await page.locator('.tool-options select').selectOption('radial')
    await app.drag([200, 150], [260, 150])

    const right = await app.pixel([230, 150])
    const below = await app.pixel([200, 180])
    expect(Math.abs(right[0] - below[0])).toBeLessThanOrEqual(3)
  })

  test('fill respects tolerance and the selection, and can be undone', async ({ page }) => {
    const app = editor(page)

    await app.selectTool('Gradient')
    await app.drag([0, 150], [400, 150])
    await app.setColor('foreground', '#00aa00')
    await app.selectTool('Fill')

    await page.locator('.tool-options input[type=number]').fill('0')
    await app.click([200, 150])
    expect(await app.pixel([200, 150])).toEqual([0, 170, 0, 255])
    expect(await app.pixel([260, 150])).not.toEqual([0, 170, 0, 255])
    await page.keyboard.press('Control+z')
    expect(await app.pixel([200, 150])).not.toEqual([0, 170, 0, 255])

    await page.locator('.tool-options input[type=number]').fill('255')
    await app.selectTool('Select')
    await app.drag([100, 100], [200, 200])
    await app.selectTool('Fill')
    await app.click([150, 150])
    expect(await app.pixel([195, 150])).toEqual([0, 170, 0, 255])
    expect(await app.pixel([205, 150])).not.toEqual([0, 170, 0, 255])
  })

  test('undo while dragging cancels the drag instead of committing stale pixels', async ({
    page,
  }) => {
    const app = editor(page)

    await app.selectTool('Rect')
    await page.locator('.tool-options select').selectOption('fill')
    await app.drag([10, 10], [50, 50])

    await app.selectTool('Gradient')
    const start = await app.screenPoint([0, 150])
    const end = await app.screenPoint([400, 150])
    await page.mouse.move(start.x, start.y)
    await page.mouse.down()
    await page.mouse.move(end.x, end.y, { steps: 4 })
    await page.keyboard.press('Control+z')
    await page.mouse.up()

    expect((await app.pixel([30, 30]))[3]).toBe(0) // rectangle undone
    expect((await app.pixel([200, 150]))[3]).toBe(0) // gradient discarded
  })
})
