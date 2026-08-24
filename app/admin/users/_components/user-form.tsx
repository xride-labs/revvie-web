import type { Dispatch, SetStateAction } from 'react'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import type { RoleOption, UserFormData } from '../_lib/constants'

export function UserForm({
  form,
  setForm,
  includePassword = false,
  roleOptions,
}: {
  form: UserFormData
  setForm: Dispatch<SetStateAction<UserFormData>>
  includePassword?: boolean
  roleOptions: readonly RoleOption[]
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input
          placeholder="Name"
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
        />
        <Input
          placeholder="Username"
          value={form.username}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, username: event.target.value }))
          }
        />
        <Input
          placeholder="Email"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
        />
        <Input
          placeholder="Phone"
          value={form.phone}
          onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
        />
        <Input
          placeholder="Location"
          value={form.location}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, location: event.target.value }))
          }
        />
        <Input
          placeholder="Bio"
          value={form.bio}
          onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))}
        />
      </div>
      {includePassword ? (
        <Input
          type="password"
          placeholder="Temporary Password"
          value={form.password}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, password: event.target.value }))
          }
        />
      ) : null}
      <div>
        <p className="text-sm font-medium mb-2">Roles</p>
        <div className="grid grid-cols-2 gap-2">
          {roleOptions.map((role) => (
            <label key={role} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.roles.includes(role)}
                onCheckedChange={() => {
                  setForm((prev) => {
                    const exists = prev.roles.includes(role)
                    if (exists) {
                      const nextRoles = prev.roles.filter((r) => r !== role)
                      return { ...prev, roles: nextRoles.length ? nextRoles : ['RIDER'] }
                    }
                    return { ...prev, roles: [...prev.roles, role] }
                  })
                }}
              />
              {role}
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
