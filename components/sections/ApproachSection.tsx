'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Sparkles, Leaf, Users, Award } from 'lucide-react'

const approaches = [
  {
    icon: Sparkles,
    title: 'Innovative Design',
    description: 'We blend contemporary aesthetics with timeless elegance, creating pieces that transcend seasonal trends.'
  },
  {
    icon: Leaf,
    title: 'Sustainable Materials',
    description: 'Every garment is crafted using eco-friendly materials and ethical production processes.'
  },
  {
    icon: Users,
    title: 'Community Focused',
    description: 'We collaborate with local artisans and designers to create authentic, meaningful fashion.'
  },
  {
    icon: Award,
    title: 'Quality Craftsmanship',
    description: 'Each piece undergoes rigorous quality control to ensure exceptional durability and comfort.'
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut'
    }
  }
}

export default function ApproachSection() {
  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_theme(colors.foreground)_1px,_transparent_0)] bg-[size:32px_32px]" />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Sparkles className="w-4 h-4" />
            Our Philosophy
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Our Approach to
            <br />
            <span className="text-primary">Fashion Design</span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            At Espada, we believe fashion should be a harmonious blend of innovation, 
            sustainability, and craftsmanship. Our approach combines cutting-edge design 
            with timeless elegance to create pieces that tell a story.
          </p>
        </motion.div>
        
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content - Approach Cards */}
          <motion.div
            className="space-y-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            {approaches.map((approach, index) => {
              const Icon = approach.icon
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="group"
                >
                  <motion.div
                    className="flex items-start gap-4 p-6 rounded-2xl bg-muted/30 border border-border/40 hover:border-primary/20 transition-all duration-300"
                    whileHover={{ scale: 1.02, y: -4 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  >
                    <motion.div
                      className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300"
                      whileHover={{ rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    >
                      <Icon className="w-6 h-6 text-primary" />
                    </motion.div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                        {approach.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {approach.description}
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              )
            })}
          </motion.div>
          
          {/* Right Content - Images */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="grid grid-cols-2 gap-4 h-[600px]">
              {/* Main Large Image */}
              <motion.div
                className="relative col-span-2 h-2/3 rounded-2xl overflow-hidden bg-muted"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <Image
                  src="/images/mg0tjbpx-2myp9b6.png"
                  alt="Fashion Design Process"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                
                {/* Overlay Text */}
                <motion.div
                  className="absolute bottom-6 left-6 text-white"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <h4 className="text-lg font-semibold mb-1">Crafted with Care</h4>
                  <p className="text-sm text-white/80">Every detail matters</p>
                </motion.div>
              </motion.div>
              
              {/* Bottom Left Image */}
              <motion.div
                className="relative rounded-xl overflow-hidden bg-muted"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <Image
                  src="/images/mg0tjbq2-3h6yy6x.png"
                  alt="Sustainable Materials"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </motion.div>
              
              {/* Bottom Right Image */}
              <motion.div
                className="relative rounded-xl overflow-hidden bg-muted"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <Image
                  src="/images/mg0tjbq2-6rgezts.png"
                  alt="Quality Craftsmanship"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </motion.div>
            </div>
            
            {/* Floating Stats */}
            <motion.div
              className="absolute -top-8 -right-8 bg-background/90 backdrop-blur-sm border border-border/40 rounded-2xl p-6 shadow-lg"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 1 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">15+</div>
                <div className="text-sm text-muted-foreground">Years Experience</div>
              </div>
            </motion.div>
            
            <motion.div
              className="absolute -bottom-8 -left-8 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-2xl p-6"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 1.2 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">100%</div>
                <div className="text-sm text-primary/80">Sustainable</div>
              </div>
            </motion.div>
            
            {/* Decorative Elements */}
            <motion.div
              className="absolute top-1/4 -right-16 w-32 h-32 bg-primary/5 rounded-full blur-2xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
            
            <motion.div
              className="absolute bottom-1/4 -left-16 w-24 h-24 bg-secondary/10 rounded-full blur-xl"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 2
              }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}