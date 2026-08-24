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

export function EditUserDialog({
  open,
  onOpenChange,
  form,
  setForm,
  roleOptions,
  saving,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: UserFormData
  setForm: Dispatch<SetStateAction<UserFormData>>
  roleOptions: readonly RoleOption[]
  saving: boolean
  onSave: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Edit profile, contact, and role details</DialogDescription>
        </DialogHeader>
        <UserForm form={form} setForm={setForm} roleOptions={roleOptions} />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
