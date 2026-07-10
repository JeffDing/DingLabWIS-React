/**
 * 左侧导航 Sidebar 组件
 * 支持折叠/展开分类、本地页面和外部链接导航
 */

import { useState, useEffect, useCallback } from 'react'
import type { NavItem } from '../types/nav'
import defaultNavData from '../data/defaultNav.json'
import './Sidebar.css'

interface SidebarProps {
  onNavigate: (url: string, target: '_self' | '_blank' | 'main') => void
  navData?: NavItem[]
  onToggleSidebar?: () => void
  isCollapsed?: boolean
}

const STORAGE_KEY = 'sidebarNavData'

function Sidebar({ onNavigate, navData: propNavData, onToggleSidebar, isCollapsed }: SidebarProps) {
  const [navItems, setNavItems] = useState<NavItem[]>([])
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const hasPropNavData = !!propNavData

  // 从 localStorage 或 defaultNav.json 加载导航数据
  useEffect(() => {
    if (hasPropNavData) {
      setNavItems(propNavData)
      return
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as NavItem[]
        setNavItems(parsed)
      } else {
        setNavItems(defaultNavData as NavItem[])
      }
    } catch {
      // localStorage 不可用或数据解析失败时回退到默认数据
      setNavItems(defaultNavData as NavItem[])
    }
  }, [hasPropNavData, propNavData])

  // 监听 localStorage 变化，实现管理后台修改后前台实时生效
  useEffect(() => {
    if (hasPropNavData) return

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as NavItem[]
          setNavItems(parsed)
        } catch {
          // 解析失败时保持现有数据
        }
      }
    }

    const handleCustomUpdate = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored) as NavItem[]
          setNavItems(parsed)
        }
      } catch {
        // 解析失败时保持现有数据
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('navDataUpdated', handleCustomUpdate)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('navDataUpdated', handleCustomUpdate)
    }
  }, [hasPropNavData])

  // 初始化时默认展开所有分类
  useEffect(() => {
    if (navItems.length > 0) {
      setExpandedIds((prev) => {
        const next = new Set(prev)
        navItems.forEach((item) => {
          if (item.type === 'category' && item.children && item.children.length > 0) {
            next.add(item.id)
          }
        })
        return next
      })
    }
  }, [navItems])

  // 切换分类展开/折叠状态
  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  // 处理链接点击
  const handleItemClick = useCallback(
    (item: NavItem) => {
      if (!item.url) return

      const target = item.target as '_self' | '_blank' | 'main' | undefined

      if (target === '_blank') {
        // 在新标签页打开
        window.open(item.url, '_blank', 'noopener,noreferrer')
      } else if (target === '_self') {
        // 当前页面跳转
        window.location.href = item.url
      } else if (target === 'main' || target === '_top') {
        // 通过父组件回调传递，在 iframe 中加载
        onNavigate(item.url, 'main')
      }
    },
    [onNavigate],
  )

  // 渲染分类
  const renderCategory = (item: NavItem) => {
    const isExpanded = expandedIds.has(item.id)

    return (
      <li key={item.id} className="nav-category">
        <div
          className={`nav-category-title ${isExpanded ? 'expanded' : ''}`}
          onClick={() => toggleExpand(item.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              toggleExpand(item.id)
            }
          }}
        >
          <span className="nav-category-name">{item.name}</span>
          <span className={`nav-category-arrow ${isExpanded ? 'expanded' : ''}`}>▶</span>
        </div>
        {isExpanded && item.children && item.children.length > 0 && (
          <ul className="nav-children">
            {item.children
              .sort((a, b) => a.order - b.order)
              .map((child) => (
                <li key={child.id} className="nav-child">
                  <a
                    className="nav-child-link"
                    href={child.url || '#'}
                    onClick={(e) => {
                      e.preventDefault()
                      handleItemClick(child)
                    }}
                    onContextMenu={(e) => e.preventDefault()}
                    draggable={false}
                  >
                    {child.name}
                  </a>
                </li>
              ))}
          </ul>
        )}
      </li>
    )
  }

  // 渲染独立链接（非分类项）
  const renderLink = (item: NavItem) => (
    <li key={item.id} className="nav-link-item">
      <a
        className="nav-link"
        href={item.url || '#'}
        onClick={(e) => {
          e.preventDefault()
          handleItemClick(item)
        }}
        onContextMenu={(e) => e.preventDefault()}
        draggable={false}
      >
        {item.name}
      </a>
    </li>
  )

  // 对导航项按 order 排序
  const sortedItems = [...navItems].sort((a, b) => a.order - b.order)

  return (
    <nav className={`sidebar ${isCollapsed ? 'collapsed' : ''}`} aria-label="侧边导航">
      {onToggleSidebar && (
        <div className="sidebar-toggle" onClick={onToggleSidebar} role="button" tabIndex={0}>
          {isCollapsed ? '◀' : '▶'}
        </div>
      )}
      <ul className="nav-list">
        {sortedItems.map((item) => {
          if (item.type === 'category') {
            return renderCategory(item)
          }
          return renderLink(item)
        })}
      </ul>
    </nav>
  )
}

export default Sidebar