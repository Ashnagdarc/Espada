'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import Header from '@/components/layout/Header'
import { ChevronDown } from 'lucide-react'

const brandStory = `I was frustrated by fast fashion. Tired of loud trends that shout for attention then disappear overnight. My closet was full of pieces that didn't last or didn't feel like me. I wanted something better, something simple, timeless, and built to last. So I decided to create it myself.

I insist on keeping production local. Every piece is made here at home, in small batches, by skilled hands I trust. That way I know every stitch is right and every fabric is premium quality. I focus on essential pieces, not seasonal trends. I only release a few designs at a time, and each one is built to last for years.

Each design is unisex, made to fit anyone comfortably. Great style has no gender. I design for those who prefer quiet confidence over loud logos, for people who value quality and simplicity over hype. If that sounds like you, I made this brand for you.`

const ScrollRevealText = ({ children, className }: { children: string; className?: string }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const words = children.split(' ')

  return (
    <motion.div ref={ref} className={`mb-8 ${className || ''}`} style={{ fontFamily: 'Gilroy, sans-serif' }}>
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          initial={{
            opacity: 0,
            y: 30,
            filter: 'blur(4px)'
          }}
          animate={{
            opacity: isInView ? 1 : 0,
            y: isInView ? 0 : 30,
            filter: isInView ? 'blur(0px)' : 'blur(4px)'
          }}
          transition={{
            duration: 1.2,
            delay: index * 0.05,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          className="inline-block mr-2"
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  )
}

function ScrollIndicator() {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      try {
        const scrolled = window.scrollY > 100
        setIsVisible(!scrolled)
      } catch (error) {
        console.error('Scroll handler error:', error instanceof Error ? error.message : 'Unknown error')
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.div
      className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-10"
      initial={{ opacity: 1, y: 0 }}
      animate={{ 
        opacity: isVisible ? 1 : 0, 
        y: isVisible ? 0 : 30 
      }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="flex flex-col items-center text-label-tertiary">
        <span className="text-sm font-medium mb-2 tracking-wider" style={{ fontFamily: 'Gilroy, sans-serif' }}>
          SCROLL DOWN
        </span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </div>
    </motion.div>
  )
}

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  })

  const hiOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0.2])
  const hiScale = useTransform(scrollYProgress, [0, 0.25], [1, 0.85])
  const letterOpacity = useTransform(scrollYProgress, [0.15, 0.4], [0, 1])

  const paragraphs = brandStory.split('\n\n')

  return (
    <div ref={containerRef} className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-32 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),_transparent_55%)]" />
        </div>

        <motion.div
          className="text-center relative z-10"
          style={{ opacity: hiOpacity, scale: hiScale }}
        >
          <motion.p
            className="text-xs uppercase tracking-[0.35em] text-label-tertiary mb-6"
            style={{ fontFamily: 'Gilroy, sans-serif' }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            About Espada
          </motion.p>
          <motion.h1
            className="text-[10rem] md:text-[14rem] lg:text-[18rem] font-black text-foreground leading-none tracking-tighter"
            style={{ fontFamily: 'Gilroy, sans-serif' }}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            HI
          </motion.h1>
          <motion.p
            className="mt-4 text-base md:text-lg text-label-secondary"
            style={{ fontFamily: 'Gilroy, sans-serif' }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            Quiet essentials. Small batches. Made to outlast trends.
          </motion.p>
        </motion.div>

        <ScrollIndicator />
      </section>

      {/* Letter Content */}
      <motion.section
        className="min-h-screen px-6 md:px-10 py-24"
        style={{ opacity: letterOpacity }}
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-12">
          <div className="lg:sticky lg:top-24 self-start">
            <motion.div
              className="mb-10"
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl md:text-3xl font-medium text-label-primary mb-4 tracking-wide" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                A Letter From Our Founder
              </h2>
              <p className="text-sm text-label-tertiary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                Built for the long term. Designed for quiet confidence.
              </p>
            </motion.div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-[11px] uppercase tracking-[0.24em] text-label-tertiary mb-2">Principle 01</div>
                <div className="text-base font-semibold text-foreground">Local craft</div>
                <p className="text-sm text-label-secondary mt-1">Small batches with trusted hands and premium fabrics.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-[11px] uppercase tracking-[0.24em] text-label-tertiary mb-2">Principle 02</div>
                <div className="text-base font-semibold text-foreground">Essential forms</div>
                <p className="text-sm text-label-secondary mt-1">Timeless silhouettes over trend-driven noise.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-[11px] uppercase tracking-[0.24em] text-label-tertiary mb-2">Principle 03</div>
                <div className="text-base font-semibold text-foreground">Inclusive fit</div>
                <p className="text-sm text-label-secondary mt-1">Unisex design that prioritizes comfort and ease.</p>
              </div>
            </div>
          </div>

          <div className="space-y-12">
            {paragraphs.map((paragraph, index) => (
              <ScrollRevealText
                key={index}
                className="text-xl md:text-2xl leading-relaxed text-label-secondary"
              >
                {paragraph}
              </ScrollRevealText>
            ))}

            <motion.div
              className="mt-16"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              viewport={{ once: true }}
            >
              <div className="inline-block">
                <div className="text-lg font-medium text-label-primary mb-2" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                  With love,
                </div>
                <div className="text-2xl font-bold text-foreground tracking-wider" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                  ESPADA
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Values Strip */}
      <section className="px-6 md:px-10 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-label-tertiary mb-2" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                  Our Values
                </p>
                <h3 className="text-2xl md:text-3xl font-semibold text-foreground" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                  Designed to last. Built to feel like you.
                </h3>
              </div>
              <div className="text-sm text-label-secondary max-w-md">
                We focus on fewer, better pieces: wearable daily, crafted locally, and refined through slow iteration.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
                <div className="text-xs uppercase tracking-[0.24em] text-label-tertiary mb-2">Materials</div>
                <div className="text-lg font-semibold text-foreground">Premium fabrics</div>
                <p className="text-sm text-label-secondary mt-2">
                  Natural, breathable textiles that soften with time and hold their shape.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
                <div className="text-xs uppercase tracking-[0.24em] text-label-tertiary mb-2">Craft</div>
                <div className="text-lg font-semibold text-foreground">Small‑batch production</div>
                <p className="text-sm text-label-secondary mt-2">
                  Every run is intentional, controlled, and checked by the hands that make it.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
                <div className="text-xs uppercase tracking-[0.24em] text-label-tertiary mb-2">Design</div>
                <div className="text-lg font-semibold text-foreground">Quiet confidence</div>
                <p className="text-sm text-label-secondary mt-2">
                  Subtle details, clean lines, and fit that feels effortless day after day.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Spacing */}
      <div className="h-24" />
    </div>
  )
}