/**
 * 导航数据模块
 * 提供导航数据的读取、写入、CRUD 操作及 localStorage 持久化
 */

import type { NavItem } from '../types/nav'
import defaultNavData from '../data/defaultNav.json'

const STORAGE_KEY = 'sidebarNavData'

/**
 * 从 localStorage 或默认数据加载导航数据
 * @returns NavItem[] 导航数据数组
 */
export function getNavData(): NavItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as NavItem[]
      return parsed
    }
  } catch {
    // 解析失败时回退到默认数据
  }
  return JSON.parse(JSON.stringify(defaultNavData)) as NavItem[]
}

/**
 * 保存导航数据到 localStorage
 * @param data 导航数据数组
 */
export function saveNavData(data: NavItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    window.dispatchEvent(new CustomEvent('navDataUpdated'))
  } catch {
    // localStorage 不可用时静默失败
  }
}

/**
 * 重置为默认导航数据
 * @returns NavItem[] 默认导航数据数组
 */
export function resetToDefault(): NavItem[] {
  return JSON.parse(JSON.stringify(defaultNavData)) as NavItem[]
}

/**
 * 根据 ID 查找导航项
 * @param items 导航数据数组
 * @param id 要查找的项 ID
 * @returns NavItem | undefined
 */
export function findNavItemById(items: NavItem[], id: string): NavItem | undefined {
  for (const item of items) {
    if (item.id === id) return item
    if (item.children) {
      const found = findNavItemById(item.children, id)
      if (found) return found
    }
  }
  return undefined
}

/**
 * 生成唯一 ID
 * @returns string 唯一 ID
 */
export function generateId(): string {
  return `nav_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

/**
 * 添加顶级分类
 * @param items 当前导航数据数组
 * @param name 分类名称
 * @returns 新的导航数据数组
 */
export function addCategory(items: NavItem[], name: string): NavItem[] {
  if (!name || name.trim() === '') return items

  const maxOrder = items.reduce((max, item) => Math.max(max, item.order), 0)
  const newCategory: NavItem = {
    id: generateId(),
    name: name.trim(),
    type: 'category',
    order: maxOrder + 1,
  }

  const newItems = [...items, newCategory]
  saveNavData(newItems)
  return newItems
}

/**
 * 删除分类（级联删除子项）
 * @param items 当前导航数据数组
 * @param categoryId 要删除的分类 ID
 * @returns 新的导航数据数组
 */
export function deleteCategory(items: NavItem[], categoryId: string): NavItem[] {
  const newItems = items.filter((item) => item.id !== categoryId)
  // 递归清理所有子项（filter 已经移除了整个分类，但为了保险起见保持逻辑清晰）
  saveNavData(newItems)
  return newItems
}

/**
 * 更新分类名称
 * @param items 当前导航数据数组
 * @param categoryId 分类 ID
 * @param newName 新名称
 * @returns 新的导航数据数组
 */
export function updateCategoryName(items: NavItem[], categoryId: string, newName: string): NavItem[] {
  const newItems = items.map((item) => {
    if (item.id === categoryId) {
      return { ...item, name: newName.trim() }
    }
    return item
  })

  saveNavData(newItems)
  return newItems
}

/**
 * 添加子项到分类
 * @param items 当前导航数据数组
 * @param categoryId 父分类 ID
 * @param childItem 子项数据
 * @returns 新的导航数据数组
 */
export function addChildToCategory(
  items: NavItem[],
  categoryId: string,
  childItem: Omit<NavItem, 'id' | 'order'>,
): NavItem[] {
  const newItems = items.map((item) => {
    if (item.id === categoryId && item.type === 'category') {
      const children = item.children || []
      const maxChildOrder = children.reduce((max, child) => Math.max(max, child.order), 0)
      const newChild: NavItem = {
        ...childItem,
        id: generateId(),
        order: maxChildOrder + 1,
      }
      return {
        ...item,
        children: [...children, newChild],
      }
    }
    return item
  })

  saveNavData(newItems)
  return newItems
}

/**
 * 更新子项信息
 * @param items 当前导航数据数组
 * @param childId 子项 ID
 * @param updates 要更新的字段
 * @returns 新的导航数据数组
 */
export function updateChildItem(
  items: NavItem[],
  childId: string,
  updates: Partial<Pick<NavItem, 'name' | 'url' | 'target' | 'type'>>,
): NavItem[] {
  const newItems = items.map((item) => {
    if (item.type !== 'category' || !item.children) return item

    const newChildren = item.children.map((child) => {
      if (child.id === childId) {
        return { ...child, ...updates }
      }
      return child
    })

    return { ...item, children: newChildren }
  })

  saveNavData(newItems)
  return newItems
}

/**
 * 删除子项
 * @param items 当前导航数据数组
 * @param childId 子项 ID
 * @returns 新的导航数据数组
 */
export function deleteChildItem(items: NavItem[], childId: string): NavItem[] {
  const newItems = items.map((item) => {
    if (item.type !== 'category' || !item.children) return item
    return {
      ...item,
      children: item.children.filter((child) => child.id !== childId),
    }
  })

  saveNavData(newItems)
  return newItems
}