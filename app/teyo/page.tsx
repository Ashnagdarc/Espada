'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail } from 'lucide-react'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/contexts/ToastContext'

export default function TeyoPage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { success, error } = useToast()

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      error('Please enter your email address')
      return
    }

    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      success('Welcome to the future! You\'ll get exclusive early access to TEYO.')
      setEmail('')
    } catch (err) {
      error('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
      {/* Vibrant gradient overlay */}
      <div className="absolute inset-0">
        <div className="w-full h-full bg-gradient-to-tr from-pink-500/20 via-purple-500/30 to-cyan-500/20" />
      </div>
      
      {/* Dynamic mesh pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(45deg, rgba(255,0,150,0.3) 25%, transparent 25%),
            linear-gradient(-45deg, rgba(0,255,255,0.3) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, rgba(255,0,150,0.3) 75%),
            linear-gradient(-45deg, transparent 75%, rgba(0,255,255,0.3) 75%)
          `,
          backgroundSize: '60px 60px',
          backgroundPosition: '0 0, 0 30px, 30px -30px, -30px 0px'
        }} />
      </div>

      {/* Back button */}
      <div className="absolute top-8 left-8 z-20">
        <Link href="/" className="flex items-center space-x-2 text-purple-200 hover:text-white transition-colors duration-300">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Collection name */}
        <div className="text-center mb-16">
          <h1 className="text-[11rem] md:text-[15rem] lg:text-[19rem] font-black tracking-tight leading-none mb-6" style={{ 
            fontFamily: 'Gilroy, sans-serif',
            background: 'linear-gradient(135deg, #ff0080, #00ffff, #8000ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            TEYO
          </h1>
          <div className="w-40 h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 mx-auto mb-8 rounded-full" />
          <p className="text-2xl md:text-3xl font-bold text-purple-100 tracking-wide uppercase">
            Coming Soon
          </p>
        </div>

        {/* Description */}
        <div className="max-w-2xl text-center mb-12">
          <p className="text-lg md:text-xl text-purple-200 leading-relaxed mb-6">
            The future of fashion is here. Bold colors, innovative designs, and cutting-edge technology 
            merge to create something extraordinary. TEYO is more than clothing—it's a statement.
          </p>
          <p className="text-base text-purple-300">
            Expected Launch: <span className="text-cyan-400 font-semibold">Fall 2025</span>
          </p>
        </div>

        {/* Newsletter signup */}
        <div className="w-full max-w-md">
          <form onSubmit={handleSubscribe} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-300 w-5 h-5" />
              <Input
                type="email"
                placeholder="Enter your email for early access"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-purple-400/50 text-white placeholder-purple-300 rounded-xl focus:border-cyan-400 focus:ring-cyan-400/30 backdrop-blur-md"
                required
                disabled={isSubmitting}
              />
            </div>
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? 'Joining...' : 'Join the Future'}
            </Button>
          </form>
        </div>

        {/* Dynamic stats */}
        <div className="mt-16 text-center">
          <p className="text-purple-300 text-sm mb-4">Innovation in motion</p>
          <div className="flex items-center justify-center space-x-8 text-purple-200">
            <div className="text-center">
              <p className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">∞</p>
              <p className="text-xs uppercase tracking-wide">Possibilities</p>
            </div>
            <div className="w-px h-8 bg-purple-400" />
            <div className="text-center">
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">2025</p>
              <p className="text-xs uppercase tracking-wide">Future</p>
            </div>
            <div className="w-px h-8 bg-purple-400" />
            <div className="text-center">
              <p className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">1st</p>
              <p className="text-xs uppercase tracking-wide">Edition</p>
            </div>
          </div>
        </div>
      </div>

      {/* Animated floating elements */}
      <div className="absolute top-1/4 left-1/5 w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
      <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-1/3 left-1/3 w-4 h-4 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '2s' }} />
      <div className="absolute top-3/4 right-1/3 w-2.5 h-2.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
      <div className="absolute bottom-1/4 right-1/5 w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }} />
      
      {/* Gradient orbs */}
      <div className="absolute top-1/6 right-1/6 w-32 h-32 bg-gradient-to-br from-pink-500/30 to-transparent rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-1/6 left-1/6 w-40 h-40 bg-gradient-to-tr from-cyan-500/20 to-transparent rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
    </div>
  )
}