'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail } from 'lucide-react'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function XVIIPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white text-gray-900 relative overflow-hidden">
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 opacity-30">
        <div className="w-full h-full bg-gradient-to-tr from-gray-100/50 via-transparent to-gray-200/30" />
      </div>
      
      {/* Elegant geometric pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(0,0,0,0.1) 2px, transparent 2px),
            radial-gradient(circle at 75% 75%, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px, 60px 60px'
        }} />
      </div>

      {/* Back button */}
      <div className="absolute top-8 left-8 z-20">
        <Link href="/" className="flex items-center space-x-2 text-gray-500 hover:text-gray-900 transition-colors duration-300">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Collection name */}
        <div className="text-center mb-20">
          <h1 className="text-[10rem] md:text-[14rem] lg:text-[18rem] font-thin tracking-wider leading-none text-gray-900 mb-6" style={{ fontFamily: 'Gilroy, sans-serif', fontWeight: 100 }}>
            XVII
          </h1>
          <div className="w-24 h-px bg-gray-400 mx-auto mb-8" />
          <p className="text-xl md:text-2xl font-light text-gray-600 tracking-[0.2em] uppercase">
            Coming Soon
          </p>
        </div>

        {/* Description */}
        <div className="max-w-xl text-center mb-16">
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6 font-light">
            Seventeen pieces. Timeless elegance. Minimalist perfection.
            <br />A collection that speaks through silence.
          </p>
          <p className="text-base text-gray-500 font-light">
            Expected Launch: <span className="text-gray-800 font-medium">Summer 2025</span>
          </p>
        </div>

        {/* Newsletter signup */}
        <div className="w-full max-w-sm">
          {!isSubscribed ? (
            <form onSubmit={handleSubscribe} className="space-y-6">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/80 border border-gray-200 text-gray-900 placeholder-gray-400 rounded-none focus:border-gray-400 focus:ring-gray-400/20 backdrop-blur-sm shadow-sm"
                  required
                />
              </div>
              <Button 
                type="submit"
                className="w-full py-4 bg-gray-900 hover:bg-gray-800 text-white font-light text-base rounded-none transition-all duration-500 transform hover:scale-[1.02]"
              >
                Notify Me
              </Button>
            </form>
          ) : (
            <div className="text-center p-8 bg-white/60 border border-gray-200 backdrop-blur-sm">
              <p className="text-gray-800 font-medium text-lg">Thank you</p>
              <p className="text-gray-600 text-sm mt-2 font-light">You'll be the first to know about XVII.</p>
            </div>
          )}
        </div>

        {/* Minimalist stats */}
        <div className="mt-20 text-center">
          <p className="text-gray-500 text-sm mb-4 font-light tracking-wide">Crafted with intention</p>
          <div className="flex items-center justify-center space-x-12 text-gray-600">
            <div className="text-center">
              <p className="text-3xl font-thin text-gray-900">17</p>
              <p className="text-xs uppercase tracking-widest font-light">Pieces</p>
            </div>
            <div className="w-px h-12 bg-gray-300" />
            <div className="text-center">
              <p className="text-3xl font-thin text-gray-900">∞</p>
              <p className="text-xs uppercase tracking-widest font-light">Timeless</p>
            </div>
            <div className="w-px h-12 bg-gray-300" />
            <div className="text-center">
              <p className="text-3xl font-thin text-gray-900">1</p>
              <p className="text-xs uppercase tracking-widest font-light">Vision</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle floating elements */}
      <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDuration: '3s' }} />
      <div className="absolute bottom-1/3 left-1/5 w-0.5 h-0.5 bg-gray-500 rounded-full animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }} />
      <div className="absolute top-2/3 left-2/3 w-1.5 h-1.5 bg-gray-300 rounded-full animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }} />
    </div>
  )
}