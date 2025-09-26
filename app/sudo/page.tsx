'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function SudoPage() {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setIsSubscribed(true)
      setEmail('')
    }
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Dark grain texture overlay */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full bg-gradient-to-br from-gray-900 via-black to-gray-800" />
      </div>
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Back button */}
      <div className="absolute top-8 left-8 z-20">
        <Link href="/" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-300">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Collection name */}
        <div className="text-center mb-16">
          <h1 className="text-[12rem] md:text-[16rem] lg:text-[20rem] font-black tracking-tighter leading-none text-white mb-4" style={{ fontFamily: 'Gilroy, sans-serif' }}>
            SUDO
          </h1>
          <div className="w-32 h-1 bg-red-600 mx-auto mb-8" />
          <p className="text-2xl md:text-3xl font-bold text-gray-300 tracking-wide uppercase">
            Coming Soon
          </p>
        </div>

        {/* Description */}
        <div className="max-w-2xl text-center mb-12">
          <p className="text-lg md:text-xl text-gray-400 leading-relaxed mb-6">
            The most exclusive collection yet. Dark, bold, and unapologetically edgy. 
            SUDO represents the underground culture that defines modern streetwear.
          </p>
          <p className="text-base text-gray-500">
            Expected Launch: <span className="text-red-400 font-semibold">Spring 2025</span>
          </p>
        </div>

        {/* Newsletter signup */}
        <div className="w-full max-w-md">
          {!isSubscribed ? (
            <form onSubmit={handleSubscribe} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <Input
                  type="email"
                  placeholder="Enter your email for updates"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-900/50 border border-gray-700 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:ring-red-500/20 backdrop-blur-sm"
                  required
                />
              </div>
              <Button 
                type="submit"
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-lg rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                Get Notified
              </Button>
            </form>
          ) : (
            <div className="text-center p-6 bg-green-900/20 border border-green-700 rounded-lg backdrop-blur-sm">
              <p className="text-green-400 font-semibold text-lg">✓ You're on the list!</p>
              <p className="text-gray-400 text-sm mt-2">We'll notify you when SUDO drops.</p>
            </div>
          )}
        </div>

        {/* Social proof */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 text-sm mb-2">Join the underground</p>
          <div className="flex items-center justify-center space-x-8 text-gray-500">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">2.5K+</p>
              <p className="text-xs uppercase tracking-wide">Waiting</p>
            </div>
            <div className="w-px h-8 bg-gray-700" />
            <div className="text-center">
              <p className="text-2xl font-bold text-white">Limited</p>
              <p className="text-xs uppercase tracking-wide">Edition</p>
            </div>
            <div className="w-px h-8 bg-gray-700" />
            <div className="text-center">
              <p className="text-2xl font-bold text-white">Exclusive</p>
              <p className="text-xs uppercase tracking-wide">Access</p>
            </div>
          </div>
        </div>
      </div>

      {/* Animated background elements */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-red-600 rounded-full animate-pulse" />
      <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-white rounded-full animate-ping" />
      <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
    </div>
  )
}