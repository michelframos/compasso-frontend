import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import {
  isLayoutMenuGroup,
  type LayoutMenuGroup,
  type LayoutMenuLeaf,
  type LayoutNavEntry,
} from '../hooks/layoutTypes'

interface SidebarNavProps {
  entries: LayoutNavEntry[]
  isActive: (path: string) => boolean
  isCollapsed?: boolean
  compact?: boolean
  onNavigate?: () => void
}

function leafClass(active: boolean, compact: boolean) {
  const padding = compact ? 'p-3' : 'p-2.5'
  return `flex items-center gap-3 ${padding} rounded-full transition-all duration-200 group relative ${
    active
      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
      : 'text-zinc-500 hover:text-indigo-600 hover:bg-zinc-50'
  }`
}

const LeafLink: React.FC<{
  item: LayoutMenuLeaf
  active: boolean
  isCollapsed: boolean
  compact: boolean
  indented?: boolean
  onNavigate?: () => void
}> = ({ item, active, isCollapsed, compact, indented, onNavigate }) => (
  <Link
    to={item.path}
    onClick={onNavigate}
    className={`${leafClass(active, compact)} ${indented && !isCollapsed ? 'pl-9' : ''} ${
      isCollapsed && !compact ? 'justify-center' : ''
    }`}
  >
    <item.icon className={`h-5 w-5 shrink-0 ${active ? 'text-white' : ''}`} />
    {(!isCollapsed || compact) && (
      <span className="overflow-hidden whitespace-nowrap text-sm font-medium transition-all duration-300">
        {item.label}
      </span>
    )}
    {isCollapsed && !compact && (
      <span className="pointer-events-none absolute left-full z-50 ml-4 translate-x-[-10px] whitespace-nowrap rounded-lg bg-zinc-900 px-2.5 py-1.5 text-[11px] font-medium text-white opacity-0 shadow-xl transition-all group-hover:translate-x-0 group-hover:opacity-100">
        {item.label}
      </span>
    )}
  </Link>
)

const GroupNav: React.FC<{
  group: LayoutMenuGroup
  isActive: (path: string) => boolean
  isCollapsed: boolean
  compact: boolean
  forceOpen: boolean
  onNavigate?: () => void
}> = ({ group, isActive, isCollapsed, compact, forceOpen, onNavigate }) => {
  const [aberto, setAberto] = useState(forceOpen)
  const [flyout, setFlyout] = useState(false)
  const algumAtivo = group.children.some((child) => isActive(child.path))

  useEffect(() => {
    if (forceOpen) setAberto(true)
  }, [forceOpen])

  if (isCollapsed && !compact) {
    return (
      <div
        className="relative"
        onMouseEnter={() => setFlyout(true)}
        onMouseLeave={() => setFlyout(false)}
      >
        <button
          type="button"
          aria-label={group.label}
          aria-expanded={flyout}
          onClick={() => setFlyout((v) => !v)}
          className={`flex w-full items-center justify-center rounded-full p-2.5 transition-all duration-200 ${
            algumAtivo
              ? 'bg-indigo-50 text-indigo-600'
              : 'text-zinc-500 hover:bg-zinc-50 hover:text-indigo-600'
          }`}
        >
          <group.icon className="h-5 w-5 shrink-0" />
        </button>
        {flyout && (
          <div className="absolute left-full top-0 z-50 ml-2 min-w-[200px] rounded-2xl border border-zinc-100 bg-white p-2 shadow-xl">
            <p className="px-2.5 pb-1.5 pt-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              {group.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {group.children.map((child) => (
                <Link
                  key={child.path}
                  to={child.path}
                  onClick={() => {
                    setFlyout(false)
                    onNavigate?.()
                  }}
                  className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium transition-colors ${
                    isActive(child.path)
                      ? 'bg-indigo-600 text-white'
                      : 'text-zinc-600 hover:bg-zinc-50 hover:text-indigo-600'
                  }`}
                >
                  <child.icon className="h-4 w-4 shrink-0" />
                  {child.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-0.5">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        className={`flex w-full items-center gap-3 rounded-full transition-all duration-200 hover:cursor-pointer ${
          compact ? 'p-3' : 'p-2.5'
        } ${
          algumAtivo
            ? 'bg-indigo-50 text-indigo-700'
            : 'text-zinc-500 hover:bg-zinc-50 hover:text-indigo-600'
        }`}
      >
        <group.icon className="h-5 w-5 shrink-0" />
        <span className="flex-1 truncate text-left text-sm font-medium">{group.label}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${aberto ? 'rotate-180' : ''}`}
        />
      </button>
      {aberto && (
        <div className="flex flex-col gap-0.5">
          {group.children.map((child) => (
            <LeafLink
              key={child.path}
              item={child}
              active={isActive(child.path)}
              isCollapsed={false}
              compact={compact}
              indented
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  entries,
  isActive,
  isCollapsed = false,
  compact = false,
  onNavigate,
}) => {
  return (
    <div className={`flex flex-col ${compact ? 'gap-1.5' : 'gap-1.5'}`}>
      {entries.map((entry) => {
        if (isLayoutMenuGroup(entry)) {
          const forceOpen = entry.children.some((child) => isActive(child.path))
          return (
            <GroupNav
              key={entry.id}
              group={entry}
              isActive={isActive}
              isCollapsed={isCollapsed}
              compact={compact}
              forceOpen={forceOpen}
              onNavigate={onNavigate}
            />
          )
        }

        return (
          <LeafLink
            key={entry.path}
            item={entry}
            active={isActive(entry.path)}
            isCollapsed={isCollapsed}
            compact={compact}
            onNavigate={onNavigate}
          />
        )
      })}
    </div>
  )
}
