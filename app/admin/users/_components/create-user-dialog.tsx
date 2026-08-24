import type { Dispatch, SetStateAction } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import type { RoleOption, UserFormData } from '../_lib/constants'
import { UserForm } from './user-form'

export function CreateUserDialog({
  open,
  onOpenChange,
  form,
  setForm,
  roleOptions,
  saving,
  onCreate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: UserFormData
  setForm: Dispatch<SetStateAction<UserFormData>>
  roleOptions: readonly RoleOption[]
  saving: boolean
  onCreate: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add User</DialogTitle>
          <DialogDescription>Create a user and assign initial roles</DialogDescription>
        </DialogHeader>
        <UserForm form={form} setForm={setForm} includePassword roleOptions={roleOptions} />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onCreate} disabled={saving || !form.email || !form.password}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Create User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
