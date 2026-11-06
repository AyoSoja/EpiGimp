/*
 ** EPITECH PROJECT, 2026
 ** EpiGimp
 ** File description:
 ** Toolbar.tsx
 */

import { TOOL_DEFINITIONS } from '../../tools/toolDefinitions'
import type { ToolId } from '../../tools/types'

import './Toolbar.css'

interface ToolbarProps {
  activeTool: ToolId
  onToolSelect: (tool: ToolId) => void
}

function Toolbar({ activeTool, onToolSelect }: ToolbarProps) {
  return (
    <aside className="toolbar" aria-label="Editing tools">
      {TOOL_DEFINITIONS.map((tool) => {
        const isActive = tool.id === activeTool

        return (
          <button
            className={`toolbar__item${isActive ? ' toolbar__item--active' : ''}`}
            type="button"
            key={tool.id}
            title={tool.label}
            aria-pressed={isActive}
            onClick={() => onToolSelect(tool.id)}
          >
            {tool.label}
          </button>
        )
      })}
    </aside>
  )
}

export default Toolbar
