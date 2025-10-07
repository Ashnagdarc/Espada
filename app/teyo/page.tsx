"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function TeyoComingSoon() {
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
    <div className="min-h-screen bg-slate-900 text-white relative">
      {/* Subtle tech grid background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Navigation */}
      <nav className="absolute top-8 left-8 z-10">
        <Link 
          href="/" 
          className="inline-flex items-center text-slate-400 hover:text-white transition-colors group"
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
              className="text-7xl md:text-8xl lg:text-9xl font-black tracking-tight leading-none text-blue-400"
            >
              TEYO
            </h1>
            <div className="w-16 h-px bg-blue-400/60 mx-auto"></div>
          </div>

          {/* Subtitle */}
          <div className="space-y-6">
            <h2 style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-lg font-light tracking-[0.3em] text-slate-300 uppercase">
              Gaming Collection
            </h2>
            <p style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-base text-slate-400 leading-relaxed font-light max-w-md mx-auto">
              Level up your style. A sophisticated gaming collection for the modern player.
            </p>
          </div>

          {/* Coming Soon */}
          <div className="space-y-12">
            <div className="inline-block border border-blue-400/30 px-8 py-3">
              <span style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-sm font-light tracking-[0.2em] uppercase text-blue-300">
                Beta Coming Soon
              </span>
            </div>

            {/* Email Signup - Figma Style */}
            <div className="max-w-2xl mx-auto">
              {isSubmitted ? (
                <div className="text-center space-y-6">
                  <h3 style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-xl font-light text-blue-300 tracking-wide">
                    Welcome to the Beta Squad!
                  </h3>
                  <p style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-slate-400 font-light">
                    You'll be notified when TEYO launches. Get ready to level up!
                  </p>
                  
                  {/* Social Proof Section */}
                  <div className="flex flex-col items-center space-y-3 pt-4">
                    <div className="flex items-center space-x-3">
                      {/* User Avatars */}
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-slate-700 flex items-center justify-center text-white text-xs font-bold">
                          T
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 border-2 border-slate-700 -ml-2 flex items-center justify-center text-white text-xs font-bold">
                          G
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 border-2 border-slate-700 -ml-2 flex items-center justify-center text-white text-xs font-bold">
                          A
                        </div>
                      </div>
                      <p style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-slate-400 text-sm font-light">
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
                          className="w-full bg-slate-800 border-0 rounded-2xl text-white placeholder:text-slate-400 px-4 py-4 text-base font-light focus:bg-slate-700 focus:ring-2 focus:ring-blue-400/50 transition-all duration-200"
                          style={{ fontFamily: 'Gilroy, sans-serif', minWidth: '280px', height: '64px' }}
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-slate-200 hover:bg-white text-slate-900 border-0 rounded-2xl px-6 py-4 h-16 font-semibold text-base transition-all duration-200 flex items-center gap-2"
                        style={{ fontFamily: 'Gilroy, sans-serif' }}
                      >
                        {isSubmitting ? (
                          <div className="w-4 h-4 border-2 border-slate-600 border-t-slate-900 rounded-full animate-spin"></div>
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
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-slate-700 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                          T
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 border-2 border-slate-700 -ml-2 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                          G
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 border-2 border-slate-700 -ml-2 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                          A
                        </div>
                      </div>
                      <p style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-slate-400 text-sm font-light">
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
        <p style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-slate-500 text-xs font-light tracking-wider">
          ESPADA
        </p>
      </div>
    </div>
  );
}