'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then((registration) => {
          console.log('SW registered:', registration.scope)
        }).catch((error) => {
          console.log('SW registration failed:', error)
        })
      })
    }
  }, [])

  return null
}

export function DeveloperCredits() {
  return (
    <div className="py-6 text-center border-t border-gray-200 mt-8">
      <p className="text-xs text-gray-400">
        Developed by <span className="text-emerald-600 font-medium">Shunaid Ahmed</span>
      </p>
      <p className="text-xs text-gray-300 mt-1">Karigar.ai — Har Karigar, Ek Click Dur</p>
    </div>
  )
}
