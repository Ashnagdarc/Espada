"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function SudoComingSoon() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setIsSubmitting(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSubmitted(true);
      setEmail('');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Navigation */}
      <nav className="absolute top-8 left-8 z-10">
        <Link 
          href="/" 
          className="inline-flex items-center text-white/60 hover:text-white transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-0.5 transition-transform" />
          <span style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-sm font-light">
            Back
          </span>
        </Link>
      </nav>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-screen px-8">
        <div className="max-w-2xl mx-auto text-center space-y-16">
          
          {/* Main Title */}
          <div className="space-y-8">
            <h1 
              style={{ fontFamily: 'Gilroy, sans-serif' }} 
              className="text-7xl md:text-8xl lg:text-9xl font-black tracking-tight leading-none"
            >
              SUDO
            </h1>
            <div className="w-16 h-px bg-white/40 mx-auto"></div>
          </div>

          {/* Subtitle */}
          <div className="space-y-6">
            <h2 style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-lg font-light tracking-[0.3em] text-white/80 uppercase">
              Bold & Unapologetic
            </h2>
            <p style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-base text-white/60 leading-relaxed font-light max-w-md mx-auto">
              For those who dare to stand out. A collection that speaks without compromise.
            </p>
          </div>

          {/* Coming Soon */}
          <div className="space-y-12">
            <div className="inline-block border border-white/30 px-8 py-3">
              <span style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-sm font-light tracking-[0.2em] uppercase">
                Coming Soon
              </span>
            </div>

            {/* Email Signup */}
            {/* Email Signup - Figma Style */}
            <div className="max-w-2xl mx-auto">
              {isSubmitted ? (
                <div className="text-center space-y-6">
                  <h3 style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-xl font-light text-white/90 tracking-wide">
                    You're on the list
                  </h3>
                  <p style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-white/60 font-light">
                    We'll notify you when SUDO launches. Stay bold.
                  </p>
                  
                  {/* Social Proof Section */}
                  <div className="flex flex-col items-center space-y-3 pt-4">
                    <div className="flex items-center space-x-3">
                      {/* User Avatars */}
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white to-gray-300 border-2 border-gray-800 flex items-center justify-center text-black text-xs font-bold">
                          S
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 border-2 border-gray-800 -ml-2 flex items-center justify-center text-black text-xs font-bold">
                          U
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 border-2 border-gray-800 -ml-2 flex items-center justify-center text-white text-xs font-bold">
                          D
                        </div>
                      </div>
                      <p style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-white/50 text-sm font-light">
                        Join 2,000+ others who signed up
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Horizontal Form Layout */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex items-center gap-5 max-w-lg mx-auto">
                      <div className="flex-1">
                        <Input
                          type="email"
                          placeholder="Your email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-gray-900 border-0 rounded-2xl text-white placeholder:text-gray-400 px-4 py-4 text-base font-light focus:bg-gray-800 focus:ring-2 focus:ring-white/20 transition-all duration-200"
                          style={{ fontFamily: 'Gilroy, sans-serif', minWidth: '280px', height: '64px' }}
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-white hover:bg-gray-100 text-black border-0 rounded-2xl px-6 py-4 h-16 font-semibold text-base transition-all duration-200 flex items-center gap-2"
                        style={{ fontFamily: 'Gilroy, sans-serif' }}
                      >
                        {isSubmitting ? (
                          <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                        ) : (
                          <>
                            Join waitlist
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </Button>
                    </div>
                    {error && (
                      <p className="text-red-400 text-sm font-light text-center">{error}</p>
                    )}
                  </form>

                  {/* Social Proof Section */}
                  <div className="flex flex-col items-center space-y-3">
                    <div className="flex items-center space-x-3">
                      {/* User Avatars */}
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white to-gray-300 border-2 border-gray-800 flex items-center justify-center text-black text-xs font-bold shadow-lg">
                          S
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 border-2 border-gray-800 -ml-2 flex items-center justify-center text-black text-xs font-bold shadow-lg">
                          U
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 border-2 border-gray-800 -ml-2 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                          D
                        </div>
                      </div>
                      <p style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-white/50 text-sm font-light">
                        Join 2,000+ others who signed up
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <p style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-white/30 text-xs font-light tracking-wider">
          ESPADA
        </p>
      </div>
    </div>
  );
}