import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Scale, Mail, ArrowLeft } from 'lucide-react'
import { auth } from '../../lib/supabase'
import { motion } from 'framer-motion'

interface ForgotPasswordFormData {
  email: string
}

interface ForgotPasswordFormProps {
  onBack: () => void
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>()

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setLoading(true)
      setError('')

      const { error } = await auth.resetPassword(data.email)

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-green-900 mb-2">Reset Link Sent</h3>
          <p className="text-green-700 mb-4">
            If an account with that email exists, we've sent you a password reset link.
          </p>
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-500 font-medium flex items-center justify-center mx-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Sign In
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="text-center mb-8">
        <Scale className="h-12 w-12 text-blue-900 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>
        <p className="text-gray-600 mt-2">Enter your email to receive a reset link</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
          >
            {error}
          </motion.div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              type="email"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter your email"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full bg-blue-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
        </motion.button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-500 font-medium flex items-center justify-center mx-auto"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Sign In
        </button>
      </div>
    </motion.div>
  )
}

export default ForgotPasswordForm