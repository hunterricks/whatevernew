'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function FreelancerOnboarding() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    title: '',
    skills: [],
    experience: '',
    hourlyRate: '',
    availability: '',
    bio: ''
  })

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1)
    } else {
      // Submit onboarding data
      handleSubmit()
    }
  }

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/freelancer/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Onboarding failed')

      // Redirect to dashboard
      router.push('/freelancer/dashboard')
    } catch (error) {
      console.error('Onboarding error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto pt-12 px-4">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className="h-2 bg-green-600 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
          <div className="text-sm text-gray-600 mt-2">
            Step {step} of 4
          </div>
        </div>

        {/* Step content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">What's your expertise?</h2>
              {/* Add form fields for step 1 */}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Tell us about your experience</h2>
              {/* Add form fields for step 2 */}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Set your rate and availability</h2>
              {/* Add form fields for step 3 */}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Complete your profile</h2>
              {/* Add form fields for step 4 */}
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleNext}
              className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700"
            >
              {step === 4 ? 'Complete' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}