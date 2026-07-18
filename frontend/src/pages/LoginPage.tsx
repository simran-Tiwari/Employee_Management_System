import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import LoadingSpinner from '../components/LoadingSpinner'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type FormData = z.infer<typeof schema>

const LoginPage = () => {
  const { login, isAuthenticated, user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  // Already logged in redirect
  if (isAuthenticated) {
    return <Navigate to={user?.role === 'employee' ? '/profile' : '/dashboard'} replace />
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const loggedInUser = await login(data.email, data.password)
      showToast('Welcome back!', 'success')
      navigate(loggedInUser.role === 'employee' ? '/profile' : '/dashboard')
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { message?: string } }
        code?: string
        message?: string
      }
      const msg =
        axiosErr?.response?.data?.message ||
        (axiosErr?.code === 'ERR_NETWORK'
          ? 'Cannot reach the server. Check API URL and backend CORS settings.'
          : 'Invalid email or password.')
      showToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-5xl">🏢</span>
          <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">EMS</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Employee Management System</p>
        </div>

        <div className="card p-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Sign in to your account</h2>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="label">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={`input ${errors.email ? 'border-red-400 focus:ring-red-400' : ''}`}
                placeholder="admin@ems.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="label">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className={`input ${errors.password ? 'border-red-400 focus:ring-red-400' : ''}`}
                placeholder="••••••••"
                {...register('password')}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading && <LoadingSpinner size="sm" />}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-xs text-indigo-700 dark:text-indigo-300">
            <p className="font-semibold mb-2">Demo credentials:</p>
            <div className="space-y-2">
              <div>
                <p className="font-medium text-indigo-800 dark:text-indigo-200">Super Admin</p>
                <p>📧 admin@ems.com</p>
                <p>🔑 Admin@1234</p>
              </div>
              <div className="border-t border-indigo-200 dark:border-indigo-700/50 pt-2">
                <p className="font-medium text-indigo-800 dark:text-indigo-200">HR Manager</p>
                <p>📧 sarah.johnson@ems.com</p>
                <p>🔑 Hr@12345678</p>
              </div>
              <div className="border-t border-indigo-200 dark:border-indigo-700/50 pt-2">
                <p className="font-medium text-indigo-800 dark:text-indigo-200">Employee</p>
                <p>📧 michael.chen@ems.com</p>
                <p>🔑 Emp@12345678</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
