/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** useToolManager.ts
 */

import { useState } from 'react'

import { DEFAULT_TOOL } from '../tools/toolDefinitions'
import type { ToolId } from '../tools/types'

export function useToolManager() {
  const [activeTool, setActiveTool] = useState<ToolId>(DEFAULT_TOOL)

  const selectTool = (tool: ToolId): void => {
    setActiveTool(tool)
  }

  return {
    activeTool,
    selectTool,
  }
}
