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
  const isInView = useInView(ref, { threshold: 0.05, once: true })

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
      
      {/* Hero Section with HI */}
      <section className="min-h-screen flex items-center justify-center relative">
        <motion.div
          className="text-center"
          style={{ opacity: hiOpacity, scale: hiScale }}
        >
          <motion.h1
            className="text-[12rem] md:text-[16rem] lg:text-[20rem] font-black text-foreground leading-none tracking-tighter"
            style={{ fontFamily: 'Gilroy, sans-serif' }}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            HI
          </motion.h1>
        </motion.div>
        
        <ScrollIndicator />
      </section>

      {/* Letter Content */}
      <motion.section 
        className="min-h-screen px-8 py-24"
        style={{ opacity: letterOpacity }}
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            viewport={{ once: true, threshold: 0.3 }}
          >
            <h2 className="text-2xl md:text-3xl font-medium text-label-primary mb-8 tracking-wide" style={{ fontFamily: 'Gilroy, sans-serif' }}>
              A Letter From Our Founder
            </h2>
          </motion.div>

          <div className="space-y-12">
            {paragraphs.map((paragraph, index) => (
              <ScrollRevealText
                key={index}
                className="text-xl md:text-2xl leading-relaxed text-label-secondary"
              >
                {paragraph}
              </ScrollRevealText>
            ))}
          </div>

          <motion.div
            className="mt-24 text-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            viewport={{ once: true, threshold: 0.5 }}
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
      </motion.section>

      {/* Bottom Spacing */}
      <div className="h-24" />
    </div>
  )
}