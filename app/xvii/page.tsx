"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function XviiComingSoon() {
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
    <div className="min-h-screen bg-white text-stone-900 relative">
      {/* Navigation */}
      <nav className="absolute top-8 left-8 z-10">
        <Link 
          href="/" 
          className="inline-flex items-center text-stone-400 hover:text-stone-700 transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-0.5 transition-transform" />
          <span style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-sm font-light">
            Back
          </span>
        </Link>
      </nav>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-screen px-8">
        <div className="max-w-3xl mx-auto text-center space-y-20">
          
          {/* Main Title */}
          <div className="space-y-12">
            <h1 
              style={{ fontFamily: 'Gilroy, sans-serif' }} 
              className="text-8xl md:text-9xl lg:text-[10rem] font-light tracking-[0.1em] leading-none text-stone-900"
            >
              XVII
            </h1>
            <div className="w-12 h-px bg-stone-400 mx-auto"></div>
          </div>

          {/* Subtitle */}
          <div className="space-y-8">
            <h2 style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-base font-light tracking-[0.4em] text-stone-500 uppercase">
              Mastercraft Collection
            </h2>
            <p style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-sm text-stone-400 leading-relaxed font-light max-w-sm mx-auto">
              Seventeen exclusive pieces. Japanese minimalism meets Roman grandeur.
            </p>
          </div>

          {/* Coming Soon */}
          <div className="space-y-16">
            <div className="inline-block border border-stone-300 px-6 py-2">
              <span style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-xs font-light tracking-[0.3em] uppercase text-stone-600">
                Coming Soon
              </span>
            </div>

            {/* Email Signup */}
            {/* Email Signup - Figma Style */}
            <div className="max-w-2xl mx-auto">
              {isSubmitted ? (
                <div className="text-center space-y-6">
                  <h3 style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-lg font-light text-stone-700 tracking-wide">
                    Welcome to XVII
                  </h3>
                  <p style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-stone-400 font-light">
                    You'll be notified when this mastercraft collection launches.
                  </p>
                  
                  {/* Social Proof Section */}
                  <div className="flex flex-col items-center space-y-3 pt-4">
                    <div className="flex items-center space-x-3">
                      {/* User Avatars */}
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-stone-600 to-stone-800 border-2 border-stone-200 flex items-center justify-center text-white text-xs font-bold">
                          X
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-stone-500 to-stone-700 border-2 border-stone-200 -ml-2 flex items-center justify-center text-white text-xs font-bold">
                          V
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-stone-400 to-stone-600 border-2 border-stone-200 -ml-2 flex items-center justify-center text-white text-xs font-bold">
                          I
                        </div>
                      </div>
                      <p style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-stone-400 text-sm font-light">
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
                          className="w-full bg-stone-50 border-0 rounded-2xl text-stone-700 placeholder:text-stone-400 px-4 py-4 text-base font-light focus:bg-white focus:ring-2 focus:ring-stone-300/50 transition-all duration-200"
                          style={{ fontFamily: 'Gilroy, sans-serif', minWidth: '280px', height: '64px' }}
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-stone-800 hover:bg-stone-900 text-white border-0 rounded-2xl px-6 py-4 h-16 font-semibold text-base transition-all duration-200 flex items-center gap-2"
                        style={{ fontFamily: 'Gilroy, sans-serif' }}
                      >
                        {isSubmitting ? (
                          <div className="w-4 h-4 border-2 border-stone-300 border-t-white rounded-full animate-spin"></div>
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
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-stone-600 to-stone-800 border-2 border-stone-200 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                          X
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-stone-500 to-stone-700 border-2 border-stone-200 -ml-2 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                          V
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-stone-400 to-stone-600 border-2 border-stone-200 -ml-2 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                          I
                        </div>
                      </div>
                      <p style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-stone-400 text-sm font-light">
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
        <p style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-stone-300 text-xs font-light tracking-[0.2em]">
          ESPADA
        </p>
      </div>
    </div>
  );
}