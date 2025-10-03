'use client'

import React, { useState } from 'react'
import { ChevronUp, ChevronDown, MoreHorizontal, Search } from 'lucide-react'
import Skeleton from './Skeleton'

interface Column<T = any> {
  key: string
  title: string
  dataIndex?: keyof T
  render?: (value: any, record: T, index: number) => React.ReactNode
  sortable?: boolean
  width?: string | number
  align?: 'left' | 'center' | 'right'
  fixed?: 'left' | 'right'
}

interface TableProps<T = any> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  pagination?: {
    current: number
    pageSize: number
    total: number
    onChange: (page: number, pageSize: number) => void
  }
  rowKey?: string | ((record: T) => string)
  onRow?: (record: T, index: number) => {
    onClick?: () => void
    onDoubleClick?: () => void
    className?: string
  }
  scroll?: {
    x?: number | string
    y?: number | string
  }
  size?: 'small' | 'middle' | 'large'
  bordered?: boolean
  striped?: boolean
  hoverable?: boolean
  className?: string
}

const Table = <T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  pagination,
  rowKey = 'id',
  onRow,
  scroll,
  size = 'middle',
  bordered = true,
  striped = false,
  hoverable = true,
  className = ''
}: TableProps<T>) => {
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: 'asc' | 'desc'
  } | null>(null)

  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record)
    }
    return record[rowKey] || index.toString()
  }

  const handleSort = (columnKey: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    
    if (sortConfig && sortConfig.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    
    setSortConfig({ key: columnKey, direction })
  }

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data
    
    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }, [data, sortConfig])

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'text-xs'
      case 'large':
        return 'text-base'
      default:
        return 'text-sm'
    }
  }

  const getCellPadding = () => {
    switch (size) {
      case 'small':
        return 'px-3 py-2'
      case 'large':
        return 'px-6 py-4'
      default:
        return 'px-4 py-3'
    }
  }

  const getAlignClasses = (align?: string) => {
    switch (align) {
      case 'center':
        return 'text-center'
      case 'right':
        return 'text-right'
      default:
        return 'text-left'
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className={`overflow-hidden ${className}`}>
      <div 
        className="overflow-auto"
        style={{
          maxHeight: scroll?.y,
          maxWidth: scroll?.x
        }}
      >
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800">
              {columns.map((column) => {
                const isSorted = sortConfig?.key === column.key
                const sortDirection = isSorted ? sortConfig.direction : null
                
                return (
                  <th
                    key={column.key}
                    className={`
                      ${getCellPadding()}
                      ${getSizeClasses()}
                      ${getAlignClasses(column.align)}
                      ${bordered ? 'border-b border-gray-200 dark:border-gray-700' : ''}
                      ${column.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : ''}
                      font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-200
                    `}
                    style={{ 
                      width: column.width,
                      fontFamily: 'Gilroy, sans-serif'
                    }}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.title}</span>
                      {column.sortable && (
                        <div className="flex flex-col">
                          <ChevronUp 
                            className={`h-3 w-3 ${
                              isSorted && sortDirection === 'asc' 
                                ? 'text-black dark:text-white' 
                                : 'text-gray-400'
                            }`} 
                          />
                          <ChevronDown 
                            className={`h-3 w-3 -mt-1 ${
                              isSorted && sortDirection === 'desc' 
                                ? 'text-black dark:text-white' 
                                : 'text-gray-400'
                            }`} 
                          />
                        </div>
                      )}
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((record, index) => {
              const rowProps = onRow?.(record, index) || {}
              
              return (
                <tr
                  key={getRowKey(record, index)}
                  className={`
                    ${striped && index % 2 === 1 ? 'bg-gray-50/50 dark:bg-gray-800/50' : ''}
                    ${hoverable ? 'hover:bg-gray-50 dark:hover:bg-gray-800/50' : ''}
                    ${rowProps.onClick ? 'cursor-pointer' : ''}
                    ${rowProps.className || ''}
                    transition-colors duration-200
                  `}
                  onClick={rowProps.onClick}
                  onDoubleClick={rowProps.onDoubleClick}
                >
                  {columns.map((column) => {
                    const value = column.dataIndex ? record[column.dataIndex] : record[column.key]
                    const cellContent = column.render 
                      ? column.render(value, record, index)
                      : value
                    
                    return (
                      <td
                        key={column.key}
                        className={`
                          ${getCellPadding()}
                          ${getSizeClasses()}
                          ${getAlignClasses(column.align)}
                          ${bordered ? 'border-b border-gray-200 dark:border-gray-700' : ''}
                          text-gray-900 dark:text-gray-100
                        `}
                        style={{ 
                          width: column.width,
                          fontFamily: 'Gilroy, sans-serif'
                        }}
                      >
                        {cellContent}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
        
        {sortedData.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-600">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p 
                className="text-lg font-medium"
                style={{ fontFamily: 'Gilroy, sans-serif' }}
              >
                No data found
              </p>
              <p 
                className="text-sm mt-1"
                style={{ fontFamily: 'Gilroy, sans-serif' }}
              >
                There are no records to display
              </p>
            </div>
          </div>
        )}
      </div>
      
      {pagination && (
        <TablePagination {...pagination} />
      )}
    </div>
  )
}

// Table Pagination Component
interface TablePaginationProps {
  current: number
  pageSize: number
  total: number
  onChange: (page: number, pageSize: number) => void
  showSizeChanger?: boolean
  pageSizeOptions?: number[]
  showQuickJumper?: boolean
  showTotal?: (total: number, range: [number, number]) => React.ReactNode
}

const TablePagination: React.FC<TablePaginationProps> = ({
  current,
  pageSize,
  total,
  onChange,
  showSizeChanger = true,
  pageSizeOptions = [10, 20, 50, 100],
  showQuickJumper = false,
  showTotal
}) => {
  const totalPages = Math.ceil(total / pageSize)
  const startIndex = (current - 1) * pageSize + 1
  const endIndex = Math.min(current * pageSize, total)
  
  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []
    
    for (let i = Math.max(2, current - delta); i <= Math.min(totalPages - 1, current + delta); i++) {
      range.push(i)
    }
    
    if (current - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }
    
    rangeWithDots.push(...range)
    
    if (current + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }
    
    return rangeWithDots
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-4">
        {showTotal && (
          <div 
            className="text-sm text-gray-700 dark:text-gray-300"
            style={{ fontFamily: 'Gilroy, sans-serif' }}
          >
            {showTotal(total, [startIndex, endIndex])}
          </div>
        )}
        
        {showSizeChanger && (
          <div className="flex items-center space-x-2">
            <span 
              className="text-sm text-gray-700 dark:text-gray-300"
              style={{ fontFamily: 'Gilroy, sans-serif' }}
            >
              Show
            </span>
            <select
              value={pageSize}
              onChange={(e) => onChange(1, Number(e.target.value))}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              style={{ fontFamily: 'Gilroy, sans-serif' }}
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <span 
              className="text-sm text-gray-700 dark:text-gray-300"
              style={{ fontFamily: 'Gilroy, sans-serif' }}
            >
              entries
            </span>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-1">
        <button
          onClick={() => onChange(current - 1, pageSize)}
          disabled={current <= 1}
          className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          style={{ fontFamily: 'Gilroy, sans-serif' }}
        >
          Previous
        </button>
        
        {getVisiblePages().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onChange(page, pageSize)}
            disabled={page === '...'}
            className={`
              px-3 py-1 text-sm border rounded-md transition-colors duration-200
              ${page === current
                ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
              }
              ${page === '...' ? 'cursor-default' : 'cursor-pointer'}
            `}
            style={{ fontFamily: 'Gilroy, sans-serif' }}
          >
            {page}
          </button>
        ))}
        
        <button
          onClick={() => onChange(current + 1, pageSize)}
          disabled={current >= totalPages}
          className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          style={{ fontFamily: 'Gilroy, sans-serif' }}
        >
          Next
        </button>
      </div>
    </div>
  )
}

export { TablePagination }
export default Table