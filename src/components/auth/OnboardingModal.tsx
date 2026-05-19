'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, MapPin, Wrench, Bell, Star, Check, ArrowRight } from 'lucide-react'

const steps = [
  {
    icon: MapPin,
    title: 'Choose Your City',
    description: 'We\'ll show you available service providers in your area',
    color: 'from-emerald-400 to-emerald-600',
  },
  {
    icon: Wrench,
    title: 'Book Any Service',
    description: 'AC repair, plumbing, electrical work, tutoring, and more',
    color: 'from-blue-400 to-blue-600',
  },
  {
    icon: Bell,
    title: 'Get Real-time Updates',
    description: 'Track your booking from confirmation to completion',
    color: 'from-purple-400 to-purple-600',
  },
  {
    icon: Star,
    title: 'Rate & Review',
    description: 'Help others find the best karigar in your area',
    color: 'from-orange-400 to-orange-600',
  },
]

interface OnboardingModalProps {
  onComplete: () => void
}

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedCity, setSelectedCity] = useState('')

  const cities = ['Islamabad', 'Karachi', 'Lahore', 'Peshawar', 'Multan']

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleComplete = async () => {
    const supabase = createClient() as any
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          city: selectedCity || user.user_metadata?.city,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
    }
    onComplete()
  }

  const step = steps[currentStep]
  const Icon = step.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden animate-scale-in shadow-2xl">
        {/* Header */}
        <div className={`bg-gradient-to-br ${step.color} p-6 text-white relative transition-all duration-300`}>
          <button
            onClick={handleComplete}
            className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
          >
            <X size={16} />
          </button>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 animate-float">
            <Icon size={28} />
          </div>
          <h2 className="text-2xl font-bold">{step.title}</h2>
          <p className="text-white/80 text-sm mt-1">{step.description}</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStep === 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 mb-3">Select your city</p>
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex items-center justify-between ${
                    selectedCity === city
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="font-medium">{city}</span>
                  {selectedCity === city && <Check size={18} className="text-emerald-600" />}
                </button>
              ))}
            </div>
          )}

          {currentStep > 0 && currentStep < steps.length - 1 && (
            <div className="text-center py-8">
              <div className={`w-24 h-24 bg-gradient-to-br ${step.color} rounded-3xl flex items-center justify-center mx-auto mb-4 animate-float`}>
                <Icon size={40} className="text-white" />
              </div>
              <p className="text-gray-600">{step.description}</p>
            </div>
          )}

          {currentStep === steps.length - 1 && (
            <div className="text-center py-4">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-4 animate-bounce-in">
                <Star size={40} className="text-white" />
              </div>
              <p className="text-gray-600 mb-4">You're all set! Let's find your first karigar.</p>
            </div>
          )}

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-6">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentStep ? 'bg-emerald-600 w-6' : idx < currentStep ? 'bg-emerald-300' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Next button */}
          <button
            onClick={handleNext}
            disabled={currentStep === 0 && !selectedCity}
            className="w-full mt-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            <ArrowRight size={18} />
          </button>

          {/* Skip */}
          <button
            onClick={handleComplete}
            className="w-full mt-2 py-2 text-gray-500 text-sm hover:text-gray-700 transition-colors"
          >
            Skip tutorial
          </button>
        </div>
      </div>
    </div>
  )
}
