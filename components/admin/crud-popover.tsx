'use client'

import { ReactElement } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import {
  Edit2,
  Trash2,
  Eye,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CRUDAction {
  id: string
  label: string
  icon?: ReactElement
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost'
  onClick: () => void | Promise<void>
  disabled?: boolean
  loading?: boolean
  className?: string
}

interface AdminCRUDPopoverProps {
  actions: CRUDAction[]
  triggerClassName?: string
  contentClassName?: string
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'right' | 'bottom' | 'left'
}

/**
 * Reusable popover dialog for admin CRUD operations
 * Provides a clean, accessible interface for displaying multiple actions
 */
export function AdminCRUDPopover({
  actions,
  triggerClassName,
  contentClassName,
  align = 'end',
  side = 'bottom',
}: AdminCRUDPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn('h-8 w-8 p-0', triggerClassName)}
          aria-label="Open menu"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        side={side}
        className={cn('w-48 p-2', contentClassName)}
      >
        <div className="space-y-1">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant={action.variant || 'ghost'}
              size="sm"
              className={cn(
                'w-full justify-start text-sm font-medium',
                action.variant === 'destructive' && 'text-red-600 hover:bg-red-50',
                action.className,
              )}
              onClick={action.onClick}
              disabled={action.disabled || action.loading}
            >
              {action.loading ? (
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : action.icon ? (
                <div className="mr-2 h-4 w-4">{action.icon}</div>
              ) : null}
              {action.label}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

/**
 * Pre-configured action builders for common CRUD operations
 */
export const CRUDActionBuilders = {
  view: (onClick: () => void, disabled?: boolean): CRUDAction => ({
    id: 'view',
    label: 'View Details',
    icon: <Eye className="h-4 w-4" />,
    onClick,
    disabled,
  }),

  edit: (onClick: () => void, disabled?: boolean): CRUDAction => ({
    id: 'edit',
    label: 'Edit',
    icon: <Edit2 className="h-4 w-4" />,
    onClick,
    disabled,
  }),

  delete: (onClick: () => void, disabled?: boolean, loading?: boolean): CRUDAction => ({
    id: 'delete',
    label: 'Delete',
    icon: <Trash2 className="h-4 w-4" />,
    variant: 'destructive',
    onClick,
    disabled,
    loading,
  }),

  verify: (onClick: () => void, disabled?: boolean, loading?: boolean): CRUDAction => ({
    id: 'verify',
    label: 'Verify',
    icon: <CheckCircle className="h-4 w-4" />,
    onClick,
    disabled,
    loading,
  }),

  unverify: (onClick: () => void, disabled?: boolean, loading?: boolean): CRUDAction => ({
    id: 'unverify',
    label: 'Unverify',
    icon: <AlertCircle className="h-4 w-4" />,
    onClick,
    disabled,
    loading,
  }),

  create: (onClick: () => void, disabled?: boolean): CRUDAction => ({
    id: 'create',
    label: 'Create New',
    icon: <Plus className="h-4 w-4" />,
    onClick,
    disabled,
  }),

  custom: (
    id: string,
    label: string,
    onClick: () => void,
    options?: Partial<CRUDAction>,
  ): CRUDAction => ({
    id,
    label,
    onClick,
    ...options,
  }),
}
