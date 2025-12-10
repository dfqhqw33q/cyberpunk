'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CyberInput } from '@/components/cyberpunk/cyber-input'
import { CyberButton } from '@/components/cyberpunk/cyber-button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'

export function AddUserFormClient() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    can_add_users: false,
    can_edit_users: false,
    can_view_logs: false,
    can_manage_roles: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    // Validation
    if (!formData.username.trim()) {
      setError('Username is required')
      return
    }

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters')
      return
    }

    if (!formData.password) {
      setError('Password is required')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/user/add-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          restrictions: {
            can_add_users: formData.can_add_users,
            can_edit_users: formData.can_edit_users,
            can_view_logs: formData.can_view_logs,
            can_manage_roles: formData.can_manage_roles,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.error || 'Failed to create user')
        return
      }

      setSuccess(true)
      // Reset form
      setFormData({
        username: '',
        password: '',
        confirmPassword: '',
        can_add_users: false,
        can_edit_users: false,
        can_view_logs: false,
        can_manage_roles: false,
      })

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-sm bg-cyber-red/10 border border-cyber-red/30">
          <AlertTriangle className="text-cyber-red shrink-0 mt-0.5" size={18} />
          <p className="text-sm text-cyber-red">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 p-4 rounded-sm bg-cyber-green/10 border border-cyber-green/30">
          <CheckCircle2 className="text-cyber-green shrink-0 mt-0.5" size={18} />
          <div>
            <p className="text-sm text-cyber-green font-display">User created successfully!</p>
            <p className="text-xs text-cyber-green/70">Redirecting to dashboard...</p>
          </div>
        </div>
      )}

      {/* Username */}
      <div className="space-y-2">
        <Label htmlFor="username" className="text-sm uppercase tracking-wider">
          Username
        </Label>
        <CyberInput
          id="username"
          name="username"
          type="text"
          placeholder="Enter username"
          value={formData.username}
          onChange={handleChange}
          disabled={loading || success}
        />
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm uppercase tracking-wider">
          Password
        </Label>
        <CyberInput
          id="password"
          name="password"
          type="password"
          placeholder="Enter password (min 8 characters)"
          value={formData.password}
          onChange={handleChange}
          disabled={loading || success}
        />
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm uppercase tracking-wider">
          Confirm Password
        </Label>
        <CyberInput
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="Confirm password"
          value={formData.confirmPassword}
          onChange={handleChange}
          disabled={loading || success}
        />
      </div>

      {/* Permissions */}
      <div className="space-y-3 pt-4">
        <Label className="text-sm uppercase tracking-wider">User Permissions</Label>
        <div className="space-y-2">
          {[
            { key: 'can_add_users', label: 'Can Add Users' },
            { key: 'can_edit_users', label: 'Can Edit Users' },
            { key: 'can_view_logs', label: 'Can View Logs' },
            { key: 'can_manage_roles', label: 'Can Manage Roles' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center gap-2">
              <Checkbox
                id={key}
                checked={formData[key as keyof typeof formData] as boolean}
                onCheckedChange={(checked) =>
                  setFormData(prev => ({
                    ...prev,
                    [key]: checked,
                  }))
                }
                disabled={loading || success}
              />
              <Label htmlFor={key} className="text-sm cursor-pointer">
                {label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <CyberButton
        type="submit"
        disabled={loading || success}
        className="w-full mt-6"
      >
        {loading ? 'Creating User...' : success ? 'User Created!' : 'Create User'}
      </CyberButton>
    </form>
  )
}
