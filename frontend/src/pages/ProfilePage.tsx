import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getEmployee, patchEmployee } from '../api/employees'
import type { Employee } from '../types'
import Avatar from '../components/Avatar'
import LoadingSpinner from '../components/LoadingSpinner'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z
    .string()
    .regex(/^\d{10}$/, 'Phone must be exactly 10 digits')
    .optional()
    .or(z.literal('')),
})

type FormData = z.infer<typeof schema>

const ProfilePage = () => {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [profile, setProfile] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [previewImage, setPreviewImage] = useState<string>('')
  const [imageBase64, setImageBase64] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (!user?.id) return
    getEmployee(user.id)
      .then((emp) => {
        setProfile(emp)
        setPreviewImage(emp.profileImage || '')
        reset({ name: emp.name, phone: emp.phone || '' })
      })
      .catch(() => showToast('Failed to load profile.', 'error'))
      .finally(() => setLoading(false))
  }, [user?.id, reset, showToast])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate: image only, max 2MB
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file.', 'error')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast('Image must be smaller than 2MB.', 'error')
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      setPreviewImage(result)
      setImageBase64(result)
    }
    reader.readAsDataURL(file)
  }

  const onSubmit = async (data: FormData) => {
    if (!user?.id) return
    setSubmitting(true)
    try {
      const updated = await patchEmployee(user.id, {
        name: data.name,
        phone: data.phone || undefined,
        profileImage: imageBase64 || previewImage || undefined,
      })
      setProfile(updated)
      showToast('Profile updated successfully!', 'success')
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Failed to update profile'
      showToast(msg || 'Failed to update profile', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!profile) return null

  const roleLabels: Record<string, string> = {
    super_admin: 'Super Admin',
    hr_manager: 'HR Manager',
    employee: 'Employee',
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>

      {/* Avatar and info */}
      <div className="card p-6 flex flex-col sm:flex-row items-center gap-6">
        <Avatar name={profile.name} imageUrl={profile.profileImage} size="lg" />
        <div className="text-center sm:text-left">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{profile.name}</h2>
          <p className="text-gray-500 dark:text-gray-400">{profile.designation} · {profile.department}</p>
          <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
              {roleLabels[profile.role]}
            </span>
            <span className={profile.status === 'active' ? 'badge-active' : 'badge-inactive'}>
              {profile.status}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{profile.employeeId}</span>
          </div>
        </div>
      </div>

      {/* Read-only details */}
      <div className="card p-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Details</h3>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email</dt>
            <dd className="mt-1 font-medium text-gray-900 dark:text-white">{profile.email}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Joining Date</dt>
            <dd className="mt-1 font-medium text-gray-900 dark:text-white">
              {new Date(profile.joiningDate).toLocaleDateString()}
            </dd>
          </div>
          {profile.reportingManager && typeof profile.reportingManager === 'object' && (
            <div>
              <dt className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Reporting Manager
              </dt>
              <dd className="mt-1 font-medium text-gray-900 dark:text-white">
                {profile.reportingManager.name}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Editable fields */}
      <div className="card p-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
          Edit Profile
          <span className="ml-2 text-xs font-normal text-gray-400">(name, phone, profile picture)</span>
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* Profile picture upload */}
          <div>
            <label className="label">Profile Picture</label>
            <div className="flex items-center gap-4">
              {/* Preview */}
              <div className="shrink-0">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="h-16 w-16 rounded-full object-cover border-2 border-indigo-300"
                  />
                ) : (
                  <Avatar name={profile?.name || 'U'} size="lg" />
                )}
              </div>
              {/* Upload button */}
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  aria-label="Upload profile picture"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary text-sm"
                >
                  📷 Choose Image
                </button>
                {previewImage && (
                  <button
                    type="button"
                    onClick={() => { setPreviewImage(''); setImageBase64('') }}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Remove photo
                  </button>
                )}
                <p className="text-xs text-gray-400">JPG, PNG, GIF · Max 2MB</p>
              </div>
            </div>
          </div>

          <div>
            <label className="label">Full Name</label>
            <input type="text" className={`input ${errors.name ? 'border-red-400' : ''}`} {...register('name')} />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div>
            <label className="label">Phone</label>
            <input
              type="tel"
              className={`input ${errors.phone ? 'border-red-400' : ''}`}
              placeholder="10-digit number"
              {...register('phone')}
            />
            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
          </div>

          <div className="pt-2">
            <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
              {submitting && <LoadingSpinner size="sm" />}
              {submitting ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProfilePage
